import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import Svg, { Circle, G } from "react-native-svg";
import type { AppTheme } from "../themes";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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
  const strokeWidth = 3;
  const trackWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    p.value = withTiming(Math.max(0, Math.min(1, progress)), {
      duration: t.motion.durations.slow,
      easing: Easing.bezier(...t.motion.easings.standard)
    });
  }, [progress, p, t.motion]);

  const ringStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.45 + 0.5 * p.value
  }));

  const ringAnimatedProps = useAnimatedProps(() => ({
    stroke: interpolateColor(
      p.value,
      [0, 0.5, 1],
      [t.colors.accent, t.colors.accentSoft, t.colors.success]
    ),
    strokeDashoffset: circumference * (1 - p.value)
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
        <G rotation={-90} originX={size / 2} originY={size / 2}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={"rgba(255,255,255,0.08)"}
            strokeWidth={trackWidth}
            fill="none"
          />
          <AnimatedCircle
            animatedProps={ringAnimatedProps}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            fill="none"
          />
        </G>
      </Svg>
      <Animated.View
        style={[
          styles.activeRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2
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
      position: "absolute"
    },
    activeRing: {
      position: "absolute",
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 0 },
      pointerEvents: "none"
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
