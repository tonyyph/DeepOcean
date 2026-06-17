import React, { useCallback } from "react";
import { View, ViewStyle, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "../useTheme";
import { useSettings } from "@/stores";
import { GlassCard } from "./GlassCard";
import { Pressable, PressableProps } from "react-native-gesture-handler";

type Props = PressableProps & {
  haptic?: "light" | "medium" | "heavy" | "selection" | null;
  glow?: boolean;
  selected?: boolean;
  radius?: number;
  padding?: number;
  containerStyle?: ViewStyle;
  children: React.ReactNode;
};

/**
 * PressableCard — premium tactile card. Subtle scale + glow on press.
 * Respects `settings.hapticsEnabled` + `settings.reducedMotion`.
 */
export const PressableCard = React.memo(function PressableCard({
  haptic = "light",
  glow = false,
  selected = false,
  radius,
  padding,
  containerStyle,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: Props) {
  const t = useTheme();
  const r = radius ?? t.radii["2xl"];
  const hapticsEnabled = useSettings((s) => s.hapticsEnabled);
  const reducedMotion = useSettings((s) => s.reducedMotion);

  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const handlePressIn = useCallback(
    (e: Parameters<NonNullable<PressableProps["onPressIn"]>>[0]) => {
      if (!reducedMotion) {
        scale.value = withSpring(0.965, { damping: 18, stiffness: 240 });
        glowOpacity.value = withTiming(1, {
          duration: t.motion.durations.quick
        });
      }
      if (haptic && hapticsEnabled) {
        const map = {
          light: Haptics.ImpactFeedbackStyle.Light,
          medium: Haptics.ImpactFeedbackStyle.Medium,
          heavy: Haptics.ImpactFeedbackStyle.Heavy
        } as const;
        if (haptic === "selection") Haptics.selectionAsync();
        else Haptics.impactAsync(map[haptic]);
      }
      onPressIn?.(e);
    },
    [
      haptic,
      hapticsEnabled,
      reducedMotion,
      onPressIn,
      scale,
      glowOpacity,
      t.motion.durations.quick
    ]
  );

  const handlePressOut = useCallback(
    (e: Parameters<NonNullable<PressableProps["onPressOut"]>>[0]) => {
      if (!reducedMotion) {
        scale.value = withSpring(1, { damping: 14, stiffness: 180 });
        glowOpacity.value = withTiming(0, {
          duration: t.motion.durations.base
        });
      }
      onPressOut?.(e);
    },
    [reducedMotion, onPressOut, scale, glowOpacity, t.motion.durations.base]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  const animatedGlow = useAnimatedStyle(() => ({
    opacity: glowOpacity.value
  }));

  return (
    <Animated.View style={[animatedStyle, containerStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...rest}
      >
        <View>
          <GlassCard radius={r} padding={padding} glow={glow || selected}>
            {children}
          </GlassCard>
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: r,
                borderWidth: 1,
                borderColor: t.colors.accent,
                shadowColor: t.colors.accent,
                shadowOpacity: 0.22,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 0 }
              },
              selected ? selectedGlow : animatedGlow
            ]}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
});

const selectedGlow = { opacity: 1 };
