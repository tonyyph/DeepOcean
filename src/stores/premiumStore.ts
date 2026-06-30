import { container } from "@/data/container";
import { PurchaseCancelledError } from "@/data/repositories/PremiumRepository";
import {
  normalizeThemeId,
  THEME_IDS,
  type ThemeId
} from "@/design-system/themes";
import type {
  EntitlementSnapshot,
  PlanId,
  PromoCodeResult,
  TrialState
} from "@/domain/entities";
import { create, StoreApi, UseBoundStore } from "zustand";

/**
 * Premium store — reactive cache over the entitlement gateway (RevenueCat via
 * `container.premium`). The gateway is the source of truth for real billing;
 * free all-access mode forces the effective premium state locally.
 *
 * Free themes never appear in `unlockedThemes` — they are free for all.
 * `unlockedThemes` tracks ONLY individually-purchased premium themes.
 */

const VALID_THEME_IDS = new Set<string>(THEME_IDS);
// Product mode: the full app is available without a paid entitlement.
const FREE_ALL_ACCESS_ENABLED = true;
const LEGACY_THEME_IDS: Record<string, ThemeId> = {
  deep: "prismWater",
  reef: "prismNature",
  glow: "prismLight",
  ice: "prismIce",
  ember: "prismFire",
  coral: "prismMystic",
  kelp: "prismNature",
  pearl: "prismLight",
  ruby: "prismDark",
  royal: "prismStorm",
  abyss: "prismWater",
  sunlit: "prismLight",
  ["bio" + "luminescent"]: "prismLight",
  arctic: "prismIce",
  volcanic: "prismMagma",
  coralGarden: "prismMystic"
};

function narrowThemes(ids: readonly string[]): ThemeId[] {
  const out = new Set<ThemeId>();
  for (const id of ids) {
    const legacyId = LEGACY_THEME_IDS[id];
    if (legacyId) {
      out.add(legacyId);
    } else if (VALID_THEME_IDS.has(id)) {
      out.add(normalizeThemeId(id));
    }
  }
  return Array.from(out);
}

type PurchaseStatus = "idle" | "loading" | "error";

type PremiumState = {
  /** Raw entitlement state resolved from billing provider. */
  entitlementPremium: boolean;
  isPremium: boolean;
  unlockedThemes: ThemeId[];
  activePlan: PlanId | null;
  /** Dev-only local override for fast premium UI testing. */
  debugPremiumEnabled: boolean;
  /** True when billing is usable or the build is running in all-access mode. */
  isConfigured: boolean;
  /** Tracks in-flight purchase/restore calls for the paywall UI. */
  status: PurchaseStatus;
  /** Active trial / promo state (null = not active). */
  trialState: TrialState | null;
  /** Configure the SDK and resolve entitlements (call once at launch). */
  hydrate: () => Promise<void>;
  /** Buy the lifetime all-access pass. Resolves true on success, false if cancelled. */
  purchaseLifetime: () => Promise<boolean>;
  /** Buy the annual subscription. Resolves true on success, false if cancelled. */
  purchaseAnnual: () => Promise<boolean>;
  /** Buy the monthly subscription. Resolves true on success, false if cancelled. */
  purchaseMonthly: () => Promise<boolean>;
  /** Buy a single premium theme. Resolves true on success, false if cancelled. */
  purchaseTheme: (id: ThemeId) => Promise<boolean>;
  /** Restore prior purchases from the store account. Resolves true on success. */
  restore: () => Promise<boolean>;
  /** Start a 7-day free trial. */
  startTrial: (planId: "annual" | "monthly") => Promise<TrialState | null>;
  /** Validate and activate a promo/experience code. */
  applyPromoCode: (code: string) => Promise<PromoCodeResult>;
  /** Dev-only premium toggle for local testing. */
  setDebugPremiumEnabled: (enabled: boolean) => void;
};

function applySnapshot(
  snapshot: EntitlementSnapshot,
  debugPremiumEnabled: boolean
): Pick<
  PremiumState,
  "entitlementPremium" | "isPremium" | "unlockedThemes" | "activePlan"
