import { Colors } from "./colors";

export const Shadows = {
  premium: {
    glow: {
      shadowColor: Colors.premium.gold,
      shadowOpacity: 0.24,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 0 }
    },
    card: {
      shadowColor: Colors.premium.gold,
      shadowOpacity: 0.14,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 0 }
    }
  }
} as const;
