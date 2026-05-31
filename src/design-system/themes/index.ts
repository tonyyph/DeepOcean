import type { AppTheme, ThemeId } from "./types";
import { abyssTheme } from "./abyss";
import { sunlitTheme } from "./sunlit";
import { bioluminescentTheme } from "./bioluminescent";
import { arcticTheme } from "./arctic";
import { volcanicTheme } from "./volcanic";
import { coralGardenTheme } from "./coralGarden";

export const THEMES: Record<ThemeId, AppTheme> = {
  abyss: abyssTheme,
  sunlit: sunlitTheme,
  bioluminescent: bioluminescentTheme,
  arctic: arcticTheme,
  volcanic: volcanicTheme,
  coralGarden: coralGardenTheme
};

export const THEME_LIST: readonly AppTheme[] = [
  abyssTheme,
  sunlitTheme,
  bioluminescentTheme,
  arcticTheme,
  volcanicTheme,
  coralGardenTheme
];

export const DEFAULT_THEME_ID: ThemeId = "abyss";

export function getTheme(id: ThemeId | string | undefined): AppTheme {
  if (!id) return THEMES[DEFAULT_THEME_ID];
  return (THEMES as Record<string, AppTheme>)[id] ?? THEMES[DEFAULT_THEME_ID];
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
