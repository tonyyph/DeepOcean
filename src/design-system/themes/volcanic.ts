import type { AppTheme } from "./types";
import { radii, spacing, motion } from "../tokens";

// Volcanic Vent — premium. Hydrothermal vent: dark plum + ember accents.
export const volcanicTheme: AppTheme = {
  id: "volcanic",
  name: "Volcanic Vent",
  description: "Hydrothermal vents in pitch black. Embers rising slowly.",
  premium: true,
  colors: {
    background: "#0F0408",
    surface: "#1A0810",
    surfaceElevated: "#2A0E18",
    border: "rgba(255,150,100,0.10)",
    borderStrong: "rgba(255,150,100,0.30)",
    text: "#FFF1E8",
    textSecondary: "rgba(255,241,232,0.74)",
    textMuted: "rgba(255,241,232,0.44)",
    textFaint: "rgba(255,241,232,0.22)",
    accent: "#FF7A3D",
    accentSoft: "#FFB45A",
    danger: "#FF3D6B",
    success: "#FFD27A",
    warning: "#FFB45A",
    glass: "rgba(255,150,100,0.05)",
    glassEdge: "rgba(255,150,100,0.22)",
    premium: "#FFD27A"
  },
  gradients: {
    surface: ["#3A1010", "#2A0810", "#1A0410"],
    twilight: ["#2A0E18", "#1A0810", "#0F0408"],
    midnight: ["#1A0810", "#0F0408", "#080205"],
    abyss: ["#0F0408", "#080205", "#020001"],
    trench: ["#080205", "#020001", "#000000"],
    bioGlow: ["#FF7A3D", "#FF3D6B"]
  },
  fonts: {
    display: "SpaceGrotesk_700Bold",
    body: "SpaceGrotesk_400Regular",
    label: "SpaceGrotesk_500Medium",
    mono: "JetBrainsMono_400Regular",
    displayLetterSpacing: -0.8
  },
  particles: {
    style: "embers",
    count: 32,
    size: [1.0, 3.0],
    speed: 32,
    drift: 12,
    blur: 1.0,
    hues: ["#FF7A3D", "#FFB45A", "#FFD27A"],
    vignette: ["rgba(255,122,61,0.20)", "rgba(26,8,16,0.88)", "rgba(0,0,0,1)"],
    loopMs: 10000,
    opacity: 0.85
  },
  radii,
  spacing,
  motion
};
