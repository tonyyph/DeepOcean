import { NotificationService } from "@/core/notifications/NotificationService";
import { container } from "@/data/container";
import type { NotificationSchedule } from "@/domain/entities";

export type ReminderCopy = { title: string; body: string };

/**
 * Cancels any previously persisted schedule then creates a fresh daily
 * reminder, persisting the new OS identifier. Cancelling first is what
 * guarantees a single active schedule (no duplicates) across restarts and
 * repeated calls.
 */
export async function scheduleDiveReminder(
  hour: number,
  minute: number,
  copy: ReminderCopy
): Promise<NotificationSchedule | null> {
  const existing = await container.notifications.getSchedule();
  if (existing) {
    await NotificationService.cancelReminder(existing.identifier);
  }

  const identifier = await NotificationService.scheduleDailyReminder({
    hour,
    minute,
    title: copy.title,
    body: copy.body
  });

  const schedule: NotificationSchedule = {
    identifier,
    hour,
    minute,
    scheduledAt: Date.now()
  };
  await container.notifications.saveSchedule(schedule);
  return schedule;
}

/** Cancels the active reminder (if any) and clears persistence. */
export async function cancelDiveReminder(): Promise<void> {
  const existing = await container.notifications.getSchedule();
  if (existing) {
    await NotificationService.cancelReminder(existing.identifier);
  }
  await container.notifications.clearSchedule();
}

/**
 * Idempotent launch-time reconciliation. Ensures the OS state matches the
 * user's persisted intent:
 * - disabled        → cancel + clear
 * - enabled, in sync → no-op (avoids re-scheduling churn every launch)
 * - enabled, drifted → reschedule to the desired time
 */
export async function reconcileDiveReminder(
  enabled: boolean,
  hour: number,
  minute: number,
  copy: ReminderCopy
): Promise<void> {
  if (!enabled) {
    await cancelDiveReminder();
    return;
  }
  const granted = await NotificationService.hasPermission();
  if (!granted) {
    // Permission was revoked from OS settings — drop the stale schedule.
    await cancelDiveReminder();
    return;
  }
  const existing = await container.notifications.getSchedule();
  const inSync =
    existing && existing.hour === hour && existing.minute === minute;
  if (inSync) return;
  await scheduleDiveReminder(hour, minute, copy);
}
