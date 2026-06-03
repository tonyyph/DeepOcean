import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "@/core/i18n";
import { useSettings } from "@/stores";
import {
  cancelDiveReminder,
  scheduleDiveReminder,
  type ReminderCopy
} from "./reminderScheduler";
import { useNotificationPermission } from "./useNotificationPermission";

/** Formats an hour/minute pair as a zero-padded 24h `HH:MM` label. */
export function formatReminderTime(hour: number, minute: number): string {
  const h = String(hour).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Single source of truth for the dive-reminder UI. Bridges settings (intent),
 * the OS scheduler (NotificationService) and persistence (NotificationRepository)
 * while keeping ProfileScreen declarative.
 */
export function useDiveReminders(): {
  enabled: boolean;
  hour: number;
  minute: number;
  timeLabel: string;
  busy: boolean;
  setEnabled: (next: boolean) => Promise<boolean>;
  setTime: (hour: number, minute: number) => Promise<void>;
} {
  const tr = useTranslations();
  const enabled = useSettings((s) => s.diveRemindersEnabled);
  const hour = useSettings((s) => s.reminderHour);
  const minute = useSettings((s) => s.reminderMinute);
  const update = useSettings((s) => s.update);
  const { request } = useNotificationPermission();
  const [busy, setBusy] = useState(false);

  const copy = useMemo<ReminderCopy>(
    () => ({
      title: tr.notifications.reminderTitle,
      body: tr.notifications.reminderBody
    }),
    [tr]
  );

  const setEnabled = useCallback(
    async (next: boolean) => {
      setBusy(true);
      try {
        if (next) {
          const granted = await request();
          if (!granted) {
            update({ diveRemindersEnabled: false });
            return false;
          }
          await scheduleDiveReminder(hour, minute, copy);
          update({ diveRemindersEnabled: true });
          return true;
        }
        await cancelDiveReminder();
        update({ diveRemindersEnabled: false });
        return true;
      } finally {
        setBusy(false);
      }
    },
    [request, hour, minute, copy, update]
  );

  const setTime = useCallback(
    async (nextHour: number, nextMinute: number) => {
      update({ reminderHour: nextHour, reminderMinute: nextMinute });
      if (!enabled) return;
      setBusy(true);
      try {
        await scheduleDiveReminder(nextHour, nextMinute, copy);
      } finally {
        setBusy(false);
      }
    },
    [enabled, copy, update]
  );

  return {
    enabled,
    hour,
    minute,
    timeLabel: formatReminderTime(hour, minute),
    busy,
    setEnabled,
    setTime
  };
}
