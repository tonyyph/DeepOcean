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

export type DailyReminderInput = {
  hour: number;
  minute: number;
  title: string;
  body: string;
};

export type PermissionState = "granted" | "denied" | "undetermined";

let handlerConfigured = false;
let channelConfigured = false;

// Foreground presentation: a reminder should surface even while the app is
// open. Configured once, lazily, to avoid side effects at import time.
function ensureHandler(): void {
  if (handlerConfigured) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false
    })
  });
  handlerConfigured = true;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android" || channelConfigured) return;
  await Notifications.setNotificationChannelAsync(DIVE_REMINDER_CHANNEL, {
    name: "Dive reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: "#22E4FF",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
  });
  channelConfigured = true;
}

export const NotificationService = {
  /** Idempotent. Safe to call on every app launch. */
  async configure(): Promise<void> {
    if (Platform.OS === "web") return;
    ensureHandler();
    await ensureAndroidChannel();
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

  async cancelReminder(identifier: string): Promise<void> {
    if (Platform.OS === "web") return;
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch {
      // Identifier may already be gone (OS cleared / user wiped). Non-fatal.
    }
  }
} as const;
