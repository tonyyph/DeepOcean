import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent
} from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing
} from "react-native-reanimated";
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
  "abyss",
  "midnight",
  "twilight",
  "surface"
];

type OnboardingChapter = {
  title: string;
  body: string;
  detail: string;
  depth: string;
  zone: OceanZone;
};

export default function OnboardingScreen() {
  const router = useRouter();
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { width, height } = useWindowDimensions();
  const [idx, setIdx] = useState(0);
  const longPressProgress = useSharedValue(0);
  const listRef = useRef<FlatList<OnboardingChapter>>(null);
  const tr = useTranslations();

  const chapters = useMemo<OnboardingChapter[]>(
    () =>
      ZONES.map((zone, i) => ({
        ...tr.onboarding.chapters[i]!,
        zone
      })),
    [tr]
  );

  const chapter = chapters[idx]!;
  const isFinal = idx === chapters.length - 1;
  const compact = height < 720;
  const titleSize = compact ? 34 : width < 380 ? 38 : 44;

  const completeOnboarding = useCallback(() => {
    Haptics.selectionAsync();
    storage.set(StorageKeys.onboardingComplete, true);
    router.replace("/(tabs)");
  }, [router]);

  const goTo = useCallback(
    (nextIdx: number) => {
      const boundedIdx = Math.max(0, Math.min(nextIdx, chapters.length - 1));
      if (boundedIdx === idx) return;
      Haptics.selectionAsync();
      setIdx(boundedIdx);
      listRef.current?.scrollToIndex({ index: boundedIdx, animated: true });
    },
    [chapters.length, idx]
  );

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIdx = Math.round(event.nativeEvent.contentOffset.x / width);
      setIdx(Math.max(0, Math.min(nextIdx, chapters.length - 1)));
    },
    [chapters.length, width]
  );

  const handleCtaPressIn = useCallback(() => {
    longPressProgress.value = withTiming(1, {
      duration: 800,
      easing: Easing.bezier(0.16, 1, 0.3, 1)
    });
  }, [longPressProgress]);

  const handleCtaPressOut = useCallback(() => {
    longPressProgress.value = withTiming(0, { duration: 280 });
  }, [longPressProgress]);

  const ctaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + longPressProgress.value * 0.06 }],
    shadowOpacity: 0.4 + longPressProgress.value * 0.5
  }));

  const renderChapter = useCallback(
    ({ item }: { item: OnboardingChapter }) => (
      <View style={[styles.slide, { width }]}>
        <Animated.View
          entering={FadeIn.duration(700)}
          exiting={FadeOut.duration(280)}
          style={styles.body}
        >
          <View style={styles.depthPill}>
            <View style={styles.depthDot} />
            <Text style={styles.depthText}>{item.depth}</Text>
          </View>
          <GlowText
            size={titleSize}
            pulse
            color={t.colors.text}
            style={styles.titleAlign}
          >
            {item.title}
          </GlowText>
          <Text style={styles.copy}>{item.body}</Text>
          <View style={styles.divider} />
          <Text style={styles.detail}>{item.detail}</Text>
        </Animated.View>
      </View>
    ),
    [styles, t.colors.text, titleSize, width]
  );

  return (
    <ZoneBackground zone={chapter.zone}>
      <UnderwaterCanvas zone={chapter.zone} particleCount={36} />
      <BlurView
        pointerEvents="none"
        intensity={10}
        tint="light"
        style={styles.fullScreenGlass}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[
          t.colors.background + "CC",
          t.colors.surfaceElevated + "5C",
          t.colors.background + "E8"
        ]}
        locations={[0, 0.46, 1]}
        style={styles.fullScreenGlass}
      />
      <LinearGradient
        pointerEvents="none"
        colors={["transparent", t.colors.accent + "18", "transparent"]}
        start={{ x: 0, y: 0.2 }}
        end={{ x: 1, y: 0.9 }}
        style={styles.fullScreenGlass}
      />
      <View style={styles.container}>
        <FlatList
          ref={listRef}
          data={chapters}
          renderItem={renderChapter}
          keyExtractor={(item) => item.zone}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumEnd}
          scrollEventThrottle={16}
          getItemLayout={(_, i) => ({
            length: width,
            offset: width * i,
            index: i
          })}
        />

        <View style={styles.footer}>
          <View style={styles.dots}>
            {chapters.map((_, i) => (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={`${tr.onboarding.pageLabel} ${i + 1}`}
                onPress={() => goTo(i)}
                hitSlop={10}
              >
                <View
                  style={[
                    styles.dot,
                    i === idx && {
                      width: 22,
                      backgroundColor: t.colors.accent
                    }
                  ]}
                />
              </Pressable>
            ))}
          </View>
          {isFinal ? (
            <Animated.View style={[styles.cta, ctaStyle]}>
              <PressableCard
                haptic="heavy"
                glow
                onLongPress={completeOnboarding}
                onPressIn={handleCtaPressIn}
                onPressOut={handleCtaPressOut}
                delayLongPress={800}
              >
                <Text style={styles.ctaText}>{tr.onboarding.holdToBegin}</Text>
              </PressableCard>
            </Animated.View>
          ) : (
            <View style={styles.navRow}>
              <Pressable
                accessibilityRole="button"
                disabled={idx === 0}
                onPress={() => goTo(idx - 1)}
                style={[styles.navButton, idx === 0 && styles.navDisabled]}
              >
                <Text style={styles.navText}>{tr.onboarding.back}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => goTo(idx + 1)}
                style={[styles.navButton, styles.navButtonPrimary]}
              >
                <Text style={[styles.navText, styles.navTextPrimary]}>
                  {tr.onboarding.next}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </ZoneBackground>
  );
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "space-between",
      paddingTop: t.spacing[12],
      paddingBottom: t.spacing[8],
      paddingHorizontal: 0
    },
    fullScreenGlass: {
      ...StyleSheet.absoluteFillObject
    },
    titleAlign: { textAlign: "center" },
    slide: {
      justifyContent: "center",
      paddingHorizontal: t.spacing[6] + t.spacing[2]
    },
    body: {
      width: "100%",
      maxWidth: 460,
      alignSelf: "center",
      alignItems: "center",
      gap: t.spacing[4],
      paddingTop: t.spacing[5],
      paddingBottom: t.spacing[3]
    },
    depthPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[2],
      borderWidth: 1,
      borderColor: t.colors.accent + "44",
      borderRadius: t.radii.pill,
      backgroundColor: t.colors.background + "66",
      paddingHorizontal: t.spacing[3.5],
      paddingVertical: t.spacing[1.5]
    },
    depthDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: t.colors.accent,
      shadowColor: t.colors.accent,
      shadowOpacity: 0.8,
      shadowRadius: 8
    },
    depthText: {
      color: t.colors.accent,
      fontSize: 11,
      letterSpacing: 1,
      fontFamily: t.fonts.label
    },
    copy: {
      color: t.colors.text,
      textAlign: "center",
      fontSize: 18,
      lineHeight: 27,
      fontFamily: t.fonts.body,
      textShadowColor: "rgba(0,0,0,0.45)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 12
    },
    divider: {
      width: 64,
      height: 1,
      backgroundColor: t.colors.accent + "40"
    },
    detail: {
      color: t.colors.textSecondary,
      textAlign: "center",
      fontSize: 15,
      lineHeight: 23,
      fontFamily: t.fonts.body,
      textShadowColor: "rgba(0,0,0,0.4)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 10
    },
    footer: {
      alignItems: "center",
      gap: t.spacing[5],
      paddingHorizontal: t.spacing[6]
    },
    dots: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[2]
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: "rgba(255,255,255,0.18)"
    },
    navRow: {
      width: "100%",
      flexDirection: "row",
      gap: t.spacing[3]
    },
    navButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: t.colors.accent + "36",
      borderRadius: t.radii.md,
      backgroundColor: t.colors.background + "78",
      minHeight: 54,
      paddingHorizontal: t.spacing[3]
    },
    navButtonPrimary: {
      borderColor: t.colors.accent,
      backgroundColor: t.colors.accent
    },
    navDisabled: { opacity: 0.35 },
    navText: {
      color: t.colors.textMuted,
      fontSize: 12,
      letterSpacing: 1,
      fontFamily: t.fonts.label
    },
    navTextPrimary: { color: t.colors.background },
    cta: { width: "100%" },
    ctaText: {
      color: t.colors.text,
      textAlign: "center",
      letterSpacing: 1,
      fontSize: 14,
      paddingVertical: t.spacing[1],
      fontFamily: t.fonts.label
    }
  });
