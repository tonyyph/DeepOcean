import {
  PACKAGE_TYPE,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage
} from "react-native-purchases";
import type { IEntitlementGateway } from "@/domain/repositories";
import type {
  EntitlementSnapshot,
  PlanId,
  PromoCodeResult,
  PurchaseOffering,
  PurchaseOption,
  TrialState
} from "@/domain/entities";
import { StorageKeys, TypedStore } from "@/core/storage/mmkv";
import { getIapConfig, type IapConfig } from "@/core/config/iapConfig";
import {
  revenueCat,
  type RevenueCatService
} from "@/core/iap/RevenueCatService";

const EMPTY_SNAPSHOT: EntitlementSnapshot = {
  isPremium: false,
  unlockedThemes: [],
  activePlan: null,
  resolvedAt: 0
};

/** Thrown when the user dismisses the native purchase dialog. */
export class PurchaseCancelledError extends Error {
  constructor() {
    super("Purchase cancelled by user");
    this.name = "PurchaseCancelledError";
  }
}

/** Thrown when billing is not configured (no API key / dashboard product). */
export class BillingUnavailableError extends Error {
  constructor(message = "Billing is unavailable") {
    super(message);
    this.name = "BillingUnavailableError";
  }
}

function isUserCancelled(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { userCancelled?: boolean }).userCancelled === true
  );
}

/**
 * PremiumRepository — maps RevenueCat entitlements to the app's premium
 * snapshot and persists the last-known state to MMKV.
 *
 * Reinstall safety: entitlements live on the user's store account, so after a
 * reinstall the first `refresh()` (or `restore()`) re-resolves the real state
 * from the store. The MMKV cache only smooths the cold-start before that
 * network round-trip completes — it is never the source of truth.
 */
export class PremiumRepository implements IEntitlementGateway {
  private readonly config: IapConfig;
  private readonly service: RevenueCatService;
  private readonly store = new TypedStore<EntitlementSnapshot>(
    StorageKeys.premiumSnapshot
  );
  private readonly trialStore = new TypedStore<TrialState | null>(
    StorageKeys.trialState
  );
  private readonly promoStore = new TypedStore<string[]>(
    StorageKeys.usedPromoCodes
  );

  constructor(
    service: RevenueCatService = revenueCat,
    config: IapConfig = getIapConfig()
  ) {
    this.service = service;
    this.config = config;
  }

  get isConfigured(): boolean {
    return this.service.isConfigured;
  }

  async configure(): Promise<void> {
    await this.service.configure();
  }

  cached(): EntitlementSnapshot {
    return this.store.get(EMPTY_SNAPSHOT);
  }

  async refresh(): Promise<EntitlementSnapshot> {
    if (!this.isConfigured) return this.cached();
    await this.service.configure();
    const info = await this.service.getCustomerInfo();
    return this.persist(this.toSnapshot(info));
  }

  async offerings(): Promise<PurchaseOffering | null> {
    if (!this.isConfigured) return null;
    await this.service.configure();
    const offerings = await this.service.getOfferings();
    const current = offerings.current;
    if (!current) return null;
    return this.toOffering(current);
  }

  async purchaseLifetime(): Promise<EntitlementSnapshot> {
    const pkg = await this.requireLifetimePackage();
    return this.purchase(pkg);
  }

  async purchaseAnnual(): Promise<EntitlementSnapshot> {
    const pkg = await this.requirePackageById(
      this.config.annualPackageId,
      PACKAGE_TYPE.ANNUAL
    );
    return this.purchase(pkg);
  }

  async purchaseMonthly(): Promise<EntitlementSnapshot> {
    const pkg = await this.requirePackageById(
      this.config.monthlyPackageId,
      PACKAGE_TYPE.MONTHLY
    );
    return this.purchase(pkg);
  }

