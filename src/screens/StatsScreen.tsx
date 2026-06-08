import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  ZoneBackground,
  GlassCard,
  AppHeader,
  SectionLabel,
  useTheme,
  useThemedStyles,
  type AppTheme
} from "@/design-system";
import { useSessions, useDiverProfile } from "@/features/diver";
import type { DiveSession } from "@/domain/entities";
import { useTranslations } from "@/core/i18n";

export default function StatsScreen() {
  const { data: sessions = [] } = useSessions();
  const { data: profile } = useDiverProfile();
  const tr = useTranslations();
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();

  const last7Days = useMemo(() => buildLast7Days(sessions), [sessions]);
  const maxDepth = useMemo(
    () =>
      sessions.reduce(
        (m: number, s: DiveSession) => Math.max(m, s.depthMeters),
        0
      ),
    [sessions]
  );
  const totalMinutes = useMemo(
    () =>
      sessions.reduce(
        (m: number, s: DiveSession) => m + s.elapsedSeconds / 60,
        0
      ),
    [sessions]
  );

  return (
    <ZoneBackground zone="abyss">
      <SafeAreaView style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <AppHeader
            title={tr.stats.title}
            subtitle={tr.stats.subtitle}
            size={28}
          />

          <View style={styles.kpiRow}>
            <Kpi
              label={tr.stats.maxDepth}
              value={`${Math.round(maxDepth).toLocaleString()} m`}
            />
            <Kpi
              label={tr.stats.totalFocus}
              value={`${Math.round(totalMinutes)} min`}
            />
          </View>
          <View style={styles.kpiRow}>
            <Kpi
              label={tr.stats.dives}
              value={String(profile?.totalDives ?? 0)}
            />
            <Kpi label={tr.stats.level} value={String(profile?.level ?? 1)} />
          </View>

          <GlassCard radius={t.radii.md}>
            <SectionLabel>{tr.stats.weeklyHeatmap}</SectionLabel>
            <Heatmap data={last7Days} />
            <View style={styles.heatLegend}>
              <Text style={styles.legendText}>{tr.stats.less}</Text>
              <View style={styles.legendCells}>
                {[0.1, 0.3, 0.55, 0.8, 1].map((v, i) => (
                  <View key={i} style={[styles.legendCell, { opacity: v }]} />
                ))}
              </View>
              <Text style={styles.legendText}>{tr.stats.more}</Text>
            </View>
          </GlassCard>

          <GlassCard radius={t.radii.md}>
            <SectionLabel>{tr.stats.recentExpeditions}</SectionLabel>
            {sessions.length === 0 ? (
              <Text style={styles.empty}>{tr.stats.noDives}</Text>
            ) : (
              sessions.slice(0, 6).map((s: DiveSession) => (
                <Pressable
                  key={s.id}
                  onPress={() => router.push(`/session/${s.id}`)}
                  style={styles.sessionRow}
                  accessibilityRole="button"
                >
                  <Text style={styles.sessionDate}>
                    {new Date(s.startedAt).toLocaleDateString()}
                  </Text>
                  <Text style={styles.sessionMeta}>
                    {Math.round(s.elapsedSeconds / 60)}m ·{" "}
                    {Math.round(s.depthMeters)}m
                  </Text>
                  <Text
                    style={[styles.sessionMeta, { color: t.colors.accentSoft }]}
                  >
                    ✦ {s.discoveries.length}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={t.colors.textMuted}
                  />
                </Pressable>
              ))
            )}
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </ZoneBackground>
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

function Heatmap({
  data
}: {
  data: { day: string; label: string; minutes: number }[];
}) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const max = Math.max(1, ...data.map((d) => d.minutes));
  return (
    <View style={styles.heatRow}>
      {data.map((d) => {
        const intensity = d.minutes / max;
        return (
          <View key={d.day} style={styles.heatCol}>
            <View
              style={[
                styles.heatBar,
                {
                  backgroundColor: t.colors.accent,
                  opacity: 0.15 + 0.85 * intensity
                }
              ]}
            />
            <Text style={styles.dayLabel}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function buildLast7Days(
  sessions: { startedAt: number; elapsedSeconds: number }[]
) {
  const buckets = new Map<string, number>();
  const days: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push(key);
    buckets.set(key, 0);
  }
  for (const s of sessions) {
    const key = new Date(s.startedAt).toISOString().slice(0, 10);
    if (buckets.has(key))
      buckets.set(key, (buckets.get(key) ?? 0) + s.elapsedSeconds / 60);
  }
  const dayShort = (iso: string) =>
    new Date(iso)
      .toLocaleDateString(undefined, { weekday: "short" })
      .slice(0, 1);
  return days.map((day) => ({
    day,
    label: dayShort(day),
    minutes: buckets.get(day) ?? 0
  }));
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    scroll: {
      padding: t.spacing[5],
      paddingBottom: t.spacing[24],
      gap: t.spacing[4]
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
      fontSize: 26,
      marginTop: t.spacing[1.5],
      fontFamily: t.fonts.mono
    },
    dayLabel: {
      color: t.colors.textMuted,
      fontSize: 11,
      letterSpacing: 1,
      fontFamily: t.fonts.label
    },
    heatLegend: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: t.spacing[3]
    },
    legendCells: { flexDirection: "row", gap: 4 },
    legendText: {
      color: t.colors.textMuted,
      fontSize: 10,
      fontFamily: t.fonts.label
    },
    legendCell: {
      width: 12,
      height: 12,
      borderRadius: 3,
      backgroundColor: t.colors.accent
    },
    heatRow: {
      flexDirection: "row",
      gap: t.spacing[2],
      marginTop: t.spacing[3]
    },
    heatCol: { flex: 1, alignItems: "center", gap: t.spacing[1.5] },
    heatBar: {
      width: "100%",
      height: 72,
      borderRadius: t.radii.s
    },
    empty: {
      color: t.colors.textMuted,
      marginTop: t.spacing[3],
      fontSize: 13,
      fontFamily: t.fonts.body
    },
    sessionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: t.spacing[2.5],
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.border
    },
    sessionDate: {
      color: t.colors.text,
      fontSize: 13,
      fontFamily: t.fonts.body
    },
    sessionMeta: {
      color: t.colors.textSecondary,
      fontSize: 13,
      fontFamily: t.fonts.body
    }
  });
