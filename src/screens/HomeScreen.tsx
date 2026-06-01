import { useTranslations } from "@/core/i18n";
import {
  GlassCard,
  GlowText,
  OptionPill,
  PressableCard,
  SectionLabel,
  UnderwaterCanvas,
  useTheme,
  useThemedStyles,
  ZoneBackground,
  type AppTheme
} from "@/design-system";
import type { AppSettings } from "@/domain/entities";
import {
  getLevelTitle,
  useDailyRecommendation,
  useDiverProfile,
  useSessions
} from "@/features/diver";
import {
  OCEAN_ZONES,
  QUICK_DURATIONS,
  ZONE_COLORS,
  ZONE_ICONS,
  ZONE_TABLE
} from "@/features/ocean";
import type { OceanZone } from "@/features/ocean/zones";
import { useAchievements, useSettings } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { data: profile } = useDiverProfile();
  const { data: dailyRec } = useDailyRecommendation();
  const { data: sessions = [] } = useSessions();
  const settings = useSettings();

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

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return tr.home.greeting.awake;
    if (h < 12) return tr.home.greeting.morning;
    if (h < 18) return tr.home.greeting.afternoon;
    return tr.home.greeting.evening;
  }, [tr]);

  const levelTitle = profile
    ? getLevelTitle(profile.level, settings.language === "en")
    : null;
  const lastSession = sessions[0] ?? null;

  const startDive = (minutes: number | null) => {
    router.push({
      pathname: "/dive",
      params: minutes ? { minutes: String(minutes) } : {}
    });
  };

  return (
    <ZoneBackground zone="surface">
      <UnderwaterCanvas zone="surface" />
      <SafeAreaView style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={styles.greeting}>{greeting}</Text>
            <View style={styles.row}>
              <GlowText size={36} pulse>
                {profile?.name ?? tr.home.diver}
              </GlowText>
              {levelTitle && (
                <View style={styles.rankRow}>
                  <Ionicons name="star" size={11} color={t.colors.accent} />
                  <Text style={styles.rankLabel}>{levelTitle}</Text>
                </View>
              )}
            </View>
            <Text style={styles.sub}>{tr.home.ready}</Text>
          </View>

          {/* ── Last Dive Recap ── */}
          {lastSession ? <LastDiveCard session={lastSession} tr={tr} /> : null}

          {/* ── Hero dive CTA ── */}
          <PressableCard
            glow
            haptic="light"
            onPress={() => startDive(preferredMinutes)}
            containerStyle={styles.heroCard}
            radius={t.radii.md}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroLabel}>{tr.home.beginDive}</Text>
              <Text style={styles.heroDuration}>{preferredMinutes}</Text>
              <Text style={styles.heroDurationSub}>{tr.home.min}</Text>
              <Text style={styles.heroHint}>
                {tr.home.estimatedReach} ·{" "}
                {ZONE_TABLE[zoneForMinutes(preferredMinutes)].label}
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
            </View>
          </PressableCard>

          {/* ── Free dive ── */}
          <PressableCard
            haptic="light"
            onPress={() => startDive(null)}
            radius={t.radii.md}
          >
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{tr.home.freeDive}</Text>
                <Text style={styles.cardBody}>{tr.home.freeDiveDesc}</Text>
              </View>
              <Ionicons name="infinite" size={24} color={t.colors.accentSoft} />
            </View>
          </PressableCard>

          {/* ── Zone Progress ── */}
          <GlassCard radius={t.radii.md}>
            <SectionLabel>{tr.home.zoneProgressTitle}</SectionLabel>
            <ZoneProgressStrip unlockedZones={unlockedZones} />
          </GlassCard>

          {/* ── Daily companion ── */}
          {dailyRec ? (
            <GlassCard radius={t.radii.md}>
              <SectionLabel>{tr.home.guideTitle}</SectionLabel>
              <Text style={styles.companionBody}>{dailyRec}</Text>
            </GlassCard>
          ) : null}

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
        </ScrollView>
      </SafeAreaView>
    </ZoneBackground>
  );
}

// ─── Last Dive Card ───────────────────────────────────────────────────────────

