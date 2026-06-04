import type { AIContext, Language } from "@/domain/entities";
import { ZONE_TABLE } from "@/features/ocean/zones";
import type { ReflectionInput } from "./AIProvider";

/** A pair of prompts ready to be adapted to any chat-style LLM API. */
export type PromptPair = { system: string; user: string };

const PERSONA: Record<Language, string> = {
  en: "You are the in-app AI companion of DeepOcean, a focus app where focus sessions are ocean dives. Sound human, warm, and specific to the diver's real data. Never invent facts. Never use emojis, markdown, headings, or lists. Keep response to at most two short sentences in natural English.",
  vi: "Bạn là AI đồng hành ngay trong DeepOcean, một ứng dụng tập trung nơi mỗi phiên tập trung được ví như chuyến lặn biển. Hãy nói tự nhiên như người thật, ấm áp và bám sát dữ liệu thật của người dùng. Không bịa thông tin. Không dùng emoji, markdown, tiêu đề hay danh sách. Trả lời tối đa hai câu ngắn, tiếng Việt tự nhiên."
};

function contextLines(ctx: AIContext): string {
  const zones = ctx.unlockedZones.map((z) => ZONE_TABLE[z].label).join(", ");
  const recent = ctx.recentSessions
    .slice(0, 5)
    .map((s) =>
      ctx.language === "vi"
        ? `${s.minutes} phút ở ${ZONE_TABLE[s.zone].label}, ${s.discoveries} khám phá`
        : `${s.minutes}min in ${ZONE_TABLE[s.zone].label}, ${s.discoveries} finds`
    )
    .join("; ");
  const last = ctx.recentSessions[0];

  const mood =
    ctx.language === "vi" ? moodLabelVi(ctx.mood) : (ctx.mood ?? "unknown");

  const recency = !last
    ? ctx.language === "vi"
      ? "Chưa có phiên gần đây"
      : "No recent dives"
    : ctx.language === "vi"
      ? `Phiên gần nhất: ${last.minutes} phút ở ${ZONE_TABLE[last.zone].label}, ${last.discoveries} khám phá`
      : `Last dive: ${last.minutes}min in ${ZONE_TABLE[last.zone].label}, ${last.discoveries} finds`;

  return [
    `Level: ${ctx.level}`,
    `XP: ${ctx.xp}`,
    ctx.language === "vi"
      ? `Streak hiện tại: ${ctx.streakDays} ngày`
      : `Current streak: ${ctx.streakDays} day(s)`,
    ctx.language === "vi"
      ? `Streak dài nhất: ${ctx.longestStreakDays} ngày`
      : `Longest streak: ${ctx.longestStreakDays} day(s)`,
    ctx.language === "vi"
      ? `Tổng số chuyến lặn: ${ctx.totalDives}`
      : `Total dives: ${ctx.totalDives}`,
    ctx.language === "vi"
      ? `Tâm trạng hiện tại: ${mood}`
      : `Current mood: ${mood}`,
    ctx.language === "vi"
      ? `Vùng đã mở: ${zones || "Sunlight Zone"}`
      : `Unlocked zones: ${zones || "Sunlight Zone"}`,
    ctx.language === "vi"
      ? `Thành tựu đã mở: ${ctx.achievements.length}`
      : `Achievements earned: ${ctx.achievements.length}`,
    recency,
    ctx.language === "vi"
      ? `Lịch sử gần đây: ${recent || "chưa có"}`
      : `Recent dives: ${recent || "none yet"}`
  ].join("\n");
}

export function buildRecommendationPrompt(ctx: AIContext): PromptPair {
  const instruction =
    ctx.language === "vi"
      ? "Đưa ra đúng 1 đề xuất hữu ích cho hôm nay gồm: thời lượng cụ thể (phút), vùng lặn phù hợp, ý định tập trung rõ ràng và 1 bước bắt đầu trong 30 giây. Phải bám sát dữ liệu trong context (mood, streak, phiên gần nhất). Tránh lời khuyên chung chung kiểu sáo rỗng."
      : "Give exactly 1 useful recommendation for today with: a specific duration in minutes, a suitable dive zone, a clear focus intention, and 1 concrete 30-second starting action. It must be grounded in the provided context (mood, streak, last dive). Avoid generic motivational fluff.";

  return {
    system: PERSONA[ctx.language],
    user: `${instruction}\n\n${contextLines(ctx)}`
  };
}

export function buildMotivationPrompt(ctx: AIContext): PromptPair {
  const instruction =
    ctx.language === "vi"
      ? "Viết 1 câu động viên ngắn nghe như người thật, có nhắc tối thiểu 1 dữ kiện cụ thể từ context (ví dụ streak, tổng số chuyến, hoặc phiên gần nhất). Không chung chung."
      : "Write 1 short encouragement line that sounds human and references at least 1 concrete fact from context (streak, total dives, or last dive). Avoid generic wording.";

  return {
    system: PERSONA[ctx.language],
    user: `${instruction}\n\n${contextLines(ctx)}`
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
    user:
      language === "vi"
        ? `Phản hồi ấm áp về phiên lặn vừa xong, phải nhắc đúng thời lượng và vùng sâu nhất, rồi khép lại bằng 1 câu ngắn có ý nghĩa thực tế.\n\nThời lượng: ${input.minutes} phút.\nVùng sâu nhất: ${input.zoneLabel}.\nSố khám phá: ${input.discoveries}.\n${finds}`
        : `Reflect warmly on the finished dive, explicitly mentioning the duration and deepest zone, then close with one practical meaningful line.\n\nDuration: ${input.minutes} minutes.\nDeepest zone: ${input.zoneLabel}.\nDiscoveries: ${input.discoveries}.\n${finds}`
  };
}

function moodLabelVi(mood: AIContext["mood"]): string {
  switch (mood) {
    case "focused":
      return "tập trung";
    case "tired":
      return "mệt";
    case "burned_out":
      return "kiệt sức";
    case "motivated":
      return "đầy động lực";
    case "curious":
      return "tò mò";
    default:
      return "chưa rõ";
  }
}
