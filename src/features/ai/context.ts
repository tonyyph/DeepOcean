import { container } from "@/data/container";
import { useAchievements } from "@/stores";
import type { AIContext, AIRecentSession, Language } from "@/domain/entities";

const MAX_RECENT_SESSIONS = 5;

/**
 * Assembles the full {@link AIContext} from persisted state. Lives in the
 * feature layer because it reaches across multiple repositories + the
 * achievement store — none of which the data-layer gateway should know about.
 */
export async function buildAIContext(language: Language): Promise<AIContext> {
  const [profile, moodRecord, sessions] = await Promise.all([
    container.diver.get(),
    container.mood.get(),
    container.sessions.list()
  ]);

  const ach = useAchievements.getState();

  const recentSessions: AIRecentSession[] = sessions
    .slice(0, MAX_RECENT_SESSIONS)
    .map((s) => ({
      at: s.startedAt,
      minutes: Math.round(s.elapsedSeconds / 60),
      zone: s.zone,
      discoveries: s.discoveries.length
    }));

  return {
    language,
    level: profile.level,
    xp: profile.xp,
    streakDays: profile.currentStreakDays,
    longestStreakDays: profile.longestStreakDays,
    totalDives: profile.totalDives,
    mood: moodRecord.currentMood,
    unlockedZones: ach.unlockedZones,
    achievements: ach.unlockedTitleAchievements,
    recentSessions
  };
}
