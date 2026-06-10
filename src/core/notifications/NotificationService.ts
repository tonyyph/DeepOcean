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
};

export type DiveCompletionInput = {
  fireAt: number;
  title: string;
  body: string;
  sound: string | true;
};

export type ActiveDiveInput = {
  title: string;
  body: string;
};

export type PermissionState = "granted" | "denied" | "undetermined";

let handlerConfigured = false;
const configuredChannels = new Set<string>();

// Foreground presentation: a reminder should surface even while the app is
// open. Configured once, lazily, to avoid side effects at import time.
function ensureHandler(): void {
  if (handlerConfigured) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false
    })
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

async function ensureReminderChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  if (configuredChannels.has(DIVE_REMINDER_CHANNEL)) return;
  await Notifications.setNotificationChannelAsync(DIVE_REMINDER_CHANNEL, {
    name: "Dive reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: "#22E4FF",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
  });
  configuredChannels.add(DIVE_REMINDER_CHANNEL);
}

async function ensureCompletionChannel(sound: string | true): Promise<string> {
  const channelId = completionChannelId(sound);
  if (Platform.OS !== "android") return channelId;
  if (configuredChannels.has(channelId)) return channelId;
  await Notifications.setNotificationChannelAsync(channelId, {
    name: "Dive completion",
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: "#22E4FF",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: sound === true ? "default" : sound,
    vibrationPattern: [0, 240, 120, 240]
  });
  configuredChannels.add(channelId);
  return channelId;
}

async function ensureActiveDiveChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  if (configuredChannels.has(ACTIVE_DIVE_CHANNEL)) return;
  await Notifications.setNotificationChannelAsync(ACTIVE_DIVE_CHANNEL, {
    name: "Active dive",
    importance: Notifications.AndroidImportance.LOW,
    lightColor: "#22E4FF",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: null
  });
  configuredChannels.add(ACTIVE_DIVE_CHANNEL);
}

export const NotificationService = {
  /** Idempotent. Safe to call on every app launch. */
  async configure(): Promise<void> {
    if (Platform.OS === "web") return;
    ensureHandler();
    await Promise.all([ensureReminderChannel(), ensureActiveDiveChannel()]);
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
        allowSound: true
      }
    });
    return status === "granted";
  },

  /**
   * Schedules a repeating daily local notification.
   * Returns the OS identifier so the caller can persist + later cancel it.
   */
  async scheduleDailyReminder(input: DailyReminderInput): Promise<string> {
    await this.configure();
    return Notifications.scheduleNotificationAsync({
      content: {
        title: input.title,
        body: input.body,
        sound: true
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: input.hour,
        minute: input.minute,
        channelId: DIVE_REMINDER_CHANNEL
      }
    });
  },

  async scheduleDiveCompletion(input: DiveCompletionInput): Promise<string> {
    await this.configure();
    const channelId = await ensureCompletionChannel(input.sound);
    return Notifications.scheduleNotificationAsync({
      content: {
        title: input.title,
        body: input.body,
        sound: input.sound,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        color: "#22E4FF",
        data: { kind: "dive-complete" },
        interruptionLevel: "timeSensitive"
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(input.fireAt),
        channelId
      }
    });
  },

  async notifyDiveCompletionNow(input: Omit<DiveCompletionInput, "fireAt">) {
    await this.configure();
    const channelId = await ensureCompletionChannel(input.sound);
    return Notifications.scheduleNotificationAsync({
      content: {
        title: input.title,
        body: input.body,
        sound: input.sound,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        color: "#22E4FF",
        data: { kind: "dive-complete" },
        interruptionLevel: "timeSensitive"
      },
      trigger: {
        channelId
      }
    });
  },

  async showActiveDive(input: ActiveDiveInput): Promise<string | null> {
    if (Platform.OS !== "android") return null;
    await this.configure();
    return Notifications.scheduleNotificationAsync({
      content: {
        title: input.title,
        body: input.body,
        sound: false,
        sticky: true,
        autoDismiss: false,
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
        color: "#22E4FF",
        data: { kind: "active-dive" }
      },
      trigger: {
        channelId: ACTIVE_DIVE_CHANNEL
      }
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
  }
} as const;
