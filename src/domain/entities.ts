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

export type Language = "en" | "vi";

export type AppSettings = {
  hapticsEnabled: boolean;
  ambientVolume: number; // 0..1
  reducedMotion: boolean;
  preferredSessionMinutes: number;
  language: Language;
  /** Mock dive-reminder daily notification toggle. */
  diveRemindersEnabled: boolean;
  /** Show discovery pop-up cards during a live dive session. */
  showDiscoveryAlerts: boolean;
};
