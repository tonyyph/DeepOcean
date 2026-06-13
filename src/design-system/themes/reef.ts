import type { AppTheme } from "./types";
import { motion, radii, shadows, spacing, surfaces, typography, palette } from "../tokens";
import { THEME_FONTS, THEME_HEX, alpha } from "./shared";

// Reef — warm shallow reef. Free theme, brighter alternative to Deep.
export const reefTheme: AppTheme = {
  id: "reef",
  name: "Reef Gold",
  description: "Warm tropical shallows. Coral, sunlight, schools of fish.",
  premium: false,
  colors: {
    background: "#082B45",
    surface: "#0D4565",
    surfaceElevated: "#126383",
    panel: "rgba(4,36,54,0.08)",
    panelStrong: "rgba(6,50,72,0.14)",
    panelTint: "rgba(255,228,181,0.07)",
    panelEdge: "rgba(255,184,92,0.36)",
    border: alpha("#FFE4B5", 0.2),
    borderStrong: alpha("#FFB85C", 0.42),
    text: "#F5FAFF",
    textSecondary: "rgba(245,250,255,0.84)",
    textMuted: "rgba(245,250,255,0.64)",
    textFaint: "rgba(245,250,255,0.36)",
    accent: "#FFB85C",
    accentSoft: "#FFD27A",
    danger: "#FF6B6B",
    success: "#5EEAD4",
    warning: "#FACC15",
    glass: alpha("#FFE4B5", 0.08),
    glassEdge: alpha("#FFEBC8", 0.28),
    premium: THEME_HEX.premium
  },
  gradients: {
    surface: ["#116A7A", "#0A4B66", "#06293E"],
    twilight: ["#5B2D86", "#351B68", "#160D34"],
    midnight: ["#0F665D", "#0A474D", "#052631"],
    abyss: ["#174F9A", "#0C3474", "#061A3D"],
    trench: ["#0E6A70", "#08434F", "#031B28"],
    bioGlow: ["#FFB85C", "#FF6B6B"]
  },
  fonts: THEME_FONTS,
  particles: {
    style: "bubbles",
    count: 24,
    size: [2.0, 5.5],
    speed: 28,
    drift: 14,
    blur: 0.8,
    hues: [THEME_HEX.white, "#FFE4B5", "#7DD3FC"],
    vignette: [
      alpha(THEME_HEX.premium, 0.18),
      alpha("#0F4A6E", 0.65),
      alpha("#021126", 0.95)
    ],
    loopMs: 8000,
    opacity: 0.75
  },
  typography,
  radii,
  spacing,
  surfaces,
  shadows,
  motion
};
