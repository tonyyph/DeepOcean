import { StorageKeys, TypedStore } from "@/core/storage/mmkv";
import type { DiverProfile } from "@/domain/entities";
import type { IDiverRepository } from "@/domain/repositories";

const store = new TypedStore<DiverProfile>(StorageKeys.diverProfile);

const DEFAULT: DiverProfile = {
  id: "me",
  name: "Diver",
  level: 1,
  xp: 0,
  totalDives: 0,
  totalFocusMinutes: 0,
  longestStreakDays: 0,
  currentStreakDays: 0,
  preferredZone: null
};

export class DiverRepository implements IDiverRepository {
  async get(): Promise<DiverProfile> {
    return store.get(DEFAULT);
  }
  async update(patch: Partial<DiverProfile>): Promise<DiverProfile> {
    const current = store.get(DEFAULT);
    const next = { ...current, ...patch };
    store.set(next);
    return next;
  }
}
