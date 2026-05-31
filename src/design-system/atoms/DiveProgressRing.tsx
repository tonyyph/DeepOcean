import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  interpolateColor,
  Easing
} from "react-native-reanimated";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import type { AppTheme } from "../themes";

type Props = {
  /** 0..1 progress (elapsed / target). For open-ended dives, use elapsed/sessionEstimate. */
  progress: number;
  elapsedSeconds: number;
  size?: number;
};

export const DiveProgressRing = React.memo(function DiveProgressRing({
  progress,
  elapsedSeconds,
  size = 240
}: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withTiming(Math.max(0, Math.min(1, progress)), {
      duration: t.motion.durations.slow,
      easing: Easing.bezier(...t.motion.easings.standard)
    });
  }, [progress, p, t.motion]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(p.value, [0, 1], [-90, 270])}deg` }],
    borderColor: interpolateColor(
      p.value,
      [0, 0.5, 1],
      [t.colors.accent, t.colors.accentSoft, t.colors.success]
    ),
    shadowOpacity: 0.45 + 0.5 * p.value
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View
        style={[
          styles.trackRing,
          { width: size, height: size, borderRadius: size / 2 }
        ]}
      />
      <Animated.View
        style={[
          styles.activeRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            shadowColor: t.colors.accent
          },
          ringStyle
        ]}
      />
      <View style={styles.center}>
        <Text style={styles.time}>{formatTime(elapsedSeconds)}</Text>
        <Text style={styles.label}>DIVE TIME</Text>
      </View>
    </View>
  );
});

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    wrap: { alignItems: "center", justifyContent: "center" },
    trackRing: {
      position: "absolute",
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.08)"
    },
    activeRing: {
      position: "absolute",
      borderWidth: 3,
      borderRightColor: "transparent",
      borderBottomColor: "transparent",
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 0 }
    },
    center: { alignItems: "center" },
    time: {
      color: t.colors.text,
      fontSize: 48,
      fontFamily: t.fonts.mono,
      letterSpacing: -1
    },
    label: {
      color: t.colors.textMuted,
      fontSize: 11,
      letterSpacing: 1,
      marginTop: 4,
      fontFamily: t.fonts.label
    }
  });
