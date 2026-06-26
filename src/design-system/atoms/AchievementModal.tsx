import { useTranslations } from "@/core/i18n";
import { ZONE_TABLE, type OceanZone } from "@/features/ocean/zones";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated as RNAnimated,
  StyleSheet,
  Text,
  View
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from "react-native-reanimated";
import type { AppTheme } from "../themes";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import { GlowText } from "./GlowText";
import { Colors } from "@/theme";
import { ModalFrame } from "./ModalFrame";

const ZONE_ICONS: Record<OceanZone, keyof typeof Ionicons.glyphMap> = {
  surface: "sunny-outline",
  twilight: "partly-sunny-outline",
  midnight: "moon-outline",
  abyss: "eye-outline",
  trench: "infinite-outline"
};

const AUTO_DISMISS_MS = 5000;

type Props = {
  visible: boolean;
  zone: OceanZone;
  onDismiss: () => void;
};

/**
 * AchievementModal — celebrates a first-ever zone unlock during a live dive.
 * Auto-dismisses after 5 s; tapping anywhere closes it early.
 * Rendered as a centered Modal (not bottom-sheet) to break through the dive UI.
 */
export const AchievementModal = React.memo(function AchievementModal({
  visible,
  zone,
  onDismiss
}: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();

  const progress = useSharedValue(0);
  const iconScale = useSharedValue(0.4);
  const glowRadius = useSharedValue(0);
  // Countdown bar (drives width % from 1→0 over AUTO_DISMISS_MS)
  const countdown = useRef(new RNAnimated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      progress.value = withTiming(1, {
        duration: 260,
        easing: Easing.bezier(0.16, 1, 0.3, 1)
      });
      iconScale.value = withSequence(
        withSpring(1.18, { damping: 10, stiffness: 240 }),
        withSpring(1.0, { damping: 16, stiffness: 200 })
      );
      glowRadius.value = withTiming(16, { duration: 400 });
      countdown.setValue(1);
      RNAnimated.timing(countdown, {
        toValue: 0,
        duration: AUTO_DISMISS_MS,
        useNativeDriver: false
      }).start();
      timerRef.current = setTimeout(() => {
        onDismiss();
      }, AUTO_DISMISS_MS);
    } else {
      progress.value = withTiming(0, { duration: 200 });
      iconScale.value = 0.4;
      glowRadius.value = 0;
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
  }, [visible, progress, iconScale, glowRadius, countdown, onDismiss]);

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

  const glowRingStyle = useAnimatedStyle(() => ({
    shadowRadius: glowRadius.value,
    shadowOpacity: glowRadius.value > 0 ? 0.4 : 0
  }));

  const handleDismiss = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      (error: unknown) => {
        if (__DEV__) {
          console.warn("[Haptics] Achievement dismiss failed", error);
        }
      }
    );
    onDismiss();
  };

  if (!zone) return null;

  const zoneInfo = ZONE_TABLE[zone];
  const accent = Colors.zoneAccent[zone];
  const icon = ZONE_ICONS[zone];
  const depthMin = zoneInfo.depth[0];
  const depthMax = zoneInfo.depth[1];
  const depthLabel =
    depthMax === Number.POSITIVE_INFINITY
      ? `${depthMin.toLocaleString()} m +`
      : `${depthMin.toLocaleString()} – ${depthMax.toLocaleString()} m`;

  return (
    <ModalFrame
      visible={visible}
      onDismiss={handleDismiss}
      progress={progress}
      cardAnimatedStyle={cardStyle}
      cardStyle={styles.card}
      accentColor={accent}
    >
      <LinearGradient
        colors={[accent + "28", "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.cardGlow}
      />

      <View style={[styles.badge, { borderColor: accent + "55" }]}>
        <Ionicons name="ribbon-outline" size={11} color={accent} />
        <Text style={[styles.badgeText, { color: accent }]}>
          {tr.achievement.zoneUnlocked}
        </Text>
      </View>

      <Animated.View
        style={[
          styles.iconWrap,
          {
            borderColor: accent + "55",
            shadowColor: accent
          },
          iconBounceStyle,
          glowRingStyle
        ]}
      >
        <Ionicons name={icon} size={32} color={accent} />
      </Animated.View>

      <GlowText size={26} style={styles.zoneName}>
        {zoneInfo.label}
      </GlowText>

      <View style={[styles.depthChip, { borderColor: accent + "44" }]}>
        <Ionicons
          name="navigate-outline"
          size={11}
          color={t.colors.textMuted}
        />
        <Text style={styles.depthText}>{depthLabel}</Text>
      </View>

      <Text style={styles.description}>{zoneInfo.description}</Text>

      <View style={styles.countdownTrack}>
        <RNAnimated.View
          style={[
            styles.countdownBar,
            {
              backgroundColor: accent,
              width: countdown.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"]
              })
            }
          ]}
        />
      </View>

      <Text style={styles.dismissHint}>{tr.achievement.tapToDismiss}</Text>
    </ModalFrame>
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
    zoneName: {
      color: t.colors.text,
      fontSize: 26,
      fontFamily: t.fonts.display,
      letterSpacing: t.fonts.displayLetterSpacing,
      textAlign: "center"
    },
    depthChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[1.5],
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[1],
      borderRadius: t.radii.pill,
      borderWidth: StyleSheet.hairlineWidth,
      backgroundColor: t.colors.panel
    },
    depthText: {
      color: t.colors.textMuted,
      fontSize: 11,
      fontFamily: t.fonts.label,
      letterSpacing: 0.8
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
    dismissHint: {
      color: t.colors.textFaint,
      fontSize: 11,
      fontFamily: t.fonts.label,
      letterSpacing: 0.6,
      marginTop: t.spacing[1]
    }
  });
