import { StorageKeys, TypedStore } from "@/core/storage/mmkv";
import type { DiveSession } from "@/domain/entities";
import type { ISessionRepository } from "@/domain/repositories";

const store = new TypedStore<DiveSession[]>(StorageKeys.sessions);

export class SessionRepository implements ISessionRepository {
  async list(): Promise<DiveSession[]> {
    return store.get([]);
  }
  async save(session: DiveSession): Promise<void> {
    const all = store.get([]);
    const idx = all.findIndex((s) => s.id === session.id);
    if (idx >= 0) all[idx] = session;
    else all.unshift(session);
    // Cap history so MMKV stays light
    store.set(all.slice(0, 500));
  }
  async byId(id: string): Promise<DiveSession | null> {
    return store.get([]).find((s) => s.id === id) ?? null;
  }
  async clearAll(): Promise<void> {
    store.remove();
  }
}
