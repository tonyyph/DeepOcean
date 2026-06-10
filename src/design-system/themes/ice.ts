import type { AppTheme } from "./types";
import { radii, spacing, motion } from "../tokens";
import { THEME_FONTS, THEME_HEX, alpha } from "./shared";

// Ice — premium. Glacial pale blues, frosted glass, falling snow particles.
export const iceTheme: AppTheme = {
  id: "ice",
  name: "Ice Drift",
  description: "Glacial pale blues. Quiet, crystalline, breath-frosted.",
  premium: true,
  colors: {
    background: "#061827",
    surface: "#0E2B42",
    surfaceElevated: "#174C68",
    panel: "rgba(5,28,45,0.08)",
    panelStrong: "rgba(8,42,65,0.14)",
    panelTint: "rgba(218,241,255,0.08)",
    panelEdge: "rgba(165,229,255,0.38)",
    border: alpha("#DAF1FF", 0.2),
    borderStrong: alpha("#A5E5FF", 0.42),
    text: "#F0F8FF",
    textSecondary: "rgba(240,248,255,0.86)",
    textMuted: "rgba(240,248,255,0.64)",
    textFaint: "rgba(240,248,255,0.36)",
    accent: "#A5E5FF",
    accentSoft: "#DAF1FF",
    danger: "#FF8A9F",
    success: "#9CFBE4",
    warning: "#FFE08A",
    glass: alpha("#DAF1FF", 0.08),
    glassEdge: alpha("#A5E5FF", 0.3),
    premium: THEME_HEX.premium
  },
  gradients: {
    surface: ["#1A6D89", "#0E4B6C", "#062238"],
    twilight: ["#5D3C92", "#34246A", "#111133"],
    midnight: ["#176979", "#0A455D", "#062437"],
    abyss: ["#235AA0", "#123875", "#071A3C"],
    trench: ["#1A6E72", "#0A454B", "#041A25"],
    bioGlow: ["#A5E5FF", "#DAF1FF"]
  },
  fonts: THEME_FONTS,
  particles: {
    style: "snow",
    count: 30,
    size: [1.5, 3.5],
    speed: 16,
    drift: 24,
    blur: 1.2,
    hues: [THEME_HEX.white, "#DAF1FF", "#A5E5FF"],
    vignette: [
      alpha("#DAF1FF", 0.16),
      alpha("#102A40", 0.78),
      alpha("#02060C", 0.96)
    ],
    loopMs: 18000,
    opacity: 0.85
  },
  radii,
  spacing,
  motion
};
