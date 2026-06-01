import type { AppTheme } from "./types";
import { radii, spacing, motion } from "../tokens";

// Coral Garden — premium. Soft pastel reef, swaying petals.
export const coralGardenTheme: AppTheme = {
  id: "coralGarden",
  name: "Coral Garden",
  description: "Pastel reef in pink and seafoam. Gentle drifting petals.",
  premium: true,
  colors: {
    background: "#1B1023",
    surface: "#241431",
    surfaceElevated: "#321A43",
    border: "rgba(255,200,220,0.10)",
    borderStrong: "rgba(255,200,220,0.28)",
    text: "#FFF0F6",
    textSecondary: "rgba(255,240,246,0.76)",
    textMuted: "rgba(255,240,246,0.48)",
    textFaint: "rgba(255,240,246,0.24)",
    accent: "#FF8DBF",
    accentSoft: "#9DE9D0",
    danger: "#FF6E8A",
    success: "#9DE9D0",
    warning: "#FFD27A",
    glass: "rgba(255,200,220,0.06)",
    glassEdge: "rgba(255,200,220,0.20)",
    premium: "#FFD27A"
  },
  gradients: {
    surface: ["#9C5A9E", "#FF8DBF", "#9C5A9E"],
    twilight: ["#9C5A9E", "#FF8DBF", "#5C2E66"],
    midnight: ["#9C5A9E", "#5C2E66", "#321A43"],
    abyss: ["#5C2E66", "#321A43", "#1B1023"],
    trench: ["#321A43", "#1B1023", "#0A0410"],
    bioGlow: ["#FF8DBF", "#9DE9D0"]
  },
  fonts: {
    display: "SpaceGrotesk_700Bold",
    body: "SpaceGrotesk_400Regular",
    label: "SpaceGrotesk_500Medium",
    mono: "JetBrainsMono_400Regular",
    displayLetterSpacing: -0.8
  },
  particles: {
    style: "petals",
    count: 22,
    size: [2.4, 4.8],
    speed: 12,
    drift: 38,
    blur: 1.4,
    hues: ["#FF8DBF", "#FFC8DD", "#9DE9D0"],
    vignette: [
      "rgba(255,141,191,0.18)",
      "rgba(36,20,49,0.82)",
      "rgba(10,4,16,0.98)"
    ],
    loopMs: 20000,
    opacity: 0.7
  },
  radii,
  spacing,
  motion
};
