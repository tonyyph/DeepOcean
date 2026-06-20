import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * NotificationService — thin, framework-agnostic wrapper around
 * expo-notifications. Owns OS-level concerns only (handler config, Android
 * channel, permission, scheduling). It holds NO business logic and NO
 * persistence; orchestration lives in the notifications feature hooks and the
 * NotificationRepository.
 */

export const DIVE_REMINDER_CHANNEL = "dive-reminders";
export const DIVE_COMPLETION_CHANNEL_PREFIX = "dive-completion";
export const ACTIVE_DIVE_CHANNEL = "active-dive";

export type DailyReminderInput = {
  hour: number;
  minute: number;
  title: string;
  body: string;
  channelName: string;
};

export type DiveCompletionInput = {
  fireAt: number;
  title: string;
  body: string;
  sound: string | true;
  channelName: string;
};

export type ActiveDiveInput = {
  title: string;
  body: string;
  channelName: string;
};

export type PermissionState = "granted" | "denied" | "undetermined";

let handlerConfigured = false;
const configuredChannels = new Set<string>();

// Foreground presentation: a reminder should surface even while the app is
// open. Configured once, lazily, to avoid side effects at import time.
function ensureHandler(): void {
  if (handlerConfigured) return;
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const isDiveCompletion =
        notification.request.content.data?.kind === "dive-complete";
      return {
        shouldShowAlert: false,
        shouldShowBanner: false,
        shouldShowList: false,
        // DiveScreen owns the foreground completion cue. The scheduled
        // notification remains audible only when the app is backgrounded.
        shouldPlaySound: !isDiveCompletion,
        shouldSetBadge: false,
      };
    },
  });
  handlerConfigured = true;
}

