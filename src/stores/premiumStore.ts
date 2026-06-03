import { create, StoreApi, UseBoundStore } from "zustand";
import { THEME_IDS, type ThemeId } from "@/design-system/themes";
import { container } from "@/data/container";
import { PurchaseCancelledError } from "@/data/repositories/PremiumRepository";
import type { EntitlementSnapshot } from "@/domain/entities";

/**
 * Premium store — reactive cache over the entitlement gateway (RevenueCat via
 * `container.premium`). The gateway is the source of truth; this store mirrors
 * the resolved snapshot so components can read premium state synchronously.
 *
 * Free themes never appear in `unlockedThemes` — they are free for all.
 * `unlockedThemes` tracks ONLY individually-purchased premium themes.
 */

const VALID_THEME_IDS = new Set<string>(THEME_IDS);

function narrowThemes(ids: readonly string[]): ThemeId[] {
  return ids.filter((id): id is ThemeId => VALID_THEME_IDS.has(id));
}

type PurchaseStatus = "idle" | "loading" | "error";

type PremiumState = {
  isPremium: boolean;
  unlockedThemes: ThemeId[];
  /** True when a real billing provider is configured. */
  isConfigured: boolean;
  /** Tracks in-flight purchase/restore calls for the paywall UI. */
  status: PurchaseStatus;
  /** Configure the SDK and resolve entitlements (call once at launch). */
  hydrate: () => Promise<void>;
  /** Buy the lifetime all-access pass. Resolves true on success, false if cancelled. */
  purchaseLifetime: () => Promise<boolean>;
  /** Buy a single premium theme. Resolves true on success, false if cancelled. */
  purchaseTheme: (id: ThemeId) => Promise<boolean>;
  /** Restore prior purchases from the store account. Resolves true on success. */
  restore: () => Promise<boolean>;
};

function applySnapshot(
  snapshot: EntitlementSnapshot
): Pick<PremiumState, "isPremium" | "unlockedThemes"> {
  return {
    isPremium: snapshot.isPremium,
    unlockedThemes: narrowThemes(snapshot.unlockedThemes)
  };
}

export const usePremium: UseBoundStore<StoreApi<PremiumState>> =
  create<PremiumState>((set) => {
    async function runPurchase(
      op: () => Promise<EntitlementSnapshot>
    ): Promise<boolean> {
      set({ status: "loading" });
      try {
        const snapshot = await op();
        set({ ...applySnapshot(snapshot), status: "idle" });
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
      ...applySnapshot(container.premium.cached()),
      isConfigured: container.premium.isConfigured,
      status: "idle",

      hydrate: async () => {
        // Reflect the offline cache immediately, then reconcile with the store.
        set(applySnapshot(container.premium.cached()));
        try {
          await container.premium.configure();
          const fresh = await container.premium.refresh();
          set(applySnapshot(fresh));
        } catch {
          // Offline / not configured — keep the cached snapshot.
        }
      },

      purchaseLifetime: () =>
        runPurchase(() => container.premium.purchaseLifetime()),
      purchaseTheme: (id) =>
        runPurchase(() => container.premium.purchaseTheme(id)),
      restore: () => runPurchase(() => container.premium.restore())
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
