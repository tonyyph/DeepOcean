export const REMINDER_HOURS = Array.from({ length: 24 }, (_, index) => index);

export const REMINDER_MINUTES = Array.from(
  { length: 60 },
  (_, index) => index * 1
);

export function snapReminderMinute(minute: number): number {
  const bounded = Math.max(0, Math.min(59, minute));
  return Math.min(55, Math.round(bounded / 5) * 5);
}

export function pickerIndexFromOffset(
  offset: number,
  itemHeight: number,
  itemCount: number
): number {
  if (itemCount <= 0 || itemHeight <= 0) return 0;
  return Math.max(
    0,
    Math.min(itemCount - 1, Math.round(Math.max(0, offset) / itemHeight))
  );
}