> {
  const isPremium =
    FREE_ALL_ACCESS_ENABLED || snapshot.isPremium || debugPremiumEnabled;

  return {
    entitlementPremium: snapshot.isPremium,
    isPremium,
    unlockedThemes: narrowThemes(snapshot.unlockedThemes),
    activePlan: isPremium ? snapshot.activePlan ?? "lifetime" : null
  };
}

export const usePremium: UseBoundStore<StoreApi<PremiumState>> =
  create<PremiumState>((set, get) => {
    async function runPurchase(
      op: () => Promise<EntitlementSnapshot>
    ): Promise<boolean> {
      if (FREE_ALL_ACCESS_ENABLED) {
        set({
          ...applySnapshot(
            container.premium.cached(),
            get().debugPremiumEnabled
          ),
          status: "idle"
        });
        return true;
      }

      set({ status: "loading" });
      try {
        const snapshot = await op();
        set({
          ...applySnapshot(snapshot, get().debugPremiumEnabled),
          status: "idle"
        });
        return true;
      } catch (error) {
        if (error instanceof PurchaseCancelledError) {
          set({ status: "idle" });
          return false;
        }
        set({ status: "error" });
        throw error;
      }
    }

    return {
      ...applySnapshot(container.premium.cached(), false),
      debugPremiumEnabled: false,
      isConfigured: FREE_ALL_ACCESS_ENABLED || container.premium.isConfigured,
      status: "idle",
      trialState: container.premium.activeTrial(),

      hydrate: async () => {
        // Reflect the offline cache immediately, then reconcile with the store.
        set({
          ...applySnapshot(
            container.premium.cached(),
            get().debugPremiumEnabled
          ),
          trialState: container.premium.activeTrial()
        });
        if (FREE_ALL_ACCESS_ENABLED) {
          return;
        }
        try {
          await container.premium.configure();
          const fresh = await container.premium.refresh();
          set({
            ...applySnapshot(fresh, get().debugPremiumEnabled),
            trialState: container.premium.activeTrial()
          });
        } catch {
          // Offline / not configured — keep the cached snapshot.
        }
      },

      purchaseLifetime: () =>
        runPurchase(() => container.premium.purchaseLifetime()),
      purchaseAnnual: () =>
        runPurchase(() => container.premium.purchaseAnnual()),
      purchaseMonthly: () =>
        runPurchase(() => container.premium.purchaseMonthly()),
      purchaseTheme: (id) =>
        runPurchase(() => container.premium.purchaseTheme(id)),
      restore: () => runPurchase(() => container.premium.restore()),

      startTrial: async (planId) => {
        if (FREE_ALL_ACCESS_ENABLED) {
          const trialState = container.premium.activeTrial();
          set({ trialState, status: "idle" });
          return trialState;
        }

        set({ status: "loading" });
        try {
          const state = await container.premium.startTrial(planId);
          set({ trialState: state, status: "idle" });
          return state;
        } catch (error) {
          if (error instanceof PurchaseCancelledError) {
            set({ status: "idle" });
            return null;
          }
          set({ status: "error" });
          throw error;
        }
      },

      applyPromoCode: async (code: string) => {
        set({ status: "loading" });
        try {
          const result = await container.premium.validatePromoCode(code);
          if (result.valid) {
            set({
              trialState: container.premium.activeTrial(),
              status: "idle"
            });
          } else {
            set({ status: "idle" });
          }
          return result;
        } catch {
          set({ status: "idle" });
          return { valid: false, reason: "not_found" } as PromoCodeResult;
        }
      },

      setDebugPremiumEnabled: (enabled) => {
        set((state) => ({
          debugPremiumEnabled: enabled,
          isPremium:
            FREE_ALL_ACCESS_ENABLED || state.entitlementPremium || enabled,
          activePlan:
            FREE_ALL_ACCESS_ENABLED || state.entitlementPremium || enabled
              ? state.activePlan ?? "lifetime"
              : null
        }));
      }
    };
  });

/** Pure helper — can a given theme be selected by this user right now? */
export function canUseTheme(
  themeId: ThemeId,
  themePremium: boolean,
  isPremium: boolean,
  unlocked: readonly ThemeId[]
): boolean {
  if (!themePremium) return true;
  if (isPremium) return true;
  return unlocked.includes(themeId);
}
