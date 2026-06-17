import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  type ViewStyle,
  ActivityIndicator
} from "react-native";
import type { AppTheme } from "../themes";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import { Pressable, PressableProps } from "react-native-gesture-handler";

type Tone = "primary" | "secondary" | "danger" | "premium";
type Size = "sm" | "md" | "lg";

type Props = Omit<PressableProps, "children"> & {
  label: string;
  tone?: Tone;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  loading?: boolean;
  containerStyle?: ViewStyle;
};

export const ActionButton = React.memo(function ActionButton({
  label,
  tone = "primary",
  size = "md",
  icon,
  fullWidth = false,
  loading = false,
  disabled,
  containerStyle,
  ...rest
}: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const isPrimary = tone === "primary" || tone === "premium";
  const radius = t.radii.pill;
  const toneColor =
    tone === "danger"
      ? t.colors.danger
      : tone === "premium"
        ? t.colors.premium
        : t.colors.accent;
  const foregroundColor = isPrimary
    ? readableOn(toneColor, t.colors.background, t.colors.text)
    : toneColor;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        fullWidth ? styles.fullWidth : styles.compact,
        !isPrimary && styles.secondary,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
        {
          borderRadius: radius,
          borderColor: isPrimary ? "transparent" : toneColor,
          shadowColor: toneColor
        },
        containerStyle
      ]}
      {...rest}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.background,
          { borderRadius: radius }
        ]}
        pointerEvents="none"
      >
        {isPrimary ? (
          <LinearGradient
            colors={
              tone === "premium"
                ? [t.colors.premium, t.colors.warning]
                : [t.colors.accent, t.colors.accent]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: t.colors.panelStrong }
            ]}
          />
        )}
      </View>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={foregroundColor} />
        ) : icon ? (
          <Ionicons
            name={icon}
            size={size === "sm" ? 14 : 16}
            color={foregroundColor}
          />
        ) : null}
        <Text
          style={[
            styles.label,
            styles[`${size}Label`],
            { color: foregroundColor }
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
});

function readableOn(
  background: string,
  darkText: string,
  lightText: string
): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(background);
  if (!match?.[1]) return darkText;
  const n = parseInt(match[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma > 0.62 ? darkText : lightText;
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    base: {
      borderRadius: t.radii.pill,
      borderWidth: 1,
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      shadowOpacity: t.shadows.glow.opacity,
      shadowRadius: t.shadows.glow.radius,
      shadowOffset: { width: 0, height: t.shadows.glow.offsetY }
    },
    sm: {
      minHeight: 36,
      paddingHorizontal: t.spacing[3.5],
      paddingVertical: t.spacing[1]
    },
    md: {
      minHeight: 40,
      paddingHorizontal: t.spacing[4],
      paddingVertical: t.spacing[1]
    },
    lg: {
      minHeight: 44,
      paddingHorizontal: t.spacing[4],
      paddingVertical: t.spacing[1]
    },
    secondary: {
      shadowOpacity: 0
    },
    background: {
      overflow: "hidden"
    },
    content: {
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      padding: t.spacing[3],
      gap: t.spacing[2],
      zIndex: 1
    },
    compact: {
      alignSelf: "center",
      minWidth: 128
    },
    fullWidth: {
      alignSelf: "stretch"
    },
    disabled: {
      opacity: t.surfaces.pressDisabledOpacity
    },
    pressed: {
      transform: [{ scale: 0.98 }]
    },
    label: {
      fontFamily: t.fonts.label,
      letterSpacing: 0,
      textAlign: "center",
      flexShrink: 1
    },
    smLabel: {
      fontSize: t.typography.scale.caption
    },
    mdLabel: {
      fontSize: t.typography.scale.body
    },
    lgLabel: {
      fontSize: t.typography.scale.body
    }
  });
