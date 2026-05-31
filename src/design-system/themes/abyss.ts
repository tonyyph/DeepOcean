import type { AppTheme } from "./types";
import { radii, spacing, motion, palette } from "../tokens";

export const abyssTheme: AppTheme = {
  id: "abyss",
  name: "Abyss",
  description: "The default deep-blue dive. Calm, midnight, bioluminescent.",
  premium: false,
  colors: {
    background: palette.abyss[600],
    surface: palette.abyss[400],
    surfaceElevated: palette.abyss[300],
    border: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.18)",
    text: palette.text.primary,
    textSecondary: palette.text.secondary,
    textMuted: palette.text.muted,
    textFaint: palette.text.faint,
    accent: palette.bio.cyan,
    accentSoft: palette.bio.aqua,
    danger: palette.bio.coral,
    success: palette.bio.jade,
    warning: palette.bio.amber,
    glass: "rgba(255,255,255,0.05)",
    glassEdge: "rgba(255,255,255,0.12)",
    premium: "#FFD27A"
  },
  gradients: {
    surface: [palette.surface[300], palette.surface[500], palette.abyss[300]],
    twilight: [palette.surface[500], palette.abyss[100], palette.abyss[400]],
    midnight: [palette.abyss[100], palette.abyss[400], palette.abyss[600]],
    abyss: [palette.abyss[400], palette.abyss[600], palette.abyss[700]],
    trench: [palette.abyss[600], palette.abyss[700], "#000"],
    bioGlow: [palette.bio.cyan, palette.bio.violet]
  },
  fonts: {
    display: "SpaceGrotesk_700Bold",
    body: "SpaceGrotesk_400Regular",
    label: "SpaceGrotesk_500Medium",
    mono: "JetBrainsMono_400Regular",
    displayLetterSpacing: -0.8
  },
  particles: {
    style: "dust",
    count: 28,
    size: [1.2, 3.8],
    speed: 14,
    drift: 20,
    blur: 1.4,
    hues: [palette.bio.cyan, palette.bio.aqua, palette.bio.jade],
    vignette: [
      "rgba(34,228,255,0.12)",
      "rgba(2,8,28,0.85)",
      "rgba(0,0,0,0.96)"
    ],
    loopMs: 14000,
    opacity: 0.8
  },
  radii,
  spacing,
  motion
};
