import { type Translations } from "@/core/i18n";
import { MOODS, type Mood } from "@/domain/entities";
import {
  ActionButton,
  GlassCard,
  MoodMapChart,
  PremiumBadge,
  useThemedStyles,
  type AppTheme,
  type MoodMapEntry
} from "@/design-system";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  isPremium: boolean;
  onUnlock: () => void;
  theme: AppTheme;
  tr: Translations;
  selectedMood: Mood | null;
};

export const ProInsights = React.memo(function ProInsights({
  isPremium,
  onUnlock,
  theme: t,
  tr,
  selectedMood
}: Props) {
  const styles = useThemedStyles(makeStyles);
  const moodData = useMemo(
    () => buildMoodData(tr, selectedMood),
    [tr, selectedMood]
  );

  if (!isPremium) {
    return (
      <View style={styles.proLockedCard}>
        <LinearGradient
          colors={[t.colors.glass, t.colors.panelStrong]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.proHeaderRow}>
          <View style={styles.proHeaderTitleWrap}>
            <Ionicons name="sparkles" size={18} color={t.colors.premium} />
            <Text style={styles.proHeader}>{tr.ai.proHeader}</Text>
          </View>
          <PremiumBadge variant="lock" />
        </View>
        <Text style={styles.proLockedBody}>{tr.ai.proLocked}</Text>
        <View style={styles.proPreviewBlur}>
          <Text style={styles.proPreviewText} numberOfLines={2}>
            {tr.ai.proPatternBody}
          </Text>
          <Text style={styles.proPreviewText} numberOfLines={2}>
            {tr.ai.proMoodBody}
          </Text>
        </View>
        <ActionButton
          label={tr.ai.proUnlockCta}
          icon="arrow-forward"
          tone="premium"
          size="sm"
          fullWidth
          onPress={onUnlock}
        />
      </View>
    );
  }

  return (
    <GlassCard radius={t.radii.lg} style={styles.proUnlockedWrap}>
      <MotiView
        from={{ opacity: 0, translateY: 6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 320 }}
        style={{ gap: t.spacing[3] }}
      >
        <View style={styles.proHeaderRow}>
          <View style={styles.proHeaderTitleWrap}>
            <Ionicons name="sparkles" size={18} color={t.colors.premium} />
            <Text style={styles.proHeader}>{tr.ai.proHeader}</Text>
          </View>
        </View>

        <ProInsightTile
          title={tr.ai.proPatternTitle}
          body={tr.ai.proPatternBody}
          icon="trending-up"
          t={t}
        />

        <View style={styles.proTile}>
          <View
            style={[
              styles.proTileIcon,
              { borderColor: t.colors.premium }
            ]}
          >
            <Ionicons name="compass" size={14} color={t.colors.premium} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.proTileTitle}>{tr.ai.proMoodTitle}</Text>
            <View style={styles.moodChartWrap}>
              <MoodMapChart data={moodData} />
            </View>
          </View>
        </View>

        <ProInsightTile
          title={tr.ai.proRitualTitle}
          body={tr.ai.proRitualBody}
          icon="leaf"
          t={t}
        />
      </MotiView>
    </GlassCard>
  );
});

function buildMoodData(
  tr: Translations,
  selected: Mood | null
): MoodMapEntry[] {
  const BASE = [0.72, 0.55, 0.68, 0.41, 0.6];
  const BOOST = 0.22;
  return MOODS.map((mood, i) => ({
    label: tr.ai.moodLabels[mood],
    value: Math.min(
      1,
      (BASE[i % BASE.length] ?? 0.5) + (mood === selected ? BOOST : 0)
    )
  }));
}

const ProInsightTile = React.memo(function ProInsightTile({
  title,
  body,
  icon,
  t
}: {
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  t: AppTheme;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.proTile}>
      <View
        style={[styles.proTileIcon, { borderColor: t.colors.premium }]}
      >
        <Ionicons name={icon} size={14} color={t.colors.premium} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.proTileTitle}>{title}</Text>
        <Text style={styles.proTileBody}>{body}</Text>
      </View>
    </View>
  );
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    proLockedCard: {
      borderRadius: t.radii.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.borderStrong,
      padding: t.spacing[4],
      overflow: "hidden",
      gap: t.spacing[3]
    },
    proUnlockedWrap: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.borderStrong,
      backgroundColor: t.colors.panelStrong,
      padding: t.spacing[2],
      gap: t.spacing[6]
    },
    proHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },
    proHeaderTitleWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[2]
    },
    proHeader: {
      color: t.colors.premium,
      fontFamily: t.fonts.label,
      fontSize: 13,
      letterSpacing: 0.8,
      fontWeight: "700"
    },
    proLockedBody: {
      color: t.colors.text,
      fontSize: 13,
      lineHeight: 19,
      fontFamily: t.fonts.body
    },
    proPreviewBlur: {
      gap: t.spacing[1.5],
      paddingVertical: t.spacing[2],
      opacity: 0.72
    },
    proPreviewText: {
      color: t.colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
      fontFamily: t.fonts.body,
      fontStyle: "italic"
    },
    proTile: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: t.spacing[3],
      paddingVertical: t.spacing[2]
    },
    proTileIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.colors.glass,
      marginTop: 2
    },
    proTileTitle: {
      color: t.colors.premium,
      fontFamily: t.fonts.label,
      fontSize: 10,
      letterSpacing: 0.8
    },
    proTileBody: {
      color: t.colors.text,
      fontFamily: t.fonts.body,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 2
    },
    moodChartWrap: {
      marginTop: t.spacing[2.5]
    }
  });
