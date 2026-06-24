import type { AIRecommendation } from "@/domain/entities";
import {
  normalizeRecommendation,
  recommendFallback
} from "./recommendationEngine";

function itemIds(recommendation: AIRecommendation): string[] {
  return recommendation.recommendedItems.map((item) => item.id);
}

describe("recommendFallback", () => {
  test("does not duplicate track progress when it is already selected", () => {
    const recommendation = recommendFallback({
      selectedGoals: ["track_progress"],
      language: "en"
    });

    expect(itemIds(recommendation)).toEqual(["item.track_progress"]);
    expect(recommendation.recommendedItems[0]?.isPremium).toBe(true);
  });

  test("deduplicates repeated selected goals before building items", () => {
    const recommendation = recommendFallback({
      selectedGoals: ["track_progress", "track_progress", "improve_focus"],
      language: "en"
    });

    expect(itemIds(recommendation)).toEqual([
      "item.track_progress",
      "item.improve_focus"
    ]);
  });
});

describe("normalizeRecommendation", () => {
  test("removes duplicate cached recommendation items", () => {
    const recommendation = recommendFallback({
      selectedGoals: ["track_progress"],
      language: "en"
    });
    const duplicate = {
      ...recommendation,
      recommendedItems: [
        ...recommendation.recommendedItems,
        recommendation.recommendedItems[0]!
      ]
    };

    expect(itemIds(normalizeRecommendation(duplicate))).toEqual([
      "item.track_progress"
    ]);
  });
});