  async startTrial(planId: "annual" | "monthly"): Promise<TrialState> {
    // If billing is configured, attempt the actual intro-price purchase from
    // the relevant package. If not configured, create a local 7-day trial
    // stored in MMKV (developer / demo mode only).
    const trialDurationMs = 7 * 24 * 60 * 60 * 1000;
    if (this.isConfigured) {
      const pkg = await this.requirePackageById(
        planId === "annual"
          ? this.config.annualPackageId
          : this.config.monthlyPackageId,
        planId === "annual" ? PACKAGE_TYPE.ANNUAL : PACKAGE_TYPE.MONTHLY
      );
      await this.purchase(pkg);
    }
    const state: TrialState = {
      planId,
      expiresAt: Date.now() + trialDurationMs,
      kind: "trial"
    };
    this.trialStore.set(state);
    return state;
  }

  async validatePromoCode(code: string): Promise<PromoCodeResult> {
    const trimmed = code.trim().toUpperCase();
    // Validate: must start with the configured prefix and have at least 4
    // additional alphanumeric characters — simple pattern that prevents
    // enumeration of short codes without requiring a network round-trip.
    const prefix = this.config.promoCodePrefix.toUpperCase();
    const isValidPattern =
      trimmed.startsWith(prefix) &&
      trimmed.length >= prefix.length + 4 &&
      /^[A-Z0-9-]+$/.test(trimmed.slice(prefix.length));

    if (!isValidPattern) {
      return { valid: false, reason: "not_found" };
    }

    // Check if already used / active trial for same code.
    const used = this.promoStore.get([]);
    if (used.includes(trimmed)) {
      // Already in use — check if still active via trialStore.
      const active = this.trialStore.get(null);
      if (active && active.kind === "promo" && Date.now() < active.expiresAt) {
        const msLeft = active.expiresAt - Date.now();
        const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
        return {
          valid: true,
          expiresAt: active.expiresAt,
          discountLabel: `${daysLeft}d`
        };
      }
      // Expired — treat as expired.
      return { valid: false, reason: "expired" };
    }

    // Issue a 3-day experience-code unlock.
    const promoDurationMs = 3 * 24 * 60 * 60 * 1000;
    const expiresAt = Date.now() + promoDurationMs;
    const state: TrialState = {
      planId: "monthly",
      expiresAt,
      kind: "promo"
    };
    this.trialStore.set(state);
    this.promoStore.set([...used, trimmed]);
    return { valid: true, expiresAt, discountLabel: "3d" };
  }

  activeTrial(): TrialState | null {
    const state = this.trialStore.get(null);
    if (!state) return null;
    if (Date.now() >= state.expiresAt) {
      this.trialStore.remove();
      return null;
    }
    return state;
  }

  async purchaseTheme(themeId: string): Promise<EntitlementSnapshot> {
    const pkg = await this.requireThemePackage(themeId);
    return this.purchase(pkg);
  }

  async restore(): Promise<EntitlementSnapshot> {
    if (!this.isConfigured) throw new BillingUnavailableError();
    await this.service.configure();
    const info = await this.service.restore();
    return this.persist(this.toSnapshot(info));
  }

  // --- internals -----------------------------------------------------------

  private async purchase(pkg: PurchasesPackage): Promise<EntitlementSnapshot> {
    try {
      const info = await this.service.purchasePackage(pkg);
      return this.persist(this.toSnapshot(info));
    } catch (error) {
      if (isUserCancelled(error)) throw new PurchaseCancelledError();
      throw error;
    }
  }

  private async requirePackageById(
    packageId: string,
    fallbackType: string
  ): Promise<PurchasesPackage> {
    const current = await this.currentOfferingOrThrow();
    const pkg =
      current.availablePackages.find((p) => p.identifier === packageId) ??
      current.availablePackages.find((p) => p.packageType === fallbackType);
    if (!pkg)
      throw new BillingUnavailableError(
        `Package "${packageId}" is unavailable`
      );
    return pkg;
  }

