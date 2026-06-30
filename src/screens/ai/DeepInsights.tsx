import { type Translations } from "@/core/i18n";
import {
  GlassCard,
  MoodMapChart,
  useThemedStyles,
  type AppTheme,
  type MoodMapEntry
} from "@/design-system";
import type { Mood } from "@/domain/entities";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  theme: AppTheme;
  tr: Translations;
  selectedMood: Mood | null;
  randomMoods: Mood[];
};

export const DeepInsights = React.memo(function DeepInsights({
  theme: t,
  tr,
  selectedMood,
  randomMoods
}: Props) {
  const styles = useThemedStyles(makeStyles);
  const moodData = useMemo(
    () => buildMoodData(tr, selectedMood, randomMoods),
    [tr, selectedMood, randomMoods]
  );

  return (
    <GlassCard radius={t.radii.lg} style={styles.deepInsightsWrap}>
      <MotiView
        from={{ opacity: 0, translateY: 6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 320 }}
        style={{ gap: t.spacing[3] }}
      >
        <View style={styles.deepHeaderRow}>
          <View style={styles.deepHeaderTitleWrap}>
            <Ionicons name="sparkles" size={18} color={t.colors.accent} />
            <Text style={styles.deepHeader}>{tr.ai.deepHeader}</Text>
          </View>
        </View>

        <DeepInsightTile
          title={tr.ai.deepPatternTitle}
          body={tr.ai.deepPatternBody}
          icon="trending-up"
          t={t}
        />

        <View style={styles.deepTile}>
          <View style={[styles.deepTileIcon, { borderColor: t.colors.accent }]}>
            <Ionicons name="compass" size={14} color={t.colors.accent} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.deepTileTitle}>{tr.ai.deepMoodTitle}</Text>
            <View style={styles.moodChartWrap}>
              <MoodMapChart data={moodData} />
            </View>
          </View>
        </View>

        <DeepInsightTile
          title={tr.ai.deepRitualTitle}
          body={tr.ai.deepRitualBody}
          icon="leaf"
          t={t}
        />
      </MotiView>
    </GlassCard>
  );
});

function buildMoodData(
  tr: Translations,
  selected: Mood | null,
  moods: Mood[]
): MoodMapEntry[] {
  const BASE = [0.72, 0.55, 0.68, 0.41, 0.6];
  const BOOST = 0.22;
  return moods.map((mood, i) => ({
    label: tr.ai.moodLabels[mood],
    value: Math.min(
      1,
      (BASE[i % BASE.length] ?? 0.5) + (mood === selected ? BOOST : 0)
    )
  }));
}

const DeepInsightTile = React.memo(function DeepInsightTile({
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
    <View style={styles.deepTile}>
      <View style={[styles.deepTileIcon, { borderColor: t.colors.accent }]}>
        <Ionicons name={icon} size={14} color={t.colors.accent} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.deepTileTitle}>{title}</Text>
        <Text style={styles.deepTileBody}>{body}</Text>
      </View>
    </View>
  );
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    deepInsightsWrap: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.borderStrong,
      backgroundColor: t.colors.panelStrong,
      padding: t.spacing[2],
      gap: t.spacing[6]
    },
    deepHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },
    deepHeaderTitleWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[2]
    },
    deepHeader: {
      color: t.colors.accent,
      fontFamily: t.fonts.label,
      fontSize: 13,
      letterSpacing: 0.8,
      fontWeight: "700"
    },
    deepTile: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: t.spacing[3],
      paddingVertical: t.spacing[2]
    },
    deepTileIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.colors.glass,
      marginTop: 2
    },
    deepTileTitle: {
      color: t.colors.accent,
      fontFamily: t.fonts.label,
      fontSize: 10,
      letterSpacing: 0.8
    },
    deepTileBody: {
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
