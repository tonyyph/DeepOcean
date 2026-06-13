import type { AppTheme, ParticleEffect, ParticleStyle, ThemeId } from "./types";
import {
  motion,
  radii,
  shadows,
  spacing,
  surfaces,
  typography
} from "../tokens";
import { THEME_FONTS, THEME_HEX, alpha } from "./shared";

type PrismaticSpec = {
  id: ThemeId;
  name: string;
  element: string;
  description: string;
  colorStory: readonly string[];
  effectDescription: string;
  premium: boolean;
  accent: string;
  accentSoft: string;
  background: string;
  surface: string;
  elevated: string;
  text: string;
  muted: string;
  warning: string;
  success: string;
  danger: string;
  gradients: {
    surface: readonly [string, string, string];
    twilight: readonly [string, string, string];
    midnight: readonly [string, string, string];
    abyss: readonly [string, string, string];
    trench: readonly [string, string, string];
    bioGlow: readonly [string, string];
  };
  particles: {
    style: ParticleStyle;
    effect: ParticleEffect;
    scatter?: "even" | "clustered" | "bands";
    count: number;
    size: readonly [number, number];
    speed: number;
    drift: number;
    blur: number;
    hues: readonly string[];
    opacity: number;
    loopMs: number;
    randomize?: boolean;
  };
  combo?: AppTheme["combo"];
};

function makeTheme(spec: PrismaticSpec): AppTheme {
  return {
    id: spec.id,
    name: spec.name,
    element: spec.element,
    description: spec.description,
    colorStory: spec.colorStory,
    effectDescription: spec.effectDescription,
    premium: spec.premium,
    combo: spec.combo,
    colors: {
      background: spec.background,
      surface: spec.surface,
      surfaceElevated: spec.elevated,
      panel: alpha(spec.surface, 0.12),
      panelStrong: alpha(spec.elevated, 0.2),
      panelTint: alpha(spec.accent, 0.1),
      panelEdge: alpha(spec.accent, 0.36),
      border: alpha(spec.accentSoft, 0.18),
      borderStrong: alpha(spec.accent, 0.42),
      text: spec.text,
      textSecondary: alpha(spec.text, 0.82),
      textMuted: spec.muted,
      textFaint: alpha(spec.text, 0.34),
      accent: spec.accent,
      accentSoft: spec.accentSoft,
      danger: spec.danger,
      success: spec.success,
      warning: spec.warning,
      glass: alpha(spec.accent, 0.09),
      glassEdge: alpha(spec.accent, 0.24),
      premium: THEME_HEX.premium
    },
    gradients: spec.gradients,
    fonts: THEME_FONTS,
    particles: {
      ...spec.particles,
      vignette: [
        alpha(spec.accent, 0.13),
        alpha(spec.surface, 0.82),
        alpha(THEME_HEX.black, 0.96)
      ]
    },
    typography,
    radii,
    spacing,
    surfaces,
    shadows,
    motion
  };
}

export const prismLightTheme = makeTheme({
  id: "prismLight",
  name: "Prism Light",
  element: "Light",
  description:
    "A clean celestial skin with pale gold, pearl highlights, and readable luminous glass.",
  colorStory: [
    "Primary: warm prism gold for main actions and focus highlights.",
    "Secondary: pearl cyan for glows, edges, and low-pressure contrast.",
    "Base: near-black navy so bright elements stay readable."
  ],
  effectDescription:
    "Large prism beams descend from above while soft golden rays breathe behind the dive.",
  premium: false,
  accent: "#FFE9A6",
  accentSoft: "#BFF7FF",
  background: "#05070F",
  surface: "#171A27",
  elevated: "#23283A",
  text: "#FFF8E7",
  muted: "rgba(255,248,231,0.62)",
  warning: "#FFD27A",
  success: "#9FFFD4",
  danger: "#FF8EA6",
  gradients: {
    surface: ["#F6D987", "#7CC7D8", "#111827"],
    twilight: ["#FAE6A0", "#8BB7FF", "#141A35"],
    midnight: ["#E4F8FF", "#6F8DFF", "#10172A"],
    abyss: ["#FFF0B8", "#6BAED6", "#0B1020"],
    trench: ["#B4F4FF", "#36527D", "#05070F"],
    bioGlow: ["#FFE9A6", "#BFF7FF"]
  },
  particles: {
    style: "rays",
    effect: "light",
    scatter: "bands",
    count: 30,
    size: [1.4, 4],
    speed: 9,
    drift: 12,
    blur: 1.8,
    hues: ["#FFE9A6", "#FFFFFF", "#BFF7FF"],
    opacity: 0.78,
    loopMs: 15500
  },
  combo: {
    combinesWith: ["prismFire", "prismWater", "prismAir", "prismNature"]
  }
});

