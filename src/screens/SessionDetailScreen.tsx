import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ZoneBackground,
  GlassCard,
  GlowText,
  SectionLabel,
  SessionTimeline,
  DiscoveryTimeline,
  useTheme,
  useThemedStyles,
  type AppTheme
} from "@/design-system";
import { useSession } from "@/features/diver";
import { xpForSession } from "@/features/diver/levelSystem";
import { useTranslations } from "@/core/i18n";
import { useSettings } from "@/stores";
import type { DiveSession } from "@/domain/entities";

function formatDuration(seconds: number): string {
  const totalMin = Math.round(seconds / 60);
  if (totalMin < 60) return `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();
  const locale = useSettings((s) => s.language ?? "en");
  const { data: session, isLoading } = useSession(id);

  return (
    <ZoneBackground zone={session?.zone ?? "abyss"}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color={t.colors.text} />
          </Pressable>
          <GlowText size={18}>{tr.sessionDetail.title}</GlowText>
          <View style={styles.backBtn} />
        </View>

        {!session ? (
          <View style={styles.center}>
            <Text style={styles.empty}>
              {isLoading ? "" : tr.sessionDetail.notFound}
            </Text>
          </View>
        ) : (
          <Body session={session} locale={locale} />
        )}
      </SafeAreaView>
    </ZoneBackground>
  );
}

function Body({ session, locale }: { session: DiveSession; locale: string }) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();

  const xpEarned =
    session.summary?.xpEarned ??
    xpForSession(session.elapsedSeconds, session.discoveries.length);
  const levelText = session.summary
    ? session.summary.levelsGained > 0
      ? tr.sessionDetail.levelUp(
          session.summary.levelBefore,
          session.summary.levelAfter
        )
      : tr.sessionDetail.noLevelChange
    : tr.sessionDetail.noLevelChange;

  const dateLabel = useMemo(
    () =>
      new Date(session.startedAt).toLocaleString(locale, {
        dateStyle: "medium",
        timeStyle: "short"
      }),
    [session.startedAt, locale]
  );

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.date}>{dateLabel}</Text>

      <View style={styles.kpiRow}>
        <Kpi
          label={tr.sessionDetail.duration}
          value={formatDuration(session.elapsedSeconds)}
        />
        <Kpi
          label={tr.sessionDetail.focusMinutes}
          value={`${Math.round(session.elapsedSeconds / 60)}m`}
        />
      </View>
      <View style={styles.kpiRow}>
        <Kpi label={tr.sessionDetail.xpEarned} value={`+${xpEarned}`} />
        <Kpi
          label={tr.sessionDetail.maxDepth}
          value={`${Math.round(session.depthMeters).toLocaleString()} m`}
        />
      </View>

      <GlassCard radius={t.radii.md}>
        <View style={styles.levelRow}>
          <Ionicons
            name="trending-up"
            size={18}
            color={
              session.summary && session.summary.levelsGained > 0
                ? t.colors.accent
                : t.colors.textMuted
            }
          />
          <Text style={styles.levelText}>{levelText}</Text>
          <View style={styles.spacer} />
          <Text style={styles.discCount}>
            ✦ {session.discoveries.length} {tr.sessionDetail.discoveries}
          </Text>
        </View>
      </GlassCard>

      <GlassCard radius={t.radii.md}>
        <SectionLabel>{tr.sessionDetail.zoneJourney}</SectionLabel>
        <SessionTimeline
          elapsedSeconds={session.elapsedSeconds}
          finalZone={session.zone}
        />
      </GlassCard>

      <GlassCard radius={t.radii.md}>
        <SectionLabel>{tr.sessionDetail.discoveryLog}</SectionLabel>
        <DiscoveryTimeline discoveries={session.discoveries} />
      </GlassCard>
    </ScrollView>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <GlassCard style={styles.flex} radius={t.radii.md}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </GlassCard>
  );
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: t.spacing[5],
      paddingTop: t.spacing[2],
      paddingBottom: t.spacing[3]
    },
    backBtn: { width: 32, alignItems: "flex-start" },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    empty: {
      fontFamily: t.fonts.body,
      fontSize: 14,
      color: t.colors.textMuted
    },
    scroll: {
      paddingHorizontal: t.spacing[5],
      paddingBottom: t.spacing[24],
      gap: t.spacing[4]
    },
    date: {
      fontFamily: t.fonts.mono,
      fontSize: 13,
      color: t.colors.textSecondary
    },
    kpiRow: { flexDirection: "row", gap: t.spacing[2.5] },
    kpiLabel: {
      color: t.colors.textMuted,
      fontSize: 10,
      letterSpacing: 1,
      fontFamily: t.fonts.label
    },
    kpiValue: {
      color: t.colors.text,
      fontSize: 24,
      marginTop: t.spacing[1.5],
      fontFamily: t.fonts.mono
    },
    levelRow: { flexDirection: "row", alignItems: "center", gap: t.spacing[2] },
    levelText: {
      fontFamily: t.fonts.body,
      fontSize: 14,
      color: t.colors.text
    },
    spacer: { flex: 1 },
    discCount: {
      fontFamily: t.fonts.label,
      fontSize: 11,
      letterSpacing: 0.5,
      color: t.colors.accentSoft
    }
  });
