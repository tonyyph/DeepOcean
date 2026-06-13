import { useSettings } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import type { AppTheme } from "../themes";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";

type Props = Omit<PressableProps, "children"> & {
  label?: string;
  active?: boolean;
  containerStyle?: ViewStyle;
  icon?: keyof typeof Ionicons.glyphMap;
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
  icon,
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
        <View style={[styles.pill, active && styles.pillActive]}>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={active ? t.colors.accent : t.colors.textSecondary}
            />
          )}
          {label && (
            <Text style={[styles.label, active && { color: t.colors.accent }]}>
              {label}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    pill: {
      height: 40,
      borderRadius: t.radii.sm,
      backgroundColor: t.colors.panelStrong,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: t.spacing[2]
    },
    pillActive: {
      backgroundColor: t.colors.glass,
      borderColor: t.colors.accent
    },
    pillActive: {
      backgroundColor: t.colors.accent + "26",
      borderColor: t.colors.accent
    },
    label: {
      color: t.colors.textSecondary,
      fontSize: t.typography.scale.bodySm,
      fontFamily: t.fonts.body,
      textAlign: "center"
    }
  });
