import type { AppTheme } from "./types";
import { radii, spacing, motion } from "../tokens";

// Arctic — premium. Glacial pale blues, frosted glass, falling snow particles.
export const arcticTheme: AppTheme = {
  id: "arctic",
  name: "Arctic",
  description: "Glacial pale blues. Quiet, crystalline, breath-frosted.",
  premium: true,
  colors: {
    background: "#0A1A2B",
    surface: "#102A40",
    surfaceElevated: "#163C5A",
    border: "rgba(200,230,255,0.12)",
    borderStrong: "rgba(200,230,255,0.28)",
    text: "#F0F8FF",
    textSecondary: "rgba(240,248,255,0.76)",
    textMuted: "rgba(240,248,255,0.48)",
    textFaint: "rgba(240,248,255,0.24)",
    accent: "#A5E5FF",
    accentSoft: "#DAF1FF",
    danger: "#FF8A9F",
    success: "#9CFBE4",
    warning: "#FFE08A",
    glass: "rgba(200,230,255,0.06)",
    glassEdge: "rgba(200,230,255,0.22)",
    premium: "#FFD27A"
  },
  gradients: {
    surface: ["#DAF1FF", "#A5E5FF", "#5BB6E0"],
    twilight: ["#A5E5FF", "#5BB6E0", "#2E6B8C"],
    midnight: ["#5BB6E0", "#2E6B8C", "#163C5A"],
    abyss: ["#2E6B8C", "#163C5A", "#0A1A2B"],
    trench: ["#163C5A", "#0A1A2B", "#02060C"],
    bioGlow: ["#A5E5FF", "#DAF1FF"]
  },
  fonts: {
    display: "SpaceGrotesk_700Bold",
    body: "SpaceGrotesk_400Regular",
    label: "SpaceGrotesk_500Medium",
    mono: "JetBrainsMono_400Regular",
    displayLetterSpacing: -0.8
  },
  particles: {
    style: "snow",
    count: 30,
    size: [1.5, 3.5],
    speed: 16,
    drift: 24,
    blur: 1.2,
    hues: ["#FFFFFF", "#DAF1FF", "#A5E5FF"],
    vignette: [
      "rgba(218,241,255,0.16)",
      "rgba(16,42,64,0.78)",
      "rgba(2,6,12,0.96)"
    ],
    loopMs: 18000,
    opacity: 0.85
  },
  radii,
  spacing,
  motion
};