export const prismFireTheme = makeTheme({
  id: "prismFire",
  name: "Prism Fire",
  element: "Fire",
  description:
    "A radiant flame skin with ruby heat, ember particles, and high-contrast focus surfaces.",
  colorStory: [
    "Primary: flame orange for active states and calls to action.",
    "Secondary: hot amber for rewards, warnings, and glow accents.",
    "Base: burnt garnet panels for strong contrast without flattening text."
  ],
  effectDescription:
    "Flame sparks rise from the bottom with quick heat pulses and orange edge glow.",
  premium: false,
  accent: "#FF6A3D",
  accentSoft: "#FFD36A",
  background: "#12040A",
  surface: "#261018",
  elevated: "#3A1820",
  text: "#FFF0EA",
  muted: "rgba(255,240,234,0.62)",
  warning: "#FFD36A",
  success: "#91F7B7",
  danger: "#FF4E73",
  gradients: {
    surface: ["#FF9F45", "#CB2746", "#200711"],
    twilight: ["#FF6A3D", "#7B1842", "#190613"],
    midnight: ["#E34235", "#64132C", "#12040A"],
    abyss: ["#FF7A30", "#972339", "#16040A"],
    trench: ["#B92C29", "#471121", "#080206"],
    bioGlow: ["#FF6A3D", "#FFD36A"]
  },
  particles: {
    style: "embers",
    effect: "fire",
    scatter: "clustered",
    count: 34,
    size: [1.2, 3.6],
    speed: 18,
    drift: 22,
    blur: 1.2,
    hues: ["#FF6A3D", "#FFD36A", "#FF3D71"],
    opacity: 0.84,
    loopMs: 12000
  },
  combo: { combinesWith: ["prismWater", "prismAir", "prismNature"] }
});

export const prismWaterTheme = makeTheme({
  id: "prismWater",
  name: "Prism Water",
  element: "Water",
  description:
    "A crystalline tide skin built around aqua, sapphire, and soft bubble motion.",
  colorStory: [
    "Primary: clear aqua for focus progress and selected controls.",
    "Secondary: seafoam green for secondary highlights and success states.",
    "Base: deep sapphire blue for the calm ocean surface."
  ],
  effectDescription:
    "Round bubbles drift in wave paths while the whole background swells like a tide.",
  premium: false,
  accent: "#48E6FF",
  accentSoft: "#74F7C8",
  background: "#020A17",
  surface: "#082033",
  elevated: "#0C314D",
  text: "#EAFBFF",
  muted: "rgba(234,251,255,0.62)",
  warning: "#FFD27A",
  success: "#74F7C8",
  danger: "#FF7EA8",
  gradients: {
    surface: ["#48E6FF", "#1276C5", "#061222"],
    twilight: ["#65D7FF", "#2967D6", "#081634"],
    midnight: ["#35C8FF", "#0B4E88", "#04101F"],
    abyss: ["#36D9FF", "#0C65B2", "#020A17"],
    trench: ["#14A7C8", "#06405F", "#010712"],
    bioGlow: ["#48E6FF", "#74F7C8"]
  },
  particles: {
    style: "bubbles",
    effect: "water",
    count: 32,
    size: [1.4, 4.2],
    speed: 15,
    drift: 24,
    blur: 1.3,
    hues: ["#48E6FF", "#74F7C8", "#A9F4FF"],
    opacity: 0.78,
    loopMs: 14000
  },
  combo: { combinesWith: ["prismFire", "prismAir", "prismNature"] }
});

