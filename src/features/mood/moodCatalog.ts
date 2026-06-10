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
  curious: { mood: "curious", icon: "compass-outline" },
  happy: { mood: "happy", icon: "happy-outline" },
  calm: { mood: "calm", icon: "leaf-outline" },
  excited: { mood: "excited", icon: "flash-outline" },
  anxious: { mood: "anxious", icon: "pulse-outline" },
  stressed: { mood: "stressed", icon: "alert-circle-outline" },
  distracted: { mood: "distracted", icon: "shuffle-outline" },
  sluggish: { mood: "sluggish", icon: "battery-dead-outline" },
  bored: { mood: "bored", icon: "remove-circle-outline" },
  overwhelmed: { mood: "overwhelmed", icon: "thunderstorm-outline" }
};
