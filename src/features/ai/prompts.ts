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

Strict constraint: Write EXACTLY 2 sentences. 
Each sentence MUST be on a new line.
Each sentence MUST contain only 15 to 20 words.

Sentence 1 (Line 1):
Reflect the user's emotional state or recent progress.

Sentence 2 (Line 2):
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

Ràng buộc nghiêm ngặt: Luôn viết ĐÚNG 2 câu.
Mỗi câu PHẢI xuống dòng riêng biệt.
Mỗi câu CHỈ ĐƯỢC phép dài từ 15 đến 20 từ.

Câu 1 (Dòng 1):
Phản ánh cảm xúc hoặc tiến trình hiện tại.

Câu 2 (Dòng 2):
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
Yêu cầu định dạng: Viết đúng 2 câu, mỗi câu nằm trên một dòng riêng biệt. Mỗi câu chỉ từ 15-20 từ.

Câu 1 (Dòng 1):
- Thể hiện sự thấu cảm dựa trên mood hoặc tiến trình gần đây với cảm xúc tự nhiên.

Câu 2 (Dòng 2):
Đề xuất kế hoạch hôm nay gồm: thời lượng, vùng lặn, mục tiêu tập trung và hành động bắt đầu trong 30 giây.
`
      : `
Formatting rule: Write exactly 2 sentences, each on a new line. Each sentence must be 15-20 words long.

Sentence 1 (Line 1):
- Show emotional understanding of mood or recent progress with a personal feel.

Sentence 2 (Line 2):
Provide today's plan including: specific duration, suitable zone, focus intention, and a 30-second starting action.
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
Yêu cầu định dạng: Viết đúng 2 câu, mỗi câu nằm trên một dòng riêng biệt. Mỗi câu chỉ từ 15-20 từ.

Câu 1 (Dòng 1):
Công nhận cảm xúc hoặc nỗ lực hiện tại của người dùng một cách tự nhiên.

Câu 2 (Dòng 2):
Sử dụng một dữ kiện thực tế từ context (streak/dives/mood) để gợi ý một hành động nhỏ tiếp theo.
`
      : `
Formatting rule: Write exactly 2 sentences, each on a new line. Each sentence must be 15-20 words long.

Sentence 1 (Line 1):
Acknowledge current emotion or effort as a thoughtful companion.

Sentence 2 (Line 2):
Use one real fact from context (streak, total dives, or mood) to suggest a small next action.
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
Yêu cầu định dạng: Viết đúng 2 câu, mỗi câu nằm trên một dòng riêng biệt. Mỗi câu chỉ từ 15-20 từ. Không dùng emoji.

Câu 1 (Dòng 1):
Ghi nhận nỗ lực cá nhân, bắt buộc nhắc đến thời lượng và vùng sâu nhất của phiên lặn này.

Câu 2 (Dòng 2):
Liên hệ kết quả hoặc khám phá nổi bật với tiến độ cá nhân thành một ý nghĩa ngắn gọn dễ nhớ.

THÔNG TIN PHIÊN:

Thời lượng: ${input.minutes} phút
Vùng sâu nhất: ${input.zoneLabel}
Số khám phá: ${input.discoveries}
Khám phá nổi bật: ${notable}
`
        : `
Formatting rule: Write exactly 2 sentences, each on a new line. Each sentence must be 15-20 words long. No emojis.

Sentence 1 (Line 1):
Acknowledge effort and explicitly mention the duration and the deepest zone reached during this focus session.

Sentence 2 (Line 2):
Connect the dive result or notable discoveries to personal progress as one short, memorable takeaway.

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
    // Nhóm cảm xúc tích cực / năng lượng cao
    case "focused":
      return "tập trung";
    case "motivated":
      return "đầy động lực";
    case "curious":
      return "tò mò";
    case "happy":
      return "hạnh phúc";
    case "calm":
      return "bình yên";
    case "excited":
      return "hào hứng";

    // Nhóm tiêu cực / áp lực / năng lượng thấp
    case "tired":
      return "mệt mỏi";
    case "burned_out":
      return "kiệt sức";
    case "anxious":
      return "lo lắng";
    case "stressed":
      return "căng thẳng";
    case "distracted":
      return "mất tập trung";
    case "sluggish":
      return "uể oải";
    case "bored":
      return "chán nản";
    case "overwhelmed":
      return "quá tải";

    default:
      return "chưa rõ";
  }
}
