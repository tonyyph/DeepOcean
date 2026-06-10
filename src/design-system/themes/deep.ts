import type { AppTheme } from "./types";
import { radii, spacing, motion, palette } from "../tokens";
import { THEME_FONTS, THEME_HEX, alpha } from "./shared";

export const deepTheme: AppTheme = {
  id: "deep",
  name: "Deep Blue",
  description: "The default deep-blue dive. Calm, midnight, softly glowing.",
  premium: false,
  colors: {
    background: palette.abyss[600],
    surface: palette.abyss[400],
    surfaceElevated: palette.abyss[300],
    border: alpha(THEME_HEX.white, 0.08),
    borderStrong: alpha(THEME_HEX.white, 0.18),
    text: palette.text.primary,
    textSecondary: palette.text.secondary,
    textMuted: palette.text.muted,
    textFaint: palette.text.faint,
    accent: palette.bio.cyan,
    accentSoft: palette.bio.aqua,
    danger: palette.bio.coral,
    success: palette.bio.jade,
    warning: palette.bio.amber,
    glass: alpha(THEME_HEX.white, 0.05),
    glassEdge: alpha(THEME_HEX.white, 0.12),
    premium: THEME_HEX.premium
  },
  gradients: {
    surface: [palette.surface[300], palette.surface[500], palette.abyss[300]],
    twilight: [palette.surface[500], palette.abyss[100], palette.abyss[400]],
    midnight: [palette.abyss[100], palette.abyss[400], palette.abyss[600]],
    abyss: [palette.abyss[400], palette.abyss[600], palette.abyss[700]],
    trench: [palette.abyss[600], palette.abyss[700], THEME_HEX.black],
    bioGlow: [palette.bio.cyan, palette.bio.violet]
  },
  fonts: THEME_FONTS,
  particles: {
    style: "dust",
    count: 28,
    size: [1.2, 3.8],
    speed: 14,
    drift: 20,
    blur: 1.4,
    hues: [palette.bio.cyan, palette.bio.aqua, palette.bio.jade],
    vignette: [
      alpha(palette.bio.cyan, 0.12),
      alpha(palette.abyss[500], 0.85),
      alpha(THEME_HEX.black, 0.96)
    ],
    loopMs: 14000,
    opacity: 0.8
  },
  radii,
  spacing,
  motion
};
