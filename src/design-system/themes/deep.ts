import type { AppTheme } from "./types";
import { motion, radii, shadows, spacing, surfaces, typography, palette } from "../tokens";
import { THEME_FONTS, THEME_HEX, alpha } from "./shared";

export const deepTheme: AppTheme = {
  id: "deep",
  name: "Deep Blue",
  description: "The default deep-blue dive. Calm, midnight, softly glowing.",
  premium: false,
  colors: {
    background: "#020B1F",
    surface: "#071A35",
    surfaceElevated: "#0B274B",
    panel: "rgba(3,18,38,0.08)",
    panelStrong: "rgba(4,25,52,0.14)",
    panelTint: "rgba(124,196,250,0.07)",
    panelEdge: "rgba(34,228,255,0.34)",
    border: alpha("#7CC4FA", 0.18),
    borderStrong: alpha("#22E4FF", 0.36),
    text: palette.text.primary,
    textSecondary: "rgba(234,246,255,0.82)",
    textMuted: "rgba(234,246,255,0.62)",
    textFaint: "rgba(234,246,255,0.34)",
    accent: palette.bio.cyan,
    accentSoft: palette.bio.aqua,
    danger: palette.bio.coral,
    success: palette.bio.jade,
    warning: palette.bio.amber,
    glass: alpha("#7CC4FA", 0.08),
    glassEdge: alpha("#22E4FF", 0.22),
    premium: THEME_HEX.premium
  },
  gradients: {
    surface: ["#0B5C78", "#073A5C", "#04172D"],
    twilight: ["#44216F", "#251352", "#080D2A"],
    midnight: ["#075B66", "#043846", "#031827"],
    abyss: ["#0B4D8C", "#062E62", "#031332"],
    trench: ["#075A66", "#03323F", "#010A18"],
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
  typography,
  radii,
  spacing,
  surfaces,
  shadows,
  motion
};
