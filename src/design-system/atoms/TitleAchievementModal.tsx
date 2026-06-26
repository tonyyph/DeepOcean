import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated as RNAnimated,
  useWindowDimensions
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import type { AppTheme } from "../themes";
import { GlowText } from "./GlowText";
import type { TitleAchievement } from "@/features/diver/titleAchievements";
import { useTranslations } from "@/core/i18n";
import { ModalFrame } from "./ModalFrame";
import { FloatingLabel } from "@/design-system";

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
  const { width, height } = useWindowDimensions();

  const progress = useSharedValue(0);
  const iconScale = useSharedValue(0.5);
  const countdown = useRef(new RNAnimated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showFloat, setShowFloat] = useState(false);

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
      iconScale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 240 }),
        withSpring(1.0, { damping: 16, stiffness: 200 })
      );
      countdown.setValue(1);
      RNAnimated.timing(countdown, {
        toValue: 0,
        duration: AUTO_DISMISS_MS,
        useNativeDriver: false
      }).start();
      timerRef.current = setTimeout(() => onDismiss(), AUTO_DISMISS_MS);
      floatTimerRef.current = setTimeout(() => setShowFloat(true), 300);
    } else {
      progress.value = withTiming(0, { duration: 200 });
      iconScale.value = 0.5;
      setShowFloat(false);
      countdown.stopAnimation();
      countdown.setValue(1);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (floatTimerRef.current) {
        clearTimeout(floatTimerRef.current);
        floatTimerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (floatTimerRef.current) {
        clearTimeout(floatTimerRef.current);
        floatTimerRef.current = null;
      }
    };
  }, [visible, progress, iconScale, countdown, onDismiss]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: 0.88 + progress.value * 0.12 },
      { translateY: (1 - progress.value) * 20 }
    ]
  }));

  const iconBounceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }]
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
    <>
    <ModalFrame
      visible={visible}
      onDismiss={handleDismiss}
      progress={progress}
      cardAnimatedStyle={cardStyle}
      cardStyle={styles.card}
      accentColor={t.colors.accent}
    >
      <LinearGradient
        colors={[t.colors.accent + "18", "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.cardGlow}
      />

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

      <Animated.View style={iconBounceStyle}>
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
      </Animated.View>

      <GlowText size={22} style={styles.title}>
        {achievement.title}
      </GlowText>

      <Text style={styles.description}>{achievement.description}</Text>

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
    </ModalFrame>
    {showFloat && achievement && (
      <FloatingLabel
        label={achievement.title}
        x={width / 2 - 40}
        y={height * 0.48}
        onDone={() => setShowFloat(false)}
      />
    )}
    </>
  );
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    card: {
      maxWidth: 340,
      paddingVertical: t.spacing[8],
      paddingHorizontal: t.spacing[6],
      alignItems: "center",
      gap: t.spacing[3],
      overflow: "hidden"
    },
    cardGlow: {
      ...StyleSheet.absoluteFill,
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
      shadowOpacity: 0.22,
      shadowRadius: 10,
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
