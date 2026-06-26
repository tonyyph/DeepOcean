// src/design-system/animations/hooks/usePulseGlow.ts
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

type Options = {
  minOpacity?: number;
  maxOpacity?: number;
  duration?: number; // half-period in ms
};

export function usePulseGlow(
  opts: Options = {}
): AnimatedStyle<ViewStyle> {
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const { minOpacity = 0.2, maxOpacity = 0.7, duration = 1600 } = opts;
  const opacity = useSharedValue(minOpacity);

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = (minOpacity + maxOpacity) / 2;
      return;
    }
    opacity.value = withRepeat(
      withTiming(maxOpacity, { duration, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
    return () => cancelAnimation(opacity);
  }, [reducedMotion, minOpacity, maxOpacity, duration, opacity]);

  return useAnimatedStyle(() => ({ shadowOpacity: opacity.value }));
}
