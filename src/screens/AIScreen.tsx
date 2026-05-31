import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ZoneBackground,
  GlassCard,
  AppHeader,
  SectionLabel,
  PressableCard,
  OptionPill,
  useTheme,
  useThemedStyles,
  type AppTheme
} from "@/design-system";
import { useDailyRecommendation, useSessions } from "@/features/diver";
import { useQuery } from "@tanstack/react-query";
import { container } from "@/data/container";
import { useTranslations } from "@/core/i18n";

export default function AIScreen() {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const {
    data: recommendation,
    refetch: refetchRec,
    isFetching
  } = useDailyRecommendation();
  const { data: sessions = [] } = useSessions();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const tr = useTranslations();

  const lastSession = sessions[0];
  const { data: lastSummary } = useQuery({
    queryKey: ["ai", "summary", lastSession?.id],
    queryFn: () =>
      lastSession
        ? container.ai.sessionSummary(lastSession)
        : Promise.resolve(""),
    enabled: Boolean(lastSession)
  });

  return (
    <ZoneBackground zone="twilight">
      <SafeAreaView style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <AppHeader
            title={tr.ai.title}
            subtitle={tr.ai.subtitle}
            pulse
            size={28}
          />

          <GlassCard glow radius={t.radii.lg}>
            <SectionLabel>{tr.ai.today}</SectionLabel>
            <Text style={styles.body}>
              {isFetching ? tr.ai.listening : (recommendation ?? "—")}
            </Text>
            <View style={styles.askWrap}>
              <PressableCard
                haptic="light"
                onPress={() => refetchRec()}
                radius={t.radii.md}
              >
                <Text style={styles.cta}>{tr.ai.askAgain}</Text>
              </PressableCard>
            </View>
          </GlassCard>

          {lastSummary ? (
            <GlassCard radius={t.radii.lg}>
              <SectionLabel>{tr.ai.lastExpedition}</SectionLabel>
              <Text style={styles.body}>{lastSummary}</Text>
            </GlassCard>
          ) : null}

          <GlassCard radius={t.radii.lg}>
            <SectionLabel>{tr.ai.mood}</SectionLabel>
            <Text style={styles.bodyMuted}>{tr.ai.moodPrompt}</Text>
            <View style={styles.moodGrid}>
              {(tr.ai.moods as readonly string[]).map((m) => (
                <OptionPill
                  key={m}
                  label={m}
                  active={selectedMood === m}
                  onPress={() => {
                    setSelectedMood(m);
                    refetchRec();
                  }}
                  containerStyle={styles.moodItem}
                />
              ))}
            </View>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </ZoneBackground>
  );
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    scroll: {
      padding: t.spacing[5],
      paddingBottom: t.spacing[24],
      gap: t.spacing[4]
    },
    body: {
      color: t.colors.text,
      fontSize: 16,
      lineHeight: 24,
      fontFamily: t.fonts.body
    },
    bodyMuted: {
      color: t.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: t.fonts.body
    },
    askWrap: { marginTop: t.spacing[4] },
    cta: {
      color: t.colors.text,
      textAlign: "center",
      letterSpacing: 1,
      fontSize: 12,
      paddingVertical: 2,
      fontFamily: t.fonts.label
    },
    moodGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: t.spacing[2] + 2,
      marginTop: t.spacing[4] - 2
    },
    moodItem: { flexBasis: "47%", flexGrow: 1 }
  });
