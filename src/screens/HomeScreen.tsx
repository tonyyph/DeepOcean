import { useTranslations } from "@/core/i18n";
import { useScreenTransitionLoading } from "@/core/navigation/screenTransitionLoading";
import { container } from "@/data/container";
import {
  FreeDiveModal,
  GlassCard,
  GlowText,
  OptionPill,
  PressableCard,
  ScreenSafeAreaView,
  ScreenScrollView,
  SectionLabel,
  Skeleton,
  UnderwaterCanvas,
  usePulseGlow,
  useScrollParallax,
  useStaggerEntrance,
  useTheme,
  useThemedStyles,
  ZoneBackground
} from "@/design-system";
import {
  getLevelTitle,
  useDailyRecommendation,
  useDiverProfile,
  useSessions
} from "@/features/diver";
import {
  selectUnreadNotificationCount,
  useNotificationCenter
} from "@/features/notifications";
import { QUICK_DURATIONS, ZONE_TABLE } from "@/features/ocean";
import { minutesToZone } from "@/features/ocean/zones";
import type { OceanZone } from "@/features/ocean/zones";
import { useAchievements, useDiveSession, useSettings } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";
import {
  resolveLastDiveSession,
  shouldShowLastDiveSkeleton
} from "./homeLastDiveResolver";
import {
  DailyCompanionSkeleton,
  LastDiveCard,
  LastDiveSkeleton,
  StatCard,
  StreakMilestoneCard,
  ZoneProgressStrip
} from "./HomeScreen.components";
import { makeStyles } from "./HomeScreen.styles";

type HomeSession = {
  zone: OceanZone;
  elapsedSeconds: number;
  discoveries: unknown[];
};

