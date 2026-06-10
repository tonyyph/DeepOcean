// Theme engine types — a theme is a complete visual identity: colors, gradients,
// fonts, ambient particle field, and zone palette. Adding a new theme should not
// require touching any consumer code — just register a new file in `./index.ts`.

import type { OceanZone } from "@/features/ocean/zones";
import { radii, spacing, motion } from "../tokens";

export const THEME_IDS = [
  "deep",
  "reef",
  "glow",
  "ice",
  "ember",
  "coral"
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderStrong: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  accentSoft: string;
  danger: string;
  success: string;
  warning: string;
  glass: string;
  glassEdge: string;
  /** Used for premium badge / paywall accent — usually amber/gold. */
  premium: string;
};

export type ThemeGradient = readonly [string, string, string];

export type ThemeGradients = {
  surface: ThemeGradient;
  twilight: ThemeGradient;
  midnight: ThemeGradient;
  abyss: ThemeGradient;
  trench: ThemeGradient;
  /** Two-stop accent gradient used for glows, CTA highlights. */
  bioGlow: readonly [string, string];
};

export type ThemeFonts = {
  display: string;
  body: string;
  label: string;
  mono: string;
  /** Letter spacing override for display headings (some serifs need 0). */
  displayLetterSpacing: number;
};

export type ParticleStyle =
  | "dust" // soft drifting motes, upward — Deep default
  | "bubbles" // crisp rising orbs — Glow / Reef
  | "snow" // slow downward flakes — Ice
  | "embers" // warm upward sparks — Ember
  | "petals"; // wide horizontal sway — Coral

export type ThemeParticles = {
  style: ParticleStyle;
  count: number;
  /** [min, max] radius in px. */
  size: readonly [number, number];
  /** Base vertical speed scalar (px/s). */
  speed: number;
  /** Horizontal sway amplitude. */
  drift: number;
  /** Skia blur radius applied to the whole particle group. */
  blur: number;
  /** Cycle through these hues across particles. */
  hues: readonly string[];
  /** Radial vignette stops [center, mid, edge]. */
  vignette: readonly [string, string, string];
  /** Full animation loop in ms. */
  loopMs: number;
  /** Base particle opacity. */
  opacity: number;
};

export type AppTheme = {
  id: ThemeId;
  name: string;
  description: string;
  premium: boolean;
  colors: ThemeColors;
  gradients: ThemeGradients;
  fonts: ThemeFonts;
  particles: ThemeParticles;
  radii: typeof radii;
  spacing: typeof spacing;
  motion: typeof motion;
};

export type ZoneGradientKey = OceanZone;
