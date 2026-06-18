type FocusSession = {
  startedAt: number;
  elapsedSeconds: number;
  status: string;
};

export type WidgetFocusMetrics = {
  todayMinutes: number;
  weekMinutes: number;
};

export function getWidgetFocusMetrics(
  sessions: readonly FocusSession[],
  now: number
): WidgetFocusMetrics {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);

  let todaySeconds = 0;
  let weekSeconds = 0;
  for (const session of sessions) {
    if (session.status === "cancelled") continue;
    const elapsed = Math.max(0, session.elapsedSeconds);
    if (session.startedAt >= weekStart.getTime() && session.startedAt < tomorrow.getTime()) {
      weekSeconds += elapsed;
    }
    if (session.startedAt >= today.getTime() && session.startedAt < tomorrow.getTime()) {
      todaySeconds += elapsed;
    }
  }

  return {
    todayMinutes: Math.round(todaySeconds / 60),
    weekMinutes: Math.round(weekSeconds / 60)
  };
}
