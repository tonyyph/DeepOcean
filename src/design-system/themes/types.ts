// Theme engine types — a theme is a complete visual identity: colors, gradients,
// fonts, ambient particle field, and zone palette. Adding a new theme should not
// require touching any consumer code — just register a new file in `./index.ts`.

import type { OceanZone } from "@/features/ocean/zones";
import {
  motion,
  radii,
  shadows,
  spacing,
  surfaces,
  typography
} from "../tokens";

export const THEME_IDS = [
  "prismLight",
  "prismFire",
  "prismWater",
  "prismAir",
  "prismNature",
  "prismIce",
  "prismStorm",
  "prismMagma",
  "prismMystic",
  "prismDark"
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  /** Frosted section fill: dark translucent panel tuned for readable glass. */
  panel: string;
  /** Stronger panel fill for sheets, modals, and nested controls. */
  panelStrong: string;
  /** Subtle top highlight used inside glass panels. */
  panelTint: string;
  /** Colored rim that separates glass panels from vivid zone backgrounds. */
  panelEdge: string;
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
  | "petals" // wide horizontal sway — Coral
  | "plankton" // tiny living specks with uneven pulse — Kelp
  | "silt" // heavy suspended grains falling slowly — Pearl
  | "shards" // angular-feeling red glints with sharp drift — Ruby
  | "rays"; // slow luminous columns and motes — Royal

export type ParticleEffect =
  | "light"
  | "fire"
  | "water"
  | "air"
  | "nature"
  | "ice"
  | "storm"
  | "magma"
  | "mystic"
  | "dark";

export type ThemeParticles = {
  style: ParticleStyle;
  /** Element-specific ambience layered on top of the base particle style. */
  effect: ParticleEffect;
  /** Premium themes can opt into non-deterministic reseeding on remount. */
  randomize?: boolean;
  /** Spatial distribution for the ambient field. */
  scatter?: "even" | "clustered" | "bands";
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
  colorStory: readonly string[];
  effectDescription: string;
  element: string;
  combo?: {
    ingredients?: readonly [ThemeId, ThemeId];
    combinesWith?: readonly ThemeId[];
  };
  premium: boolean;
  colors: ThemeColors;
  gradients: ThemeGradients;
  fonts: ThemeFonts;
  particles: ThemeParticles;
  typography: typeof typography;
  radii: typeof radii;
  spacing: typeof spacing;
  surfaces: typeof surfaces;
  shadows: typeof shadows;
  motion: typeof motion;
};

export type ZoneGradientKey = OceanZone;
