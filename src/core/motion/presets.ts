import {
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  type WithTimingConfig,
  type WithSpringConfig
} from "react-native-reanimated";
import { theme } from "@/design-system/theme";

/**
 * Motion presets — opinionated, cinematic. Use these instead of crafting
 * configs ad-hoc; consistency is what gives the app its Apple-grade feel.
 *
 * All consumer code (hooks, components) imports from here. Tuning is a
 * one-line change across the entire app.
 */

const E = theme.motion.easings;
const D = theme.motion.durations;

export const motionPresets = {
  // Standard "fluid" property animation
  liquid: {
    duration: D.base,
    easing: Easing.bezier(...E.standard)
  } satisfies WithTimingConfig,

  // Entrance — slow, confident
  enter: {
    duration: D.slow,
    easing: Easing.bezier(...E.enter)
  } satisfies WithTimingConfig,

  // Exit — quick fade out
  exit: {
    duration: D.quick,
    easing: Easing.bezier(...E.exit)
  } satisfies WithTimingConfig,

  // Cinematic — page transitions / dive start
  cinematic: {
    duration: D.cinematic,
    easing: Easing.bezier(...E.organic)
  } satisfies WithTimingConfig,

  // Springs
  pop: {
    damping: 14,
    stiffness: 220,
    mass: 0.9
  } satisfies WithSpringConfig,

  settle: {
    damping: 22,
    stiffness: 140,
    mass: 1
  } satisfies WithSpringConfig
} as const;

/** Slow breathing loop — opacity/scale between two values forever. */
export function breathe(from: number, to: number) {
  "worklet";
  return withRepeat(
    withSequence(
      withTiming(to, {
        duration: D.breath / 2,
        easing: Easing.inOut(Easing.quad)
      }),
      withTiming(from, {
        duration: D.breath / 2,
        easing: Easing.inOut(Easing.quad)
      })
    ),
    -1,
    true
  );
}

/** Re-exports so feature code only imports from one place. */
export { withTiming, withSpring, withRepeat, withSequence, Easing };
