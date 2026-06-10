import type { AppTheme } from "./types";
import { radii, spacing, motion, palette } from "../tokens";
import { THEME_FONTS, THEME_HEX, alpha } from "./shared";

// Reef — warm shallow reef. Free theme, brighter alternative to Deep.
export const reefTheme: AppTheme = {
  id: "reef",
  name: "Reef Gold",
  description: "Warm tropical shallows. Coral, sunlight, schools of fish.",
  premium: false,
  colors: {
    background: "#0E3C5A",
    surface: "#0F4A6E",
    surfaceElevated: "#13598A",
    border: alpha(THEME_HEX.white, 0.1),
    borderStrong: alpha(THEME_HEX.white, 0.22),
    text: "#F5FAFF",
    textSecondary: "rgba(245,250,255,0.78)",
    textMuted: "rgba(245,250,255,0.55)",
    textFaint: "rgba(245,250,255,0.30)",
    accent: "#FFB85C",
    accentSoft: "#FFD27A",
    danger: "#FF6B6B",
    success: "#5EEAD4",
    warning: "#FACC15",
    glass: alpha(THEME_HEX.white, 0.06),
    glassEdge: alpha("#FFEBC8", 0.18),
    premium: THEME_HEX.premium
  },
  gradients: {
    surface: ["#7DD3FC", "#38BDF8", "#0EA5E9"],
    twilight: ["#38BDF8", "#0EA5E9", "#0369A1"],
    midnight: ["#0EA5E9", "#0369A1", "#0E3C5A"],
    abyss: ["#0369A1", "#0E3C5A", "#082F49"],
    trench: ["#0E3C5A", "#082F49", "#020617"],
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
  radii,
  spacing,
  motion
};
