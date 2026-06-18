import { useTranslations } from "@/core/i18n";
import { useScreenTransitionLoading } from "@/core/navigation/screenTransitionLoading";
import {
  ActionButton,
  DiscoveryTimeline,
  GlassCard,
  GlowText,
  KpiCard,
  ScreenScrollView,
  SectionLabel,
  SessionTimeline,
  Skeleton,
  UnderwaterCanvas,
  useTheme,
  useThemedStyles,
  ZoneBackground,
  type AppTheme
} from "@/design-system";
import type { DiveSession } from "@/domain/entities";
import { useSession } from "@/features/diver";
import { xpForSession } from "@/features/diver/levelSystem";
import { ZONE_ICONS, ZONE_TABLE } from "@/features/ocean";
import { useSettings } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { Share, StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

function formatDuration(seconds: number): string {
  const totalMin = Math.round(seconds / 60);
  if (totalMin < 60) return `${totalMin} ${totalMin === 1 ? "min" : "mins"}`;
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
  useScreenTransitionLoading(isLoading && !session, "session-detail");

  return (
    <ZoneBackground zone={session?.zone ?? "abyss"}>
      <UnderwaterCanvas zone={session?.zone ?? "abyss"} />
      <SafeAreaView style={styles.flex}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={tr.sessionDetail.back}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={20} color={t.colors.text} />
          </Pressable>
          <GlowText shadow={false} size={20}>
            {tr.sessionDetail.title}
          </GlowText>
          <View style={styles.backBtnNoColor} />
        </View>

        {!session ? (
          isLoading ? (
            <LoadingState />
          ) : (
            <View style={styles.center}>
              <GlassCard radius={t.radii.lg} style={styles.emptyCard} glow>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="compass-outline"
                    size={28}
                    color={t.colors.accent}
                  />
                </View>
                <Text style={styles.empty}>{tr.sessionDetail.notFound}</Text>
                <ActionButton
                  label={tr.sessionDetail.back}
                  icon="arrow-back"
                  tone="secondary"
                  size="sm"
                  fullWidth
                  onPress={() => router.back()}
                />
              </GlassCard>
            </View>
          )
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
  const zone = ZONE_TABLE[session.zone];

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

  const handleShare = useCallback(() => {
    const message = tr.sessionDetail.shareText(
      Math.round(session.elapsedSeconds / 60),
      Math.round(session.depthMeters).toLocaleString(locale),
      xpEarned,
      session.discoveries.length
    );
    void Share.share({
      title: tr.sessionDetail.shareTitle,
      message
    });
  }, [locale, session, tr, xpEarned]);

  return (
    <ScreenScrollView
      topInset={t.spacing[3]}
      bottomInset={t.spacing[12]}
      gap={t.spacing[4]}
    >
      <GlassCard radius={t.radii.md} padding={0} glow>
        <View style={styles.hero}>
          <LinearGradient
            pointerEvents="none"
            colors={[t.colors.panelTint, "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.heroTop}>
            <View style={styles.zoneIcon}>
              <Ionicons
                name={ZONE_ICONS[session.zone]}
                size={24}
                color={t.colors.accent}
              />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>{zone.label}</Text>
              <Text style={styles.heroDepth}>
                {Math.round(session.depthMeters).toLocaleString(locale)}
                <Text style={styles.heroDepthUnit}> m</Text>
              </Text>
              <Text style={styles.date}>{dateLabel}</Text>
            </View>
          </View>

          <View style={styles.heroSignals}>
            <SignalPill
              icon="time-outline"
              value={formatDuration(session.elapsedSeconds)}
            />
            <SignalPill icon="sparkles-outline" value={`+${xpEarned} XP`} />
            <SignalPill
              icon="diamond-outline"
              value={`${session.discoveries.length} ${tr.sessionDetail.discoveries}`}
            />
          </View>
        </View>
      </GlassCard>

      <View style={styles.kpiRow}>
        <KpiCard
          label={tr.sessionDetail.duration}
          value={formatDuration(session.elapsedSeconds)}
        />
        <KpiCard
          label={tr.sessionDetail.focusMinutes}
          value={`${Math.round(session.elapsedSeconds / 60)}m`}
        />
      </View>
      <View style={styles.kpiRow}>
        <KpiCard label={tr.sessionDetail.xpEarned} value={`+${xpEarned}`} />
        <KpiCard
          label={tr.sessionDetail.maxDepth}
          value={`${Math.round(session.depthMeters).toLocaleString(locale)} m`}
        />
      </View>

      <GlassCard radius={t.radii.md} padding={t.spacing[4]}>
        <View style={styles.levelRow}>
          <View
            style={[
              styles.levelIcon,
              session.summary &&
                session.summary.levelsGained > 0 &&
                styles.levelIconActive
            ]}
          >
            <Ionicons
              name="trending-up"
              size={18}
              color={
                session.summary && session.summary.levelsGained > 0
                  ? t.colors.accent
                  : t.colors.textMuted
              }
            />
          </View>
          <View style={styles.levelCopy}>
            <Text style={styles.levelLabel}>{tr.stats.level}</Text>
            <Text style={styles.levelText}>{levelText}</Text>
          </View>
          <View style={styles.spacer} />
          <View style={styles.discoveryCount}>
            <Ionicons name="sparkles" size={13} color={t.colors.accentSoft} />
            <Text style={styles.discCount}>{session.discoveries.length}</Text>
          </View>
        </View>
      </GlassCard>

      <GlassCard radius={t.radii.lg} glow padding={t.spacing[4]}>
        <SectionLabel hint={zone.label}>
          {tr.sessionDetail.zoneJourney}
        </SectionLabel>
        <SessionTimeline
          elapsedSeconds={session.elapsedSeconds}
          finalZone={session.zone}
        />
      </GlassCard>

      <GlassCard radius={t.radii.lg}>
        <SectionLabel hint={String(session.discoveries.length)}>
          {tr.sessionDetail.discoveryLog}
        </SectionLabel>
        <DiscoveryTimeline discoveries={session.discoveries} />
      </GlassCard>

      <GlassCard radius={t.radii.lg}>
        <SectionLabel>{tr.sessionDetail.shareTitle}</SectionLabel>
        <ActionButton
          label={tr.sessionDetail.shareCta}
          icon="share-social-outline"
          tone="secondary"
          size="md"
          fullWidth
          onPress={handleShare}
          containerStyle={styles.shareButton}
        />
      </GlassCard>
    </ScreenScrollView>
  );
}

function SignalPill({
  icon,
  value
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
}) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.signalPill}>
      <Ionicons name={icon} size={13} color={t.colors.accentSoft} />
      <Text style={styles.signalValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function LoadingState() {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <ScreenScrollView
      topInset={t.spacing[2]}
      bottomInset={t.spacing[12]}
      gap={t.spacing[4]}
    >
      <GlassCard radius={t.radii.xl}>
        <View style={styles.loadingHero}>
          <Skeleton style={styles.loadingIcon} radius={t.radii.lg} />
          <View style={styles.loadingCopy}>
            <Skeleton width="42%" height={11} />
            <Skeleton width="72%" height={34} />
            <Skeleton width="56%" height={11} />
          </View>
        </View>
        <View style={styles.loadingSignals}>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton
              key={index}
              style={styles.loadingSignal}
              radius={t.radii.pill}
            />
          ))}
        </View>
      </GlassCard>
      <View style={styles.kpiRow}>
        <KpiCard label="" value="" loading />
        <KpiCard label="" value="" loading />
      </View>
      <View style={styles.kpiRow}>
        <KpiCard label="" value="" loading />
        <KpiCard label="" value="" loading />
      </View>
      <Skeleton width="100%" height={120} radius={t.radii.lg} />
      <Skeleton width="100%" height={220} radius={t.radii.lg} />
    </ScreenScrollView>
  );
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: t.spacing[3],
      paddingBottom: t.spacing[2]
    },
    backBtn: {
      width: 40,
      minHeight: 40,
      borderRadius: t.radii.lg,
      backgroundColor: t.colors.panelStrong,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: t.spacing[3]
    },
    backBtnNoColor: {
      width: 40,
      minHeight: 40,
      marginRight: t.spacing[3]
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: t.spacing[5]
    },
    emptyCard: {
      width: "100%",
      maxWidth: 420
    },
    emptyIcon: {
      width: 60,
      height: 60,
      borderRadius: t.radii.xl,
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.colors.panelTint,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge
    },
    empty: {
      fontFamily: t.fonts.body,
      fontSize: 15,
      lineHeight: 22,
      color: t.colors.textSecondary,
      textAlign: "center",
      marginVertical: t.spacing[5]
    },
    hero: {
      overflow: "hidden",
      padding: t.spacing[5],
      gap: t.spacing[5],
      borderRadius: t.radii.xl
    },
    heroTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[4]
    },
    zoneIcon: {
      width: 58,
      height: 58,
      borderRadius: t.radii.xl,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.colors.panelTint,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge,
      shadowColor: t.colors.accent,
      shadowOpacity: 0.18,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 0 }
    },
    heroCopy: {
      flex: 1
    },
    heroEyebrow: {
      color: t.colors.accentSoft,
      fontFamily: t.fonts.label,
      fontSize: 11,
      letterSpacing: 1,
      textTransform: "uppercase"
    },
    heroDepth: {
      color: t.colors.text,
      fontFamily: t.fonts.mono,
      fontSize: 34,
      lineHeight: 42,
      marginTop: t.spacing.px
    },
    heroDepthUnit: {
      color: t.colors.textSecondary,
      fontSize: 17
    },
    date: {
      fontFamily: t.fonts.mono,
      fontSize: 11,
      color: t.colors.textMuted
    },
    heroSignals: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: t.spacing[2]
    },
    signalPill: {
      minHeight: 30,
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[1.5],
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[1.5],
      borderRadius: t.radii.pill,
      backgroundColor: t.colors.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.glassEdge
    },
    signalValue: {
      color: t.colors.textSecondary,
      fontFamily: t.fonts.label,
      fontSize: 10,
      letterSpacing: 0.35
    },
    kpiRow: { flexDirection: "row", gap: t.spacing[2.5] },
    levelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[3]
    },
    levelIcon: {
      width: 40,
      height: 40,
      borderRadius: t.radii.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.colors.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border
    },
    levelIconActive: {
      backgroundColor: t.colors.panelTint,
      borderColor: t.colors.accent
    },
    levelCopy: {
      gap: t.spacing.px
    },
    levelLabel: {
      color: t.colors.textMuted,
      fontFamily: t.fonts.label,
      fontSize: 9,
      letterSpacing: 1
    },
    levelText: {
      fontFamily: t.fonts.body,
      fontSize: 14,
      color: t.colors.text
    },
    spacer: { flex: 1 },
    discoveryCount: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[1],
      paddingHorizontal: t.spacing[2.5],
      paddingVertical: t.spacing[1.5],
      borderRadius: t.radii.pill,
      backgroundColor: t.colors.glass
    },
    discCount: {
      fontFamily: t.fonts.mono,
      fontSize: 12,
      color: t.colors.accentSoft
    },
    shareButton: {
      marginTop: t.spacing[2]
    },
    loadingHero: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[4]
    },
    loadingIcon: {
      width: 58,
      height: 58
    },
    loadingCopy: {
      flex: 1,
      gap: t.spacing[2]
    },
    loadingSignals: {
      flexDirection: "row",
      gap: t.spacing[2],
      marginTop: t.spacing[5]
    },
    loadingSignal: {
      flex: 1,
      height: 30
    }
  });
