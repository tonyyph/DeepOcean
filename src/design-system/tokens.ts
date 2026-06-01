// Design tokens — single source of truth for the underwater theme.
// Do not hardcode colors or motion values anywhere else in the codebase.

export const palette = {
  abyss: {
    50: "#0B2545",
    100: "#0A1E3F",
    200: "#081838",
    300: "#061330",
    400: "#040E27",
    500: "#02081C",
    600: "#010512",
    700: "#000308"
  },
  surface: {
    50: "#E6F4FF",
    100: "#BAE0FF",
    200: "#7CC4FA",
    300: "#47A3F3",
    400: "#2186EB",
    500: "#0967D2"
  },
  bio: {
    cyan: "#22E4FF",
    aqua: "#5FF7E0",
    jade: "#7CFFC2",
    violet: "#A78BFA",
    coral: "#FF7E9D",
    amber: "#FFB86B"
  },
  text: {
    primary: "#EAF6FF",
    secondary: "rgba(234,246,255,0.72)",
    muted: "rgba(234,246,255,0.48)",
    faint: "rgba(234,246,255,0.24)"
  }
} as const;

export const radii = {
  xs: 4,
  s: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  "2xl": 44,
  pill: 999
} as const;

export const spacing = {
  px: 1,
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96
} as const;

export const elevation = {
  glow: {
    color: palette.bio.cyan,
    radius: 24,
    opacity: 0.55
  },
  deep: {
    color: "#000",
    radius: 32,
    opacity: 0.6
  }
} as const;

export const typography = {
  display: {
    fontFamily: "Sora_700Bold",
    sizes: { hero: 44, h1: 32, h2: 26, h3: 20 },
    letterSpacing: -0.5
  },
  body: {
    fontFamily: "Inter_400Regular",
    sizes: { lg: 17, md: 15, sm: 13, xs: 11 },
    letterSpacing: 1
  },
  label: {
    fontFamily: "Sora_400Regular",
    sizes: { lg: 14, md: 12, sm: 10 },
    letterSpacing: 1
  },
  mono: {
    fontFamily: "JetBrainsMono_400Regular",
    sizes: { lg: 28, md: 18, sm: 13 }
  }
} as const;

// Motion — cinematic, slow, organic.
export const motion = {
  durations: {
    instant: 120,
    quick: 220,
    base: 360,
    slow: 720,
    cinematic: 1400,
    breath: 4800 // for ambient looping
  },
  easings: {
    // Reanimated Easing.bezier args — kept as tuples so screens can apply.
    standard: [0.32, 0.72, 0, 1] as const,
    enter: [0.16, 1, 0.3, 1] as const,
    exit: [0.7, 0, 0.84, 0] as const,
    organic: [0.45, 0, 0.15, 1] as const
  }
} as const;

export type Palette = typeof palette;
export type Radii = typeof radii;
