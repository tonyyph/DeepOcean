import type { AppTheme } from "./types";
import { radii, spacing, motion } from "../tokens";
import { THEME_FONTS, THEME_HEX, alpha } from "./shared";

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
    border: alpha("#FFC8DC", 0.1),
    borderStrong: alpha("#FFC8DC", 0.28),
    text: "#FFF0F6",
    textSecondary: "rgba(255,240,246,0.76)",
    textMuted: "rgba(255,240,246,0.48)",
    textFaint: "rgba(255,240,246,0.24)",
    accent: "#FF8DBF",
    accentSoft: "#9DE9D0",
    danger: "#FF6E8A",
    success: "#9DE9D0",
    warning: "#FFD27A",
    glass: alpha("#FFC8DC", 0.06),
    glassEdge: alpha("#FFC8DC", 0.2),
    premium: THEME_HEX.premium
  },
  gradients: {
    surface: ["#9C5A9E", "#FF8DBF", "#9C5A9E"],
    twilight: ["#9C5A9E", "#FF8DBF", "#5C2E66"],
    midnight: ["#9C5A9E", "#5C2E66", "#321A43"],
    abyss: ["#5C2E66", "#321A43", "#1B1023"],
    trench: ["#321A43", "#1B1023", "#0A0410"],
    bioGlow: ["#FF8DBF", "#9DE9D0"]
  },
  fonts: THEME_FONTS,
  particles: {
    style: "petals",
    count: 22,
    size: [2.4, 4.8],
    speed: 12,
    drift: 38,
    blur: 1.4,
    hues: ["#FF8DBF", "#FFC8DD", "#9DE9D0"],
    vignette: [
      alpha("#FF8DBF", 0.18),
      alpha("#241431", 0.82),
      alpha("#0A0410", 0.98)
    ],
    loopMs: 20000,
    opacity: 0.7
  },
  radii,
  spacing,
  motion
};