export const prismAirTheme = makeTheme({
  id: "prismAir",
  name: "Prism Air",
  element: "Air",
  description:
    "A swift sky skin with pale cyan, silver wind trails, and light drifting motion.",
  colorStory: [
    "Primary: pale sky cyan for airy highlights.",
    "Secondary: silver-white for clean edges and quiet luminosity.",
    "Base: blue graphite panels to keep the theme light but legible."
  ],
  effectDescription:
    "Thin wind motes sweep horizontally in wide arcs, making the canvas feel fast and airy.",
  premium: true,
  accent: "#BDEBFF",
  accentSoft: "#DDF7FF",
  background: "#060B16",
  surface: "#111B2C",
  elevated: "#1A2A42",
  text: "#F1FAFF",
  muted: "rgba(241,250,255,0.62)",
  warning: "#FFD27A",
  success: "#A7FFD6",
  danger: "#FF8EA6",
  gradients: {
    surface: ["#DDF7FF", "#78AFFF", "#0E1628"],
    twilight: ["#BDEBFF", "#A88CFF", "#11172D"],
    midnight: ["#B6F1FF", "#4E76C8", "#07101F"],
    abyss: ["#D7FAFF", "#6A91D9", "#060B16"],
    trench: ["#9CDFFF", "#2E4C78", "#020711"],
    bioGlow: ["#BDEBFF", "#DDF7FF"]
  },
  particles: {
    style: "petals",
    effect: "air",
    scatter: "bands",
    count: 27,
    size: [1, 3],
    speed: 10,
    drift: 42,
    blur: 1.6,
    hues: ["#BDEBFF", "#FFFFFF", "#B6C7FF"],
    opacity: 0.68,
    loopMs: 16500
  },
  combo: { combinesWith: ["prismFire", "prismWater"] }
});

export const prismNatureTheme = makeTheme({
  id: "prismNature",
  name: "Prism Nature",
  element: "Nature",
  description:
    "A verdant guardian skin with jade glow, living plankton, and calm emerald panels.",
  colorStory: [
    "Primary: vivid jade for living focus energy.",
    "Secondary: lime bloom for growth, streaks, and positive feedback.",
    "Base: deep moss green for a grounded restorative tone."
  ],
  effectDescription:
    "Living spores orbit and bloom around the center, like bioluminescent growth opening in the dark.",
  premium: true,
  accent: "#74FF9F",
  accentSoft: "#D4FF7A",
  background: "#04100A",
  surface: "#0B2517",
  elevated: "#113A24",
  text: "#EAFFF2",
  muted: "rgba(234,255,242,0.62)",
  warning: "#D4FF7A",
  success: "#74FF9F",
  danger: "#FF7E9D",
  gradients: {
    surface: ["#74FF9F", "#1C8C5C", "#06150D"],
    twilight: ["#B7FF79", "#238B6E", "#071711"],
    midnight: ["#50E89A", "#126047", "#04100A"],
    abyss: ["#74FF9F", "#177A4D", "#04100A"],
    trench: ["#2CA66F", "#0B3B2B", "#010804"],
    bioGlow: ["#74FF9F", "#D4FF7A"]
  },
  particles: {
    style: "plankton",
    effect: "nature",
    scatter: "clustered",
    count: 36,
    size: [1, 3.4],
    speed: 12,
    drift: 30,
    blur: 1.5,
    hues: ["#74FF9F", "#D4FF7A", "#83FFD8"],
    opacity: 0.8,
    loopMs: 15000,
    randomize: true
  },
  combo: { combinesWith: ["prismFire", "prismWater"] }
});

export const prismIceTheme = makeTheme({
  id: "prismIce",
  name: "Prism Ice",
  element: "Water + Air",
  description:
    "A diamond frost fusion: quiet blue-white glass, snow particles, and precise contrast.",
  colorStory: [
    "Primary: frost cyan for crisp focus signals.",
    "Secondary: white crystal for premium glow and clean borders.",
    "Base: cold blue-black panels for a sharp frozen read."
  ],
  effectDescription:
    "Small frost crystals fall precisely through a cold blue-white aura with restrained pulses.",
  premium: true,
  accent: "#A9F4FF",
  accentSoft: "#FFFFFF",
  background: "#04101C",
  surface: "#0C2336",
  elevated: "#17384F",
  text: "#F3FCFF",
  muted: "rgba(243,252,255,0.62)",
  warning: "#FFE6A3",
  success: "#9FFFD4",
  danger: "#FF8EA6",
  gradients: {
    surface: ["#FFFFFF", "#A9F4FF", "#071727"],
    twilight: ["#D7FEFF", "#86A9FF", "#0E1830"],
    midnight: ["#A9F4FF", "#3972AD", "#04101C"],
    abyss: ["#D9FFFF", "#5DA9D8", "#04101C"],
    trench: ["#8DEBFF", "#2A5C82", "#020914"],
    bioGlow: ["#A9F4FF", "#FFFFFF"]
  },
  particles: {
    style: "snow",
    effect: "ice",
    count: 34,
    size: [1.1, 3.2],
    speed: 8,
    drift: 16,
    blur: 1.2,
    hues: ["#FFFFFF", "#A9F4FF", "#C7D7FF"],
    opacity: 0.75,
    loopMs: 17000
  },
  combo: { ingredients: ["prismWater", "prismAir"] }
});

