import React, { useEffect } from "react";
import { StyleSheet, TextProps } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { useTheme } from "../useTheme";
import { useSettings } from "@/stores";

type Props = TextProps & {
  color?: string;
  size?: number;
  pulse?: boolean;
  children: React.ReactNode;
};

/**
 * GlowText — bio-luminescent text. Pulse loop honors `reducedMotion`.
 * Font family follows the active theme (display font).
 */
export const GlowText = React.memo(function GlowText({
  color,
  size = 16,
  pulse = false,
  style,
  children,
  ...rest
}: Props) {
  const t = useTheme();
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const opacity = useSharedValue(0.9);

  useEffect(() => {
    if (!pulse || reducedMotion) {
      opacity.value = 1;
      return;
    }
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: t.motion.durations.breath / 2,
          easing: Easing.inOut(Easing.quad)
        }),
        withTiming(0.62, {
          duration: t.motion.durations.breath / 2,
          easing: Easing.inOut(Easing.quad)
        })
      ),
      -1,
      true
    );
  }, [pulse, reducedMotion, opacity, t.motion.durations.breath]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    textShadowRadius: 18 * opacity.value
  }));

  return (
    <Animated.Text
      style={[
        styles.base,
        {
          color: color ?? t.colors.accent,
          fontSize: size,
          fontFamily: t.fonts.display,
          letterSpacing: t.fonts.displayLetterSpacing
        },
        animatedStyle,
        style
      ]}
      {...rest}
    >
      {children}
    </Animated.Text>
  );
});

const styles = StyleSheet.create({
  base: {
    textShadowOffset: { width: 0, height: 0 }
  }
});
