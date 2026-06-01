import { create } from "zustand";
import { StorageKeys, TypedStore } from "@/core/storage/mmkv";
import type { OceanZone } from "@/features/ocean/zones";
import type { TitleAchievement } from "@/features/diver/titleAchievements";

type AchievementsState = {
  unlockedZones: OceanZone[];
  /** IDs of all title achievements the player has earned. */
  unlockedTitleAchievements: string[];
  /**
   * Mark a zone as unlocked.
   * Returns `true` if this is the first time (new achievement), `false` if already known.
   */
  unlockZone: (zone: OceanZone) => boolean;
  /**
   * Persist a batch of newly earned title achievements.
   * Safe to call with an empty array (no-op).
   */
  persistTitleAchievements: (achievements: TitleAchievement[]) => void;
};

type PersistedData = {
  unlockedZones: OceanZone[];
  unlockedTitleAchievements: string[];
};

const store = new TypedStore<PersistedData>(StorageKeys.achievements);
const DEFAULT: PersistedData = {
  unlockedZones: ["surface"],
  unlockedTitleAchievements: []
};

export const useAchievements = create<AchievementsState>((set, get) => ({
  ...DEFAULT,
  ...store.get(DEFAULT),

  unlockZone: (zone) => {
    const current = get().unlockedZones;
    if (current.includes(zone)) return false;
    const next = [...current, zone];
    store.set({ ...store.get(DEFAULT), unlockedZones: next });
    set({ unlockedZones: next });
    return true;
  },

  persistTitleAchievements: (achievements) => {
    if (achievements.length === 0) return;
    const current = get().unlockedTitleAchievements;
    const next = [...current, ...achievements.map((a) => a.id)];
    store.set({ ...store.get(DEFAULT), unlockedTitleAchievements: next });
    set({ unlockedTitleAchievements: next });
  }
}));
