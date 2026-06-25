import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
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
import { ModalFrame } from "./ModalFrame";
import { useTranslations } from "@/core/i18n";
import { useSettings } from "@/stores";
import { ZONE_TABLE, type OceanZone } from "@/features/ocean/zones";
import { Colors } from "@/theme";

type Props = {
  visible: boolean;
  zone: OceanZone | null;
  onDismiss: () => void;
};

export const ZoneSetCompleteModal = React.memo(function ZoneSetCompleteModal({
  visible,
  zone,
  onDismiss
}: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const hapticsEnabled = useSettings((s) => s.hapticsEnabled);

  const progress = useSharedValue(0);
  const iconScale = useSharedValue(0.4);

  const zoneLabel = zone ? ZONE_TABLE[zone].label : "";
  const accentColor = t.colors.accent;

  useEffect(() => {
    if (visible) {
      if (hapticsEnabled) {
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
      }
      progress.value = withTiming(1, {
        duration: reducedMotion ? 0 : 280,
        easing: Easing.bezier(0.16, 1, 0.3, 1)
      });
      iconScale.value = reducedMotion
        ? 1
        : withSpring(1, { damping: 14, stiffness: 180 });
    } else {
      progress.value = withTiming(0, { duration: 200 });
      iconScale.value = 0.4;
    }
  }, [visible, progress, iconScale, reducedMotion, hapticsEnabled]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: 0.88 + progress.value * 0.12 },
      { translateY: (1 - progress.value) * 24 }
    ]
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }]
  }));

  return (
    <ModalFrame
      visible={visible}
      onDismiss={onDismiss}
      progress={progress}
      cardAnimatedStyle={cardStyle}
      cardStyle={styles.card}
      accentColor={accentColor}
    >
      <LinearGradient
        colors={[`${accentColor}1A`, `${accentColor}06`]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.cardGlow}
      />

      <View style={[styles.badge, { borderColor: accentColor }]}>
        <Ionicons name="book" size={10} color={accentColor} />
        <Text style={[styles.badgeText, { color: accentColor }]}>
          {tr.codex.setsTitle}
        </Text>
      </View>

      <Animated.View style={[styles.iconWrap, iconStyle]}>
        <View style={[styles.iconCircle, { borderColor: accentColor, shadowColor: accentColor }]}>
          <Ionicons name="checkmark-circle" size={52} color={accentColor} />
        </View>
      </Animated.View>

      <GlowText size={20} style={styles.title}>
        {tr.codex.completeTitle}
      </GlowText>

      <Text style={styles.body}>
        {tr.codex.completeBody(zoneLabel)}
      </Text>

      <View style={[styles.ctaButton, { borderColor: accentColor }]}>
        <Text
          style={[styles.ctaText, { color: accentColor }]}
          onPress={onDismiss}
        >
          {tr.codex.completeCta}
        </Text>
      </View>
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
      gap: t.spacing[4],
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
      marginVertical: t.spacing[1]
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      shadowOpacity: 0.4,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 0 }
    },
    title: {
      color: t.colors.text,
      fontSize: 20,
      fontFamily: t.fonts.display,
      letterSpacing: t.fonts.displayLetterSpacing,
      textAlign: "center"
    },
    body: {
      fontSize: 14,
      fontFamily: t.fonts.body,
      color: t.colors.textMuted,
      textAlign: "center",
      lineHeight: 20
    },
    ctaButton: {
      paddingHorizontal: t.spacing[5],
      paddingVertical: t.spacing[2],
      borderRadius: t.radii.pill,
      borderWidth: StyleSheet.hairlineWidth,
      marginTop: t.spacing[1]
    },
    ctaText: {
      fontSize: 12,
      fontFamily: t.fonts.label,
      letterSpacing: 1.5
    }
  });
