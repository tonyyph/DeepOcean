import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import {
  ZoneBackground,
  GlassCard,
  AppHeader,
  SectionLabel,
  PressableCard,
  OptionPill,
  PaywallSheet,
  PremiumBadge,
  useTheme,
  useThemedStyles,
  type AppTheme
} from "@/design-system";
import { useDailyRecommendation, useSessions } from "@/features/diver";
import { useQuery } from "@tanstack/react-query";
import { container } from "@/data/container";
import { useTranslations } from "@/core/i18n";
import { usePremium } from "@/stores";

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
  const [paywallOpen, setPaywallOpen] = useState(false);
  const tr = useTranslations();
  const isPremium = usePremium((s) => s.isPremium);

  const lastSession = sessions[0];
  const { data: lastSummary } = useQuery({
    queryKey: ["ai", "summary", lastSession?.id],
    queryFn: () =>
      lastSession
        ? container.ai.sessionSummary(lastSession)
        : Promise.resolve(""),
    enabled: Boolean(lastSession)
  });

  const handleOpenPaywall = useCallback(() => setPaywallOpen(true), []);

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

          {/* PRO INSIGHTS BLOCK */}
          <ProInsights
            isPremium={isPremium}
            onUnlock={handleOpenPaywall}
            theme={t}
            tr={tr}
          />

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

      <PaywallSheet
        visible={paywallOpen}
        onDismiss={() => setPaywallOpen(false)}
      />
    </ZoneBackground>
  );
}

type ProProps = {
  isPremium: boolean;
  onUnlock: () => void;
  theme: AppTheme;
  tr: ReturnType<typeof useTranslations>;
};

const ProInsights = React.memo(function ProInsights({
  isPremium,
  onUnlock,
  theme: t,
  tr
}: ProProps) {
  const styles = useThemedStyles(makeStyles);

  if (!isPremium) {
    return (
      <Pressable onPress={onUnlock} accessibilityRole="button">
        <View style={styles.proLockedCard}>
          <LinearGradient
            colors={[
              t.gradients.bioGlow[0] + "33",
              t.gradients.bioGlow[1] + "11"
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.proHeaderRow}>
            <View style={styles.proHeaderTitleWrap}>
              <Ionicons name="sparkles" size={14} color={t.colors.premium} />
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
          <View style={styles.proCtaRow}>
            <Text style={styles.proCtaText}>{tr.ai.proUnlockCta}</Text>
            <Ionicons name="arrow-forward" size={14} color={t.colors.premium} />
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 320 }}
      style={styles.proUnlockedWrap}
    >
      <View style={styles.proHeaderRow}>
        <View style={styles.proHeaderTitleWrap}>
          <Ionicons name="sparkles" size={14} color={t.colors.premium} />
          <Text style={styles.proHeader}>{tr.ai.proHeader}</Text>
        </View>
      </View>
      <ProInsightTile
        title={tr.ai.proPatternTitle}
        body={tr.ai.proPatternBody}
        icon="trending-up"
        t={t}
      />
      <ProInsightTile
        title={tr.ai.proMoodTitle}
        body={tr.ai.proMoodBody}
        icon="compass"
        t={t}
      />
      <ProInsightTile
        title={tr.ai.proRitualTitle}
        body={tr.ai.proRitualBody}
        icon="leaf"
        t={t}
      />
    </MotiView>
  );
});

const ProInsightTile = React.memo(function ProInsightTile({
  title,
  body,
  icon,
  t
}: {
  title: string;
  body: string;
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  t: AppTheme;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.proTile}>
      <View
        style={[styles.proTileIcon, { borderColor: t.colors.premium + "66" }]}
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
    moodItem: { flexBasis: "47%", flexGrow: 1 },

    // PRO BLOCK
    proLockedCard: {
      borderRadius: t.radii.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255,210,122,0.32)",
      padding: t.spacing[4],
      overflow: "hidden",
      gap: t.spacing[3]
    },
    proUnlockedWrap: {
      borderRadius: t.radii.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255,210,122,0.30)",
      backgroundColor: "rgba(255,210,122,0.05)",
      padding: t.spacing[4],
      gap: t.spacing[3]
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
      fontSize: 11,
      letterSpacing: 2,
      fontWeight: "700"
    },
    proLockedBody: {
      color: t.colors.text,
      fontSize: 13,
      lineHeight: 19,
      fontFamily: t.fonts.body
    },
    proPreviewBlur: {
      gap: t.spacing[1] + 2,
      paddingVertical: t.spacing[2],
      opacity: 0.45
    },
    proPreviewText: {
      color: t.colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
      fontFamily: t.fonts.body,
      fontStyle: "italic"
    },
    proCtaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: t.spacing[1]
    },
    proCtaText: {
      color: t.colors.premium,
      fontFamily: t.fonts.label,
      fontSize: 12,
      letterSpacing: 1.5,
      fontWeight: "700"
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
      backgroundColor: "rgba(255,210,122,0.08)",
      marginTop: 2
    },
    proTileTitle: {
      color: t.colors.premium,
      fontFamily: t.fonts.label,
      fontSize: 10,
      letterSpacing: 1.5
    },
    proTileBody: {
      color: t.colors.text,
      fontFamily: t.fonts.body,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 2
    }
  });
