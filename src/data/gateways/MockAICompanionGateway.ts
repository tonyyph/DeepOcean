import type { IAICompanionGateway } from "@/domain/repositories";
import type { DiveSession, DiverProfile, Language } from "@/domain/entities";
import { ZONE_TABLE } from "@/features/ocean/zones";

// ─── Daily recommendation pool ───────────────────────────────────────────────

const DAILY_REC = {
  en: {
    firstDive:
      "Begin with a 15-minute surface dive. Let your breath settle before the descent.",
    streak: (n: number) =>
      `Day ${n} of your streak. Try a 45-minute Twilight dive today — you're ready for the deeper light.`,
    pool: [
      "A short, focused 25-minute dive will do more for you today than a long, distracted one.",
      "Try descending without a target today. See where your mind leads you.",
      "You've been consistent. Add 5 more minutes to your preferred depth — the midnight zone awaits.",
      "Before you dive, three slow breaths. In for 4, hold for 7, out for 8. Then descend.",
      "Focus follows ritual. Same time, same spot, same breath — and the ocean opens differently.",
      "If it feels hard today, stay shallow. Surface zone stillness has its own value.",
      "Your best dives aren't always the deepest. Sometimes the twilight zone is exactly right.",
      "Turn notifications off before descending. The surface world can wait 25 minutes."
    ]
  },
  vi: {
    firstDive:
      "Bắt đầu với 15 phút lặn mặt nước thôi. Cho hơi thở ổn định trước khi xuống sâu.",
    streak: (n: number) =>
      `Ngày ${n} liên tiếp rồi. Thử lặn 45 phút vào vùng Twilight hôm nay đi — bạn đã sẵn sàng rồi.`,
    pool: [
      "Một lần lặn 25 phút tập trung sẽ có giá trị hơn nhiều so với một lần dài mà đầu óc để đâu đó.",
      "Hôm nay thử lặn không đặt mục tiêu. Xem đầu óc dẫn bạn đến đâu.",
      "Bạn đang giữ được nhịp rồi. Thêm 5 phút nữa vào độ sâu quen thuộc — vùng Midnight đang chờ.",
      "Trước khi xuống, hít thở 3 lần thật chậm. Hít 4, giữ 7, thở ra 8. Rồi lặn thôi.",
      "Tập trung đi theo nghi thức. Cùng giờ, cùng chỗ, cùng nhịp thở — và biển sẽ mở ra khác hơn.",
      "Nếu hôm nay thấy khó, cứ lặn cạn thôi. Vùng mặt nước tĩnh lặng có giá trị riêng của nó.",
      "Những chuyến lặn hay nhất không phải lúc nào cũng sâu nhất. Đôi khi vùng Twilight là đủ rồi.",
      "Tắt thông báo trước khi xuống. Mặt nước phía trên có thể chờ 25 phút."
    ]
  }
} as const;

// ─── Session summary (bilingual) ─────────────────────────────────────────────

const SESSION_SUMMARY = {
  en: {
    noFinds: (minutes: number, zone: string) =>
      `You held focus for ${minutes} minutes and reached the ${zone}. Stillness is its own discovery.`,
    withFinds: (minutes: number, zone: string, finds: number) =>
      `You reached the ${zone} after ${minutes} minutes and encountered ${finds} ${finds === 1 ? "wonder" : "wonders"}. The deep remembers you.`
  },
  vi: {
    noFinds: (minutes: number, zone: string) =>
      `Bạn đã duy trì sự tập trung được ${minutes} phút và xuống tới ${zone}. Yên lặng cũng là một khám phá rồi.`,
    withFinds: (minutes: number, zone: string, finds: number) =>
      `Bạn xuống tới ${zone} sau ${minutes} phút và bắt gặp ${finds} ${finds === 1 ? "điều kỳ diệu" : "điều kỳ diệu"}. Biển sâu nhớ bạn đấy.`
  }
} as const;

// Vietnamese zone labels for summary
const ZONE_LABELS_VI: Record<string, string> = {
  "Sunlight Zone": "Vùng Ánh Sáng",
  "Twilight Zone": "Vùng Hoàng Hôn",
  "Midnight Zone": "Vùng Bóng Tối",
  "Abyssal Zone": "Vùng Vực Thẳm",
  "Hadal Trench": "Hố Sâu Hadal"
};

/**
 * MockAICompanionGateway — deterministic, offline-friendly stand-in for a
 * real LLM. Swap with a real backend gateway later without touching screens.
 */
export class MockAICompanionGateway implements IAICompanionGateway {
  async dailyRecommendation(
    profile: DiverProfile,
    language: Language
  ): Promise<string> {
    await wait(220);
    const msg = DAILY_REC[language] ?? DAILY_REC.en;
    if (profile.totalDives === 0) {
      return msg.firstDive;
    }
    if (profile.currentStreakDays >= 7) {
      return msg.streak(profile.currentStreakDays);
    }
    // Deterministic pick from pool based on totalDives so it changes after dives
    const idx = profile.totalDives % msg.pool.length;
    return msg.pool[idx] ?? msg.pool[0] ?? msg.firstDive;
  }

  async sessionSummary(
    session: DiveSession,
    language?: Language
  ): Promise<string> {
    await wait(280);
    const lang = language ?? "en";
    const minutes = Math.round(session.elapsedSeconds / 60);
    const zoneLabel = ZONE_TABLE[session.zone].label;
    const zone =
      lang === "vi" ? (ZONE_LABELS_VI[zoneLabel] ?? zoneLabel) : zoneLabel;
    const finds = session.discoveries.length;
    const tmpl = SESSION_SUMMARY[lang] ?? SESSION_SUMMARY.en;
    if (finds === 0) return tmpl.noFinds(minutes, zone);
    return tmpl.withFinds(minutes, zone, finds);
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
