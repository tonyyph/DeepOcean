type FontSet = {
  display: string;
  body: string;
  label: string;
  mono: string;
  displayLetterSpacing: number;
};

export const THEME_HEX = {
  white: "#FFFFFF",
  black: "#000000",
  premium: "#FFD27A"
} as const;

export const THEME_FONTS: FontSet = {
  display: "SpaceGrotesk_700Bold",
  body: "SpaceGrotesk_400Regular",
  label: "SpaceGrotesk_500Medium",
  mono: "JetBrainsMono_400Regular",
  displayLetterSpacing: 0
};

export function alpha(hex: string, opacity: number): string {
  const normalized =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}
