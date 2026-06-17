import { StorageKeys, TypedStore } from "@/core/storage/mmkv";
import type {
  NotificationMessage,
  NotificationSchedule,
} from "@/domain/entities";
import type { INotificationRepository } from "@/domain/repositories";

const store = new TypedStore<NotificationSchedule | null>(
  StorageKeys.notifications,
);
const messageStore = new TypedStore<NotificationMessage[]>(
  StorageKeys.notificationMessages,
);

const MAX_MESSAGES = 80;

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

  async listMessages(): Promise<NotificationMessage[]> {
    return messageStore
      .get([])
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async saveMessage(message: NotificationMessage): Promise<void> {
    const messages = await this.listMessages();
    const existingIndex = messages.findIndex((item) => item.id === message.id);
    const next =
      existingIndex >= 0
        ? messages.map((item) => (item.id === message.id ? message : item))
        : [message, ...messages];
    messageStore.set(next.slice(0, MAX_MESSAGES));
  }

  async markMessageRead(id: string): Promise<void> {
    const readAt = Date.now();
    const messages = (await this.listMessages()).map((item) =>
      item.id === id && item.readAt == null ? { ...item, readAt } : item,
    );
    messageStore.set(messages);
  }

  async markAllMessagesRead(): Promise<void> {
    const readAt = Date.now();
    const messages = (await this.listMessages()).map((item) =>
      item.readAt == null ? { ...item, readAt } : item,
    );
    messageStore.set(messages);
  }
}
