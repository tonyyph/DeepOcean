/**
 * Streak engine — pure, deterministic streak computation from dive history.
 *
 * Design choices:
 * - The streak is derived *entirely* from session timestamps, never from a
 *   stored counter. Recomputing from history makes it self-healing: a missed
 *   day, a clock change, or a corrupted counter cannot drift the result.
 * - Days are bucketed by the device's *local* calendar date. Two dives on the
 *   same local day count once; midnight is the boundary the user actually
 *   experiences.
 * - No I/O, no React, no Date.now() inside the core — `now` is always passed
 *   in. This keeps the module 100% deterministic and trivially unit-testable.
 */

const DAY_MS = 86_400_000;

/**
 * Map an epoch timestamp to a stable, monotonic integer "day index" based on
 * the local calendar date.
 *
 * We read the local Y/M/D (timezone-aware) and re-anchor them to a UTC midnight
 * so the result is always an exact integer multiple of a day. This keeps
 * consecutive calendar dates exactly one apart even across DST transitions,
 * where local-midnight epochs differ by 23h or 25h.
 */
export function localDayIndex(epochMs: number): number {
  const d = new Date(epochMs);
  return Math.floor(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS
  );
}

export type StreakResult = {
  /** Consecutive local days, ending today or yesterday, with at least one dive. */
  current: number;
  /** Longest run of consecutive dive-days anywhere in history. */
  longest: number;
};

const EMPTY: StreakResult = { current: 0, longest: 0 };

/**
 * Compute the current and longest streak from a set of dive timestamps.
 *
 * @param timestamps Epoch-ms start times of dives (order irrelevant, duplicates
 *   and multiple-per-day are handled).
 * @param nowMs Reference "now" used to decide whether the current streak is
 *   still alive (latest dive is today or yesterday).
 */
export function computeStreak(
  timestamps: readonly number[],
  nowMs: number
): StreakResult {
  if (timestamps.length === 0) return EMPTY;

  // Unique, ascending local day indices.
  const days = Array.from(new Set(timestamps.map(localDayIndex))).sort(
    (a, b) => a - b
  );

  // Longest consecutive run anywhere in history.
  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = days[i] === days[i - 1]! + 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  // Current streak: only alive if the most recent dive-day is today or
  // yesterday. Any larger gap means the streak has lapsed.
  const today = localDayIndex(nowMs);
  const latest = days[days.length - 1]!;
  let current = 0;
  if (latest === today || latest === today - 1) {
    current = 1;
    for (let i = days.length - 2; i >= 0; i--) {
      if (days[i] === days[i + 1]! - 1) current++;
      else break;
    }
  }

  return { current, longest };
}
