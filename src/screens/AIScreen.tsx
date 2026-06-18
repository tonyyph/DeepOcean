import { useTranslations } from "@/core/i18n";
import { useScreenTransitionLoading } from "@/core/navigation/screenTransitionLoading";
import { container } from "@/data/container";
import {
  ActionButton,
  AppHeader,
  GlassCard,
  GuidanceCard,
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
import { buildAIContext, useAskAgainLimit } from "@/features/ai";
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
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const manualRefreshingRef = useRef(false);
  const mountedRef = useRef(true);
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

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleOpenPaywall = useCallback((_reason?: string) => {
    setPaywallOpen(true);
  }, []);
  const { askAgainUsesLeft, consumeAskAgain } = useAskAgainLimit({
    isPremium,
    onLimitReached: handleOpenPaywall
  });
  const aiRefreshInFlight =
    isFetching || motivationFetching || manualRefreshing;
  const canAskAgain = !aiRefreshInFlight;

  const runAIRefresh = useCallback(
    (shouldConsumeAskAgain: boolean) => {
      if (manualRefreshingRef.current || aiRefreshInFlight) return;
      if (shouldConsumeAskAgain && !consumeAskAgain()) return;

      manualRefreshingRef.current = true;
      setManualRefreshing(true);
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
          queryClient.setQueryData(
            ["diver", "motivation", lang],
            nextMotivation
          );
        } catch {
          if (mountedRef.current) {
            setRefreshError(tr.ai.refreshError);
          }
        } finally {
          manualRefreshingRef.current = false;
          if (mountedRef.current) {
            setManualRefreshing(false);
          }
        }
      })();
    },
    [
      aiRefreshInFlight,
      consumeAskAgain,
      language,
      queryClient,
      tr.ai.refreshError
    ]
  );
  const handleRefreshAI = useCallback(() => {
    runAIRefresh(true);
  }, [runAIRefresh]);
  const handleMoodRefreshAI = useCallback(() => {
    runAIRefresh(false);
  }, [runAIRefresh]);

  const randomMoods = React.useMemo(() => {
    return [...MOODS]
      .sort((a, b) => stableMoodRank(a) - stableMoodRank(b))
      .slice(0, 6);
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
                fullWidth
                onPress={handleRefreshAI}
                disabled={!canAskAgain}
              />
              {!isPremium && (
                <Text style={styles.askLimitText}>
                  {tr.ai.askAgainRetriesLeft(askAgainUsesLeft)}
                </Text>
              )}
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
            randomMoods={randomMoods}
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
                    if (canAskAgain) handleMoodRefreshAI();
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
    askLimitText: {
      color: t.colors.textSecondary,
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
