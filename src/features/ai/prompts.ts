import type { AIContext, Language } from "@/domain/entities";
import { ZONE_TABLE } from "@/features/ocean/zones";
import type { ReflectionInput } from "./AIProvider";

/** A pair of prompts ready to be adapted to any chat-style LLM API. */
export type PromptPair = { system: string; user: string };

const PERSONA: Record<Language, string> = {
  en: "You are the AI companion inside DeepOcean, a calm focus app where a focus session is framed as a dive into the ocean. Speak warmly and concisely, like a wise diving mentor. Use gentle ocean imagery sparingly. Never use emojis, markdown, headings, or lists. Reply in at most two short sentences. Respond in English.",
  vi: "Bạn là người bạn đồng hành AI trong DeepOcean, một ứng dụng tập trung tĩnh lặng, nơi mỗi phiên tập trung được ví như một chuyến lặn biển. Hãy nói ấm áp và súc tích, như một người thầy lặn biển từng trải. Dùng hình ảnh biển cả nhẹ nhàng, vừa phải. Không dùng emoji, markdown, tiêu đề hay danh sách. Trả lời tối đa hai câu ngắn. Trả lời bằng tiếng Việt."
};

function contextLines(ctx: AIContext): string {
  const zones = ctx.unlockedZones.map((z) => ZONE_TABLE[z].label).join(", ");
  const recent = ctx.recentSessions
    .slice(0, 5)
    .map(
      (s) =>
        `${s.minutes}min in ${ZONE_TABLE[s.zone].label}, ${s.discoveries} finds`
    )
    .join("; ");
  return [
    `Level: ${ctx.level}`,
    `XP: ${ctx.xp}`,
    `Current streak: ${ctx.streakDays} day(s)`,
    `Longest streak: ${ctx.longestStreakDays} day(s)`,
    `Total dives: ${ctx.totalDives}`,
    `Current mood: ${ctx.mood ?? "unknown"}`,
    `Unlocked zones: ${zones || "Sunlight Zone"}`,
    `Achievements earned: ${ctx.achievements.length}`,
    `Recent dives: ${recent || "none yet"}`
  ].join("\n");
}

export function buildRecommendationPrompt(ctx: AIContext): PromptPair {
  return {
    system: PERSONA[ctx.language],
    user: `Based on this diver's state, suggest ONE concrete focus dive for today (a duration and an intention). Adapt to their mood and streak. Do not repeat generic advice.\n\n${contextLines(
      ctx
    )}`
  };
}

export function buildMotivationPrompt(ctx: AIContext): PromptPair {
  return {
    system: PERSONA[ctx.language],
    user: `Offer ONE short, genuine line of encouragement tailored to this diver right now. Reference their progress or mood concretely, not generically.\n\n${contextLines(
      ctx
    )}`
  };
}

export function buildReflectionPrompt(
  input: ReflectionInput,
  language: Language
): PromptPair {
  const finds =
    input.notableNames.length > 0
      ? `Notable encounters: ${input.notableNames.join(", ")}.`
      : "No creatures or artifacts surfaced.";
  return {
    system: PERSONA[language],
    user: `Reflect warmly on the dive the diver just finished. Acknowledge the effort and what they found.\n\nDuration: ${input.minutes} minutes.\nDeepest zone: ${input.zoneLabel}.\nDiscoveries: ${input.discoveries}.\n${finds}`
  };
}
