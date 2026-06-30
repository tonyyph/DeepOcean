import { useTranslations } from "@/core/i18n";
import { useScreenTransitionLoading } from "@/core/navigation/screenTransitionLoading";
import { container } from "@/data/container";
import {
  ActionButton,
  AppHeader,
  EntranceView,
  GlassCard,
  GuidanceCard,
  OptionPill,
  ScreenSafeAreaView,
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
import { useSettings } from "@/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { DeepInsights } from "./ai/DeepInsights";

function stableMoodRank(mood: string): number {
  let hash = 0;
  for (let i = 0; i < mood.length; i++) {
    hash = (hash * 31 + mood.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// MOODS is static — sort once at module level so every component instance
// shares the same stable array rather than recomputing inside useMemo([]).
const STABLE_RANDOM_MOODS = [...MOODS]
  .sort((a, b) => stableMoodRank(a) - stableMoodRank(b))
  .slice(0, 6);

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
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const manualRefreshingRef = useRef(false);
  const mountedRef = useRef(true);
  const tr = useTranslations();
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

  const aiRefreshInFlight =
    isFetching || motivationFetching || manualRefreshing;
  const canAskAgain = !aiRefreshInFlight;

  const runAIRefresh = useCallback(
    () => {
      if (manualRefreshingRef.current || aiRefreshInFlight) return;

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
      language,
      queryClient,
      tr.ai.refreshError
    ]
  );
  const handleRefreshAI = useCallback(() => {
    runAIRefresh();
  }, [runAIRefresh]);
  const handleMoodRefreshAI = useCallback(() => {
    runAIRefresh();
  }, [runAIRefresh]);

  const randomMoods = STABLE_RANDOM_MOODS;

  return (
    <ZoneBackground zone="midnight">
      <UnderwaterCanvas
        zone={lastSession?.zone ?? "midnight"}
        particleCount={32}
      />
      <ScreenSafeAreaView style={styles.flex}>
        <ScreenScrollView>
          <EntranceView index={0}>
            <AppHeader title={tr.ai.title} subtitle={tr.ai.subtitle} size={28} />
          </EntranceView>
          {sessions.length === 0 && (
            <EntranceView index={1}>
              <GuidanceCard
                storageKey="guidance.ai.first"
                title={tr.guidance.ai.title}
                body={tr.guidance.ai.body}
                dismissLabel={tr.common.dismiss}
                icon="sparkles-outline"
              />
            </EntranceView>
          )}

          <EntranceView index={2}>
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
                {refreshError != null && (
                  <Text style={styles.refreshErrorText}>{refreshError}</Text>
                )}
              </View>
            </GlassCard>
          </EntranceView>

          {motivationLoading ? (
            <EntranceView index={3}>
              <AiCardSkeleton />
            </EntranceView>
          ) : (
            motivation && (
              <EntranceView index={3}>
                <GlassCard radius={t.radii.md}>
                  <SectionLabel>{tr.ai.nudge}</SectionLabel>
                  <Text style={styles.nudge}>{motivation}</Text>
                </GlassCard>
              </EntranceView>
            )
          )}

          {summaryLoading ? (
            <EntranceView index={4}>
              <AiCardSkeleton />
            </EntranceView>
          ) : (
            lastSummary && (
              <EntranceView index={4}>
                <GlassCard radius={t.radii.md}>
                  <SectionLabel>{tr.ai.lastExpedition}</SectionLabel>
                  <Text style={styles.body}>{lastSummary}</Text>
                </GlassCard>
              </EntranceView>
            )
          )}

          <EntranceView index={5}>
            <DeepInsights
              theme={t}
              tr={tr}
              selectedMood={selectedMood}
              randomMoods={randomMoods}
            />
          </EntranceView>

          <EntranceView index={6}>
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
          </EntranceView>
        </ScreenScrollView>
      </ScreenSafeAreaView>

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
