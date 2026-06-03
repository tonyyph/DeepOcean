import type { Mood } from "@/domain/entities";
import type { Ionicons } from "@expo/vector-icons";

export type MoodMeta = {
  mood: Mood;
  icon: keyof typeof Ionicons.glyphMap;
};

/**
 * Static presentation metadata per mood. Labels are localized and live in
 * i18n (`tr.ai.moodLabels`); only stable, language-independent data belongs
 * here so persistence keys never depend on the active language.
 */
export const MOOD_META: Record<Mood, MoodMeta> = {
  focused: { mood: "focused", icon: "scan-outline" },
  tired: { mood: "tired", icon: "moon-outline" },
  burned_out: { mood: "burned_out", icon: "flame-outline" },
  motivated: { mood: "motivated", icon: "rocket-outline" },
  curious: { mood: "curious", icon: "compass-outline" }
};
