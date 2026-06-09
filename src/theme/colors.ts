import { palette } from "@/design-system/tokens";

export const Colors = {
  base: {
    white: "#FFFFFF",
    black: "#000000"
  },
  text: palette.text,
  bio: palette.bio,
  premium: {
    gold: "#FFD27A",
    amber: "#FF9F43",
    deepInk: "#1A0F00"
  },
  overlay: {
    scrim50: "rgba(0,0,0,0.5)",
    scrim55: "rgba(0,0,0,0.55)",
    scrim58: "rgba(0,0,0,0.58)",
    scrim60: "rgba(0,0,0,0.6)"
  }
} as const;
