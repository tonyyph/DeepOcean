import { StorageKeys, TypedStore } from "@/core/storage/mmkv";
import type { CollectionEntry } from "@/domain/entities";
import type { ICollectionRepository } from "@/domain/repositories";

const store = new TypedStore<CollectionEntry[]>(StorageKeys.collection);

export class CollectionRepository implements ICollectionRepository {
  async all(): Promise<CollectionEntry[]> {
    return store.get([]);
  }
  async recordSighting(entryId: string): Promise<CollectionEntry> {
    const all = store.get([]);
    const existing = all.find((e) => e.id === entryId);
    if (existing) {
      existing.count += 1;
      store.set(all);
      return existing;
    }
    const created: CollectionEntry = {
      id: entryId,
      firstSeenAt: Date.now(),
      count: 1
    };
    all.push(created);
    store.set(all);
    return created;
  }
}
