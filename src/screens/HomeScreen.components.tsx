import { useTranslations } from "@/core/i18n";
import {
  ActionButton,
  CountUpText,
  GlassCard,
  SectionLabel,
  SectionSkeleton,
  ShimmerOverlay,
  Skeleton,
  useCountUp,
  useTheme,
  useThemedStyles
} from "@/design-system";
import type {
  AIRecommendation,
  RecommendedWorkflow
} from "@/domain/entities";
import {
  OCEAN_ZONES,
  ZONE_COLORS,
  ZONE_ICONS,
  ZONE_TABLE
} from "@/features/ocean";
import type { OceanZone } from "@/features/ocean/zones";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring
} from "react-native-reanimated";
import { makeStyles } from "./HomeScreen.styles";

export function StreakMilestoneCard({
  days,
  nextTarget,
  onPress,
  tr
}: {
  days: number;
  nextTarget: number | null;
  onPress: () => void;
  tr: ReturnType<typeof useTranslations>;
}) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const flameScale = useSharedValue(1);

  React.useEffect(() => {
    flameScale.value = withSequence(
      withSpring(1.4, { damping: 10, stiffness: 260 }),
      withSpring(1.0, { damping: 14, stiffness: 200 })
    );
  }, [days, flameScale]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  const milestoneBody =
    nextTarget == null
      ? tr.home.streakMilestoneReached(days)
      : tr.home.streakMilestoneBody(days, nextTarget);

  return (
    <GlassCard radius={t.radii.md} padding={t.spacing[4]}>
      <View style={styles.streakMilestoneHeader}>
        <Animated.View style={flameStyle}>
          <Ionicons name="flame" size={14} color={t.colors.warning} />
        </Animated.View>
        <SectionLabel>{tr.home.streakMilestoneTitle}</SectionLabel>
      </View>
      <Text style={styles.streakMilestoneBody}>{milestoneBody}</Text>
      <ActionButton
        label={tr.home.streakMilestoneCta}
        icon="water"
        size="sm"
        tone="secondary"
        fullWidth
        onPress={onPress}
        containerStyle={styles.streakMilestoneCtaWrap}
      />
    </GlassCard>
  );
}

export function LastDiveSkeleton() {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { width } = useWindowDimensions();
  const cardWidth = width - t.spacing[5] * 2;

  return (
    <GlassCard radius={t.radii.md} padding={t.spacing[4]}>
      <ShimmerOverlay width={cardWidth} height={88} borderRadius={t.radii.md} />
      <Skeleton style={styles.skeletonLabel} />
      <View style={styles.lastDiveRow}>
        <Skeleton style={styles.lastDiveIconSkeleton} radius={t.radii.sm} />
        <View style={styles.flex}>
          <Skeleton style={styles.lastDiveMetaSkeleton} />
          <Skeleton style={styles.lastDiveMetaSkeletonShort} />
        </View>
        <Skeleton style={styles.lastDiveXpSkeleton} radius={t.radii.pill} />
      </View>
    </GlassCard>
  );
}

export function DailyCompanionSkeleton() {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { width } = useWindowDimensions();
  const cardWidth = width - t.spacing[5] * 2;

  return (
    <GlassCard radius={t.radii.md}>
      <ShimmerOverlay width={cardWidth} height={72} borderRadius={t.radii.md} />
      <Skeleton style={styles.skeletonLabel} />
      <SectionSkeleton
        style={styles.companionSectionSkeleton}
        widths={["100%", "72%"]}
        lineHeight={14}
      />
    </GlassCard>
  );
}

export function PersonalizedPlanCard({
  recommendation,
  workflowId,
  tr
}: {
  recommendation: AIRecommendation | null;
  workflowId: RecommendedWorkflow["id"] | null;
  tr: ReturnType<typeof useTranslations>;
}) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const workflow =
    recommendation?.recommendedWorkflow ??
    (workflowId ? tr.onboarding.workflowOptions[workflowId] : null);
  if (!workflow) return null;
  const previewItems = recommendation?.recommendedItems.slice(0, 3) ?? [];

  return (
    <GlassCard
      radius={t.radii.md}
      padding={t.spacing[4]}
      style={styles.personalPlanCard}
    >
      <View style={styles.personalPlanHeader}>
        <View style={styles.personalPlanTitleRow}>
          <Ionicons
            name="compass"
            size={16}
            color={t.colors.accent}
          />
          <SectionLabel>{tr.home.personalPlanTitle}</SectionLabel>
        </View>
      </View>
      <Text style={styles.personalPlanName}>{workflow.title}</Text>
      <Text style={styles.companionBody}>{workflow.description}</Text>
      <View style={styles.personalPlanSteps}>
        {workflow.steps.slice(0, 3).map((step, index) => (
          <View key={`${workflow.id}.${step}`} style={styles.personalPlanStep}>
            <Text style={styles.personalPlanStepIndex}>{index + 1}</Text>
            <Text style={styles.personalPlanStepText}>{step}</Text>
          </View>
        ))}
      </View>
      {previewItems.length > 0 && (
        <View style={styles.personalPlanItems}>
          {previewItems.map((item) => (
            <Text key={item.id} style={styles.personalPlanItem} numberOfLines={1}>
              -{" "}
              {item.title}
            </Text>
          ))}
        </View>
      )}
    </GlassCard>
  );
}

