import { ZONE_TABLE, type OceanZone } from "@/features/ocean/zones";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import type { AppTheme } from "../themes";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";

type Props = {
  depthMeters: number;
  zone: OceanZone;
  progress?: number;
};

export const DepthIndicator = React.memo(function DepthIndicator({
  depthMeters,
  zone,
  progress = 0
}: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const scale = useSharedValue(0.92);
  const clampedProgress = Math.max(0, Math.min(1, progress));

  useEffect(() => {
    scale.value = 0.92;
    scale.value = withSpring(1, { damping: 18, stiffness: 220 });
  }, [zone, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={[styles.capsule, animatedStyle]}>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${clampedProgress * 100}%`,
              backgroundColor: t.colors.accent + "1F"
            }
          ]}
        />
      </View>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: t.colors.accent }]} />
        <Text style={styles.label}>{ZONE_TABLE[zone].label.toUpperCase()}</Text>
      </View>
      <Text style={styles.depth}>
        {Math.round(depthMeters).toLocaleString()} m
      </Text>
    </Animated.View>
  );
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    capsule: {
      alignSelf: "center",
      paddingHorizontal: t.spacing[5],
      paddingVertical: t.spacing[2.5],
      borderRadius: t.radii.pill,
      backgroundColor: "rgba(2,8,28,0.55)",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.glassEdge,
      alignItems: "center",
      overflow: "hidden"
    },
    progressTrack: {
      ...StyleSheet.absoluteFillObject
    },
    progressFill: {
      height: "100%"
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[1.5]
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      shadowColor: t.colors.accent,
      shadowOpacity: 0.9,
      shadowRadius: 6
    },
    label: {
      color: t.colors.textSecondary,
      fontSize: 10,
      letterSpacing: 1,
      fontFamily: t.fonts.label
    },
    depth: {
      color: t.colors.text,
      fontSize: 13,
      marginTop: 2,
      fontFamily: t.fonts.mono
    }
  });
