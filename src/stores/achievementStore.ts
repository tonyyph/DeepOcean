import { create } from "zustand";
import { StorageKeys, TypedStore } from "@/core/storage/mmkv";
import type { OceanZone } from "@/features/ocean/zones";

type AchievementsState = {
  unlockedZones: OceanZone[];
  /**
   * Mark a zone as unlocked.
   * Returns `true` if this is the first time this zone has been unlocked
   * (i.e. a new achievement), `false` if already known.
   */
  unlockZone: (zone: OceanZone) => boolean;
};

type PersistedData = { unlockedZones: OceanZone[] };

const store = new TypedStore<PersistedData>(StorageKeys.achievements);
const DEFAULT: PersistedData = {
  // surface is always accessible — no achievement needed
  unlockedZones: ["surface"]
};

export const useAchievements = create<AchievementsState>((set, get) => ({
  ...DEFAULT,
  ...store.get(DEFAULT),
  unlockZone: (zone) => {
    const current = get().unlockedZones;
    if (current.includes(zone)) return false;
    const next = [...current, zone];
    store.set({ unlockedZones: next });
    set({ unlockedZones: next });
    return true;
  }
}));