export const prismStormTheme = makeTheme({
  id: "prismStorm",
  name: "Prism Storm",
  element: "Fire + Air",
  description:
    "A charged fusion with violet lightning, bright cyan edges, and sharp glints.",
  colorStory: [
    "Primary: electric violet for charged controls and active rings.",
    "Secondary: lightning cyan for edges and fast visual feedback.",
    "Base: dark indigo panels to make the lightning feel dangerous but readable."
  ],
  effectDescription:
    "Lightning glints jump in stepped zigzags, flickering much faster than other elements.",
  premium: true,
  accent: "#B18CFF",
  accentSoft: "#55F3FF",
  background: "#070616",
  surface: "#15122B",
  elevated: "#211A45",
  text: "#F4F0FF",
  muted: "rgba(244,240,255,0.62)",
  warning: "#FFD27A",
  success: "#8CFFD6",
  danger: "#FF6FA8",
  gradients: {
    surface: ["#55F3FF", "#B18CFF", "#110A24"],
    twilight: ["#C66DFF", "#2B55FF", "#0D0920"],
    midnight: ["#8A6DFF", "#2431A8", "#070616"],
    abyss: ["#55F3FF", "#7A52FF", "#070616"],
    trench: ["#6C50D8", "#24166B", "#03030C"],
    bioGlow: ["#B18CFF", "#55F3FF"]
  },
  particles: {
    style: "shards",
    effect: "storm",
    scatter: "bands",
    count: 30,
    size: [1, 3.8],
    speed: 17,
    drift: 28,
    blur: 0.9,
    hues: ["#B18CFF", "#55F3FF", "#FFFFFF"],
    opacity: 0.82,
    loopMs: 11000
  },
  combo: { ingredients: ["prismFire", "prismAir"] }
});

export const prismMagmaTheme = makeTheme({
  id: "prismMagma",
  name: "Prism Magma",
  element: "Fire + Nature",
  description:
    "A molten fusion of flame and earth: amber lava, deep garnet, and heavy sparks.",
  colorStory: [
    "Primary: molten orange for intense progress and selected actions.",
    "Secondary: lava-lime flare for rare highlights and fusion energy.",
    "Base: dark basalt red for heavy, volcanic depth."
  ],
  effectDescription:
    "Heavy lava globes rise from the bottom while a molten lower glow expands slowly.",
  premium: true,
  accent: "#FF8A2A",
  accentSoft: "#E8FF6D",
  background: "#130604",
  surface: "#2B120A",
  elevated: "#421B0D",
  text: "#FFF2E4",
  muted: "rgba(255,242,228,0.62)",
  warning: "#FFD36A",
  success: "#B9FF7A",
  danger: "#FF4E5F",
  gradients: {
    surface: ["#E8FF6D", "#FF8A2A", "#220805"],
    twilight: ["#FFB13D", "#9C241C", "#170504"],
    midnight: ["#D65B1A", "#641711", "#130604"],
    abyss: ["#FF8A2A", "#7A1C12", "#130604"],
    trench: ["#B84316", "#39100A", "#060201"],
    bioGlow: ["#FF8A2A", "#E8FF6D"]
  },
  particles: {
    style: "silt",
    effect: "magma",
    scatter: "clustered",
    count: 38,
    size: [1.2, 4.4],
    speed: 9,
    drift: 14,
    blur: 1.4,
    hues: ["#FF8A2A", "#E8FF6D", "#FF3E31"],
    opacity: 0.82,
    loopMs: 15500
  },
  combo: { ingredients: ["prismFire", "prismNature"] }
});

