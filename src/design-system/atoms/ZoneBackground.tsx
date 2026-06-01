import React, { useEffect } from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../useTheme";
import type { OceanZone } from "@/features/ocean/zones";

type Props = ViewProps & {
  zone?: OceanZone;
  children?: React.ReactNode;
};

/**
 * ZoneBackground — full-screen gradient that morphs based on current ocean zone.
 * Gradient stops are pulled from the active theme so each theme can express
 * the zone progression in its own palette.
 *
 * The whole background also cross-fades on theme switch via Reanimated opacity.
 */
export function ZoneBackground({
  zone = "surface",
  style,
  children,
  ...rest
}: Props) {
  const t = useTheme();
  const colors = t.gradients[zone];

  // Cross-fade on theme/zone change for a buttery transition.
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, {
      duration: t.motion.durations.slow,
      easing: Easing.bezier(...t.motion.easings.enter)
    });
  }, [t.id, zone, opacity, t.motion]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View
      style={[styles.root, { backgroundColor: t.colors.background }, style]}
      {...rest}
    >
      <Animated.View style={[StyleSheet.absoluteFill, fadeStyle]}>
        <LinearGradient
          colors={colors}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      {children && children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 }
});