function LastDiveCard({
  session,
  tr
}: {
  session: { zone: OceanZone; elapsedSeconds: number; discoveries: unknown[] };
  tr: ReturnType<typeof useTranslations>;
}) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const minutes = Math.round(session.elapsedSeconds / 60);
  const zone = session.zone;
  // XP estimate: same formula as diveSessionStore (10 * minutes, min 10)
  const xp = Math.max(10, minutes * 10);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 340 }}
    >
      <GlassCard radius={t.radii.md} padding={t.spacing[4]}>
        <SectionLabel>{tr.home.lastDiveTitle}</SectionLabel>
        <View style={styles.lastDiveRow}>
          {/* Zone badge */}
          <View style={[styles.lastDiveZoneBadge]}>
            <Ionicons
              name={ZONE_ICONS[zone]}
              size={20}
              color={t.colors.accent}
            />
          </View>

          <View style={styles.flex}>
            <Text
              style={[styles.lastDiveZoneLabel, { color: t.colors.accent }]}
            >
              {ZONE_TABLE[zone].label.toUpperCase()}
            </Text>
            <Text style={styles.lastDiveDuration}>
              {tr.home.lastDiveMinutes(minutes)}
            </Text>
          </View>

          <View style={styles.lastDiveXpBadge}>
            <Text style={styles.lastDiveXpText}>{tr.home.lastDiveXp(xp)}</Text>
          </View>
        </View>
      </GlassCard>
    </MotiView>
  );
}

// ─── Zone Progress Strip ──────────────────────────────────────────────────────

function ZoneProgressStrip({ unlockedZones }: { unlockedZones: OceanZone[] }) {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.zoneStrip}>
      {OCEAN_ZONES.map((zone, idx) => {
        const isUnlocked = unlockedZones.includes(zone);
        const isDeepest =
          isUnlocked &&
          !unlockedZones.includes(OCEAN_ZONES[idx + 1] as OceanZone);
        const [c1, c2] = ZONE_COLORS[zone];

        return (
          <ZoneChip
            key={zone}
            zone={zone}
            isUnlocked={isUnlocked}
            isDeepest={isDeepest}
            colors={[c1, c2]}
          />
        );
      })}
    </View>
  );
}

