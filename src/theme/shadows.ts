import { Colors } from "./colors";

export const Shadows = {
  premium: {
    glow: {
      shadowColor: Colors.premium.gold,
      shadowOpacity: 0.7,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 0 }
    },
    card: {
      shadowColor: Colors.premium.gold,
      shadowOpacity: 0.25,
      shadowRadius: 32,
      shadowOffset: { width: 0, height: 0 }
    }
  }
} as const;
