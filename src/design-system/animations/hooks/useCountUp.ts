// src/design-system/animations/hooks/useCountUp.ts
import { useEffect } from "react";
import {
  cancelAnimation,
  Easing,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useSettings } from "@/stores";

type Options = {
  duration?: number;
};

export function useCountUp(
  target: number,
  opts: Options = {}
): SharedValue<number> {
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const { duration = 600 } = opts;
  const value = useSharedValue(target);

  useEffect(() => {
    if (reducedMotion) {
      value.value = target;
      return;
    }
    value.value = withTiming(target, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
    return () => cancelAnimation(value);
  }, [target, reducedMotion, duration, value]);

  return value;
}
