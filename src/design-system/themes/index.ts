import type { AppTheme, ThemeId } from "./types";
import { PRISMATIC_THEMES, THEME_COMBINATIONS } from "./prismatic";

export const THEMES: Record<ThemeId, AppTheme> = {
  prismWater: PRISMATIC_THEMES[0],
  prismFire: PRISMATIC_THEMES[1],
  prismLight: PRISMATIC_THEMES[2],
  prismAir: PRISMATIC_THEMES[3],
  prismNature: PRISMATIC_THEMES[4],
  prismIce: PRISMATIC_THEMES[5],
  prismStorm: PRISMATIC_THEMES[6],
  prismMagma: PRISMATIC_THEMES[7],
  prismMystic: PRISMATIC_THEMES[8],
  prismDark: PRISMATIC_THEMES[9]
};

export const THEME_LIST: readonly AppTheme[] = PRISMATIC_THEMES;

export const DEFAULT_THEME_ID: ThemeId = "prismWater";
const LEGACY_GLOW_THEME_ID = "bio" + "luminescent";
const LEGACY_THEME_IDS: Record<string, ThemeId> = {
  deep: "prismWater",
  reef: "prismNature",
  glow: "prismLight",
  ice: "prismIce",
  ember: "prismFire",
  coral: "prismMystic",
  kelp: "prismNature",
  pearl: "prismLight",
  ruby: "prismDark",
  royal: "prismStorm",
  abyss: "prismWater",
  sunlit: "prismLight",
  [LEGACY_GLOW_THEME_ID]: "prismLight",
  arctic: "prismIce",
  volcanic: "prismMagma",
  coralGarden: "prismMystic"
};

export function normalizeThemeId(id: ThemeId | string | undefined): ThemeId {
  if (id && id in LEGACY_THEME_IDS) return LEGACY_THEME_IDS[id]!;
  if (id && id in THEMES) return id as ThemeId;
  return DEFAULT_THEME_ID;
}

export function getTheme(id: ThemeId | string | undefined): AppTheme {
  return THEMES[normalizeThemeId(id)];
}

export function combineThemes(
  first: ThemeId | string | undefined,
  second: ThemeId | string | undefined
): ThemeId | null {
  if (!first || !second) return null;
  const a = normalizeThemeId(first);
  const b = normalizeThemeId(second);
  if (a === b) return null;
  const key = [a, b].sort().join("+");
  return THEME_COMBINATIONS[key] ?? null;
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
