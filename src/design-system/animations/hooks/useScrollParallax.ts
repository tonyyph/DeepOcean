// src/design-system/animations/hooks/useScrollParallax.ts
import {
  useDerivedValue,
  useAnimatedStyle,
  type SharedValue,
  type AnimatedStyle,
} from "react-native-reanimated";
import type { ViewStyle } from "react-native";

export function useScrollParallax(
  scrollY: SharedValue<number>,
  factor = 0.35
): AnimatedStyle<ViewStyle> {
  const translateY = useDerivedValue(() => scrollY.value * factor);
  return useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
}
