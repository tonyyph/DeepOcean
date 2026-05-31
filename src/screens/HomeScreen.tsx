import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ZoneBackground,
  UnderwaterCanvas,
  GlowText,
  GlassCard,
  PressableCard,
  OptionPill,
  AppHeader,
  SectionLabel,
  useTheme,
  useThemedStyles,
  type AppTheme
} from "@/design-system";
import { useDiverProfile, useDailyRecommendation } from "@/features/diver";
import { useSettings } from "@/stores";
import { ZONE_TABLE } from "@/features/ocean";
import type { AppSettings } from "@/domain/entities";
import { useTranslations } from "@/core/i18n";

const QUICK_DURATIONS = [15, 25, 45, 60] as const;

/**
 * HomeScreen / Lobby — the "above water" hub. Minimal, calm, action-forward.
 * Single most important CTA: begin a dive.
 */
export default function HomeScreen() {
  const router = useRouter();
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { data: profile } = useDiverProfile();
  const { data: dailyRec } = useDailyRecommendation();
  const preferredMinutes = useSettings(
    (
      s: AppSettings & {
        update: (patch: Partial<AppSettings>) => void;
        reset: () => void;
      }
    ) => s.preferredSessionMinutes
  );
  const tr = useTranslations();

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return tr.home.greeting.awake;
    if (h < 12) return tr.home.greeting.morning;
    if (h < 18) return tr.home.greeting.afternoon;
    return tr.home.greeting.evening;
  }, [tr]);

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
          <View style={styles.header}>
            <Text style={styles.greeting}>{greeting},</Text>
            <GlowText size={36} pulse>
              {profile?.name ?? tr.home.diver}
            </GlowText>
            <Text style={styles.sub}>{tr.home.ready}</Text>
          </View>

          <PressableCard
            glow
            haptic="heavy"
            onPress={() => startDive(preferredMinutes)}
            containerStyle={styles.heroCard}
            radius={t.radii.xl}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroLabel}>{tr.home.beginDive}</Text>
              <Text style={styles.heroDuration}>
                {preferredMinutes} {tr.home.min}
              </Text>
              <Text style={styles.heroHint}>
                {tr.home.estimatedReach} ·{" "}
                {ZONE_TABLE[zoneForMinutes(preferredMinutes)].label}
              </Text>
            </View>
          </PressableCard>

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

          <PressableCard
            haptic="light"
            onPress={() => startDive(null)}
            radius={t.radii.lg}
          >
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{tr.home.freeDive}</Text>
                <Text style={styles.cardBody}>{tr.home.freeDiveDesc}</Text>
              </View>
              <GlowText size={20} color={t.colors.accentSoft}>
                ∞
              </GlowText>
            </View>
          </PressableCard>

          {dailyRec ? (
            <GlassCard radius={t.radii.lg}>
              <SectionLabel>{tr.home.guideTitle}</SectionLabel>
              <Text style={styles.companionBody}>{dailyRec}</Text>
            </GlassCard>
          ) : null}

          <View style={styles.statsRow}>
            <Stat
              label={tr.home.streak}
              value={`${profile?.currentStreakDays ?? 0}d`}
            />
            <Stat label={tr.home.dives} value={`${profile?.totalDives ?? 0}`} />
            <Stat label={tr.home.level} value={`${profile?.level ?? 1}`} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ZoneBackground>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <GlassCard radius={t.radii.md} style={styles.flex}>
      <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </GlassCard>
  );
}

function zoneForMinutes(m: number) {
  if (m < 15) return "surface" as const;
  if (m < 30) return "twilight" as const;
  if (m < 50) return "midnight" as const;
  if (m < 75) return "abyss" as const;
  return "trench" as const;
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    scroll: {
      padding: t.spacing[5],
      paddingBottom: t.spacing[24],
      gap: t.spacing[4] + 2
    },
    header: { paddingVertical: t.spacing[6], gap: t.spacing[1] },
    greeting: {
      color: t.colors.textMuted,
      fontSize: 13,
      letterSpacing: 1,
      fontFamily: t.fonts.label
    },
    sub: {
      color: t.colors.textSecondary,
      marginTop: t.spacing[2] - 2,
      fontSize: 14,
      fontFamily: t.fonts.body
    },
    heroCard: { marginTop: t.spacing[2] },
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
      fontFamily: t.fonts.mono,
      marginTop: t.spacing[2] - 2
    },
    heroHint: {
      color: t.colors.textMuted,
      marginTop: t.spacing[1],
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
    statsRow: { flexDirection: "row", gap: t.spacing[2] + 2 },
    statLabel: {
      color: t.colors.textMuted,
      fontSize: 10,
      letterSpacing: 1,
      fontFamily: t.fonts.label
    },
    statValue: {
      color: t.colors.text,
      fontSize: 22,
      fontFamily: t.fonts.mono,
      marginTop: t.spacing[1]
    }
  });
