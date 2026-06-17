import { create } from "zustand";
import { container } from "@/data/container";
import type {
  NotificationMessage,
  NotificationMessageType,
} from "@/domain/entities";

type State = {
  messages: NotificationMessage[];
  isLoading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  record: (input: NotificationMessageInput) => Promise<NotificationMessage>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
};

export type NotificationMessageInput = {
  id?: string;
  title: string;
  body: string;
  type?: NotificationMessageType;
  deepLink?: string | null;
  source?: NotificationMessage["source"];
  createdAt?: number;
};

export const useNotificationCenter = create<State>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const messages = await container.notifications.listMessages();
      set({ messages, isLoading: false });
    } catch {
      set({
        isLoading: false,
        error: "load_failed",
      });
    }
  },

  record: async (input) => {
    const now = input.createdAt ?? Date.now();
    const message: NotificationMessage = {
      id: input.id ?? `message_${now}_${hashText(input.title + input.body)}`,
      title: input.title,
      body: input.body,
      type: input.type ?? "info",
      createdAt: now,
      readAt: null,
      deepLink: input.deepLink ?? null,
      source: input.source ?? "local",
    };
    await container.notifications.saveMessage(message);
    const messages = await container.notifications.listMessages();
    set({ messages, error: null });
    return message;
  },

  markRead: async (id) => {
    await container.notifications.markMessageRead(id);
    set({
      messages: get().messages.map((item) =>
        item.id === id && item.readAt == null
          ? { ...item, readAt: Date.now() }
          : item,
      ),
    });
  },

  markAllRead: async () => {
    await container.notifications.markAllMessagesRead();
    const readAt = Date.now();
    set({
      messages: get().messages.map((item) =>
        item.readAt == null ? { ...item, readAt } : item,
      ),
    });
  },
}));

export const selectUnreadNotificationCount = (state: State): number =>
  state.messages.reduce((count, item) => count + (item.readAt ? 0 : 1), 0);

function hashText(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
