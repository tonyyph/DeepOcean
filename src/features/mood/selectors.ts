import type { Mood, MoodRecord } from "@/domain/entities";

/**
 * Pure selectors over a MoodRecord. Keeping these centralized means screens
 * never reach into the record shape directly.
 */
export const selectCurrentMood = (r: MoodRecord | undefined): Mood | null =>
  r?.currentMood ?? null;

export const selectMoodUpdatedAt = (r: MoodRecord | undefined): number | null =>
  r?.lastMoodUpdatedAt ?? null;

export const selectHasMood = (r: MoodRecord | undefined): boolean =>
  Boolean(r?.currentMood);
