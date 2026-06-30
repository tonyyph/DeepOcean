import { OCEAN_ZONES, ZONE_TABLE } from "@/features/ocean/zones";
import type { Rarity } from "@/features/ocean/bestiary";
import type { ReflectionInput } from "@/features/ai/AIProvider";
import type { AIContext, DiveSession, Language } from "@/domain/entities";
import type { AIRequestOptions } from "@/domain/repositories";

type CacheEntry = { text: string; at: number };
type AIRequestKind = "recommendation" | "motivation" | "reflection";

const RARITY_RANK: Record<Rarity, number> = {
  mythic: 0,
  legendary: 1,
  rare: 2,
  uncommon: 3,
  common: 4
};
const DEFAULT_AUTO_COOLDOWN_HOURS = 24;
const MIN_AUTO_COOLDOWN_HOURS = 1 / 60;
const MAX_AUTO_COOLDOWN_HOURS = 24 * 7;
const AUTO_COOLDOWN_ENV_BY_KIND: Record<AIRequestKind, string> = {
  recommendation: "EXPO_PUBLIC_AI_RECOMMENDATION_COOLDOWN_HOURS",
  motivation: "EXPO_PUBLIC_AI_MOTIVATION_COOLDOWN_HOURS",
  reflection: "EXPO_PUBLIC_AI_REFLECTION_COOLDOWN_HOURS"
};

export function toReflectionInput(session: DiveSession): ReflectionInput {
  const notableNames = [...session.discoveries]
    .sort((a, b) => RARITY_RANK[a.entry.rarity] - RARITY_RANK[b.entry.rarity])
    .slice(0, 3)
    .map((d) => d.entry.name);
  return {
    minutes: Math.round(session.elapsedSeconds / 60),
    zoneLabel: ZONE_TABLE[session.zone].label,
    discoveries: session.discoveries.length,
    notableNames
  };
}

// Reflection has a distinct offline composer because its inputs differ.
export function composeOfflineReflection(
  input: ReflectionInput,
  language: Language
): string {
  if (language === "vi") {
    const base = `Bạn đã tập trung ${input.minutes} phút và xuống tới ${input.zoneLabel}.`;
    return input.discoveries > 0
      ? `${base} Gặp ${input.discoveries} điều kỳ diệu trên đường đi — biển sâu nhớ bạn đấy.`
      : `${base} Sự tĩnh lặng cũng là một khám phá.`;
  }
  const base = `You stayed with ${input.minutes} minutes of focus and reached the ${input.zoneLabel}.`;
  return input.discoveries > 0
    ? `${base} You met ${input.discoveries} wonder${input.discoveries === 1 ? "" : "s"} along the way — the deep remembers you.`
    : `${base} Stillness is its own discovery.`;
}

export function ensureRecommendationQuality(text: string, ctx: AIContext): string {
  const trimmed = text.trim();
  if (!trimmed) return fallbackRecommendation(ctx);

  const hasDuration = /(\d{1,3})\s?(min|mins|minute|minutes|phut|phút)/i.test(
    trimmed
  );
  const hasAction =
    /\b(start|begin|open|set|breathe|close|pause|bat dau|bắt đầu|thử|chọn|đặt)\b/i.test(
      trimmed
    );

  if (hasDuration && hasAction) return trimmed;
  return `${trimmed} ${fallbackRecommendation(ctx)}`.trim();
}

function fallbackRecommendation(ctx: AIContext): string {
  const zone = ZONE_TABLE[deepestUnlockedZone(ctx)].label;
  const mins = suggestedMinutes(ctx);

  if (ctx.language === "vi") {
    const intention = viIntention(ctx);
    return `Gợi ý cụ thể: lặn ${mins} phút ở ${zone}, mục tiêu là ${intention}. Bắt đầu ngay bằng cách đặt hẹn giờ ${mins} phút và tắt 1 nguồn xao nhãng.`;
  }

  const intention = enIntention(ctx);
  return `Specific plan: a ${mins}-minute dive in ${zone} with the intention to ${intention}. Start now by setting a ${mins}-minute timer and closing one distraction.`;
}

function deepestUnlockedZone(ctx: AIContext): keyof typeof ZONE_TABLE {
  let deepest: keyof typeof ZONE_TABLE = "surface";
  for (const zone of OCEAN_ZONES) {
    if (ctx.unlockedZones.includes(zone)) deepest = zone;
  }
  return deepest;
}

function suggestedMinutes(ctx: AIContext): number {
  if (ctx.mood === "burned_out") return 12;
  if (ctx.mood === "tired") return 15;
  if (ctx.mood === "motivated") return 40;
  if (ctx.streakDays >= 7) return 35;
  return 25;
}

function viIntention(ctx: AIContext): string {
  switch (ctx.mood) {
    case "burned_out":
      return "hạ tải tinh thần, chỉ giữ nhịp thở đều";
    case "tired":
      return "hoàn thành một việc nhỏ thật trọn vẹn";
    case "motivated":
      return "đẩy sâu một nhiệm vụ quan trọng nhất hôm nay";
    case "curious":
      return "khám phá một góc mới của nhiệm vụ đang làm";
    default:
      return "duy trì nhịp tập trung ổn định";
  }
}

function enIntention(ctx: AIContext): string {
  switch (ctx.mood) {
    case "burned_out":
      return "lower mental load and keep a steady breath";
    case "tired":
      return "finish one small task cleanly";
    case "motivated":
      return "push one high-impact task deeper";
    case "curious":
      return "explore one new angle of your current work";
    default:
      return "keep a stable focus rhythm";
  }
}

