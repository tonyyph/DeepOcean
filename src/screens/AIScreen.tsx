import { useTranslations } from "@/core/i18n";
import { useScreenTransitionLoading } from "@/core/navigation/screenTransitionLoading";
import { container } from "@/data/container";
import {
  ActionButton,
  AppHeader,
  GuidanceCard,
  GlassCard,
  OptionPill,
  PaywallSheet,
  ScreenScrollView,
  SectionLabel,
  SectionSkeleton,
  Skeleton,
  UnderwaterCanvas,
  useTheme,
  useThemedStyles,
  ZoneBackground,
  type AppTheme
} from "@/design-system";
import { MOODS, type Language } from "@/domain/entities";
import { buildAIContext } from "@/features/ai";
import {
  useDailyMotivation,
  useDailyRecommendation,
  useSessions
} from "@/features/diver";
import { diverKeys } from "@/features/diver/hooks";
import { selectCurrentMood, useMoodRecord, useSetMood } from "@/features/mood";
import { usePremium, useSettings } from "@/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProInsights } from "./ai/ProInsights";

const ASK_AGAIN_COOLDOWN_MS = 20_000;
const REFRESH_ERROR_RETRY_MS = 3_000;

function stableMoodRank(mood: string): number {
  let hash = 0;
  for (let i = 0; i < mood.length; i++) {
    hash = (hash * 31 + mood.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export default function AIScreen() {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const {
    data: recommendation,
    isFetching,
    isLoading: recommendationLoading
  } = useDailyRecommendation();

  const { data: sessions = [] } = useSessions();
  const { data: moodRecord } = useMoodRecord();
  const {
    data: motivation,
    isFetching: motivationFetching,
    isLoading: motivationLoading
  } = useDailyMotivation();

  const { mutate: setMood } = useSetMood();
  const selectedMood = selectCurrentMood(moodRecord);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [manualRefreshReady, setManualRefreshReady] = useState(true);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tr = useTranslations();
  const isPremium = usePremium((s) => s.isPremium);
  const language = useSettings((s) => s.language);
  const queryClient = useQueryClient();

  const lastSession = sessions[0];
  const { data: lastSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["ai", "summary", lastSession?.id, language],
    queryFn: () =>
      lastSession
        ? container.ai.sessionSummary(lastSession, language)
        : Promise.resolve(""),
    enabled: Boolean(lastSession)
  });
  useScreenTransitionLoading(
    recommendationLoading || motivationLoading || summaryLoading,
    "ai"
  );

  const canAskAgain =
    !isFetching && !motivationFetching && manualRefreshReady;

  const startManualRefreshCooldown = useCallback((duration: number) => {
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
    }
    setManualRefreshReady(false);
    cooldownTimerRef.current = setTimeout(() => {
      cooldownTimerRef.current = null;
      setManualRefreshReady(true);
    }, duration);
  }, []);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, []);

  const handleOpenPaywall = useCallback(() => setPaywallOpen(true), []);
  const handleRefreshAI = useCallback(() => {
    if (!canAskAgain) return;
    startManualRefreshCooldown(ASK_AGAIN_COOLDOWN_MS);
    setRefreshError(null);

    void (async () => {
      try {
        const lang = (language ?? "en") as Language;
        const context = await buildAIContext(lang);
        const [nextRecommendation, nextMotivation] = await Promise.all([
          container.ai.dailyRecommendation(context, { forceRefresh: true }),
          container.ai.motivation(context, { forceRefresh: true })
        ]);

        queryClient.setQueryData(
          [...diverKeys.dailyRec, lang],
          nextRecommendation
        );
        queryClient.setQueryData(["diver", "motivation", lang], nextMotivation);
      } catch {
        // Keep UI resilient while throttling repeated error retries.
        startManualRefreshCooldown(REFRESH_ERROR_RETRY_MS);
        setRefreshError(tr.ai.refreshError);
      }
    })();
  }, [
    canAskAgain,
    language,
    queryClient,
    startManualRefreshCooldown,
    tr.ai.refreshError
  ]);

  const randomMoods = React.useMemo(() => {
    return [...MOODS].sort((a, b) => stableMoodRank(a) - stableMoodRank(b)).slice(0, 6);
  }, []);

  return (
    <ZoneBackground zone="midnight">
      <UnderwaterCanvas
        zone={lastSession?.zone ?? "midnight"}
        particleCount={32}
      />
      <SafeAreaView style={styles.flex}>
        <ScreenScrollView>
          <AppHeader title={tr.ai.title} subtitle={tr.ai.subtitle} size={28} />
          {sessions.length === 0 && (
            <GuidanceCard
              storageKey="guidance.ai.first"
              title={tr.guidance.ai.title}
              body={tr.guidance.ai.body}
              dismissLabel={tr.common.dismiss}
              icon="sparkles-outline"
            />
          )}

          <GlassCard radius={t.radii.md}>
            <SectionLabel>{tr.ai.today}</SectionLabel>
            {recommendationLoading ? (
              <AiTextSkeleton />
            ) : (
              <Text style={styles.body}>
                {isFetching ? tr.ai.listening : (recommendation ?? "—")}
              </Text>
            )}
            <View style={styles.askWrap}>
              <ActionButton
                label={tr.ai.askAgain}
                icon="sparkles"
                tone="secondary"
                size="sm"
                onPress={handleRefreshAI}
                disabled={!canAskAgain}
              />
              {refreshError != null && (
                <Text style={styles.refreshErrorText}>{refreshError}</Text>
              )}
            </View>
          </GlassCard>

          {motivationLoading ? (
            <AiCardSkeleton />
          ) : (
            motivation && (
              <GlassCard radius={t.radii.md}>
                <SectionLabel>{tr.ai.nudge}</SectionLabel>
                <Text style={styles.nudge}>{motivation}</Text>
              </GlassCard>
            )
          )}

          {summaryLoading ? (
            <AiCardSkeleton />
          ) : (
            lastSummary && (
              <GlassCard radius={t.radii.md}>
                <SectionLabel>{tr.ai.lastExpedition}</SectionLabel>
                <Text style={styles.body}>{lastSummary}</Text>
              </GlassCard>
            )
          )}

          {/* PRO INSIGHTS BLOCK */}
          <ProInsights
            isPremium={isPremium}
            onUnlock={handleOpenPaywall}
            theme={t}
            tr={tr}
            selectedMood={selectedMood}
          />

          <GlassCard radius={t.radii.md}>
            <SectionLabel>{tr.ai.mood}</SectionLabel>
            <Text style={styles.bodyMuted}>{tr.ai.moodPrompt}</Text>
            <View style={styles.moodGrid}>
              {randomMoods.map((m) => (
                <OptionPill
                  key={m}
                  label={tr.ai.moodLabels[m]}
                  active={selectedMood === m}
                  onPress={() => {
                    setMood(m);
                    if (canAskAgain) handleRefreshAI();
                  }}
                  containerStyle={styles.moodItem}
                />
              ))}
            </View>
          </GlassCard>
        </ScreenScrollView>
      </SafeAreaView>

      <PaywallSheet
        visible={paywallOpen}
        onDismiss={() => setPaywallOpen(false)}
      />
    </ZoneBackground>
  );
}

