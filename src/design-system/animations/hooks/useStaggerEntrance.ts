// src/design-system/animations/hooks/useStaggerEntrance.ts
import { useEffect } from "react";
import {
  cancelAnimation,
  Easing,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useSettings } from "@/stores";

type Options = {
  staggerMs?: number;
  duration?: number;
  initialDelay?: number;
};

export function useStaggerEntrance(
  count: number,
  opts: Options = {}
): SharedValue<number>[] {
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const { staggerMs = 60, duration = 380, initialDelay = 0 } = opts;

  // Always create the same number of shared values (hooks rule)
  const values = Array.from({ length: Math.max(count, 1) }, () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSharedValue(reducedMotion ? 1 : 0)
  );

  useEffect(() => {
    if (reducedMotion) {
      values.forEach((v) => { v.value = 1; });
      return;
    }
    values.forEach((v, i) => {
      v.value = 0;
      v.value = withDelay(
        initialDelay + i * staggerMs,
        withTiming(1, { duration, easing: Easing.bezier(0.16, 1, 0.3, 1) })
      );
    });
    return () => { values.forEach((v) => cancelAnimation(v)); };
    // count is stable per component instance — deps are intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, staggerMs, duration, initialDelay]);

  return values;
}
