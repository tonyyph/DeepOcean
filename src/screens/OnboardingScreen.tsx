import { useTranslations } from "@/core/i18n";
import { storage, StorageKeys } from "@/core/storage/mmkv";
import {
  ActionButton,
  GlowText,
  UnderwaterCanvas,
  useTheme,
  useThemedStyles,
  ZoneBackground,
  type AppTheme
} from "@/design-system";
import type { OceanZone } from "@/features/ocean";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

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
            <Text style={styles.depthText}>{item.depth}</Text>
          </View>
          <GlowText
            size={width < 380 ? 40 : 48}
            pulse
            color={t.colors.text}
            style={styles.titleAlign}
          >
            {item.title}
          </GlowText>
          <Text style={[styles.copy, { maxWidth: width * 0.84 }]}>
            {item.body}
          </Text>
          <Text style={[styles.detail, { maxWidth: width * 0.84 }]}>
            {item.detail}
          </Text>
        </Animated.View>
      </View>
    ),
    [styles, t.colors.text, width]
  );

  return (
    <ZoneBackground zone={chapter.zone}>
      <UnderwaterCanvas zone={chapter.zone} particleCount={36} />
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
              <ActionButton
                label={tr.onboarding.holdToBegin}
                icon="water"
                tone="primary"
                size="lg"
                fullWidth
                onLongPress={completeOnboarding}
                onPressIn={handleCtaPressIn}
                onPressOut={handleCtaPressOut}
                delayLongPress={800}
              />
            </Animated.View>
          ) : (
            <View style={styles.navRow}>
              <ActionButton
                label={tr.onboarding.back}
                tone="secondary"
                size="md"
                fullWidth
                disabled={idx === 0}
                onPress={() => goTo(idx - 1)}
                containerStyle={styles.navButton}
              />
              <ActionButton
                label={tr.onboarding.next}
                icon="arrow-forward"
                tone="primary"
                size="md"
                fullWidth
                onPress={() => goTo(idx + 1)}
                containerStyle={styles.navButton}
              />
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
      paddingTop: t.spacing[20] + t.spacing[10],
      paddingBottom: t.spacing[20],
      paddingHorizontal: 0
    },
    titleAlign: { textAlign: "center" },
    slide: {
      justifyContent: "center",
      paddingHorizontal: t.spacing[6]
    },
    body: { alignItems: "center", gap: t.spacing[5] },
    depthPill: {
      borderWidth: 1,
      borderColor: t.colors.glassEdge,
      borderRadius: t.radii.pill,
      backgroundColor: t.colors.glass,
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[1.5]
    },
    depthText: {
      color: t.colors.accent,
      fontSize: 11,
      letterSpacing: 1,
      fontFamily: t.fonts.label
    },
    copy: {
      color: t.colors.textSecondary,
      textAlign: "center",
      fontSize: 17,
      lineHeight: 26,
      fontFamily: t.fonts.body
    },
    detail: {
      color: t.colors.textMuted,
      textAlign: "center",
      fontSize: 14,
      lineHeight: 22,
      fontFamily: t.fonts.body
    },
    footer: { alignItems: "center", gap: t.spacing[6] },
    dots: { flexDirection: "row", gap: 6 },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: t.colors.accent,
      shadowColor: t.colors.accent,
      shadowOpacity: 0.8,
      shadowRadius: 8
    },
    divider: {
      width: 64,
      height: 1,
      backgroundColor: t.colors.accent + "40"
    },
    navRow: {
      width: "88%",
      flexDirection: "row",
      gap: t.spacing[3]
    },
    navButton: {
      flex: 1
    },
    cta: { width: "88%" }
  });
