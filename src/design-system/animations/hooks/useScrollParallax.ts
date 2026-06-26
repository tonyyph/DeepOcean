// src/design-system/animations/hooks/useScrollParallax.ts
import {
  useDerivedValue,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
  type AnimatedStyle,
} from "react-native-reanimated";
import type { ViewStyle } from "react-native";
import { useSettings } from "@/stores";
import { useEffect } from "react";

export function useScrollParallax(
  scrollY: SharedValue<number>,
  factor = 0.35
): AnimatedStyle<ViewStyle> {
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const reducedMotionSV = useSharedValue(reducedMotion);

  useEffect(() => {
    reducedMotionSV.value = reducedMotion;
  }, [reducedMotion, reducedMotionSV]);

  const translateY = useDerivedValue(() => {
    "worklet";
    return reducedMotionSV.value ? 0 : scrollY.value * factor;
  });

  return useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
}
