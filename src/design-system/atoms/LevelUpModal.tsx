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
import { getLevelTitle } from "@/features/diver/levelSystem";
import { useTranslations } from "@/core/i18n";
import { useSettings } from "@/stores";
import { Colors, Gradients, Shadows } from "@/theme";
import { ModalFrame } from "./ModalFrame";
import { ParticleBurst, FloatingLabel, CountUpText, useCountUp } from "@/design-system";

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
  const { width, height } = useWindowDimensions();

  const progress = useSharedValue(0);
  const levelScale = useSharedValue(0.4);
  const countdown = useRef(new RNAnimated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showBurst, setShowBurst] = useState(false);
  const [showFloat, setShowFloat] = useState(false);

  const levelValue = useCountUp(visible ? newLevel : prevLevel, { duration: 800 });

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
      burstTimerRef.current = setTimeout(() => setShowBurst(true), 180);
      floatTimerRef.current = setTimeout(() => setShowFloat(true), 320);
    } else {
      progress.value = withTiming(0, { duration: 200 });
      levelScale.value = 0.4;
      setShowBurst(false);
      setShowFloat(false);
      countdown.stopAnimation();
      countdown.setValue(1);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (burstTimerRef.current) {
        clearTimeout(burstTimerRef.current);
        burstTimerRef.current = null;
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
      if (burstTimerRef.current) {
        clearTimeout(burstTimerRef.current);
        burstTimerRef.current = null;
      }
      if (floatTimerRef.current) {
        clearTimeout(floatTimerRef.current);
        floatTimerRef.current = null;
      }
    };
  }, [visible, progress, levelScale, countdown, onDismiss]);

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
    <>
      <ModalFrame
        visible={visible}
        onDismiss={handleDismiss}
        progress={progress}
        cardAnimatedStyle={cardStyle}
        cardStyle={styles.card}
        accentColor={t.colors.premium}
      >
        <LinearGradient
          colors={Gradients.premium.levelUpGlow}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.cardGlow}
        />

        <View style={styles.badge}>
          <Ionicons
            name="arrow-up-circle"
            size={12}
            color={t.colors.premium}
          />
          <Text style={styles.badgeText}>
            {levelsGained > 1
              ? tr.levelUp.multiLevel(levelsGained)
              : tr.levelUp.badge}
          </Text>
        </View>

        <Animated.View style={[styles.levelWrap, levelStyle]}>
          <LinearGradient
            colors={Gradients.premium.crest}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.levelCircle}
          >
            <CountUpText value={levelValue} style={styles.levelNumber} />
          </LinearGradient>
        </Animated.View>

        <GlowText size={22} style={styles.title}>
          {newTitle}
        </GlowText>

        <Text style={styles.prevLabel}>
          {tr.levelUp.from(prevLevel, newLevel)}
        </Text>

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
      </ModalFrame>
      {showBurst && (
        <ParticleBurst
          x={width / 2}
          y={height * 0.38}
          color={t.colors.premium}
          onDone={() => setShowBurst(false)}
        />
      )}
      {showFloat && (
        <FloatingLabel
          label="+XP"
          x={width / 2 - 16}
          y={height * 0.5}
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
      paddingVertical: t.spacing[6],
      paddingHorizontal: t.spacing[6],
      alignItems: "center",
      gap: t.spacing[3],
      overflow: "hidden",
      ...Shadows.premium.card
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
      borderColor: t.colors.premium,
      backgroundColor: t.colors.glass
    },
    badgeText: {
      fontSize: 10,
      fontFamily: t.fonts.label,
      letterSpacing: 1.5,
      color: t.colors.premium
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
      ...Shadows.premium.glow
    },
    levelNumber: {
      fontSize: 38,
      fontFamily: t.fonts.display,
      color: Colors.premium.deepInk,
      letterSpacing: 0
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
      backgroundColor: t.colors.glass,
      borderRadius: 1,
      overflow: "hidden",
      marginTop: t.spacing[3]
    },
    countdownBar: {
      height: "100%",
      borderRadius: 1,
      backgroundColor: t.colors.premium
    },
    hint: {
      color: t.colors.textFaint,
      fontSize: 11,
      fontFamily: t.fonts.label,
      letterSpacing: 0.6,
      marginTop: t.spacing[1]
    }
  });
