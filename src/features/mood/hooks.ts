import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "@/data/container";
import type { Mood, MoodRecord } from "@/domain/entities";

export const moodKeys = {
  current: ["mood", "current"] as const
};

/** Reads the persisted mood record (survives restarts via MMKV). */
export function useMoodRecord() {
  return useQuery({
    queryKey: moodKeys.current,
    queryFn: () => container.mood.get(),
    staleTime: Infinity
  });
}

/**
 * Mutation to persist a mood selection. On success it invalidates both the
 * mood query and the daily recommendation so the AI guidance re-derives with
 * the new emotional context.
 */
export function useSetMood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mood: Mood) => {
      const record: MoodRecord = {
        currentMood: mood,
        lastMoodUpdatedAt: Date.now()
      };
      return container.mood.set(record);
    },
    onSuccess: (record) => {
      qc.setQueryData(moodKeys.current, record);
      qc.invalidateQueries({ queryKey: ["diver", "dailyRec"] });
    }
  });
}
