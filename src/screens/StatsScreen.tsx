import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "moti";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useScreenTransitionLoading } from "@/core/navigation/screenTransitionLoading";
import {
  ZoneBackground,
  GlassCard,
  AppHeader,
  SectionLabel,
  Skeleton,
  ScreenScrollView,
  KpiCard,
  ActionButton,
  useTheme,
  useThemedStyles,
  type AppTheme,
  UnderwaterCanvas
} from "@/design-system";
import { useSessions, useDiverProfile } from "@/features/diver";
import type { DiveSession } from "@/domain/entities";
import { useTranslations } from "@/core/i18n";
import { Pressable } from "react-native-gesture-handler";

export default function StatsScreen() {
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const { data: profile, isLoading: profileLoading } = useDiverProfile();
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
  const isLoading = sessionsLoading || profileLoading;
  useScreenTransitionLoading(isLoading, "stats");

  return (
    <ZoneBackground zone="abyss">
      <UnderwaterCanvas zone="abyss" />

      <SafeAreaView style={styles.flex}>
        <ScreenScrollView>
          <AppHeader
            title={tr.stats.title}
            subtitle={tr.stats.subtitle}
            size={28}
          />

          <View style={styles.kpiRow}>
            <KpiCard
              label={tr.stats.maxDepth}
              value={`${Math.round(maxDepth).toLocaleString()} m`}
              loading={isLoading}
            />
            <KpiCard
              label={tr.stats.totalFocus}
              value={`${Math.round(totalMinutes)} min`}
              loading={isLoading}
            />
          </View>
          <View style={styles.kpiRow}>
            <KpiCard
              label={tr.stats.dives}
              value={String(profile?.totalDives ?? 0)}
              loading={isLoading}
            />
            <KpiCard
              label={tr.stats.level}
              value={String(profile?.level ?? 1)}
              loading={isLoading}
            />
          </View>

          <GlassCard radius={t.radii.md}>
            <SectionLabel>{tr.stats.weeklyHeatmap}</SectionLabel>
            {isLoading ? <HeatmapSkeleton /> : <Heatmap data={last7Days} />}
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
            {isLoading ? (
              <RecentSessionsSkeleton />
            ) : sessions.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="compass-outline"
                  size={24}
                  color={t.colors.accent}
                />
                <Text style={styles.emptyTitle}>{tr.stats.noDivesTitle}</Text>
                <Text style={styles.empty}>{tr.stats.noDives}</Text>
                <ActionButton
                  label={tr.home.beginDive}
                  icon="water"
                  tone="secondary"
                  size="sm"
                  fullWidth
                  onPress={() => router.push("/dive")}
                  containerStyle={styles.emptyCta}
                />
              </View>
            ) : (
              sessions.slice(0, 6).map((s: DiveSession) => (
                <Pressable
                  key={s.id}
                  onPress={() => router.push(`/session/${s.id}`)}
                  style={styles.sessionRow}
                  accessibilityRole="button"
                  accessibilityLabel={`${tr.sessionDetail.title}: ${Math.round(
                    s.elapsedSeconds / 60
                  )}m, ${Math.round(s.depthMeters)}m`}
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
        </ScreenScrollView>
      </SafeAreaView>
    </ZoneBackground>
  );
}

function HeatmapSkeleton() {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.heatRow}>
      {Array.from({ length: 7 }, (_, i) => (
        <View key={i} style={styles.heatCol}>
          <Skeleton style={styles.heatBarTrack} radius={t.radii.s} />
          <Skeleton style={styles.daySkeleton} />
        </View>
      ))}
    </View>
  );
}

function RecentSessionsSkeleton() {
  const styles = useThemedStyles(makeStyles);
  return (
    <View>
      {Array.from({ length: 4 }, (_, i) => (
        <View key={i} style={styles.sessionRow}>
          <Skeleton style={styles.sessionDateSkeleton} />
          <Skeleton style={styles.sessionMetaSkeleton} />
          <Skeleton style={styles.sessionMetaSkeletonShort} />
        </View>
      ))}
    </View>
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
        const height = 12 + intensity * 60;
        return (
          <View key={d.day} style={styles.heatCol}>
            <View
              style={styles.heatBarTrack}
              accessible
              accessibilityLabel={`${d.label}: ${Math.round(d.minutes)} min`}
            >
              <View
                style={[
                  styles.heatBar,
                  {
                    height,
                    backgroundColor: t.colors.accent,
                    opacity: 0.42 + 0.58 * intensity
                  }
                ]}
              />
            </View>
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
  const buckets = new Map<number, number>();
  const days: number[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const toLocalDayKey = (d: Date) => {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return y * 10_000 + m * 100 + day;
  };
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = toLocalDayKey(d);
    days.push(key);
    buckets.set(key, 0);
  }
  for (const s of sessions) {
    const key = toLocalDayKey(new Date(s.startedAt));
    if (buckets.has(key))
      buckets.set(key, (buckets.get(key) ?? 0) + s.elapsedSeconds / 60);
  }
  const keyToDate = (key: number) => {
    const y = Math.floor(key / 10_000);
    const m = Math.floor((key % 10_000) / 100) - 1;
    const day = key % 100;
    return new Date(y, m, day);
  };
  const dayShort = (key: number) =>
    keyToDate(key)
      .toLocaleDateString(undefined, { weekday: "short" })
      .slice(0, 1);
  return days.map((day) => ({
    day: String(day),
    label: dayShort(day),
    minutes: buckets.get(day) ?? 0
  }));
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    kpiRow: { flexDirection: "row", gap: t.spacing[2.5] },
    dayLabel: {
      color: t.colors.textSecondary,
      fontSize: 11,
      letterSpacing: 1,
      fontFamily: t.fonts.label
    },
    daySkeleton: {
      width: 12,
      height: 9,
      borderRadius: t.radii.xs
    },
    heatLegend: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: t.spacing[3]
    },
    legendCells: { flexDirection: "row", gap: 4 },
    legendText: {
      color: t.colors.textSecondary,
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
    heatBarTrack: {
      width: "100%",
      height: 72,
      borderRadius: t.radii.s,
      justifyContent: "flex-end",
      backgroundColor: t.colors.panelStrong,
      overflow: "hidden"
    },
    heatBar: {
      width: "100%",
      borderRadius: t.radii.s
    },
    emptyState: {
      alignItems: "center",
      gap: t.spacing[2],
      paddingVertical: t.spacing[3]
    },
    emptyTitle: {
      color: t.colors.text,
      marginTop: t.spacing[1],
      fontSize: 15,
      fontFamily: t.fonts.body,
      textAlign: "center"
    },
    empty: {
      color: t.colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      fontFamily: t.fonts.body,
      textAlign: "center"
    },
    emptyCta: {
      marginTop: t.spacing[2],
      alignSelf: "stretch"
    },
    sessionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 44,
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
    },
    sessionDateSkeleton: {
      width: 84,
      height: 12,
      borderRadius: t.radii.xs
    },
    sessionMetaSkeleton: {
      width: 54,
      height: 12,
      borderRadius: t.radii.xs
    },
    sessionMetaSkeletonShort: {
      width: 36,
      height: 12,
      borderRadius: t.radii.xs
    }
  });
