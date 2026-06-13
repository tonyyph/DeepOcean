import type { AppTheme } from "./types";
import { motion, radii, shadows, spacing, surfaces, typography } from "../tokens";
import { THEME_FONTS, THEME_HEX, alpha } from "./shared";

// Coral — premium. Soft pastel reef, swaying petals.
export const coralTheme: AppTheme = {
  id: "coral",
  name: "Coral Bloom",
  description: "Pastel reef in pink and seafoam. Gentle drifting petals.",
  premium: true,
  colors: {
    background: "#160D26",
    surface: "#29183D",
    surfaceElevated: "#3F2358",
    panel: "rgba(26,14,40,0.09)",
    panelStrong: "rgba(42,22,60,0.15)",
    panelTint: "rgba(255,200,220,0.07)",
    panelEdge: "rgba(255,141,191,0.4)",
    border: alpha("#FFC8DC", 0.18),
    borderStrong: alpha("#FF8DBF", 0.42),
    text: "#FFF0F6",
    textSecondary: "rgba(255,240,246,0.86)",
    textMuted: "rgba(255,240,246,0.64)",
    textFaint: "rgba(255,240,246,0.36)",
    accent: "#FF8DBF",
    accentSoft: "#9DE9D0",
    danger: "#FF6E8A",
    success: "#9DE9D0",
    warning: "#FFD27A",
    glass: alpha("#FFC8DC", 0.08),
    glassEdge: alpha("#FF8DBF", 0.3),
    premium: THEME_HEX.premium
  },
  gradients: {
    surface: ["#2E766B", "#1A5A72", "#0D273F"],
    twilight: ["#87446B", "#51276E", "#201033"],
    midnight: ["#2D716D", "#0D4A5B", "#0A2537"],
    abyss: ["#7A466B", "#1F3C8A", "#190F3A"],
    trench: ["#2E766B", "#0C4B4C", "#10091F"],
    bioGlow: ["#FF8DBF", "#9DE9D0"]
  },
  fonts: THEME_FONTS,
  particles: {
    style: "petals",
    count: 22,
    size: [2.4, 4.8],
    speed: 12,
    drift: 38,
    blur: 1.4,
    hues: ["#FF8DBF", "#FFC8DD", "#9DE9D0"],
    vignette: [
      alpha("#FF8DBF", 0.18),
      alpha("#241431", 0.82),
      alpha("#0A0410", 0.98)
    ],
    loopMs: 20000,
    opacity: 0.7
  },
  typography,
  radii,
  spacing,
  surfaces,
  shadows,
  motion
};