export default function HomeScreen() {
  const router = useRouter();
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { data: profile, isLoading: profileLoading } = useDiverProfile();
  const { data: dailyRec, isLoading: dailyRecLoading } =
    useDailyRecommendation();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const language = useSettings((s) => s.language);
  const unreadNotifications = useNotificationCenter(
    selectUnreadNotificationCount
  );
  const beginDiveSession = useDiveSession((s) => s.start);

  const preferredMinutes = useSettings((s) => s.preferredSessionMinutes);
  const unlockedZones = useAchievements((s) => s.unlockedZones);
  const tr = useTranslations();
  const [customMinutes, setCustomMinutes] = useState(preferredMinutes);
  const [isFreeDiveModalVisible, setIsFreeDiveModalVisible] = useState(false);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return tr.home.greeting.awake;
    if (h < 12) return tr.home.greeting.morning;
    if (h < 18) return tr.home.greeting.afternoon;
    return tr.home.greeting.evening;
  }, [tr]);

  const levelTitle = profile
    ? getLevelTitle(profile.level, language === "en")
    : null;
  const liveLastSession = (sessions[0] as HomeSession | undefined) ?? null;
  const [fallbackLastSession, setFallbackLastSession] =
    useState<HomeSession | null>(null);

  useEffect(() => {
    if (liveLastSession != null) {
      const fallbackTimer = setTimeout(
        () => setFallbackLastSession(liveLastSession),
        0
      );
      return () => clearTimeout(fallbackTimer);
    }
  }, [liveLastSession]);

  useEffect(() => {
    if (sessionsLoading || liveLastSession != null) return;
    let active = true;

    // Fallback read protects Home from transient empty-query states.
    void container.sessions
      .list()
      .then((items) => {
        if (!active) return;
        const item = (items[0] as HomeSession | undefined) ?? null;
        if (item != null) {
          setFallbackLastSession(item);
        }
      })
      .catch(() => {
        // Ignore: keep existing cached fallback/ref value if any.
      });

    return () => {
      active = false;
    };
  }, [sessionsLoading, liveLastSession]);

  const lastSession = resolveLastDiveSession(
    liveLastSession,
    fallbackLastSession,
    null
  );
  const showLastDiveSkeleton = shouldShowLastDiveSkeleton(
    sessionsLoading,
    lastSession
  );
  const showHeaderSkeleton = profileLoading;
  useScreenTransitionLoading(
    showHeaderSkeleton || showLastDiveSkeleton || dailyRecLoading,
    "home"
  );

  const startDive = useCallback(
    (minutes: number | null) => {
      beginDiveSession(minutes);
      router.push({
        pathname: "/dive",
        params: minutes ? { minutes: String(minutes) } : {}
      });
    },
    [beginDiveSession, router]
  );

  const preferredZoneLabel = useMemo(
    () => ZONE_TABLE[minutesToZone(preferredMinutes)].label,
    [preferredMinutes]
  );

  const openFreeDiveModal = useCallback(
    () => setIsFreeDiveModalVisible(true),
    []
  );

  const openNotifications = useCallback(() => {
    router.push("/notifications");
  }, [router]);

  const closeFreeDiveModal = useCallback(
    () => setIsFreeDiveModalVisible(false),
    []
  );

  const handleStartPreferredDive = useCallback(
    () => startDive(preferredMinutes),
    [startDive, preferredMinutes]
  );

  const handleStartUnlimitedDive = useCallback(
    () => startDive(null),
    [startDive]
  );

  const handleStartCustomDive = useCallback(() => {
    setIsFreeDiveModalVisible(false);
    startDive(customMinutes);
  }, [startDive, customMinutes]);

  const streakDays = profile?.currentStreakDays ?? 0;
  const nextStreakTarget = useMemo(
    () => getNextStreakMilestone(streakDays),
    [streakDays]
  );

  // ── Animation setup ──────────────────────────────────────────────────────
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    "worklet";
    scrollY.value = event.contentOffset.y;
  });

  // 7 stagger slots: header, statsRow, streakCard, lastDive, companion, plan, zones
  const stagger = useStaggerEntrance(7, { staggerMs: 55 });

  const staggerStyle0 = useAnimatedStyle(() => ({
    opacity: stagger[0]!.value,
    transform: [{ translateY: (1 - stagger[0]!.value) * 18 }],
  }));
  const staggerStyle1 = useAnimatedStyle(() => ({
    opacity: stagger[1]!.value,
    transform: [{ translateY: (1 - stagger[1]!.value) * 18 }],
  }));
  const staggerStyle2 = useAnimatedStyle(() => ({
    opacity: stagger[2]!.value,
    transform: [{ translateY: (1 - stagger[2]!.value) * 18 }],
  }));
  const staggerStyle3 = useAnimatedStyle(() => ({
    opacity: stagger[3]!.value,
    transform: [{ translateY: (1 - stagger[3]!.value) * 18 }],
  }));
  const staggerStyle4 = useAnimatedStyle(() => ({
    opacity: stagger[4]!.value,
    transform: [{ translateY: (1 - stagger[4]!.value) * 18 }],
  }));
  const staggerStyle5 = useAnimatedStyle(() => ({
    opacity: stagger[5]!.value,
    transform: [{ translateY: (1 - stagger[5]!.value) * 18 }],
  }));
  const staggerStyle6 = useAnimatedStyle(() => ({
    opacity: stagger[6]!.value,
    transform: [{ translateY: (1 - stagger[6]!.value) * 18 }],
  }));

  const parallaxStyle = useScrollParallax(scrollY, 0.3);
  const ctaGlowStyle = usePulseGlow({ minOpacity: 0.18, maxOpacity: 0.55, duration: 1800 });

  return (
    <ZoneBackground zone="midnight">
      <Animated.View style={[StyleSheet.absoluteFill, parallaxStyle]} pointerEvents="none">
        <UnderwaterCanvas zone="midnight" />
      </Animated.View>
      <ScreenSafeAreaView style={styles.flex}>
        <ScreenScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
          {/* ── Header ── */}
          <Animated.View style={staggerStyle0}>
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={tr.notifications.center.openAccessibility}
                hitSlop={10}
                onPress={openNotifications}
                style={({ pressed }) => [
                  styles.bellButton,
                  pressed && styles.bellButtonPressed
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={t.colors.text}
                />
                {unreadNotifications > 0 ? (
                  <View style={styles.bellBadge} />
                ) : null}
              </Pressable>
            </View>
            <View style={styles.row}>
              {showHeaderSkeleton ? (
                <Skeleton style={styles.nameSkeleton} radius={t.radii.s} />
              ) : (
                <GlowText size={36} pulse style={styles.base}>
                  {profile?.name ?? tr.home.diver}
                </GlowText>
              )}
              {!showHeaderSkeleton && levelTitle && (
                <View style={styles.rankRow}>
                  <Ionicons name="star" size={11} color={t.colors.accent} />
                  <Text style={styles.rankLabel}>{levelTitle}</Text>
                </View>
              )}
            </View>
            {showHeaderSkeleton ? (
              <Skeleton style={styles.subSkeleton} />
            ) : (
              <Text style={styles.sub}>{tr.home.ready}</Text>
            )}
          </View>
          </Animated.View>

          {/* ── Last Dive Recap ── */}
          <Animated.View style={staggerStyle3}>
          {showLastDiveSkeleton ? <LastDiveSkeleton /> : null}
          {!showLastDiveSkeleton && lastSession ? (
            <LastDiveCard session={lastSession} tr={tr} />
          ) : null}
          </Animated.View>

          {/* ── Hero dive CTA ── */}
          <Animated.View
            style={[
              ctaGlowStyle,
              {
                borderRadius: t.radii.md,
                shadowColor: t.colors.accent,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 0 },
              },
            ]}
          >
          <PressableCard
            glow
            haptic="light"
            onPress={handleStartPreferredDive}
            containerStyle={styles.heroCard}
            radius={t.radii.md}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroLabel}>{tr.home.beginDive}</Text>
              <Text style={styles.heroDuration}>{preferredMinutes}</Text>
              <Text style={styles.heroDurationSub}>{tr.home.min}</Text>
              <Text style={styles.heroHint}>
                {tr.home.estimatedReach} · {preferredZoneLabel}
              </Text>
            </View>
            <View style={styles.quickRow}>
              {QUICK_DURATIONS.map((m) => (
                <OptionPill
                  key={m}
                  label={`${m}${tr.home.minShort}`}
                  onPress={() => startDive(m)}
                  containerStyle={styles.quickItem}
                />
              ))}
              <OptionPill
                key={"custom"}
                icon="infinite"
                onLongPress={openFreeDiveModal}
                onPress={handleStartUnlimitedDive}
                containerStyle={styles.quickItem}
              />
            </View>
          </PressableCard>
          </Animated.View>

          {/* ── Zone Progress ── */}
          <Animated.View style={staggerStyle6}>
          <GlassCard radius={t.radii.md}>
            <SectionLabel>{tr.home.zoneProgressTitle}</SectionLabel>
            <ZoneProgressStrip unlockedZones={unlockedZones} />
          </GlassCard>
          </Animated.View>

          {/* ── Daily companion ── */}
          <Animated.View style={staggerStyle4}>
          {dailyRecLoading ? (
            <DailyCompanionSkeleton />
          ) : (
            dailyRec && (
              <GlassCard radius={t.radii.md}>
                <SectionLabel>{tr.home.guideTitle}</SectionLabel>
                <Text style={styles.companionBody}>{dailyRec}</Text>
              </GlassCard>
            )
          )}
          </Animated.View>

          {/* ── Stats ── */}
          <Animated.View style={staggerStyle1}>
          <View style={styles.statsRow}>
            <StatCard
              icon="flame"
              label={tr.home.streak}
              value={`${profile?.currentStreakDays ?? 0}`}
              unit="d"
            />
            <StatCard
              icon="water"
              label={tr.home.dives}
              value={`${profile?.totalDives ?? 0}`}
            />
            <StatCard
              icon="trophy"
              label={tr.home.level}
              value={`${profile?.level ?? 1}`}
            />
          </View>
          </Animated.View>

          {streakDays > 0 && (
            <Animated.View style={staggerStyle2}>
            <StreakMilestoneCard
              days={streakDays}
              nextTarget={nextStreakTarget}
              onPress={handleStartPreferredDive}
              tr={tr}
            />
            </Animated.View>
          )}
        </ScreenScrollView>

        <FreeDiveModal
          visible={isFreeDiveModalVisible}
          minutes={customMinutes}
          zoneLabel={ZONE_TABLE[minutesToZone(customMinutes)].label}
          title={tr.home.freeDive}
          description={tr.home.freeDiveDesc}
          minutesLabel={tr.home.min}
          estimatedReachLabel={tr.home.estimatedReach}
          startLabel={tr.home.startFreeDive}
          onDismiss={closeFreeDiveModal}
          onMinutesChange={setCustomMinutes}
          onStart={handleStartCustomDive}
        />
      </ScreenSafeAreaView>
    </ZoneBackground>
  );
}
function getNextStreakMilestone(days: number): number | null {
  const milestones = [3, 7, 14, 21, 30, 45, 60, 90];
  return milestones.find((m) => m > days) ?? null;
}
