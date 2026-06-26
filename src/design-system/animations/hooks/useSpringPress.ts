// src/design-system/animations/hooks/useSpringPress.ts
import { useCallback } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type AnimatedStyle,
} from "react-native-reanimated";
import type { ViewStyle } from "react-native";
import { useSettings } from "@/stores";

type Result = {
  onPressIn: () => void;
  onPressOut: () => void;
  pressStyle: AnimatedStyle<ViewStyle>;
};

export function useSpringPress(): Result {
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const scale = useSharedValue(1);

  const onPressIn = useCallback(() => {
    if (reducedMotion) return;
    scale.value = withSpring(0.96, { damping: 18, stiffness: 300 });
  }, [reducedMotion, scale]);

  const onPressOut = useCallback(() => {
    if (reducedMotion) return;
    scale.value = withSpring(1.0, { damping: 14, stiffness: 200 });
  }, [reducedMotion, scale]);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { onPressIn, onPressOut, pressStyle };
}
