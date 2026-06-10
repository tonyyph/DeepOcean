import type { AppTheme } from "./types";
import { radii, spacing, motion } from "../tokens";
import { THEME_FONTS, THEME_HEX, alpha } from "./shared";

// Kelp — premium. Green-black forest, olive light, living plankton.
export const kelpTheme: AppTheme = {
  id: "kelp",
  name: "Kelp Shade",
  description: "A green-black kelp forest. Moss light moves in slow curtains.",
  premium: true,
  colors: {
    background: "#07130C",
    surface: "#102318",
    surfaceElevated: "#183624",
    panel: "rgba(7,19,12,0.08)",
    panelStrong: "rgba(16,35,24,0.14)",
    panelTint: "rgba(180,255,122,0.07)",
    panelEdge: "rgba(138,211,92,0.4)",
    border: alpha("#8AD35C", 0.18),
    borderStrong: alpha("#B4FF7A", 0.42),
    text: "#F1FFE8",
    textSecondary: "rgba(241,255,232,0.84)",
    textMuted: "rgba(241,255,232,0.62)",
    textFaint: "rgba(241,255,232,0.34)",
    accent: "#B4FF7A",
    accentSoft: "#7DD956",
    danger: "#FF6B7A",
    success: "#9BFF9B",
    warning: "#DCEB5E",
    glass: alpha("#8AD35C", 0.08),
    glassEdge: alpha("#B4FF7A", 0.3),
    premium: THEME_HEX.premium
  },
  gradients: {
    surface: ["#326B37", "#1F4F35", "#0A2518"],
    twilight: ["#496B2C", "#273B24", "#101B15"],
    midnight: ["#1E5C4A", "#12382F", "#071A18"],
    abyss: ["#3B6B28", "#183A24", "#07130C"],
    trench: ["#475F20", "#1E321B", "#050D08"],
    bioGlow: ["#B4FF7A", "#6FE7A0"]
  },
  fonts: THEME_FONTS,
  particles: {
    style: "plankton",
    randomize: true,
    scatter: "clustered",
    count: 42,
    size: [0.8, 2.6],
    speed: 10,
    drift: 42,
    blur: 1.3,
    hues: ["#B4FF7A", "#7DD956", "#6FE7A0", "#E2FFB4"],
    vignette: [
      alpha("#B4FF7A", 0.14),
      alpha("#102318", 0.72),
      alpha(THEME_HEX.black, 0.96)
    ],
    loopMs: 22000,
    opacity: 0.82
  },
  radii,
  spacing,
  motion
};
