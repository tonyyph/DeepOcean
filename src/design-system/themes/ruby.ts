import type { AppTheme } from "./types";
import { radii, spacing, motion } from "../tokens";
import { THEME_FONTS, THEME_HEX, alpha } from "./shared";

// Ruby — premium. Dark garnet pressure with red glints.
export const rubyTheme: AppTheme = {
  id: "ruby",
  name: "Ruby Deep",
  description: "Garnet pressure and dark wine water. Rare red glints below.",
  premium: true,
  colors: {
    background: "#16050F",
    surface: "#2A0B1B",
    surfaceElevated: "#411126",
    panel: "rgba(22,5,15,0.09)",
    panelStrong: "rgba(42,11,27,0.15)",
    panelTint: "rgba(255,80,120,0.07)",
    panelEdge: "rgba(255,67,109,0.42)",
    border: alpha("#FF436D", 0.2),
    borderStrong: alpha("#FF7A9A", 0.42),
    text: "#FFF1F5",
    textSecondary: "rgba(255,241,245,0.84)",
    textMuted: "rgba(255,241,245,0.62)",
    textFaint: "rgba(255,241,245,0.34)",
    accent: "#FF436D",
    accentSoft: "#FF9AAE",
    danger: "#FF3A3A",
    success: "#FFC2A1",
    warning: "#FFD166",
    glass: alpha("#FF436D", 0.08),
    glassEdge: alpha("#FF436D", 0.32),
    premium: THEME_HEX.premium
  },
  gradients: {
    surface: ["#783044", "#4A1930", "#1A0611"],
    twilight: ["#7A285F", "#47194A", "#18091F"],
    midnight: ["#66243A", "#2D263F", "#100D1B"],
    abyss: ["#7A1E36", "#27306E", "#12081D"],
    trench: ["#5A1728", "#30213F", "#09040A"],
    bioGlow: ["#FF436D", "#FFB000"]
  },
  fonts: THEME_FONTS,
  particles: {
    style: "shards",
    randomize: true,
    scatter: "even",
    count: 28,
    size: [0.8, 2.8],
    speed: 24,
    drift: 26,
    blur: 0.6,
    hues: ["#FF436D", "#FF7A9A", "#FFB000"],
    vignette: [
      alpha("#FF436D", 0.14),
      alpha("#2A0B1B", 0.82),
      alpha(THEME_HEX.black, 0.98)
    ],
    loopMs: 13000,
    opacity: 0.84
  },
  radii,
  spacing,
  motion
};
