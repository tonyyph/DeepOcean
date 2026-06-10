import {
  ZONE_TABLE,
  OCEAN_ZONES,
  type OceanZone
} from "@/features/ocean/zones";
import type { AIContext, Mood } from "@/domain/entities";

/**
 * Offline companion composer — the graceful-degradation path used only when no
 * provider is configured AND no cached real response exists (e.g. a brand-new
 * install with no network). It does NOT carry a pool of pre-written advice;
 * every line is assembled from the diver's live numbers, mood and zones, so the
 * output is data-driven rather than canned.
 */

function deepestZone(zones: OceanZone[]): OceanZone {
  let deepest: OceanZone = "surface";
  for (const z of OCEAN_ZONES) {
    if (zones.includes(z)) deepest = z;
  }
  return deepest;
}

const MOOD_FOCUS: Record<Mood, { en: string; vi: string }> = {
  focused: {
    en: "lean into that focus with a longer descent",
    vi: "tận dụng sự tập trung ấy bằng một chuyến lặn dài hơn"
  },
  tired: {
    en: "keep it gentle and shallow today",
    vi: "hôm nay cứ nhẹ nhàng và lặn cạn thôi"
  },
  burned_out: {
    en: "give yourself a short, kind dive — no targets",
    vi: "cho mình một chuyến lặn ngắn, nhẹ nhàng — đừng đặt mục tiêu"
  },
  motivated: {
    en: "channel that drive toward a deeper zone",
    vi: "hướng nguồn năng lượng đó xuống một tầng sâu hơn"
  },
  curious: {
    en: "follow your curiosity and explore without a target",
    vi: "đi theo sự tò mò và khám phá không cần mục tiêu"
  },
  happy: {
    en: "turn that lightness into a steady, playful dive",
    vi: "biến sự nhẹ nhõm đó thành một chuyến lặn đều và thoải mái"
  },
  calm: {
    en: "keep the pace quiet and let the depth come naturally",
    vi: "giữ nhịp thật yên và để độ sâu đến tự nhiên"
  },
  excited: {
    en: "use that spark, but anchor it with one clear task",
    vi: "tận dụng sự hào hứng đó, nhưng neo lại bằng một việc thật rõ"
  },
  anxious: {
    en: "start small and make the first five minutes the whole goal",
    vi: "bắt đầu thật nhỏ và xem năm phút đầu là toàn bộ mục tiêu"
  },
  stressed: {
    en: "choose a shorter dive and let the pressure loosen first",
    vi: "chọn một chuyến lặn ngắn hơn và để áp lực dịu xuống trước"
  },
  distracted: {
    en: "pick one tiny target before you descend",
    vi: "chọn một mục tiêu thật nhỏ trước khi lặn"
  },
  sluggish: {
    en: "keep the dive shallow until your momentum returns",
    vi: "giữ chuyến lặn ở tầng cạn cho tới khi nhịp quay lại"
  },
  bored: {
    en: "add a small challenge to make the dive feel fresh",
    vi: "thêm một thử thách nhỏ để chuyến lặn mới mẻ hơn"
  },
  overwhelmed: {
    en: "lower the target and protect a calm first step",
    vi: "hạ mục tiêu xuống và giữ một bước đầu thật bình tĩnh"
  }
};

export function composeOfflineCompanion(
  kind: "recommendation" | "motivation",
  ctx: AIContext
): string {
  const vi = ctx.language === "vi";
  const zoneLabel = ZONE_TABLE[deepestZone(ctx.unlockedZones)].label;
  const moodHint = ctx.mood ? MOOD_FOCUS[ctx.mood] : null;

  if (kind === "motivation") {
    if (ctx.streakDays >= 2) {
      return vi
        ? `${ctx.streakDays} ngày liên tiếp rồi — nhịp lặn của bạn đang rất vững.`
        : `${ctx.streakDays} days in a row — your rhythm is holding strong.`;
    }
    if (ctx.totalDives > 0) {
      return vi
        ? `Bạn đã hoàn thành ${ctx.totalDives} chuyến lặn và xuống tới ${zoneLabel}. Cứ tiếp tục nhé.`
        : `You've completed ${ctx.totalDives} dives and reached the ${zoneLabel}. Keep going.`;
    }
    return vi
      ? "Chuyến lặn đầu tiên luôn là chuyến khó nhất. Hãy bắt đầu nhẹ nhàng."
      : "The first dive is always the hardest. Begin gently.";
  }

  // recommendation
  const suggestedMinutes =
    ctx.mood === "tired" ||
    ctx.mood === "burned_out" ||
    ctx.mood === "anxious" ||
    ctx.mood === "stressed" ||
    ctx.mood === "overwhelmed" ||
    ctx.mood === "sluggish"
      ? 15
      : ctx.mood === "motivated" || ctx.mood === "excited"
        ? 45
        : 25;

  if (ctx.totalDives === 0) {
    return vi
      ? "Bắt đầu với 15 phút lặn mặt nước. Cho hơi thở ổn định trước khi xuống sâu."
      : "Begin with a 15-minute surface dive. Let your breath settle before the descent.";
  }

  if (moodHint) {
    return vi
      ? `Hôm nay ${moodHint.vi}: thử một chuyến ${suggestedMinutes} phút ở ${zoneLabel}.`
      : `Today, ${moodHint.en}: try a ${suggestedMinutes}-minute dive in the ${zoneLabel}.`;
  }

  return vi
    ? `Thử một chuyến lặn ${suggestedMinutes} phút ở ${zoneLabel} — đều đặn hơn là sâu hơn.`
    : `Try a ${suggestedMinutes}-minute dive in the ${zoneLabel} — consistency over depth.`;
}
