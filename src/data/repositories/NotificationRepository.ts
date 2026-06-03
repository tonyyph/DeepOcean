import { StorageKeys, TypedStore } from "@/core/storage/mmkv";
import type { NotificationSchedule } from "@/domain/entities";
import type { INotificationRepository } from "@/domain/repositories";

const store = new TypedStore<NotificationSchedule | null>(
  StorageKeys.notifications
);

/**
 * Persists the single active daily-reminder schedule (its OS identifier +
 * the time it represents). Keeping this in MMKV lets us cancel/replace the
 * exact notification after an app restart and guarantees we never stack
 * duplicate schedules.
 */
export class NotificationRepository implements INotificationRepository {
  async getSchedule(): Promise<NotificationSchedule | null> {
    return store.get(null);
  }

  async saveSchedule(schedule: NotificationSchedule): Promise<void> {
    store.set(schedule);
  }

  async clearSchedule(): Promise<void> {
    store.remove();
  }
}
