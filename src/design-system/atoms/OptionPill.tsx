import React, { useCallback } from "react";
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import { useSettings } from "@/stores";
import type { AppTheme } from "../themes";

type Props = Omit<PressableProps, "children"> & {
  label: string;
  active?: boolean;
  containerStyle?: ViewStyle;
};

/**
 * OptionPill — single tappable pill used for compact option grids
 * (e.g. preferred dive length, mood selection).
 *
 * Lightweight (no GlassCard) for grids with many items.
 */
export const OptionPill = React.memo(function OptionPill({
  label,
  active = false,
  containerStyle,
  onPressIn,
  ...rest
}: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const hapticsEnabled = useSettings((s) => s.hapticsEnabled);
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(
    (e: Parameters<NonNullable<PressableProps["onPressIn"]>>[0]) => {
      if (!reducedMotion) {
        scale.value = withSpring(0.94, { damping: 16, stiffness: 280 });
      }
      if (hapticsEnabled) Haptics.selectionAsync();
      onPressIn?.(e);
    },
    [hapticsEnabled, reducedMotion, onPressIn, scale]
  );

  const handlePressOut = useCallback(() => {
    if (!reducedMotion) {
      scale.value = withSpring(1, { damping: 14, stiffness: 200 });
    }
  }, [reducedMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={[animatedStyle, containerStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...rest}
      >
        <View
          style={[
            styles.pill,
            active && {
              backgroundColor: hexWithAlpha(t.colors.accent, 0.14),
              borderColor: t.colors.accent
            }
          ]}
        >
          <Text style={[styles.label, active && { color: t.colors.accent }]}>
            {label}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
});

function hexWithAlpha(color: string, alpha: number): string {
  // Already rgba(...) — return as-is
  if (color.startsWith("rgba")) return color;
  // Hex #RRGGBB -> rgba()
  if (color.startsWith("#") && (color.length === 7 || color.length === 4)) {
    const c =
      color.length === 4
        ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
        : color;
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return color;
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    pill: {
      paddingVertical: t.spacing[3],
      paddingHorizontal: t.spacing[4],
      borderRadius: t.radii.md,
      backgroundColor: t.colors.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border,
      alignItems: "center",
      justifyContent: "center"
    },
    label: {
      color: t.colors.textSecondary,
      fontSize: 14,
      fontFamily: t.fonts.body,
      textAlign: "center"
    }
  });
