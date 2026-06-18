import { getWidgetFocusMetrics } from "./metrics";

describe("getWidgetFocusMetrics", () => {
  test("separates today from the rolling seven-day window", () => {
    const now = new Date(2026, 5, 18, 12).getTime();
    const atDaysAgo = (days: number) => {
      const date = new Date(2026, 5, 18 - days, 9);
      return date.getTime();
    };

    expect(
      getWidgetFocusMetrics(
        [
          { startedAt: atDaysAgo(0), elapsedSeconds: 30 * 60, status: "surfaced" },
          { startedAt: atDaysAgo(3), elapsedSeconds: 45 * 60, status: "surfaced" },
          { startedAt: atDaysAgo(7), elapsedSeconds: 90 * 60, status: "surfaced" }
        ],
        now
      )
    ).toEqual({ todayMinutes: 30, weekMinutes: 75 });
  });

  test("ignores cancelled sessions and clamps invalid elapsed time", () => {
    const now = new Date(2026, 5, 18, 12).getTime();

    expect(
      getWidgetFocusMetrics(
        [
          { startedAt: now, elapsedSeconds: 50 * 60, status: "cancelled" },
          { startedAt: now, elapsedSeconds: -60, status: "surfaced" }
        ],
        now
      )
    ).toEqual({ todayMinutes: 0, weekMinutes: 0 });
  });
});
