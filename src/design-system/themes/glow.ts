import type { AppTheme } from "./types";
import { radii, spacing, motion } from "../tokens";
import { THEME_FONTS, THEME_HEX, alpha } from "./shared";

// Glow — premium. True-black canvas with neon cyan/violet glow.
export const glowTheme: AppTheme = {
  id: "glow",
  name: "Glow Mist",
  description: "Pure dark, neon edges. Like staring into a midnight reef.",
  premium: true,
  colors: {
    background: "#02030A",
    surface: "#0A1024",
    surfaceElevated: "#121B3C",
    panel: "rgba(5,9,24,0.09)",
    panelStrong: "rgba(10,14,35,0.15)",
    panelTint: "rgba(34,228,255,0.07)",
    panelEdge: "rgba(167,139,250,0.4)",
    border: alpha("#22E4FF", 0.18),
    borderStrong: alpha("#A78BFA", 0.42),
    text: "#EDEAFF",
    textSecondary: "rgba(237,234,255,0.84)",
    textMuted: "rgba(237,234,255,0.62)",
    textFaint: "rgba(237,234,255,0.34)",
    accent: "#A78BFA",
    accentSoft: "#22E4FF",
    danger: "#FF5C9B",
    success: "#5FF7E0",
    warning: "#FFD86B",
    glass: alpha("#22E4FF", 0.08),
    glassEdge: alpha("#A78BFA", 0.3),
    premium: THEME_HEX.premium
  },
  gradients: {
    surface: ["#0A6E8A", "#073F6B", "#041629"],
    twilight: ["#671C86", "#33145F", "#0B082A"],
    midnight: ["#066F64", "#064A5D", "#031A2A"],
    abyss: ["#1A4AA3", "#10246E", "#060B2A"],
    trench: ["#066F7D", "#033747", "#010611"],
    bioGlow: ["#A78BFA", "#22E4FF"]
  },
  fonts: THEME_FONTS,
  particles: {
    style: "dust",
    count: 36,
    size: [1.0, 3.2],
    speed: 18,
    drift: 28,
    blur: 1.8,
    hues: ["#A78BFA", "#22E4FF", "#FF5C9B"],
    vignette: [
      alpha("#A78BFA", 0.18),
      alpha("#070A18", 0.92),
      alpha(THEME_HEX.black, 1)
    ],
    loopMs: 16000,
    opacity: 0.9
  },
  radii,
  spacing,
  motion
};