function ZoneChip({
  zone,
  isUnlocked,
  isDeepest,
  colors
}: {
  zone: OceanZone;
  isUnlocked: boolean;
  isDeepest: boolean;
  colors: [string, string];
}) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const scale = useSharedValue(isDeepest ? 1 : 0.96);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={[styles.zoneChip, animStyle]}>
      {isUnlocked && (
        <LinearGradient
          colors={[colors[0] + (isDeepest ? "55" : "30"), colors[1] + "18"]}
          style={[StyleSheet.absoluteFill, { borderRadius: t.radii.sm }]}
        />
      )}
      <Ionicons
        name={ZONE_ICONS[zone]}
        size={16}
        color={isUnlocked ? colors[0] : t.colors.textFaint}
      />
      <Text
        style={[
          styles.zoneChipLabel,
          {
            color: isUnlocked
              ? isDeepest
                ? colors[0]
                : t.colors.textSecondary
              : t.colors.textFaint
          }
        ]}
        numberOfLines={1}
      >
        {ZONE_TABLE[zone].label.split(" ")[0]}
      </Text>
      {isDeepest ? (
        <View style={[styles.zoneDeepestDot, { backgroundColor: colors[0] }]} />
      ) : null}
    </Animated.View>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  unit
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  unit?: string;
}) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <GlassCard radius={t.radii.md} style={styles.flex} padding={t.spacing[4]}>
      <Ionicons name={icon} size={14} color={t.colors.accentSoft} />
      <View style={styles.statValueRow}>
        <Text style={styles.statValue}>{value}</Text>
        {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
      </View>
      <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
    </GlassCard>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function zoneForMinutes(m: number): OceanZone {
  if (m < 15) return "surface";
  if (m < 30) return "twilight";
  if (m < 50) return "midnight";
  if (m < 75) return "abyss";
  return "trench";
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    scroll: {
      padding: t.spacing[5],
      paddingBottom: t.spacing[24],
      gap: t.spacing[4]
    },
    header: { paddingVertical: t.spacing[3], gap: t.spacing[1] },
    greeting: {
      color: t.colors.textMuted,
      fontSize: 13,
      letterSpacing: 1,
      fontFamily: t.fonts.label
    },
    rankRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[1],
      marginTop: t.spacing[1]
    },
    rankLabel: {
      color: t.colors.accent,
      fontSize: 12,
      fontFamily: t.fonts.label,
      letterSpacing: 0.6
    },
    sub: {
      color: t.colors.textSecondary,
      marginTop: t.spacing[1],
      fontSize: 14,
      fontFamily: t.fonts.body
    },
    heroCard: { marginTop: t.spacing[0] },
    heroContent: { alignItems: "center", paddingVertical: t.spacing[5] },
    heroLabel: {
      color: t.colors.accent,
      letterSpacing: 1,
      fontSize: 12,
      fontFamily: t.fonts.label
    },
    heroDuration: {
      color: t.colors.text,
      fontSize: 56,
      fontFamily: t.fonts.display,
      marginTop: t.spacing[2] - 2,
      lineHeight: 60
    },
    heroDurationSub: {
      color: t.colors.textMuted,
      fontSize: 13,
      fontFamily: t.fonts.body,
      marginTop: -2
    },
    heroHint: {
      color: t.colors.textMuted,
      marginTop: t.spacing[2],
      fontSize: 12,
      fontFamily: t.fonts.body
    },
    quickRow: { flexDirection: "row", gap: t.spacing[2] + 2 },
    quickItem: { flex: 1 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },
    cardTitle: {
      color: t.colors.text,
      fontSize: 17,
      fontFamily: t.fonts.body
    },
    cardBody: {
      color: t.colors.textMuted,
      fontSize: 13,
      marginTop: t.spacing[1],
      fontFamily: t.fonts.body
    },
    companionBody: {
      color: t.colors.text,
      fontSize: 15,
      lineHeight: 22,
      fontFamily: t.fonts.body
    },
    // Last dive card
    lastDiveRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[3],
      marginTop: t.spacing[2]
    },
    lastDiveZoneBadge: {
      width: 44,
      height: 44,
      borderRadius: t.radii.sm,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      backgroundColor: "rgba(255,255,255,0.05)"
    },
    lastDiveZoneLabel: {
      fontSize: 11,
      fontFamily: t.fonts.label,
      letterSpacing: 0.8
    },
    lastDiveDuration: {
      color: t.colors.text,
      fontSize: 15,
      fontFamily: t.fonts.body,
      marginTop: 2
    },
    lastDiveXpBadge: {
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[1],
      borderRadius: t.radii.pill,
      backgroundColor: t.colors.accent + "22",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.accent + "55"
    },
    lastDiveXpText: {
      color: t.colors.accent,
      fontSize: 13,
      fontFamily: t.fonts.mono
    },
    // Zone progress
    zoneStrip: {
      flexDirection: "row",
      gap: t.spacing[2],
      marginTop: t.spacing[2]
    },
    zoneChip: {
      flex: 1,
      alignItems: "center",
      paddingVertical: t.spacing[3],
      paddingHorizontal: t.spacing[1],
      borderRadius: t.radii.sm,
      gap: t.spacing[1],
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border
    },
    zoneChipLabel: {
      fontSize: 9,
      fontFamily: t.fonts.label,
      letterSpacing: 0.3,
      textAlign: "center"
    },
    zoneDeepestDot: {
      width: 4,
      height: 4,
      borderRadius: 2
    },
    // Stats
    statsRow: { flexDirection: "row", gap: t.spacing[2] + 2 },
    statValueRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 2,
      marginTop: t.spacing[1]
    },
    statValue: {
      color: t.colors.text,
      fontSize: 22,
      fontFamily: t.fonts.mono
    },
    statUnit: {
      color: t.colors.textMuted,
      fontSize: 13,
      fontFamily: t.fonts.label
    },
    statLabel: {
      color: t.colors.textMuted,
      fontSize: 10,
      letterSpacing: 0.8,
      fontFamily: t.fonts.label,
      marginTop: t.spacing[1]
    }
  });
