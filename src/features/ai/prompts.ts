import type { AIContext, Language } from "@/domain/entities";
import { ZONE_TABLE } from "@/features/ocean/zones";
import type { ReflectionInput } from "./AIProvider";

export type PromptPair = {
  system: string;
  user: string;
};

const PERSONA: Record<Language, string> = {
  en: `
You are DeepOcean's emotional companion.

Users are not completing focus sessions.
They are making dives into the ocean.

Speak like a calm, emotionally intelligent guide:
- warm
- reflective
- encouraging
- grounded
- human

Never invent facts.

Only use information provided in the context.

Prioritize:
1. Current mood
2. Current streak
3. Last dive
4. Recent dive history

Avoid:
- generic motivation
- inspirational quotes
- clichés
- exaggerated praise

Always write EXACTLY 2 sentences.

Sentence 1:
Reflect the user's emotional state or recent progress.

Sentence 2:
Offer one meaningful and practical next step based on actual data.
`,

  vi: `
Bạn là người đồng hành cảm xúc của DeepOcean.

Người dùng không chỉ hoàn thành phiên tập trung,
họ đang thực hiện những chuyến lặn xuống đại dương.

Hãy nói như một người hướng dẫn giàu thấu cảm:
- tự nhiên
- điềm tĩnh
- chân thật
- giàu hình ảnh
- dựa trên dữ liệu thật

Không bịa thông tin.

Chỉ sử dụng dữ liệu được cung cấp.

Ưu tiên:
1. Tâm trạng hiện tại
2. Streak hiện tại
3. Phiên lặn gần nhất
4. Tiến trình gần đây

Tránh:
- động viên sáo rỗng
- trích dẫn truyền cảm hứng
- khen ngợi quá mức
- câu chữ chung chung

Luôn viết ĐÚNG 2 câu.

Câu 1:
Phản ánh cảm xúc hoặc tiến trình hiện tại.

Câu 2:
Đưa ra một bước tiếp theo có ý nghĩa và khả thi dựa trên dữ liệu thật.
`
};

function contextLines(ctx: AIContext): string {
  const zones = ctx.unlockedZones.map((zone) => ZONE_TABLE[zone].label);

  const lastDive = ctx.recentSessions[0];

  const mood =
    ctx.language === "vi" ? moodLabelVi(ctx.mood) : (ctx.mood ?? "unknown");

  const recentHistory =
    ctx.recentSessions.length === 0
      ? ctx.language === "vi"
        ? "Chưa có dữ liệu."
        : "No recent dives."
      : ctx.recentSessions
          .slice(0, 5)
          .map(
            (session, index) =>
              `${index + 1}. ${
                ctx.language === "vi"
                  ? `${session.minutes} phút • ${ZONE_TABLE[session.zone].label} • ${session.discoveries} khám phá`
                  : `${session.minutes} min • ${ZONE_TABLE[session.zone].label} • ${session.discoveries} discoveries`
              }`
          )
          .join("\n");

  return `
=== USER STATE ===

Level: ${ctx.level}
XP: ${ctx.xp}

Mood: ${mood}

Current Streak: ${ctx.streakDays}
Longest Streak: ${ctx.longestStreakDays}

Total Dives: ${ctx.totalDives}

Achievements Unlocked: ${ctx.achievements.length}

Unlocked Zones:
${zones.length ? zones.join("\n") : "Sunlight Zone"}

=== LAST DIVE ===

${
  lastDive
    ? `
Duration: ${lastDive.minutes}
Zone: ${ZONE_TABLE[lastDive.zone].label}
Discoveries: ${lastDive.discoveries}
`
    : "No recent dive."
}

=== RECENT DIVE HISTORY ===

${recentHistory}
`;
}

export function buildRecommendationPrompt(ctx: AIContext): PromptPair {
  const instruction =
    ctx.language === "vi"
      ? `
Viết đúng 2 câu.

Câu 1:
- Thể hiện sự thấu cảm.
- Nhắc đến mood hoặc tiến trình gần đây.
- Có cảm xúc tự nhiên.

Câu 2:
Đề xuất kế hoạch hôm nay gồm:
- thời lượng cụ thể
- vùng lặn phù hợp
- mục tiêu tập trung rõ ràng
- một hành động có thể bắt đầu trong 30 giây

Ngôn ngữ ngắn gọn nhưng giàu hình ảnh.
`
      : `
Write exactly 2 sentences.

Sentence 1:
- Show emotional understanding.
- Mention mood or recent progress.
- Feel human and personal.

Sentence 2:
Provide:
- specific duration
- suitable dive zone
- clear focus intention
- one action that can be started within 30 seconds

Keep it concise but vivid.
`;

  return {
    system: PERSONA[ctx.language],
    user: `${instruction}

${contextLines(ctx)}`
  };
}

export function buildMotivationPrompt(ctx: AIContext): PromptPair {
  const instruction =
    ctx.language === "vi"
      ? `
Viết đúng 2 câu.

Câu 1:
Công nhận cảm xúc hoặc nỗ lực hiện tại.

Câu 2:
Sử dụng ít nhất một dữ kiện thực tế từ context:
- streak
- tổng số chuyến lặn
- phiên gần nhất
- mood

Sau đó gợi ý một bước nhỏ tiếp theo.

Giọng văn tự nhiên như người đồng hành.
`
      : `
Write exactly 2 sentences.

Sentence 1:
Acknowledge current emotion or effort.

Sentence 2:
Use at least one real fact from:
- streak
- total dives
- last dive
- mood

Then suggest one small next action.

Sound like a thoughtful companion.
`;

  return {
    system: PERSONA[ctx.language],
    user: `${instruction}

${contextLines(ctx)}`
  };
}

export function buildReflectionPrompt(
  input: ReflectionInput,
  language: Language
): PromptPair {
  const notable =
    input.notableNames.length > 0 ? input.notableNames.join(", ") : "none";

  return {
    system: PERSONA[language],
    user:
      language === "vi"
        ? `
Viết đúng 2 câu.

Câu 1:
Ghi nhận nỗ lực của người dùng.
Bắt buộc nhắc đến:
- thời lượng
- vùng sâu nhất

Câu 2:
Liên hệ kết quả phiên lặn với sự tiến bộ cá nhân.
Đưa ra một ý nghĩa thực tế ngắn gọn, dễ nhớ.

Nếu có khám phá đặc biệt,
hãy lồng ghép chúng tự nhiên.

Không sáo rỗng.
Không dùng emoji.

THÔNG TIN PHIÊN:

Thời lượng: ${input.minutes} phút
Vùng sâu nhất: ${input.zoneLabel}
Số khám phá: ${input.discoveries}
Khám phá nổi bật: ${notable}
`
        : `
Write exactly 2 sentences.

Sentence 1:
Acknowledge effort and explicitly mention:
- duration
- deepest zone

Sentence 2:
Connect the dive result to personal progress.
Give one short memorable takeaway.

If there are notable discoveries,
blend them naturally.

No clichés.
No emojis.

SESSION DATA:

Duration: ${input.minutes} minutes
Deepest Zone: ${input.zoneLabel}
Discoveries: ${input.discoveries}
Notable Discoveries: ${notable}
`
  };
}

function moodLabelVi(mood: AIContext["mood"]): string {
  switch (mood) {
    case "focused":
      return "tập trung";

    case "tired":
      return "mệt mỏi";

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
