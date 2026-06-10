import type { AppTheme } from "./types";
import { radii, spacing, motion } from "../tokens";
import { THEME_FONTS, THEME_HEX, alpha } from "./shared";

// Ember — premium. Hydrothermal vent: dark plum + ember accents.
export const emberTheme: AppTheme = {
  id: "ember",
  name: "Ember Vent",
  description: "Hydrothermal vents in pitch black. Embers rising slowly.",
  premium: true,
  colors: {
    background: "#12050A",
    surface: "#241018",
    surfaceElevated: "#3A1822",
    panel: "rgba(24,8,14,0.09)",
    panelStrong: "rgba(40,14,22,0.15)",
    panelTint: "rgba(255,180,90,0.07)",
    panelEdge: "rgba(255,122,61,0.4)",
    border: alpha("#FFB45A", 0.18),
    borderStrong: alpha("#FF7A3D", 0.42),
    text: "#FFF1E8",
    textSecondary: "rgba(255,241,232,0.84)",
    textMuted: "rgba(255,241,232,0.62)",
    textFaint: "rgba(255,241,232,0.34)",
    accent: "#FF7A3D",
    accentSoft: "#FFB45A",
    danger: "#FF3D6B",
    success: "#FFD27A",
    warning: "#FFB45A",
    glass: alpha("#FF9664", 0.08),
    glassEdge: alpha("#FF7A3D", 0.3),
    premium: THEME_HEX.premium
  },
  gradients: {
    surface: ["#7A3414", "#4A1D14", "#17070A"],
    twilight: ["#7A2546", "#4A1B58", "#180A23"],
    midnight: ["#6E2F16", "#0D4B59", "#071C25"],
    abyss: ["#743012", "#173A83", "#10091F"],
    trench: ["#6B3B12", "#0A4B56", "#090409"],
    bioGlow: ["#FF7A3D", "#FF3D6B"]
  },
  fonts: THEME_FONTS,
  particles: {
    style: "embers",
    count: 32,
    size: [1.0, 3.0],
    speed: 32,
    drift: 12,
    blur: 1.0,
    hues: ["#FF7A3D", "#FFB45A", "#FFD27A"],
    vignette: [
      alpha("#FF7A3D", 0.2),
      alpha("#1A0810", 0.88),
      alpha(THEME_HEX.black, 1)
    ],
    loopMs: 10000,
    opacity: 0.85
  },
  radii,
  spacing,
  motion
};
