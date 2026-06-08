import React, { useEffect } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import { PressableCard } from "./PressableCard";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import type { AppTheme } from "../themes";

type Props = {
  visible: boolean;
  minutes: number;
  zoneLabel: string;
  title: string;
  description: string;
  minutesLabel: string;
  estimatedReachLabel: string;
  startLabel: string;
  onDismiss: () => void;
  onMinutesChange: (value: number) => void;
  onStart: () => void;
};

/**
 * FreeDiveModal — centered modal for free dive setup.
 * Styled with the same backdrop + animated card language as other app modals.
 */
export const FreeDiveModal = React.memo(function FreeDiveModal({
  visible,
  minutes,
  zoneLabel,
  title,
  description,
  minutesLabel,
  estimatedReachLabel,
  startLabel,
  onDismiss,
  onMinutesChange,
  onStart
}: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: 220,
      easing: Easing.bezier(0.16, 1, 0.3, 1)
    });
  }, [visible, progress]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: 0.94 + progress.value * 0.06 },
      { translateY: (1 - progress.value) * 12 }
    ]
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value
  }));

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          <BlurView
            intensity={32}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <Pressable
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(0,0,0,0.58)" }
            ]}
            onPress={onDismiss}
          />
        </Animated.View>

        <View style={styles.center} pointerEvents="box-none">
          <Animated.View style={[styles.card, cardStyle]}>
            <View style={styles.headerRow}>
              <View style={styles.flex}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
              </View>
              <Ionicons name="infinite" size={24} color={t.colors.accent} />
            </View>

            <LinearGradient
              colors={[t.colors.accent + "20", t.colors.glass]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.spotlight}
            >
              <View style={styles.hintRow}>
                <Text style={styles.hintText}>
                  {estimatedReachLabel} · {zoneLabel}
                </Text>
              </View>
              <View style={styles.valueRow}>
                <Text style={styles.value}>{minutes}</Text>
                <Text style={styles.valueUnit}>{minutesLabel}</Text>
              </View>
            </LinearGradient>

            <Slider
              value={minutes}
              onValueChange={onMinutesChange}
              minimumValue={1}
              maximumValue={120}
              step={1}
              minimumTrackTintColor={t.colors.glassEdge}
              maximumTrackTintColor={t.colors.textMuted}
              thumbTintColor={t.colors.accent}
              style={styles.slider}
            />

            <PressableCard
              haptic="light"
              onPress={onStart}
              containerStyle={styles.action}
              radius={t.radii.sm}
              padding={t.spacing[3]}
              glow
            >
              <Text style={styles.actionText}>{startLabel}</Text>
            </PressableCard>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: t.spacing[5]
    },
    card: {
      width: "100%",
      maxWidth: 360,
      borderRadius: t.radii.xl,
      backgroundColor: t.colors.surfaceElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.borderStrong,
      paddingVertical: t.spacing[5],
      paddingHorizontal: t.spacing[5],
      gap: t.spacing[3],
      overflow: "hidden"
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: t.spacing[2]
    },
    title: {
      color: t.colors.text,
      fontSize: 18,
      fontFamily: t.fonts.display,
      letterSpacing: t.fonts.displayLetterSpacing
    },
    description: {
      color: t.colors.textMuted,
      fontSize: 13,
      marginTop: t.spacing[1],
      fontFamily: t.fonts.body
    },
    spotlight: {
      borderRadius: t.radii.sm,
      paddingVertical: t.spacing[3],
      paddingHorizontal: t.spacing[3],
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.accent + "44"
    },
    hintRow: {
      flexDirection: "row",
      justifyContent: "flex-end"
    },
    hintText: {
      color: t.colors.textMuted,
      fontSize: 11,
      fontFamily: t.fonts.body,
      textAlign: "right"
    },
    valueRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: t.spacing[1],
      marginTop: t.spacing[1.5]
    },
    value: {
      color: t.colors.accent,
      fontSize: 36,
      lineHeight: 38,
      fontFamily: t.fonts.mono
    },
    valueUnit: {
      color: t.colors.textSecondary,
      fontSize: 13,
      fontFamily: t.fonts.label
    },
    slider: {
      marginTop: t.spacing[1]
    },
    action: {
      width: "100%",
      marginTop: t.spacing[1]
    },
    actionText: {
      color: t.colors.text,
      textAlign: "center",
      letterSpacing: 0.9,
      fontSize: 12,
      fontFamily: t.fonts.label
    }
  });
