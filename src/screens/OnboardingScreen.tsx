import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { storage, StorageKeys } from "@/core/storage/mmkv";
import {
  ZoneBackground,
  UnderwaterCanvas,
  GlowText,
  PressableCard,
  useTheme,
  useThemedStyles,
  type AppTheme
} from "@/design-system";
import type { OceanZone } from "@/features/ocean";
import { useTranslations } from "@/core/i18n";

const ZONES: readonly OceanZone[] = [
  "surface",
  "twilight",
  "midnight",
  "abyss"
];

export default function OnboardingScreen() {
  const router = useRouter();
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { width } = useWindowDimensions();
  const [idx, setIdx] = useState(0);
  const longPressProgress = useSharedValue(0);
  const advanceLock = useRef(false);
  const tr = useTranslations();

  const chapters = useMemo(
    () => ZONES.map((zone, i) => ({ ...tr.onboarding.chapters[i]!, zone })),
    [tr]
  );

  const chapter = chapters[idx]!;
  const isFinal = idx === chapters.length - 1;

  const advance = useCallback(() => {
    if (advanceLock.current) return;
    advanceLock.current = true;
    Haptics.selectionAsync();
    if (isFinal) {
      storage.set(StorageKeys.onboardingComplete, true);
      router.replace("/(tabs)");
    } else {
      setIdx((i) => i + 1);
      setTimeout(() => (advanceLock.current = false), 400);
    }
  }, [isFinal, router]);

  const tap = Gesture.Tap().onEnd(() => {
    "worklet";
    if (!isFinal) {
      runOnJS(advance)();
    }
  });

  const longPress = Gesture.LongPress()
    .minDuration(800)
    .onBegin(() => {
      "worklet";
      longPressProgress.value = withTiming(1, {
        duration: 800,
        easing: Easing.bezier(0.16, 1, 0.3, 1)
      });
    })
    .onEnd(() => {
      "worklet";
      runOnJS(advance)();
    })
    .onFinalize((_, success) => {
      "worklet";
      if (!success) longPressProgress.value = withTiming(0, { duration: 280 });
    });

  const ctaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + longPressProgress.value * 0.06 }],
    shadowOpacity: 0.4 + longPressProgress.value * 0.5
  }));

  return (
    <ZoneBackground zone={chapter.zone}>
      <UnderwaterCanvas zone={chapter.zone} particleCount={36} />
      <GestureDetector gesture={isFinal ? longPress : tap}>
        <View style={styles.container}>
          <Animated.View
            key={idx}
            entering={FadeIn.duration(900)}
            exiting={FadeOut.duration(360)}
            style={styles.body}
          >
            <GlowText
              size={48}
              pulse
              color={t.colors.text}
              style={styles.titleAlign}
            >
              {chapter.title}
            </GlowText>
            <Text style={[styles.copy, { maxWidth: width * 0.82 }]}>
              {chapter.body}
            </Text>
          </Animated.View>

          <View style={styles.footer}>
            <View style={styles.dots}>
              {chapters.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === idx && {
                      width: 22,
                      backgroundColor: t.colors.accent
                    }
                  ]}
                />
              ))}
            </View>
            {isFinal ? (
              <Animated.View style={[styles.cta, ctaStyle]}>
                <PressableCard
                  haptic="heavy"
                  glow
                  onLongPress={advance}
                  delayLongPress={450}
                >
                  <Text style={styles.ctaText}>
                    {tr.onboarding.holdToBegin}
                  </Text>
                </PressableCard>
              </Animated.View>
            ) : (
              <Text style={styles.hint}>{tr.onboarding.tapToContinue}</Text>
            )}
          </View>
        </View>
      </GestureDetector>
    </ZoneBackground>
  );
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "space-between",
      paddingTop: t.spacing[20] + t.spacing[10],
      paddingBottom: t.spacing[20],
      paddingHorizontal: t.spacing[6]
    },
    titleAlign: { textAlign: "center" },
    body: { alignItems: "center", gap: t.spacing[6] },
    copy: {
      color: t.colors.textSecondary,
      textAlign: "center",
      fontSize: 17,
      lineHeight: 26,
      fontFamily: t.fonts.body
    },
    footer: { alignItems: "center", gap: t.spacing[6] },
    dots: { flexDirection: "row", gap: 6 },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "rgba(255,255,255,0.18)"
    },
    hint: {
      color: t.colors.textMuted,
      fontSize: 12,
      letterSpacing: 1,
      fontFamily: t.fonts.label
    },
    cta: { width: "88%" },
    ctaText: {
      color: t.colors.text,
      textAlign: "center",
      letterSpacing: 1,
      fontSize: 13,
      paddingVertical: 4,
      fontFamily: t.fonts.label
    }
  });
