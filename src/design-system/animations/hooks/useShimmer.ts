// src/design-system/animations/hooks/useShimmer.ts
import { useEffect } from "react";
import {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type AnimatedStyle,
} from "react-native-reanimated";
import type { ViewStyle } from "react-native";
import { useSettings } from "@/stores";

export function useShimmer(containerWidth: number): AnimatedStyle<ViewStyle> {
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const translateX = useSharedValue(-containerWidth);

  useEffect(() => {
    if (reducedMotion || containerWidth <= 0) return;
    translateX.value = -containerWidth;
    translateX.value = withRepeat(
      withTiming(containerWidth, { duration: 1100, easing: Easing.linear }),
      -1,
      false
    );
    return () => cancelAnimation(translateX);
  }, [reducedMotion, containerWidth, translateX]);

  return useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
}