export const prismMysticTheme = makeTheme({
  id: "prismMystic",
  name: "Prism Mystic",
  element: "Water + Nature",
  description:
    "A fae tide fusion with turquoise, orchid, and soft living shimmer.",
  colorStory: [
    "Primary: enchanted turquoise for calm focus states.",
    "Secondary: orchid violet for magical edges and companion moments.",
    "Base: blue-green midnight panels for a soft dreamlike surface."
  ],
  effectDescription:
    "Mystic orbs orbit the center in soft turquoise-violet loops, halfway between tide and spell.",
  premium: true,
  accent: "#82FFD9",
  accentSoft: "#D7A6FF",
  background: "#050C12",
  surface: "#0D2230",
  elevated: "#173246",
  text: "#EDFFF9",
  muted: "rgba(237,255,249,0.62)",
  warning: "#FFD27A",
  success: "#82FFD9",
  danger: "#FF8ECF",
  gradients: {
    surface: ["#82FFD9", "#D7A6FF", "#0A1322"],
    twilight: ["#D7A6FF", "#3FA9B8", "#0B1323"],
    midnight: ["#82FFD9", "#4262A9", "#050C12"],
    abyss: ["#82FFD9", "#6B6EEA", "#050C12"],
    trench: ["#4BC8BA", "#29366E", "#02070D"],
    bioGlow: ["#82FFD9", "#D7A6FF"]
  },
  particles: {
    style: "plankton",
    effect: "mystic",
    scatter: "clustered",
    count: 34,
    size: [1, 3.6],
    speed: 11,
    drift: 34,
    blur: 1.8,
    hues: ["#82FFD9", "#D7A6FF", "#FFFFFF"],
    opacity: 0.76,
    loopMs: 16000,
    randomize: true
  },
  combo: { ingredients: ["prismWater", "prismNature"] }
});

export const prismDarkTheme = makeTheme({
  id: "prismDark",
  name: "Prism Dark",
  element: "Fire + Water",
  description:
    "A final eclipse fusion: black-violet surfaces, crimson edges, and restrained power.",
  colorStory: [
    "Primary: eclipse violet for premium focus and selected states.",
    "Secondary: crimson rose for dangerous highlights and sharp borders.",
    "Base: near-black violet for maximum contrast and final-form intensity."
  ],
  effectDescription:
    "Eclipse orbs orbit slowly around the center with dark-violet pulses and crimson edges.",
  premium: true,
  accent: "#C77DFF",
  accentSoft: "#FF4E88",
  background: "#030108",
  surface: "#100719",
  elevated: "#1B0B2A",
  text: "#F8EEFF",
  muted: "rgba(248,238,255,0.62)",
  warning: "#FFD27A",
  success: "#75FFD5",
  danger: "#FF4E88",
  gradients: {
    surface: ["#FF4E88", "#6A2CFF", "#05020C"],
    twilight: ["#C77DFF", "#48116D", "#030108"],
    midnight: ["#8D45FF", "#240A45", "#030108"],
    abyss: ["#C77DFF", "#3B0A5C", "#030108"],
    trench: ["#5E1E90", "#160520", "#010003"],
    bioGlow: ["#C77DFF", "#FF4E88"]
  },
  particles: {
    style: "shards",
    effect: "dark",
    scatter: "bands",
    count: 28,
    size: [1, 3.4],
    speed: 14,
    drift: 18,
    blur: 1,
    hues: ["#C77DFF", "#FF4E88", "#FFFFFF"],
    opacity: 0.78,
    loopMs: 13000
  },
  combo: { ingredients: ["prismFire", "prismWater"] }
});

export const PRISMATIC_THEMES = [
  prismLightTheme,
  prismFireTheme,
  prismWaterTheme,
  prismAirTheme,
  prismNatureTheme,
  prismIceTheme,
  prismStormTheme,
  prismMagmaTheme,
  prismMysticTheme,
  prismDarkTheme
] as const;

export const THEME_COMBINATIONS: Record<string, ThemeId> = {
  "prismAir+prismWater": "prismIce",
  "prismAir+prismFire": "prismStorm",
  "prismFire+prismNature": "prismMagma",
  "prismNature+prismWater": "prismMystic",
  "prismFire+prismWater": "prismDark"
};
