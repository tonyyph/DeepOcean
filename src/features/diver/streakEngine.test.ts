import { computeStreak, localDayIndex } from "./streakEngine";

/**
 * Build an epoch from a *local* calendar date so the tests are independent of
 * the machine timezone: the constructor and `localDayIndex` both interpret in
 * the same local zone, so the day bucketing is stable everywhere.
 */
function day(year: number, month1: number, date: number, hour = 12): number {
  return new Date(year, month1 - 1, date, hour, 0, 0, 0).getTime();
}

describe("localDayIndex", () => {
  it("maps two times on the same local day to the same index", () => {
    expect(localDayIndex(day(2024, 3, 10, 0))).toBe(
      localDayIndex(day(2024, 3, 10, 23))
    );
  });

  it("maps consecutive calendar days to consecutive integers", () => {
    expect(
      localDayIndex(day(2024, 3, 11)) - localDayIndex(day(2024, 3, 10))
    ).toBe(1);
  });

  it("keeps consecutive integers across a month boundary", () => {
    expect(
      localDayIndex(day(2024, 4, 1)) - localDayIndex(day(2024, 3, 31))
    ).toBe(1);
  });

  it("keeps consecutive integers across a year boundary", () => {
    expect(
      localDayIndex(day(2025, 1, 1)) - localDayIndex(day(2024, 12, 31))
    ).toBe(1);
  });
});

describe("computeStreak", () => {
  it("returns zero for no dives", () => {
    expect(computeStreak([], day(2024, 3, 10))).toEqual({
      current: 0,
      longest: 0
    });
  });

  it("counts a single dive today as a streak of one", () => {
    const now = day(2024, 3, 10, 20);
    expect(computeStreak([day(2024, 3, 10, 9)], now)).toEqual({
      current: 1,
      longest: 1
    });
  });

  it("counts three consecutive days ending today", () => {
    const now = day(2024, 3, 12, 18);
    const ts = [day(2024, 3, 10), day(2024, 3, 11), day(2024, 3, 12)];
    expect(computeStreak(ts, now)).toEqual({ current: 3, longest: 3 });
  });

  it("keeps the current streak alive when the last dive was yesterday", () => {
    const now = day(2024, 3, 13, 8);
    const ts = [day(2024, 3, 10), day(2024, 3, 11), day(2024, 3, 12)];
    expect(computeStreak(ts, now)).toEqual({ current: 3, longest: 3 });
  });

  it("breaks the current streak when the last dive was two days ago", () => {
    const now = day(2024, 3, 14);
    const ts = [day(2024, 3, 10), day(2024, 3, 11), day(2024, 3, 12)];
    expect(computeStreak(ts, now)).toEqual({ current: 0, longest: 3 });
  });

  it("collapses multiple dives on the same day into one", () => {
    const now = day(2024, 3, 10, 23);
    const ts = [
      day(2024, 3, 10, 6),
      day(2024, 3, 10, 12),
      day(2024, 3, 10, 22)
    ];
    expect(computeStreak(ts, now)).toEqual({ current: 1, longest: 1 });
  });

  it("reports the longest historical run independent of the current run", () => {
    const now = day(2024, 3, 20);
    // 5-day run in the past, then a gap, then a 2-day run ending today.
    const ts = [
      day(2024, 3, 1),
      day(2024, 3, 2),
      day(2024, 3, 3),
      day(2024, 3, 4),
      day(2024, 3, 5),
      day(2024, 3, 19),
      day(2024, 3, 20)
    ];
    expect(computeStreak(ts, now)).toEqual({ current: 2, longest: 5 });
  });

  it("is order-independent", () => {
    const now = day(2024, 3, 12, 18);
    const ordered = [day(2024, 3, 10), day(2024, 3, 11), day(2024, 3, 12)];
    const shuffled = [day(2024, 3, 12), day(2024, 3, 10), day(2024, 3, 11)];
    expect(computeStreak(shuffled, now)).toEqual(computeStreak(ordered, now));
  });

  it("counts a lone dive yesterday as an alive streak of one", () => {
    const now = day(2024, 3, 11, 9);
    expect(computeStreak([day(2024, 3, 10)], now)).toEqual({
      current: 1,
      longest: 1
    });
  });

  it("does not count a future-only dive toward the current streak", () => {
    // Latest dive is two days after 'now' (e.g. clock rolled back) → not today/yesterday.
    const now = day(2024, 3, 10);
    expect(computeStreak([day(2024, 3, 12)], now)).toEqual({
      current: 0,
      longest: 1
    });
  });

  it("is fully deterministic across repeated calls", () => {
    const now = day(2024, 3, 12, 18);
    const ts = [day(2024, 3, 10), day(2024, 3, 11), day(2024, 3, 12)];
    const first = computeStreak(ts, now);
    const second = computeStreak(ts, now);
    expect(first).toEqual(second);
  });
});
