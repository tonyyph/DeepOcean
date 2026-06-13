import type { AppTheme } from "./types";
import { motion, radii, shadows, spacing, surfaces, typography } from "../tokens";
import { THEME_FONTS, THEME_HEX, alpha } from "./shared";

// Pearl — premium. Moonlit silver water, opal edges, suspended silt.
export const pearlTheme: AppTheme = {
  id: "pearl",
  name: "Pearl Moon",
  description: "Moonlit silver water. Quiet opal glass over a black sea.",
  premium: true,
  colors: {
    background: "#0B0F14",
    surface: "#151B22",
    surfaceElevated: "#202833",
    panel: "rgba(11,15,20,0.08)",
    panelStrong: "rgba(21,27,34,0.14)",
    panelTint: "rgba(232,244,255,0.08)",
    panelEdge: "rgba(190,214,232,0.42)",
    border: alpha("#BED6E8", 0.2),
    borderStrong: alpha("#E8F4FF", 0.42),
    text: "#F6FBFF",
    textSecondary: "rgba(246,251,255,0.84)",
    textMuted: "rgba(246,251,255,0.62)",
    textFaint: "rgba(246,251,255,0.34)",
    accent: "#E8F4FF",
    accentSoft: "#AFC9D8",
    danger: "#FF7F9F",
    success: "#B5F7E5",
    warning: "#F8E7A1",
    glass: alpha("#E8F4FF", 0.08),
    glassEdge: alpha("#BED6E8", 0.32),
    premium: THEME_HEX.premium
  },
  gradients: {
    surface: ["#52616F", "#2C3A46", "#111922"],
    twilight: ["#6B647A", "#38344F", "#171423"],
    midnight: ["#3A5A66", "#243944", "#101B24"],
    abyss: ["#5D6F8A", "#263754", "#0C1320"],
    trench: ["#68737D", "#2C3A42", "#090D12"],
    bioGlow: ["#E8F4FF", "#AFC9D8"]
  },
  fonts: THEME_FONTS,
  particles: {
    style: "silt",
    randomize: true,
    scatter: "bands",
    count: 34,
    size: [0.9, 2.4],
    speed: 12,
    drift: 18,
    blur: 0.9,
    hues: ["#E8F4FF", "#BED6E8", "#8FA9BA"],
    vignette: [
      alpha("#E8F4FF", 0.12),
      alpha("#151B22", 0.8),
      alpha(THEME_HEX.black, 0.97)
    ],
    loopMs: 26000,
    opacity: 0.74
  },
  typography,
  radii,
  spacing,
  surfaces,
  shadows,
  motion
};
