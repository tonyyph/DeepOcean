import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing
} from "react-native-reanimated";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import type { AppTheme } from "../themes";

export type MoodMapEntry = {
  label: string;
  /** Normalised value 0–1. */
  value: number;
  /** Optional accent color override. */
  color?: string;
};

type Props = {
  data: MoodMapEntry[];
};

/**
 * MoodMapChart — horizontal bar chart for the Pro insights mood map.
 * Bars animate in from left on mount/data change.
 */
export const MoodMapChart = React.memo(function MoodMapChart({ data }: Props) {
  return (
    <View style={styles.container}>
      {data.map((entry, idx) => (
        <MoodBar key={entry.label} entry={entry} delay={idx * 80} />
      ))}
    </View>
  );
});

function MoodBar({ entry, delay }: { entry: MoodMapEntry; delay: number }) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(entry.value, {
        duration: 600,
        easing: Easing.bezier(0.16, 1, 0.3, 1)
      })
    );
    // Reset when value changes
    return () => {
      width.value = 0;
    };
  }, [entry.value, delay, width]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%` as `${number}%`
  }));

  const accent = entry.color ?? t.colors.accent;

  return (
    <View style={styles.row}>
      <Text style={styles.label} numberOfLines={1}>
        {entry.label}
      </Text>
      <View style={styles.track}>
        <Animated.View
          style={[styles.fill, barStyle, { backgroundColor: accent }]}
        >
          {/* Glow cap */}
          <View
            style={[
              styles.fillCap,
              { backgroundColor: accent, shadowColor: accent }
            ]}
          />
        </Animated.View>
      </View>
      <Text style={styles.pct}>{Math.round(entry.value * 100)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 }
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[3]
    },
    label: {
      width: 72,
      color: t.colors.textSecondary,
      fontSize: 12,
      fontFamily: t.fonts.label,
      letterSpacing: 0.4
    },
    track: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      backgroundColor: "rgba(255,255,255,0.07)",
      overflow: "hidden"
    },
    fill: {
      height: "100%",
      borderRadius: 3,
      position: "relative"
    },
    fillCap: {
      position: "absolute",
      right: 0,
      top: -1,
      width: 8,
      height: 8,
      borderRadius: 4,
      shadowOpacity: 0.9,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 0 }
    },
    pct: {
      width: 34,
      color: t.colors.textMuted,
      fontSize: 11,
      fontFamily: t.fonts.label,
      textAlign: "right"
    }
  });