  private async requireLifetimePackage(): Promise<PurchasesPackage> {
    const current = await this.currentOfferingOrThrow();
    const pkg =
      current.availablePackages.find(
        (p) => p.identifier === this.config.lifetimePackageId
      ) ??
      current.availablePackages.find(
        (p) => p.packageType === PACKAGE_TYPE.LIFETIME
      );
    if (!pkg) throw new BillingUnavailableError("Lifetime pass is unavailable");
    return pkg;
  }

  private async requireThemePackage(
    themeId: string
  ): Promise<PurchasesPackage> {
    const current = await this.currentOfferingOrThrow();
    const productId = `${this.config.themeEntitlementPrefix}${themeId}`;
    const pkg = current.availablePackages.find(
      (p) => p.product.identifier === productId
    );
    if (!pkg) {
      throw new BillingUnavailableError(
        `Theme pack "${themeId}" is unavailable`
      );
    }
    return pkg;
  }

  private async currentOfferingOrThrow(): Promise<PurchasesOffering> {
    if (!this.isConfigured) throw new BillingUnavailableError();
    await this.service.configure();
    const offerings = await this.service.getOfferings();
    if (!offerings.current) throw new BillingUnavailableError("No offering");
    return offerings.current;
  }

  private toSnapshot(info: CustomerInfo): EntitlementSnapshot {
    const active = Object.keys(info.entitlements.active);
    const isPremium = active.includes(this.config.premiumEntitlement);
    const prefix = this.config.themeEntitlementPrefix;
    const unlockedThemes = active
      .filter((id) => id.startsWith(prefix))
      .map((id) => id.slice(prefix.length))
      .filter((id) => id.length > 0);

    let activePlan: PlanId | null = null;
    if (isPremium) {
      // Determine the active plan from entitlement product identifiers.
      const lifetime = active.find(
        (id) => id === this.config.premiumEntitlement
      );
      if (lifetime) {
        const info2 = info.entitlements.active[this.config.premiumEntitlement];
        const productId = info2?.productIdentifier ?? "";
        if (productId.includes(this.config.annualPackageId)) {
          activePlan = "annual";
        } else if (productId.includes(this.config.monthlyPackageId)) {
          activePlan = "monthly";
        } else {
          activePlan = "lifetime";
        }
      }
    }

    return { isPremium, unlockedThemes, activePlan, resolvedAt: Date.now() };
  }

  private toOffering(offering: PurchasesOffering): PurchaseOffering {
    const prefix = this.config.themeEntitlementPrefix;
    let lifetime: PurchaseOption | null = null;
    let annual: PurchaseOption | null = null;
    let monthly: PurchaseOption | null = null;
    const themePacks: Record<string, PurchaseOption> = {};

    for (const pkg of offering.availablePackages) {
      const option: PurchaseOption = {
        id: pkg.identifier,
        priceString: pkg.product.priceString,
        productId: pkg.product.identifier
      };
      if (
        pkg.identifier === this.config.lifetimePackageId ||
        pkg.packageType === PACKAGE_TYPE.LIFETIME
      ) {
        lifetime = option;
      } else if (
        pkg.identifier === this.config.annualPackageId ||
        pkg.packageType === PACKAGE_TYPE.ANNUAL
      ) {
        annual = option;
      } else if (
        pkg.identifier === this.config.monthlyPackageId ||
        pkg.packageType === PACKAGE_TYPE.MONTHLY
      ) {
        monthly = option;
      } else if (pkg.product.identifier.startsWith(prefix)) {
        const themeId = pkg.product.identifier.slice(prefix.length);
        if (themeId.length > 0) themePacks[themeId] = option;
      }
    }

    return { lifetime, annual, monthly, themePacks };
  }

  private persist(snapshot: EntitlementSnapshot): EntitlementSnapshot {
    this.store.set(snapshot);
    return snapshot;
  }
}
