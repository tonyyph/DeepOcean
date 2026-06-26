import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated as RNAnimated,
  Pressable,
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
import { ModalFrame } from "./ModalFrame";
import { useTranslations } from "@/core/i18n";
import { useSettings } from "@/stores";
import type { ChestRarity, ChestReward } from "@/domain/entities";
import { ParticleBurst } from "@/design-system";

const AUTO_DISMISS_MS = 7000;

const CHEST_COLORS: Record<ChestRarity, [string, string]> = {
  driftwood: ["#8B7355", "#6B5B45"],
  bronze: ["#CD7F32", "#A05C1A"],
  silver: ["#C0C0C0", "#888888"],
  gold: ["#FFD27A", "#FF9F43"],
  void: ["#9333EA", "#4C1D95"]
};

const CHEST_GLOW: Record<ChestRarity, string> = {
  driftwood: "#8B7355",
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD27A",
  void: "#9333EA"
};

const CHEST_ICON: Record<ChestRarity, string> = {
  driftwood: "📦",
  bronze: "🗃️",
  silver: "🪣",
  gold: "🏆",
  void: "🌑"
};

type Props = {
  visible: boolean;
  reward: ChestReward | null;
  onDismiss: () => void;
};

export const MysteryChestModal = React.memo(function MysteryChestModal({
  visible,
  reward,
  onDismiss
}: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const hapticsEnabled = useSettings((s) => s.hapticsEnabled);

  const { width, height } = useWindowDimensions();

  const progress = useSharedValue(0);
  const chestScale = useSharedValue(0.5);
  const chestRotation = useSharedValue(0);
  const opened = useSharedValue(0);
  const countdown = useRef(new RNAnimated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOpened, setIsOpened] = React.useState(false);
  const [showBurst, setShowBurst] = useState(false);

  const rarity = reward?.rarity ?? "driftwood";
  const glowColor = CHEST_GLOW[rarity];
  const [gradStart, gradEnd] = CHEST_COLORS[rarity];

  const rarityLabel =
    rarity === "driftwood"
      ? tr.chest.rarityDriftwood
      : rarity === "bronze"
      ? tr.chest.rarityBronze
      : rarity === "silver"
      ? tr.chest.raritySilver
      : rarity === "gold"
      ? tr.chest.rarityGold
      : tr.chest.rarityVoid;

  useEffect(() => {
    if (visible) {
      setIsOpened(false);
      progress.value = withTiming(1, {
        duration: reducedMotion ? 0 : 280,
        easing: Easing.bezier(0.16, 1, 0.3, 1)
      });
      chestScale.value = reducedMotion
        ? 1
        : withSpring(1, { damping: 14, stiffness: 180 });
      opened.value = 0;
      countdown.setValue(1);
    } else {
      progress.value = withTiming(0, { duration: 200 });
      chestScale.value = 0.5;
      chestRotation.value = 0;
      opened.value = 0;
      setShowBurst(false);
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
    };
  }, [visible, progress, chestScale, chestRotation, opened, countdown, reducedMotion]);

  const handleOpen = () => {
    if (isOpened) {
      onDismiss();
      return;
    }
    setIsOpened(true);
    if (hapticsEnabled) {
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      ).catch(() => {});
    }

    if (!reducedMotion) {
      // Step 1: shake
      chestRotation.value = withSequence(
        withTiming(-10, { duration: 60 }),
        withTiming(10, { duration: 80 }),
        withTiming(-7, { duration: 60 }),
        withTiming(7, { duration: 60 }),
        withTiming(0, { duration: 80 })
      );
      // Step 2: scale expand
      chestScale.value = withSequence(
        withSpring(1.35, { damping: 10, stiffness: 220 }),
        withSpring(1.0, { damping: 16, stiffness: 200 })
      );
    }

    // Step 3: after 220ms, burst + reveal
    burstTimerRef.current = setTimeout(() => {
      setShowBurst(true);
      opened.value = withTiming(1, {
        duration: reducedMotion ? 0 : 400,
        easing: Easing.bezier(0.16, 1, 0.3, 1)
      });
      timerRef.current = setTimeout(() => onDismiss(), AUTO_DISMISS_MS);
      RNAnimated.timing(countdown, {
        toValue: 0,
        duration: AUTO_DISMISS_MS,
        useNativeDriver: false
      }).start();
    }, reducedMotion ? 0 : 220);
  };

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: 0.88 + progress.value * 0.12 },
      { translateY: (1 - progress.value) * 24 }
    ]
  }));

  const chestStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: chestScale.value },
      { rotate: `${chestRotation.value}deg` }
    ]
  }));

  const rewardsStyle = useAnimatedStyle(() => ({
    opacity: opened.value,
    transform: [{ translateY: (1 - opened.value) * 12 }]
  }));

  const tapHintStyle = useAnimatedStyle(() => ({
    opacity: 1 - opened.value
  }));

  return (
    <>
    <ModalFrame
      visible={visible}
      onDismiss={onDismiss}
      progress={progress}
      cardAnimatedStyle={cardStyle}
      cardStyle={styles.card}
      accentColor={glowColor}
      dismissOnBackdropPress={isOpened}
    >
      <LinearGradient
        colors={[`${gradStart}18`, `${gradEnd}06`]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.cardGlow}
      />

      <View style={styles.badgeRow}>
        <View style={[styles.badge, { borderColor: glowColor }]}>
          <Text style={[styles.badgeText, { color: glowColor }]}>
            {rarityLabel}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={handleOpen}
        style={styles.chestPressArea}
        accessibilityRole="button"
        accessibilityLabel={isOpened ? tr.chest.continueLabel : tr.chest.tapToOpen}
      >
        <Animated.View style={[styles.chestWrap, chestStyle]}>
          <LinearGradient
            colors={[gradStart, gradEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.chestCircle}
          >
            <Text style={styles.chestEmoji}>{CHEST_ICON[rarity]}</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={tapHintStyle}>
          <Text style={styles.tapHint}>
            {tr.chest.tapToOpen}
          </Text>
        </Animated.View>
      </Pressable>

      <Animated.View style={[styles.rewardsBlock, rewardsStyle]}>
        {reward && (
          <>
            <GlowText size={20} style={[styles.xpText, { color: glowColor }]}>
              {tr.chest.xpReward(reward.xp)}
            </GlowText>

            {reward.featuredDiscovery ? (
              <View style={styles.discoveryRow}>
                <Ionicons
                  name="sparkles"
                  size={13}
                  color={glowColor}
                />
                <Text style={styles.discoveryText}>
                  <Text style={[styles.discoveryLabel, { color: glowColor }]}>
                    {tr.chest.discoveryHighlight}{" "}
                  </Text>
                  {reward.featuredDiscovery.name}
                </Text>
              </View>
            ) : (
              <Text style={styles.noDiscovery}>{tr.chest.noDiscovery}</Text>
            )}

            {reward.isDepthRecord && (
              <View style={styles.depthRecordRow}>
                <Ionicons name="arrow-down-circle" size={13} color={glowColor} />
                <Text style={[styles.depthRecordText, { color: glowColor }]}>
                  {tr.chest.depthRecord}
                </Text>
              </View>
            )}
          </>
        )}

        <View style={styles.countdownTrack}>
          <RNAnimated.View
            style={[
              styles.countdownBar,
              {
                backgroundColor: glowColor,
                width: countdown.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"]
                })
              }
            ]}
          />
        </View>
        <Text style={styles.hint}>{tr.chest.continueLabel}</Text>
      </Animated.View>
    </ModalFrame>
    {showBurst && (
      <ParticleBurst
        x={width / 2}
        y={height * 0.42}
        color={glowColor}
        onDone={() => setShowBurst(false)}
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
      overflow: "hidden"
    },
    cardGlow: {
      ...StyleSheet.absoluteFill,
      borderRadius: t.radii.xl
    },
    badgeRow: {
      flexDirection: "row",
      justifyContent: "center"
    },
    badge: {
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
    chestPressArea: {
      alignItems: "center",
      gap: t.spacing[3],
      paddingVertical: t.spacing[2]
    },
    chestWrap: {
      alignItems: "center",
      justifyContent: "center"
    },
    chestCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: "center",
      justifyContent: "center"
    },
    chestEmoji: {
      fontSize: 44
    },
    tapHint: {
      fontSize: 11,
      fontFamily: t.fonts.label,
      letterSpacing: 1.5,
      color: t.colors.textMuted
    },
    rewardsBlock: {
      alignItems: "center",
      gap: t.spacing[2],
      width: "100%"
    },
    xpText: {
      fontFamily: t.fonts.display,
      letterSpacing: t.fonts.displayLetterSpacing,
      textAlign: "center"
    },
    discoveryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[1.5]
    },
    discoveryText: {
      fontSize: 13,
      fontFamily: t.fonts.body,
      color: t.colors.text
    },
    discoveryLabel: {
      fontSize: 10,
      fontFamily: t.fonts.label,
      letterSpacing: 1
    },
    noDiscovery: {
      fontSize: 12,
      fontFamily: t.fonts.body,
      color: t.colors.textMuted,
      textAlign: "center",
      fontStyle: "italic"
    },
    depthRecordRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[1.5]
    },
    depthRecordText: {
      fontSize: 11,
      fontFamily: t.fonts.label,
      letterSpacing: 1
    },
    countdownTrack: {
      width: "100%",
      height: 2,
      backgroundColor: t.colors.glass,
      borderRadius: 1,
      overflow: "hidden",
      marginTop: t.spacing[2]
    },
    countdownBar: {
      height: "100%",
      borderRadius: 1
    },
    hint: {
      color: t.colors.textFaint,
      fontSize: 11,
      fontFamily: t.fonts.label,
      letterSpacing: 0.6
    }
  });
