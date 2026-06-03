// Domain entities — pure types, no React, no I/O.

import type { OceanZone } from "@/features/ocean/zones";
import type { Discovery } from "@/features/ocean/discoveryEngine";

export type DiveSessionStatus =
  | "idle"
  | "diving"
  | "paused"
  | "surfaced"
  | "cancelled";

export type DiveSession = {
  id: string;
  startedAt: number; // epoch ms
  endedAt: number | null;
  /** Target duration in seconds; null = open-ended free dive. */
  targetSeconds: number | null;
  /** Total elapsed *focused* seconds (excludes paused time). */
  elapsedSeconds: number;
  status: DiveSessionStatus;
  zone: OceanZone;
  depthMeters: number;
  oxygenPct: number; // 0..1 — drops if user leaves app, recovers slowly
  discoveries: Discovery[];
  seed: number;
  /** Reward outcome captured at surface time. Absent on legacy/in-progress sessions. */
  summary?: DiveSessionSummary;
};

/** Immutable snapshot of the rewards a finished dive produced. */
export type DiveSessionSummary = {
  xpEarned: number;
  levelBefore: number;
  levelAfter: number;
  levelsGained: number;
};

export type DiverProfile = {
  id: string;
  name: string;
  level: number;
  xp: number;
  totalDives: number;
  totalFocusMinutes: number;
  longestStreakDays: number;
  currentStreakDays: number;
  preferredZone: OceanZone | null;
};

export type CollectionEntry = {
  id: string; // creature.id or artifact.id
  firstSeenAt: number;
  count: number;
};

/** Intent the diver wants to cultivate during/after a dive. */
export type Mood = "focused" | "tired" | "burned_out" | "motivated" | "curious";

/** Canonical, ordered list of supported moods (stable keys, not labels). */
export const MOODS: readonly Mood[] = [
  "focused",
  "tired",
  "burned_out",
  "motivated",
  "curious"
] as const;

/** Persisted mood selection. `null` mood = user has never chosen one. */
export type MoodRecord = {
  currentMood: Mood | null;
  lastMoodUpdatedAt: number | null;
};

export type Language = "en" | "vi";

/** Compact, serialisable view of a past dive used to prompt the AI companion. */
export type AIRecentSession = {
  at: number; // epoch ms (startedAt)
  minutes: number;
  zone: OceanZone;
  discoveries: number;
};

/**
 * Everything the AI companion needs to personalise output. Assembled in the
 * feature layer from profile + mood + sessions + achievements, then handed to
 * a provider. Pure data — no I/O, safe to serialise for caching/debugging.
 */
export type AIContext = {
  language: Language;
  level: number;
  xp: number;
  streakDays: number;
  longestStreakDays: number;
  totalDives: number;
  mood: Mood | null;
  unlockedZones: OceanZone[];
  /** Title-achievement ids the diver has earned. */
  achievements: string[];
  /** Most-recent dives first. */
  recentSessions: AIRecentSession[];
};

/**
 * Premium entitlement snapshot — the resolved purchase state for a user.
 * Theme identifiers are kept as opaque strings so the domain stays
 * independent of the design-system theme registry.
 */
export type EntitlementSnapshot = {
  /** Lifetime / all-access pass is active. */
  isPremium: boolean;
  /** Individually-purchased premium theme identifiers. */
  unlockedThemes: string[];
  /** epoch ms the snapshot was resolved (from store or cache). */
  resolvedAt: number;
};

/** A single buyable option surfaced on the paywall (price already localized). */
export type PurchaseOption = {
  /** Stable identifier used to initiate the purchase (RC package id). */
  id: string;
  /** Localized price string, e.g. "$9.99". */
  priceString: string;
  /** Underlying store product identifier. */
  productId: string;
};

/** Offerings resolved for the current user, ready for the paywall UI. */
export type PurchaseOffering = {
  /** Lifetime all-access option, if configured. */
  lifetime: PurchaseOption | null;
  /** Per-theme options keyed by theme identifier. */
  themePacks: Record<string, PurchaseOption>;
};

export type AppSettings = {
  hapticsEnabled: boolean;
  ambientVolume: number; // 0..1
  reducedMotion: boolean;
  preferredSessionMinutes: number;
  language: Language;
  /** Daily dive-reminder local notification toggle. */
  diveRemindersEnabled: boolean;
  /** Hour (0–23, device-local time) the daily reminder fires. */
  reminderHour: number;
  /** Minute (0–59) the daily reminder fires. */
  reminderMinute: number;
  /** Show discovery pop-up cards during a live dive session. */
  showDiscoveryAlerts: boolean;
};

/**
 * Persisted record of the OS-level daily reminder we have scheduled.
 * Used to cancel/replace the exact notification across restarts and to
 * guarantee a single active schedule (no duplicates).
 */
export type NotificationSchedule = {
  /** Identifier returned by the OS scheduler. */
  identifier: string;
  hour: number;
  minute: number;
  /** epoch ms when the schedule was created. */
  scheduledAt: number;
};
