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
  withTiming
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import type { AppTheme } from "../themes";
import { GlowText } from "./GlowText";
import type { TitleAchievement } from "@/features/diver/titleAchievements";
import { useTranslations } from "@/core/i18n";
import { Colors } from "@/theme";

const AUTO_DISMISS_MS = 5500;

type Props = {
  visible: boolean;
  achievement: TitleAchievement | null;
  onDismiss: () => void;
};

/**
 * TitleAchievementModal — celebrates a milestone achievement at dive end.
 * Auto-dismisses after 5.5 s; tap anywhere to close early.
 */
export const TitleAchievementModal = React.memo(function TitleAchievementModal({
  visible,
  achievement,
  onDismiss
}: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();

  const progress = useSharedValue(0);
  const countdown = useRef(new RNAnimated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
        (error: unknown) => {
          if (__DEV__) {
            console.warn("[Haptics] Title achievement open failed", error);
          }
        }
      );
      progress.value = withTiming(1, {
        duration: 280,
        easing: Easing.bezier(0.16, 1, 0.3, 1)
      });
      countdown.setValue(1);
      RNAnimated.timing(countdown, {
        toValue: 0,
        duration: AUTO_DISMISS_MS,
        useNativeDriver: false
      }).start();
      timerRef.current = setTimeout(() => onDismiss(), AUTO_DISMISS_MS);
    } else {
      progress.value = withTiming(0, { duration: 200 });
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
  }, [visible, progress, countdown, onDismiss]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: 0.88 + progress.value * 0.12 },
      { translateY: (1 - progress.value) * 20 }
    ]
  }));

  const handleDismiss = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      (error: unknown) => {
        if (__DEV__) {
          console.warn("[Haptics] Title achievement dismiss failed", error);
        }
      }
    );
    onDismiss();
  };

  if (!achievement) return null;

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
            intensity={28}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <Pressable
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: Colors.overlay.scrim55 }
            ]}
            onPress={handleDismiss}
          />
        </Animated.View>

        <View style={styles.center} pointerEvents="box-none">
          <Animated.View style={[styles.card, cardStyle]}>
            <LinearGradient
              colors={[t.colors.accent + "18", "transparent"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.cardGlow}
            />

            {/* Badge */}
            <View
              style={[styles.badge, { borderColor: t.colors.accent + "55" }]}
            >
              <Ionicons
                name="ribbon-outline"
                size={11}
                color={t.colors.accent}
              />
              <Text style={[styles.badgeText, { color: t.colors.accent }]}>
                {tr.titleAchievement.badge}
              </Text>
            </View>

            {/* Icon */}
            <View
              style={[
                styles.iconWrap,
                {
                  borderColor: t.colors.accent + "44",
                  shadowColor: t.colors.accent
                }
              ]}
            >
              <Ionicons
                name={achievement.icon as keyof typeof Ionicons.glyphMap}
                size={30}
                color={t.colors.accent}
              />
            </View>

            {/* Title */}
            <GlowText size={22} style={styles.title}>
              {achievement.title}
            </GlowText>

            {/* Description */}
            <Text style={styles.description}>{achievement.description}</Text>

            {/* Countdown */}
            <View style={styles.countdownTrack}>
              <RNAnimated.View
                style={[
                  styles.countdownBar,
                  {
                    backgroundColor: t.colors.accent,
                    width: countdown.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"]
                    })
                  }
                ]}
              />
            </View>

            <Text style={styles.hint}>{tr.titleAchievement.tapToDismiss}</Text>
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
      borderColor: t.colors.borderStrong,
      paddingVertical: t.spacing[8],
      paddingHorizontal: t.spacing[6],
      alignItems: "center",
      gap: t.spacing[3],
      overflow: "hidden"
    },
    cardGlow: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: t.radii.xl
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[1.5],
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[1],
      borderRadius: t.radii.pill,
      borderWidth: StyleSheet.hairlineWidth,
      backgroundColor: t.colors.glass
    },
    badgeText: {
      fontSize: 10,
      fontFamily: t.fonts.label,
      letterSpacing: 1.5
    },
    iconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.colors.glass,
      shadowOpacity: 0.55,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 0 },
      marginVertical: t.spacing[1]
    },
    title: {
      color: t.colors.text,
      fontSize: 22,
      fontFamily: t.fonts.display,
      letterSpacing: t.fonts.displayLetterSpacing,
      textAlign: "center"
    },
    description: {
      color: t.colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      fontFamily: t.fonts.body,
      textAlign: "center",
      paddingHorizontal: t.spacing[2]
    },
    countdownTrack: {
      width: "100%",
      height: 2,
      backgroundColor: t.colors.glass,
      borderRadius: 1,
      overflow: "hidden",
      marginTop: t.spacing[3]
    },
    countdownBar: {
      height: "100%",
      borderRadius: 1
    },
    hint: {
      color: t.colors.textFaint,
      fontSize: 11,
      fontFamily: t.fonts.label,
      letterSpacing: 0.6,
      marginTop: t.spacing[1]
    }
  });
