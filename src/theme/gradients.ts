import { Colors } from "./colors";

export const Gradients = {
  premium: {
    crest: [Colors.premium.gold, Colors.premium.amber] as const,
    levelUpGlow: ["#FFD27A1A", "#FF9F4308"] as const
  }
} as const;
