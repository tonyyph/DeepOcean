import type { AppTheme, ThemeId } from "./types";
import { deepTheme } from "./deep";
import { reefTheme } from "./reef";
import { glowTheme } from "./glow";
import { iceTheme } from "./ice";
import { emberTheme } from "./ember";
import { coralTheme } from "./coral";
import { kelpTheme } from "./kelp";
import { pearlTheme } from "./pearl";
import { rubyTheme } from "./ruby";
import { royalTheme } from "./royal";

export const THEMES: Record<ThemeId, AppTheme> = {
  deep: deepTheme,
  reef: reefTheme,
  glow: glowTheme,
  ice: iceTheme,
  ember: emberTheme,
  coral: coralTheme,
  kelp: kelpTheme,
  pearl: pearlTheme,
  ruby: rubyTheme,
  royal: royalTheme
};

export const THEME_LIST: readonly AppTheme[] = [
  deepTheme,
  reefTheme,
  glowTheme,
  iceTheme,
  emberTheme,
  coralTheme,
  kelpTheme,
  pearlTheme,
  rubyTheme,
  royalTheme
];

export const DEFAULT_THEME_ID: ThemeId = "deep";
const LEGACY_GLOW_THEME_ID = "bio" + "luminescent";
const LEGACY_THEME_IDS: Record<string, ThemeId> = {
  abyss: "deep",
  sunlit: "reef",
  [LEGACY_GLOW_THEME_ID]: "glow",
  arctic: "ice",
  volcanic: "ember",
  coralGarden: "coral"
};

export function normalizeThemeId(id: ThemeId | string | undefined): ThemeId {
  if (id && id in LEGACY_THEME_IDS) return LEGACY_THEME_IDS[id]!;
  if (id && id in THEMES) return id as ThemeId;
  return DEFAULT_THEME_ID;
}

export function getTheme(id: ThemeId | string | undefined): AppTheme {
  return THEMES[normalizeThemeId(id)];
}

export type { AppTheme, ThemeId } from "./types";
export {
  THEME_IDS,
  type ThemeColors,
  type ThemeGradients,
  type ThemeFonts,
  type ThemeParticles,
  type ParticleStyle
} from "./types";
