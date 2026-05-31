import type { AppTheme } from "./types";
import { radii, spacing, motion } from "../tokens";

// Bioluminescent — premium. True-black canvas with neon cyan/violet glow.
export const bioluminescentTheme: AppTheme = {
  id: "bioluminescent",
  name: "Bioluminescent",
  description: "Pure dark, neon edges. Like staring into a midnight reef.",
  premium: true,
  colors: {
    background: "#02030A",
    surface: "#070A18",
    surfaceElevated: "#0D1228",
    border: "rgba(167,139,250,0.12)",
    borderStrong: "rgba(167,139,250,0.32)",
    text: "#EDEAFF",
    textSecondary: "rgba(237,234,255,0.74)",
    textMuted: "rgba(237,234,255,0.46)",
    textFaint: "rgba(237,234,255,0.22)",
    accent: "#A78BFA",
    accentSoft: "#22E4FF",
    danger: "#FF5C9B",
    success: "#5FF7E0",
    warning: "#FFD86B",
    glass: "rgba(167,139,250,0.06)",
    glassEdge: "rgba(167,139,250,0.22)",
    premium: "#FFD27A"
  },
  gradients: {
    surface: ["#0D1228", "#070A18", "#02030A"],
    twilight: ["#1A0F3A", "#0D1228", "#02030A"],
    midnight: ["#0F0A2A", "#070A18", "#02030A"],
    abyss: ["#070A18", "#02030A", "#000000"],
    trench: ["#02030A", "#000000", "#000000"],
    bioGlow: ["#A78BFA", "#22E4FF"]
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
    count: 36,
    size: [1.0, 3.2],
    speed: 18,
    drift: 28,
    blur: 1.8,
    hues: ["#A78BFA", "#22E4FF", "#FF5C9B"],
    vignette: ["rgba(167,139,250,0.18)", "rgba(7,10,24,0.92)", "rgba(0,0,0,1)"],
    loopMs: 16000,
    opacity: 0.9
  },
  radii,
  spacing,
  motion
};
