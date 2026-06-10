import type { AppTheme } from "./types";
import { radii, spacing, motion } from "../tokens";
import { THEME_FONTS, THEME_HEX, alpha } from "./shared";

// Royal — premium. Cobalt and ultraviolet currents, slow luminous rays.
export const royalTheme: AppTheme = {
  id: "royal",
  name: "Royal Tide",
  description: "Cobalt tide and ultraviolet currents. Polished, regal depth.",
  premium: true,
  colors: {
    background: "#07081F",
    surface: "#10133A",
    surfaceElevated: "#191E58",
    panel: "rgba(7,8,31,0.09)",
    panelStrong: "rgba(16,19,58,0.15)",
    panelTint: "rgba(112,97,255,0.08)",
    panelEdge: "rgba(112,97,255,0.42)",
    border: alpha("#7061FF", 0.2),
    borderStrong: alpha("#9B8CFF", 0.44),
    text: "#F3F1FF",
    textSecondary: "rgba(243,241,255,0.84)",
    textMuted: "rgba(243,241,255,0.62)",
    textFaint: "rgba(243,241,255,0.34)",
    accent: "#7061FF",
    accentSoft: "#00D6FF",
    danger: "#FF5DA8",
    success: "#61F2FF",
    warning: "#F7D66B",
    glass: alpha("#7061FF", 0.08),
    glassEdge: alpha("#7061FF", 0.32),
    premium: THEME_HEX.premium
  },
  gradients: {
    surface: ["#235B9C", "#183B78", "#0B173B"],
    twilight: ["#5636A8", "#2A216E", "#0C0B2E"],
    midnight: ["#153D9A", "#102A66", "#071432"],
    abyss: ["#2739B7", "#151F70", "#080B2A"],
    trench: ["#205B8C", "#152E5C", "#050816"],
    bioGlow: ["#7061FF", "#00D6FF"]
  },
  fonts: THEME_FONTS,
  particles: {
    style: "rays",
    randomize: true,
    scatter: "bands",
    count: 30,
    size: [1.4, 4.2],
    speed: 8,
    drift: 10,
    blur: 2.4,
    hues: ["#7061FF", "#00D6FF", "#9B8CFF"],
    vignette: [
      alpha("#7061FF", 0.16),
      alpha("#10133A", 0.78),
      alpha(THEME_HEX.black, 0.98)
    ],
    loopMs: 30000,
    opacity: 0.78
  },
  radii,
  spacing,
  motion
};
