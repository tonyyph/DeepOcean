import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { AppTheme } from "../themes";

type Props = {
  theme: AppTheme;
  size?: number;
  /** When true, draws an active glowing border. */
  active?: boolean;
};

/**
 * ThemeSwatch — a circular gradient preview used inside the theme picker.
 * Pure visual; non-interactive. The theme prop is the *theme being previewed*,
 * NOT the currently-active app theme.
 */
export const ThemeSwatch = React.memo(function ThemeSwatch({
  theme,
  size = 64,
  active = false
}: Props) {
  // Use abyss-zone gradient as the swatch — most representative of theme mood.
  const colors = theme.gradients.abyss;

  return (
    <View
      style={[
        styles.outer,
        {
          width: size + 6,
          height: size + 6,
          borderRadius: (size + 6) / 2,
          borderWidth: 2,
          borderColor: active ? theme.colors.accent : "transparent",
          shadowColor: theme.colors.accent,
          shadowOpacity: active ? 0.8 : 0,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 }
        }
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden"
        }}
      >
        {/* Accent dot in center to hint at hue */}
        <View
          style={[
            styles.dot,
            {
              backgroundColor: theme.colors.accent,
              shadowColor: theme.colors.accent
            }
          ]}
        />
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  outer: {
    alignItems: "center",
    justifyContent: "center"
  },
  dot: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 }
  }
});
