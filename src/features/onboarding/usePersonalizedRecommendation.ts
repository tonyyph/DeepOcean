import { useSettings } from "@/stores";
import { usePersonalization } from "@/stores/personalizationStore";
import { useDiverProfile } from "@/features/diver";
import { useCallback, useState } from "react";
import type { AIRecommendation, GoalId } from "@/domain/entities";
import {
  recommendFallback,
  requestPersonalizedRecommendation
} from "./recommendationEngine";

type RecommendationStatus = "idle" | "loading" | "success" | "error";

export function usePersonalizedRecommendation(selectedGoals: readonly GoalId[]) {
  const language = useSettings((s) => s.language);
  const preferredMinutes = useSettings((s) => s.preferredSessionMinutes);
  const cached = usePersonalization((s) => s.lastAIRecommendation);
  const setRecommendation = usePersonalization((s) => s.setRecommendation);
  const { data: profile } = useDiverProfile();
  const [status, setStatus] = useState<RecommendationStatus>(
    cached ? "success" : "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setLocalRecommendation] =
    useState<AIRecommendation | null>(cached);

  const generate = useCallback(async (): Promise<AIRecommendation> => {
    setStatus("loading");
    setError(null);
    try {
      const next = await requestPersonalizedRecommendation({
        selectedGoals: [...selectedGoals],
        language,
        usage: {
          preferredMinutes,
          streakDays: profile?.currentStreakDays ?? 0,
          totalDives: profile?.totalDives ?? 0
        }
      });
      setLocalRecommendation(next);
      setRecommendation(next);
      setStatus("success");
      return next;
    } catch {
      const fallback = recommendFallback({
        selectedGoals: [...selectedGoals],
        language,
        usage: { preferredMinutes }
      });
      setLocalRecommendation(fallback);
      setRecommendation(fallback);
      setError("fallback");
      setStatus("error");
      return fallback;
    }
  }, [
    language,
    preferredMinutes,
    profile,
    selectedGoals,
    setRecommendation
  ]);

  return {
    recommendation,
    status,
    error,
    retry: generate
  };
}