function AiTextSkeleton() {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.skeletonGroup}>
      <SectionSkeleton widths={["100%", "88%", "58%"]} lineHeight={14} />
      <View style={styles.askWrap}>
        <Skeleton
          style={styles.askButtonSkeleton}
          height={30}
          radius={t.radii.pill}
        />
      </View>
    </View>
  );
}

function AiCardSkeleton() {
  const t = useTheme();
  return (
    <GlassCard radius={t.radii.md}>
      <AiTextSkeleton />
    </GlassCard>
  );
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    body: {
      color: t.colors.text,
      fontSize: 16,
      lineHeight: 24,
      fontFamily: t.fonts.body,
      marginBottom: t.spacing[2]
    },
    bodyMuted: {
      color: t.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: t.fonts.body
    },
    nudge: {
      color: t.colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
      fontStyle: "italic",
      fontFamily: t.fonts.body
    },
    askWrap: { marginTop: t.spacing[4] },
    refreshErrorText: {
      color: t.colors.danger,
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
      marginTop: t.spacing[2],
      fontFamily: t.fonts.body
    },
    moodGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: t.spacing[2.5],
      marginTop: t.spacing[3.5]
    },
    moodItem: { flexBasis: "47%", flexGrow: 1 },

    skeletonGroup: {
      marginTop: t.spacing[1.5],
      paddingBottom: t.spacing[1]
    },
    askButtonSkeleton: {
      width: "42%",
      minWidth: 116,
      alignSelf: "center"
    }
  });
