import { useSettings } from "@/stores";
import { type ReactNode, useEffect } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from "react-native-reanimated";

type Props = {
  children: ReactNode;
  index?: number;
  delayMs?: number;
  durationMs?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
};

export function EntranceView({
  children,
  index = 0,
  delayMs = 70,
  durationMs = 420,
  distance = 16,
  style
}: Props) {
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const progress = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      progress.value = 1;
      return;
    }

    progress.value = 0;
    progress.value = withDelay(
      index * delayMs,
      withTiming(1, {
        duration: durationMs,
        easing: Easing.bezier(0.16, 1, 0.3, 1)
      })
    );

    return () => cancelAnimation(progress);
  }, [delayMs, durationMs, index, progress, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * distance }]
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
