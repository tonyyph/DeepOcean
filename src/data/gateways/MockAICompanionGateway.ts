import type { IAICompanionGateway } from "@/domain/repositories";
import type { DiveSession, DiverProfile, Language } from "@/domain/entities";
import { ZONE_TABLE } from "@/features/ocean/zones";

const DAILY_REC = {
  en: {
    firstDive:
      "Begin with a 15-minute surface dive. Let your breath settle before the descent.",
    streak: (n: number) =>
      `Day ${n} of your streak. Try a 45-minute Twilight dive today — you're ready for the deeper light.`,
    default:
      "A short, focused 25-minute dive will do more for you today than a long, distracted one."
  },
  vi: {
    firstDive:
      "Bắt đầu với 15 phút lặn mặt nước thôi. Cho hơi thở ổn định trước khi xuống sâu.",
    streak: (n: number) =>
      `Ngày ${n} liên tiếp rồi. Thử lặn 45 phút vào vùng Twilight hôm nay đi — bạn đã sẵn sàng rồi.`,
    default:
      "Một lần lặn 25 phút tập trung sẽ có giá trị hơn nhiều so với một lần dài mà đầu óc để đâu đó."
  }
} as const;

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
    return msg.default;
  }

  async sessionSummary(session: DiveSession): Promise<string> {
    await wait(280);
    const minutes = Math.round(session.elapsedSeconds / 60);
    const zone = ZONE_TABLE[session.zone].label;
    const finds = session.discoveries.length;
    if (finds === 0) {
      return `You held focus for ${minutes} minutes and reached the ${zone}. Stillness is its own discovery.`;
    }
    return `You reached the ${zone} after ${minutes} minutes and encountered ${finds} ${finds === 1 ? "wonder" : "wonders"}. The deep remembers you.`;
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
