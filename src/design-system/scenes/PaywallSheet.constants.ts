import { Dimensions } from "react-native";
import type { Ionicons } from "@expo/vector-icons";

export type PlanId = "lifetime" | "annual" | "monthly";

export type BenefitSlide = {
  readonly icon: string;
  readonly title: string;
  readonly body: string;
};

export const SCREEN_WIDTH = Dimensions.get("window").width;

export const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  water: "water-outline",
  diamond: "diamond-outline",
  sparkles: "sparkles-outline",
  telescope: "telescope-outline"
};