// ─── Last Dive Card ───────────────────────────────────────────────────────────

export function LastDiveCard({
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
    <GlassCard radius={t.radii.md} padding={t.spacing[4]}>
      <SectionLabel>{tr.home.lastDiveTitle}</SectionLabel>
      <View style={styles.lastDiveRow}>
        {/* Zone badge */}
        <View style={[styles.lastDiveZoneBadge]}>
          <Ionicons name={ZONE_ICONS[zone]} size={20} color={t.colors.accent} />
        </View>

        <View style={styles.flex}>
          <Text style={[styles.lastDiveZoneLabel, { color: t.colors.accent }]}>
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
  );
}

export function NoLastDiveCard({
  onStart,
  tr
}: {
  onStart: () => void;
  tr: ReturnType<typeof useTranslations>;
}) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <GlassCard radius={t.radii.md} padding={t.spacing[4]}>
      <SectionLabel>{tr.home.lastDiveTitle}</SectionLabel>
      <Text style={styles.emptyLastDiveText}>{tr.home.noSessions}</Text>
      <ActionButton
        label={tr.home.beginDive}
        icon="water"
        size="sm"
        tone="secondary"
        fullWidth
        onPress={onStart}
        containerStyle={styles.emptyLastDiveCtaWrap}
      />
    </GlassCard>
  );
}

// ─── Zone Progress Strip ──────────────────────────────────────────────────────

export function ZoneProgressStrip({
  unlockedZones
}: {
  unlockedZones: OceanZone[];
}) {
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

export function ZoneChip({
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
  const zoneColor = colors[0];
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View
      style={[
        styles.zoneChip,
        isUnlocked ? styles.zoneChipUnlocked : styles.zoneChipLocked,
        isDeepest && [
          styles.zoneChipDeepest,
          { borderColor: zoneColor + "A8" }
        ],
        animStyle
      ]}
    >
      <LinearGradient
        colors={
          isUnlocked
            ? [zoneColor + (isDeepest ? "66" : "36"), colors[1] + "1F"]
            : [t.colors.panelStrong, t.colors.panel]
        }
        style={[StyleSheet.absoluteFill, { borderRadius: t.radii.sm }]}
      />
      <Ionicons
        name={ZONE_ICONS[zone]}
        size={16}
        color={isUnlocked ? zoneColor : t.colors.textMuted}
      />
      <Text
        style={[
          styles.zoneChipLabel,
          {
            color: isUnlocked
              ? isDeepest
                ? t.colors.text
                : t.colors.textSecondary
              : t.colors.textMuted
          }
        ]}
        numberOfLines={1}
      >
        {ZONE_TABLE[zone].label.split(" ")[0]}
      </Text>
      {isDeepest && (
        <View style={[styles.zoneDeepestDot, { backgroundColor: zoneColor }]} />
      )}
    </Animated.View>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

export function StatCard({
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
  const numericValue = parseInt(value, 10);
  const isNumeric = !isNaN(numericValue);
  const animated = useCountUp(isNumeric ? numericValue : 0);

  return (
    <GlassCard radius={t.radii.md} style={styles.flex} padding={t.spacing[4]}>
      <Ionicons name={icon} size={14} color={t.colors.accentSoft} />
      <View style={styles.statValueRow}>
        {isNumeric ? (
          <CountUpText
            value={animated}
            style={StyleSheet.flatten([styles.statValue, { color: t.colors.text }])}
          />
        ) : (
          <Text style={styles.statValue}>{value}</Text>
        )}
        {unit && <Text style={styles.statUnit}>{unit}</Text>}
      </View>
      <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
    </GlassCard>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
