import type { AppTheme } from "./types";
import { radii, spacing, motion } from "../tokens";

// Sunlit Reef — warm shallow reef. Free theme, brighter alternative to Abyss.
export const sunlitTheme: AppTheme = {
  id: "sunlit",
  name: "Sunlit Reef",
  description: "Warm tropical shallows. Coral, sunlight, schools of fish.",
  premium: false,
  colors: {
    background: "#0E3C5A",
    surface: "#0F4A6E",
    surfaceElevated: "#13598A",
    border: "rgba(255,255,255,0.10)",
    borderStrong: "rgba(255,255,255,0.22)",
    text: "#F5FAFF",
    textSecondary: "rgba(245,250,255,0.78)",
    textMuted: "rgba(245,250,255,0.55)",
    textFaint: "rgba(245,250,255,0.30)",
    accent: "#FFB85C",
    accentSoft: "#FFD27A",
    danger: "#FF6B6B",
    success: "#5EEAD4",
    warning: "#FACC15",
    glass: "rgba(255,255,255,0.06)",
    glassEdge: "rgba(255,235,200,0.18)",
    premium: "#FFD27A"
  },
  gradients: {
    surface: ["#7DD3FC", "#38BDF8", "#0EA5E9"],
    twilight: ["#38BDF8", "#0EA5E9", "#0369A1"],
    midnight: ["#0EA5E9", "#0369A1", "#0E3C5A"],
    abyss: ["#0369A1", "#0E3C5A", "#082F49"],
    trench: ["#0E3C5A", "#082F49", "#020617"],
    bioGlow: ["#FFB85C", "#FF6B6B"]
  },
  fonts: {
    display: "SpaceGrotesk_700Bold",
    body: "SpaceGrotesk_400Regular",
    label: "SpaceGrotesk_500Medium",
    mono: "JetBrainsMono_400Regular",
    displayLetterSpacing: -0.8
  },
  particles: {
    style: "bubbles",
    count: 24,
    size: [2.0, 5.5],
    speed: 28,
    drift: 14,
    blur: 0.8,
    hues: ["#FFFFFF", "#FFE4B5", "#7DD3FC"],
    vignette: [
      "rgba(255,210,150,0.18)",
      "rgba(15,74,110,0.65)",
      "rgba(2,17,38,0.95)"
    ],
    loopMs: 8000,
    opacity: 0.75
  },
  radii,
  spacing,
  motion
};
