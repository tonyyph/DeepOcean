import { create, StoreApi, UseBoundStore } from "zustand";
import { StorageKeys, TypedStore } from "@/core/storage/mmkv";
import type { ThemeId } from "@/design-system/themes";

/**
 * Mock premium store — persisted via MMKV. No real IAP wired up yet.
 * `purchase()` and `restore()` are local toggles; swap with RevenueCat /
 * react-native-iap when ready.
 *
 * Free themes don't appear in `unlockedThemes` — they're free for all.
 * `unlockedThemes` tracks ONLY premium themes the user has unlocked.
 */

type PremiumPersisted = {
  isPremium: boolean;
  unlockedThemes: ThemeId[];
};

const DEFAULT: PremiumPersisted = { isPremium: false, unlockedThemes: [] };

const store = new TypedStore<PremiumPersisted>(StorageKeys.premium);

type PremiumState = PremiumPersisted & {
  /** Unlock ALL premium content (lifetime pass). */
  purchaseLifetime: () => void;
  /** Unlock a single theme (e.g. "single theme pack"). */
  unlockTheme: (id: ThemeId) => void;
  /** Mock restore — no-op locally; would call IAP.restore() in production. */
  restore: () => void;
  /** Dev/debug: revoke everything. */
  reset: () => void;
};

export const usePremium: UseBoundStore<StoreApi<PremiumState>> =
  create<PremiumState>((set, get) => ({
    ...DEFAULT,
    ...store.get(DEFAULT),
    purchaseLifetime: () =>
      set(() => {
        const next: PremiumPersisted = {
          isPremium: true,
          unlockedThemes: get().unlockedThemes
        };
        store.set(next);
        return next;
      }),
    unlockTheme: (id) =>
      set(() => {
        const existing = get().unlockedThemes;
        if (existing.includes(id)) return {};
        const unlockedThemes = [...existing, id];
        const next: PremiumPersisted = {
          isPremium: get().isPremium,
          unlockedThemes
        };
        store.set(next);
        return { unlockedThemes };
      }),
    restore: () => {
      // Mock — would re-read entitlements from IAP receipts in production.
    },
    reset: () =>
      set(() => {
        store.set(DEFAULT);
        return DEFAULT;
      })
  }));

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
