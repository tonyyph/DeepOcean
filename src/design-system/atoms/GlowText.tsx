import React, { useEffect } from "react";
import { StyleSheet, TextProps, View } from "react-native";
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
 * GlowText — raised headline text with a crisp cartoon backing layer.
 * Pulse loop honors `reducedMotion`.
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
    opacity: pulse && !reducedMotion ? 0.94 + 0.06 * opacity.value : 1
  }));
  const textStyle = [
    styles.base,
    {
      color: color ?? t.colors.text,
      fontSize: size,
      fontFamily: t.fonts.display,
      letterSpacing: t.fonts.displayLetterSpacing
    },
    style
  ];

  return (
    <View style={styles.wrap}>
      <Animated.Text
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={[textStyle, styles.backing, animatedStyle]}
        {...rest}
      >
        {children}
      </Animated.Text>
      <Animated.Text style={[textStyle, animatedStyle]} {...rest}>
        {children}
      </Animated.Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {},
  base: {
    includeFontPadding: false
  },
  backing: {
    ...StyleSheet.absoluteFillObject,
    color: "rgba(0, 42, 74, 0.35)",
    transform: [{ translateY: 4 }]
  }
});