function completionChannelId(sound: string | true): string {
  if (sound === true) return `${DIVE_COMPLETION_CHANNEL_PREFIX}-default`;
  const safe = sound
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${DIVE_COMPLETION_CHANNEL_PREFIX}-${safe || "custom"}`;
}

async function ensureReminderChannel(name: string): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(DIVE_REMINDER_CHANNEL, {
    name,
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: "#22E4FF",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
  configuredChannels.add(DIVE_REMINDER_CHANNEL);
}

async function ensureCompletionChannel(
  sound: string | true,
  name: string,
): Promise<string> {
  const channelId = completionChannelId(sound);
  if (Platform.OS !== "android") return channelId;
  await Notifications.setNotificationChannelAsync(channelId, {
    name,
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: "#22E4FF",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: sound === true ? "default" : sound,
    vibrationPattern: [0, 240, 120, 240],
  });
  configuredChannels.add(channelId);
  return channelId;
}

async function ensureActiveDiveChannel(name: string): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(ACTIVE_DIVE_CHANNEL, {
    name,
    importance: Notifications.AndroidImportance.LOW,
    lightColor: "#22E4FF",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: null,
  });
  configuredChannels.add(ACTIVE_DIVE_CHANNEL);
}

export const NotificationService = {
  /** Idempotent. Safe to call on every app launch. */
  async configure(): Promise<void> {
    if (Platform.OS === "web") return;
    ensureHandler();
  },

  async getPermissionState(): Promise<PermissionState> {
    if (Platform.OS === "web") return "denied";
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    if (status === "granted") return "granted";
    if (status === "undetermined" || canAskAgain) return "undetermined";
    return "denied";
  },

  /** Current grant state without ever prompting the user. */
  async hasPermission(): Promise<boolean> {
    if (Platform.OS === "web") return false;
    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted";
  },

  /** Requests permission, returning whether it is now granted. */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === "web") return false;
    const current = await Notifications.getPermissionsAsync();
    if (current.status === "granted") return true;
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
      },
    });
    return status === "granted";
  },

  /**
   * Schedules a repeating daily local notification.
   * Returns the OS identifier so the caller can persist + later cancel it.
   */
  async scheduleDailyReminder(input: DailyReminderInput): Promise<string> {
    await this.configure();
    await ensureReminderChannel(input.channelName);
    return Notifications.scheduleNotificationAsync({
      content: {
        title: input.title,
        body: input.body,
        sound: true,
        data: { kind: "dive-reminder", deepLink: "/dive" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: input.hour,
        minute: input.minute,
        channelId: DIVE_REMINDER_CHANNEL,
      },
    });
  },

  async scheduleDiveCompletion(input: DiveCompletionInput): Promise<string> {
    await this.configure();
    const channelId = await ensureCompletionChannel(
      input.sound,
      input.channelName,
    );
    return Notifications.scheduleNotificationAsync({
      content: {
        title: input.title,
        body: input.body,
        sound: input.sound,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        color: "#22E4FF",
        data: { kind: "dive-complete" },
        interruptionLevel: "timeSensitive",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(input.fireAt),
        channelId,
      },
    });
  },

  async notifyDiveCompletionNow(input: Omit<DiveCompletionInput, "fireAt">) {
    await this.configure();
    const channelId = await ensureCompletionChannel(
      input.sound,
      input.channelName,
    );
    return Notifications.scheduleNotificationAsync({
      content: {
        title: input.title,
        body: input.body,
        sound: input.sound,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        color: "#22E4FF",
        data: { kind: "dive-complete" },
        interruptionLevel: "timeSensitive",
      },
      trigger: {
        channelId,
      },
    });
  },

  async showActiveDive(input: ActiveDiveInput): Promise<string | null> {
    if (Platform.OS !== "android") return null;
    await this.configure();
    await ensureActiveDiveChannel(input.channelName);
    return Notifications.scheduleNotificationAsync({
      content: {
        title: input.title,
        body: input.body,
        sound: false,
        sticky: true,
        autoDismiss: false,
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
        color: "#22E4FF",
        data: { kind: "active-dive" },
      },
      trigger: {
        channelId: ACTIVE_DIVE_CHANNEL,
      },
    });
  },

  async cancelReminder(identifier: string): Promise<void> {
    if (Platform.OS === "web") return;
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch {
      // Identifier may already be gone (OS cleared / user wiped). Non-fatal.
    }
  },

  async cancelScheduled(identifier: string | null): Promise<void> {
    if (Platform.OS === "web" || !identifier) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch {
      // Identifier may already be gone.
    }
  },

  async dismissPresented(identifier: string | null): Promise<void> {
    if (Platform.OS === "web" || !identifier) return;
    try {
      await Notifications.dismissNotificationAsync(identifier);
    } catch {
      // Some platforms only support dismissing delivered notifications.
    }
  },

  async clearDiveSessionNotifications(): Promise<void> {
    if (Platform.OS === "web") return;
    try {
      const [scheduled, presented] = await Promise.all([
        Notifications.getAllScheduledNotificationsAsync(),
        Notifications.getPresentedNotificationsAsync(),
      ]);
      const isDiveNotification = (
        notification: Notifications.NotificationRequest,
      ) => {
        const kind = notification.content.data?.kind;
        return kind === "dive-complete" || kind === "active-dive";
      };
      await Promise.all([
        ...scheduled
          .filter(isDiveNotification)
          .map((notification) =>
            Notifications.cancelScheduledNotificationAsync(
              notification.identifier,
            ),
          ),
        ...presented
          .filter((notification) => isDiveNotification(notification.request))
          .map((notification) =>
            Notifications.dismissNotificationAsync(
              notification.request.identifier,
            ),
          ),
      ]);
    } catch {
      // Cleanup is idempotent and best-effort; unsupported OS calls must not
      // block session hydration.
    }
  },

  addReceivedListener(
    listener: (notification: Notifications.Notification) => void,
  ): Notifications.Subscription | null {
    if (Platform.OS === "web") return null;
    ensureHandler();
    return Notifications.addNotificationReceivedListener(listener);
  },

  addResponseListener(
    listener: (response: Notifications.NotificationResponse) => void,
  ): Notifications.Subscription | null {
    if (Platform.OS === "web") return null;
    ensureHandler();
    return Notifications.addNotificationResponseReceivedListener(listener);
  },

  async consumeLastResponse(): Promise<Notifications.NotificationResponse | null> {
    if (Platform.OS === "web") return null;
    const response = await Notifications.getLastNotificationResponseAsync();
    if (response) {
      await Notifications.clearLastNotificationResponseAsync();
    }
    return response;
  },
} as const;
