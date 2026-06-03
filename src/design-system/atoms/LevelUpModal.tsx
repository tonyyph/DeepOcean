import React, { useEffect, useRef } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated as RNAnimated
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import type { AppTheme } from "../themes";
import { getLevelTitle } from "@/features/diver/levelSystem";
import { useTranslations } from "@/core/i18n";
import { useSettings } from "@/stores";

const AUTO_DISMISS_MS = 6000;

type Props = {
  visible: boolean;
  /** Level BEFORE the gain (e.g. 3). */
  prevLevel: number;
  /** Level AFTER the gain (e.g. 5 if gained 2 levels). */
  newLevel: number;
  onDismiss: () => void;
};

/**
 * LevelUpModal — triumphant gold-glow card shown when the player levels up
 * at the end of a dive. Auto-dismisses after 6 s; tap to dismiss early.
 */
export const LevelUpModal = React.memo(function LevelUpModal({
  visible,
  prevLevel,
  newLevel,
  onDismiss
}: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();
  const settings = useSettings();

  const progress = useSharedValue(0);
  const levelScale = useSharedValue(0.4);
  const countdown = useRef(new RNAnimated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const levelsGained = newLevel - prevLevel;
  const newTitle = getLevelTitle(newLevel, settings.language === "en");

  useEffect(() => {
    if (visible) {
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      ).catch(() => {});
      progress.value = withTiming(1, {
        duration: 300,
        easing: Easing.bezier(0.16, 1, 0.3, 1)
      });
      levelScale.value = withSpring(1, { damping: 14, stiffness: 180 });
      countdown.setValue(1);
      RNAnimated.timing(countdown, {
        toValue: 0,
        duration: AUTO_DISMISS_MS,
        useNativeDriver: false
      }).start();
      timerRef.current = setTimeout(() => onDismiss(), AUTO_DISMISS_MS);
    } else {
      progress.value = withTiming(0, { duration: 200 });
      levelScale.value = 0.4;
      countdown.stopAnimation();
      countdown.setValue(1);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visible, progress, levelScale, countdown, onDismiss]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: 0.88 + progress.value * 0.12 },
      { translateY: (1 - progress.value) * 24 }
    ]
  }));

  const levelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: levelScale.value }]
  }));

  const handleDismiss = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onDismiss();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
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
              { backgroundColor: "rgba(0,0,0,0.6)" }
            ]}
            onPress={handleDismiss}
          />
        </Animated.View>

        <View style={styles.center} pointerEvents="box-none">
          <Animated.View style={[styles.card, cardStyle]}>
            {/* Gold gradient wash */}
            <LinearGradient
              colors={["#FFD27A1A", "#FF9F4308"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.cardGlow}
            />

            {/* Label badge */}
            <View style={styles.badge}>
              <Ionicons name="arrow-up-circle" size={12} color="#FFD27A" />
              <Text style={styles.badgeText}>
                {levelsGained > 1
                  ? tr.levelUp.multiLevel(levelsGained)
                  : tr.levelUp.badge}
              </Text>
            </View>

            {/* Level number — spring-scaled for drama */}
            <Animated.View style={[styles.levelWrap, levelStyle]}>
              <LinearGradient
                colors={["#FFD27A", "#FF9F43"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.levelCircle}
              >
                <Text style={styles.levelNumber}>{newLevel}</Text>
              </LinearGradient>
            </Animated.View>

            {/* New rank title */}
            <Text style={styles.title}>{newTitle}</Text>

            {/* Previous level hint */}
            <Text style={styles.prevLabel}>
              {tr.levelUp.from(prevLevel, newLevel)}
            </Text>

            {/* Countdown */}
            <View style={styles.countdownTrack}>
              <RNAnimated.View
                style={[
                  styles.countdownBar,
                  {
                    width: countdown.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"]
                    })
                  }
                ]}
              />
            </View>

            <Text style={styles.hint}>{tr.levelUp.tapToDismiss}</Text>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: t.spacing[6]
    },
    card: {
      width: "100%",
      maxWidth: 340,
      borderRadius: t.radii.xl,
      backgroundColor: t.colors.surfaceElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "#FFD27A33",
      paddingVertical: t.spacing[6],
      paddingHorizontal: t.spacing[6],
      alignItems: "center",
      gap: t.spacing[3],
      overflow: "hidden",
      shadowColor: "#FFD27A",
      shadowOpacity: 0.25,
      shadowRadius: 32,
      shadowOffset: { width: 0, height: 0 }
    },
    cardGlow: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: t.radii.xl
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[1] + 2,
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[1],
      borderRadius: t.radii.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "#FFD27A44",
      backgroundColor: "rgba(255,210,122,0.06)"
    },
    badgeText: {
      fontSize: 10,
      fontFamily: t.fonts.label,
      letterSpacing: 1.5,
      color: "#FFD27A"
    },
    levelWrap: {
      marginVertical: t.spacing[2]
    },
    levelCircle: {
      width: 84,
      height: 84,
      borderRadius: 42,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#FFD27A",
      shadowOpacity: 0.7,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 0 }
    },
    levelNumber: {
      fontSize: 38,
      fontFamily: t.fonts.display,
      color: "#1A0F00",
      letterSpacing: -1
    },
    title: {
      color: t.colors.text,
      fontSize: 22,
      fontFamily: t.fonts.display,
      letterSpacing: t.fonts.displayLetterSpacing,
      textAlign: "center"
    },
    prevLabel: {
      color: t.colors.textMuted,
      fontSize: 12,
      fontFamily: t.fonts.body,
      textAlign: "center"
    },
    countdownTrack: {
      width: "100%",
      height: 2,
      backgroundColor: "rgba(255,210,122,0.12)",
      borderRadius: 1,
      overflow: "hidden",
      marginTop: t.spacing[3]
    },
    countdownBar: {
      height: "100%",
      borderRadius: 1,
      backgroundColor: "#FFD27A"
    },
    hint: {
      color: t.colors.textFaint,
      fontSize: 11,
      fontFamily: t.fonts.label,
      letterSpacing: 0.6,
      marginTop: t.spacing[1]
    }
  });
