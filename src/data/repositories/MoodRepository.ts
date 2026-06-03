import { StorageKeys, TypedStore } from "@/core/storage/mmkv";
import type { MoodRecord } from "@/domain/entities";
import type { IMoodRepository } from "@/domain/repositories";

const DEFAULT: MoodRecord = {
  currentMood: null,
  lastMoodUpdatedAt: null
};

const store = new TypedStore<MoodRecord>(StorageKeys.mood);

/**
 * Persists the diver's current mood selection to MMKV so it survives restarts
 * and can feed the AI recommendation context.
 */
export class MoodRepository implements IMoodRepository {
  async get(): Promise<MoodRecord> {
    return store.get(DEFAULT);
  }

  async set(record: MoodRecord): Promise<MoodRecord> {
    store.set(record);
    return record;
  }

  async clear(): Promise<void> {
    store.set(DEFAULT);
  }
}
