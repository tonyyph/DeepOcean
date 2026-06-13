import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  View,
  type ViewStyle
} from "react-native";
import type { AppTheme } from "../themes";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";

type Tone = "primary" | "secondary" | "danger" | "premium";
type Size = "sm" | "md" | "lg";

type Props = Omit<PressableProps, "children"> & {
  label: string;
  tone?: Tone;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  containerStyle?: ViewStyle;
};

export const ActionButton = React.memo(function ActionButton({
  label,
  tone = "primary",
  size = "md",
  icon,
  fullWidth = false,
  disabled,
  containerStyle,
  ...rest
}: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const isPrimary = tone === "primary" || tone === "premium";
  const toneColor =
    tone === "danger"
      ? t.colors.danger
      : tone === "premium"
        ? t.colors.premium
        : t.colors.accent;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        fullWidth && styles.fullWidth,
        !isPrimary && styles.secondary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        {
          borderColor: isPrimary ? "transparent" : toneColor,
          shadowColor: toneColor
        },
        containerStyle
      ]}
      {...rest}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {isPrimary ? (
          <LinearGradient
            colors={
              tone === "premium"
                ? [t.colors.premium, t.colors.accentSoft]
                : [t.colors.accent, t.colors.accentSoft]
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
      {icon ? (
        <Ionicons
          name={icon}
          size={size === "sm" ? 14 : 16}
          color={isPrimary ? t.colors.background : toneColor}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          styles[`${size}Label`],
          { color: isPrimary ? t.colors.background : toneColor }
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    base: {
      minHeight: 44,
      borderRadius: t.radii.pill,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: t.spacing[2],
      overflow: "hidden",
      shadowOpacity: t.shadows.glow.opacity,
      shadowRadius: t.shadows.glow.radius,
      shadowOffset: { width: 0, height: t.shadows.glow.offsetY }
    },
    sm: {
      minHeight: 36,
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[2]
    },
    md: {
      paddingHorizontal: t.spacing[4],
      paddingVertical: t.spacing[3]
    },
    lg: {
      minHeight: 52,
      paddingHorizontal: t.spacing[5],
      paddingVertical: t.spacing[3.5]
    },
    secondary: {
      shadowOpacity: 0
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
      letterSpacing: 0.6,
      textAlign: "center"
    },
    smLabel: {
      fontSize: t.typography.scale.caption
    },
    mdLabel: {
      fontSize: t.typography.scale.bodySm
    },
    lgLabel: {
      fontSize: t.typography.scale.body
    }
  });
