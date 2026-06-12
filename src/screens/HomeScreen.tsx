import { useTranslations } from "@/core/i18n";
import { container } from "@/data/container";
import {
  FreeDiveModal,
  GlassCard,
  GlowText,
  OptionPill,
  PressableCard,
  SectionLabel,
  Skeleton,
  UnderwaterCanvas,
  useTheme,
  useThemedStyles,
  ZoneBackground
} from "@/design-system";
import type { AppSettings } from "@/domain/entities";
import {
  getLevelTitle,
  useDailyRecommendation,
  useDiverProfile,
  useSessions
} from "@/features/diver";
import { QUICK_DURATIONS, ZONE_TABLE } from "@/features/ocean";
import type { OceanZone } from "@/features/ocean/zones";
import { useAchievements, useSettings } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { ScrollView, Text, View } from "react-native";
import { makeStyles } from "./HomeScreen.styles";
import {
  DailyCompanionSkeleton,
  LastDiveCard,
  LastDiveSkeleton,
  NoLastDiveCard,
  StatCard,
  StreakMilestoneCard,
  ZoneProgressStrip
} from "./HomeScreen.components";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  resolveLastDiveSession,
  shouldShowLastDiveSkeleton
} from "./homeLastDiveResolver";

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

  const preferredMinutes = useSettings(
    (
      s: AppSettings & {
        update: (patch: Partial<AppSettings>) => void;
        reset: () => void;
      }
    ) => s.preferredSessionMinutes
  );
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
  const lastSessionRef = useRef<HomeSession | null>(null);

  useEffect(() => {
    if (liveLastSession != null) {
      lastSessionRef.current = liveLastSession;
      setFallbackLastSession(liveLastSession);
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
          lastSessionRef.current = item;
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
    lastSessionRef.current
  );
  const showLastDiveSkeleton = shouldShowLastDiveSkeleton(
    sessionsLoading,
    lastSession
  );
  const showHeaderSkeleton = profileLoading;

  const startDive = useCallback(
    (minutes: number | null) => {
      router.push({
        pathname: "/dive",
        params: minutes ? { minutes: String(minutes) } : {}
      });
    },
    [router]
  );

  const preferredZoneLabel = useMemo(
    () => ZONE_TABLE[zoneForMinutes(preferredMinutes)].label,
    [preferredMinutes]
  );

  const openFreeDiveModal = useCallback(
    () => setIsFreeDiveModalVisible(true),
    []
  );

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

  return (
    <ZoneBackground zone="midnight">
      <UnderwaterCanvas zone="midnight" />
      <SafeAreaView style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={styles.greeting}>{greeting}</Text>
            <View style={styles.row}>
              {showHeaderSkeleton ? (
                <Skeleton style={styles.nameSkeleton} radius={t.radii.s} />
              ) : (
                <GlowText size={36} pulse>
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

          {/* ── Last Dive Recap ── */}
          {showLastDiveSkeleton ? <LastDiveSkeleton /> : null}
          {!showLastDiveSkeleton && lastSession ? (
            <LastDiveCard session={lastSession} tr={tr} />
          ) : null}

          {/* ── Hero dive CTA ── */}
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

          {/* ── Zone Progress ── */}
          <GlassCard radius={t.radii.md}>
            <SectionLabel>{tr.home.zoneProgressTitle}</SectionLabel>
            <ZoneProgressStrip unlockedZones={unlockedZones} />
          </GlassCard>

          {/* ── Daily companion ── */}
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

          {/* ── Stats ── */}
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

          {streakDays > 0 && (
            <StreakMilestoneCard
              days={streakDays}
              nextTarget={nextStreakTarget}
              onPress={handleStartPreferredDive}
              tr={tr}
            />
          )}
        </ScrollView>

        <FreeDiveModal
          visible={isFreeDiveModalVisible}
          minutes={customMinutes}
          zoneLabel={ZONE_TABLE[zoneForMinutes(customMinutes)].label}
          title={tr.home.freeDive}
          description={tr.home.freeDiveDesc}
          minutesLabel={tr.home.min}
          estimatedReachLabel={tr.home.estimatedReach}
          startLabel={tr.home.startFreeDive}
          onDismiss={closeFreeDiveModal}
          onMinutesChange={setCustomMinutes}
          onStart={handleStartCustomDive}
        />
      </SafeAreaView>
    </ZoneBackground>
  );
}
function zoneForMinutes(m: number): OceanZone {
  if (m < 15) return "surface";
  if (m < 30) return "twilight";
  if (m < 50) return "midnight";
  if (m < 75) return "abyss";
  return "trench";
}

function getNextStreakMilestone(days: number): number | null {
  const milestones = [3, 7, 14, 21, 30, 45, 60, 90];
  return milestones.find((m) => m > days) ?? null;
}