export function ensureMotivationQuality(text: string, ctx: AIContext): string {
  const trimmed = text.trim();
  if (!trimmed) return fallbackMotivation(ctx);

  const hasConcreteSignal =
    includesAnyNumber(trimmed, motivationAnchorNumbers(ctx)) ||
    hasMoodSignal(trimmed, ctx.language);

  if (hasConcreteSignal) return trimmed;
  return `${trimmed} ${fallbackMotivation(ctx)}`.trim();
}

function fallbackMotivation(ctx: AIContext): string {
  const zone = ZONE_TABLE[deepestUnlockedZone(ctx)].label;
  const last = ctx.recentSessions[0];

  if (ctx.language === "vi") {
    if (last) {
      return `Bạn vừa có phiên ${last.minutes} phút ở ${ZONE_TABLE[last.zone].label}; hôm nay chỉ cần lặp lại nhịp đó là đã rất tốt.`;
    }
    if (ctx.streakDays > 0) {
      return `Bạn đang giữ streak ${ctx.streakDays} ngày, cứ giữ một phiên ngắn ở ${zone} là đà sẽ tiếp tục.`;
    }
    return `Bạn đã có ${ctx.totalDives} chuyến lặn; bắt đầu thêm một phiên ngắn ở ${zone} để giữ nhịp.`;
  }

  if (last) {
    return `Your last dive was ${last.minutes} minutes in ${ZONE_TABLE[last.zone].label}; repeating that rhythm today is already a solid win.`;
  }
  if (ctx.streakDays > 0) {
    return `You are on a ${ctx.streakDays}-day streak, so one short dive in ${zone} is enough to keep momentum.`;
  }
  return `You already have ${ctx.totalDives} dives logged; start one short session in ${zone} to keep the rhythm alive.`;
}

function motivationAnchorNumbers(ctx: AIContext): number[] {
  const values = [ctx.streakDays, ctx.longestStreakDays, ctx.totalDives];
  const last = ctx.recentSessions[0];
  if (last) values.push(last.minutes, last.discoveries);
  return values.filter((n) => Number.isFinite(n));
}

function includesAnyNumber(text: string, numbers: number[]): boolean {
  return numbers.some((n) => {
    if (n < 0) return false;
    const token = String(Math.round(n));
    return token.length > 0 && new RegExp(`\\b${token}\\b`).test(text);
  });
}

function hasMoodSignal(text: string, language: Language): boolean {
  const lower = text.toLowerCase();
  if (language === "vi") {
    return /(tập trung|mệt|kiệt sức|động lực|tò mò)/.test(lower);
  }
  return /(focused|tired|burned out|motivated|curious)/.test(lower);
}

export function polishEmotionalReply(text: string, language: Language): string {
  let out = text.replace(/\s+/g, " ").trim();
  if (!out) return out;

  out = out
    .replace(/([.!?])(\S)/g, "$1 $2")
    .replace(/\s*([,;:])\s*/g, "$1 ")
    .replace(/\s+/g, " ")
    .trim();

  out = splitRunOnSentence(out, language);
  out = ensureEndingPunctuation(out);
  return out;
}

function splitRunOnSentence(text: string, language: Language): string {
  if (/[.!?].+[.!?]/.test(text)) return text;
  if (text.length < 120) return text;

  const patterns =
    language === "vi"
      ? [" nhưng ", " và ", " rồi ", " vì ", " để "]
      : [" but ", " and ", " so ", " then ", " because ", " while "];

  const lower = text.toLowerCase();
  for (const token of patterns) {
    const idx = lower.indexOf(token);
    if (idx > 42 && idx < text.length - 20) {
      const head = text
        .slice(0, idx)
        .trim()
        .replace(/[,:;]$/, "");
      const tailRaw = text.slice(idx + token.length).trim();
      const tail = language === "en" ? capitalizeFirst(tailRaw) : tailRaw;
      return `${head}. ${tail}`;
    }
  }

  const comma = text.indexOf(",");
  if (comma > 42 && comma < text.length - 20) {
    const head = text.slice(0, comma).trim();
    const tailRaw = text.slice(comma + 1).trim();
    const tail = language === "en" ? capitalizeFirst(tailRaw) : tailRaw;
    return `${head}. ${tail}`;
  }

  return text;
}

function ensureEndingPunctuation(text: string): string {
  if (/[.!?]$/.test(text)) return text;
  return `${text}.`;
}

function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function shouldServeCachedFirst(
  kind: AIRequestKind,
  cached: CacheEntry | undefined,
  options?: AIRequestOptions
): boolean {
  if (!cached?.text) return false;
  if (options?.forceRefresh) return false;

  const maxAgeMs = getAutoCooldownMs(kind);
  return Date.now() - cached.at <= maxAgeMs;
}

function getAutoCooldownMs(kind: AIRequestKind): number {
  const kindHours = parseCooldownHours(
    process.env[AUTO_COOLDOWN_ENV_BY_KIND[kind]]
  );
  const globalHours = parseCooldownHours(
    process.env.EXPO_PUBLIC_AI_AUTO_COOLDOWN_HOURS
  );
  const hours = kindHours ?? globalHours ?? DEFAULT_AUTO_COOLDOWN_HOURS;
  return Math.round(hours * 60 * 60 * 1000);
}

function parseCooldownHours(raw: string | undefined): number | null {
  if (!raw || raw.trim().length === 0) return null;
  const parsed = Number(raw.trim());
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return clamp(parsed, MIN_AUTO_COOLDOWN_HOURS, MAX_AUTO_COOLDOWN_HOURS);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function isTelemetryEnabled(): boolean {
  const raw = process.env.EXPO_PUBLIC_AI_TELEMETRY;
  if (!raw || raw.trim().length === 0) return __DEV__;
  return /^(1|true|yes|on)$/i.test(raw.trim());
}
