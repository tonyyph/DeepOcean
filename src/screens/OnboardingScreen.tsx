import { useTranslations } from "@/core/i18n";
import {
  ActionButton,
  GlassCard,
  GlowText,
  ScreenScrollView,
  SectionLabel,
  Skeleton,
  UnderwaterCanvas,
  useTheme,
  useThemedStyles,
  ZoneBackground,
  type AppTheme
} from "@/design-system";
import type {
  GoalId,
  RecommendedItem,
  RecommendedWorkflow
} from "@/domain/entities";
import { GOAL_IDS, usePersonalizedRecommendation } from "@/features/onboarding";
import { usePersonalization } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";

const FLOW_STEPS = [
  "welcome",
  "goals",
  "plan",
  "workflow",
  "complete"
] as const;

const GOAL_ICONS: Record<GoalId, keyof typeof Ionicons.glyphMap> = {
  improve_focus: "locate",
  build_consistency: "repeat",
  reduce_stress: "leaf",
  learn_better: "school",
  track_progress: "stats-chart",
  build_daily_routine: "calendar",
  stay_motivated: "flame",
  improve_productivity: "rocket"
};

const WORKFLOW_ICONS: Record<
  RecommendedWorkflow["id"],
  keyof typeof Ionicons.glyphMap
> = {
  daily_focus: "sunny",
  deep_work: "diamond",
  recovery: "leaf",
  learning: "library",
  habit_building: "repeat"
};

export default function OnboardingScreen() {
  const router = useRouter();
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();
  const persistedGoals = usePersonalization((s) => s.selectedGoals);
  const persistedWorkflow = usePersonalization((s) => s.selectedWorkflow);
  const setGoals = usePersonalization((s) => s.setGoals);
  const setWorkflow = usePersonalization((s) => s.setWorkflow);
  const setSelectedRecommendedItems = usePersonalization(
    (s) => s.setSelectedRecommendedItems
  );
  const completeOnboarding = usePersonalization((s) => s.completeOnboarding);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<GoalId[]>(
    persistedGoals.length > 0 ? persistedGoals : []
  );
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [workflowId, setWorkflowId] = useState<
    RecommendedWorkflow["id"] | null
  >(persistedWorkflow);
  const { recommendation, status, error, retry } =
    usePersonalizedRecommendation(selectedGoals);
  const currentStep = FLOW_STEPS[stepIndex]!;
  const workflowOptions = useMemo(
    () => buildWorkflowOptions(recommendation?.recommendedWorkflow, tr),
    [recommendation?.recommendedWorkflow, tr]
  );

  useEffect(() => {
    setGoals(selectedGoals);
  }, [selectedGoals, setGoals]);

  useEffect(() => {
    setSelectedRecommendedItems(selectedItems);
  }, [selectedItems, setSelectedRecommendedItems]);

  const applyRecommendationDefaults = useCallback(
    (nextRecommendation: NonNullable<typeof recommendation>) => {
      const ids = nextRecommendation.recommendedItems
        .slice(0, 2)
        .map((item) => item.id);
      setSelectedItems((current) => (current.length > 0 ? current : ids));
      setWorkflowId(
        (current) => current ?? nextRecommendation.recommendedWorkflow.id
      );
    },
    []
  );

  const toggleGoal = useCallback((goal: GoalId) => {
    Haptics.selectionAsync();
    setSelectedGoals((current) =>
      current.includes(goal)
        ? current.filter((item) => item !== goal)
        : [...current, goal].slice(0, 6)
    );
  }, []);

  const toggleItem = useCallback((item: RecommendedItem) => {
    Haptics.selectionAsync();
    setSelectedItems((current) =>
      current.includes(item.id)
        ? current.filter((id) => id !== item.id)
        : [...current, item.id]
    );
  }, []);

  const chooseWorkflow = useCallback(
    (id: RecommendedWorkflow["id"]) => {
      Haptics.selectionAsync();
      setWorkflowId(id);
      setWorkflow(id);
    },
    [setWorkflow]
  );

  const goNext = useCallback(() => {
    if (currentStep === "goals" && selectedGoals.length === 0) return;
    if (currentStep === "workflow" && workflowId) setWorkflow(workflowId);
    setStepIndex((value) => Math.min(FLOW_STEPS.length - 1, value + 1));
    if (currentStep === "goals") {
      void retry().then(applyRecommendationDefaults);
    }
  }, [
    applyRecommendationDefaults,
    currentStep,
    retry,
    selectedGoals.length,
    setWorkflow,
    workflowId
  ]);

  const goBack = useCallback(() => {
    setStepIndex((value) => Math.max(0, value - 1));
  }, []);

  const finish = useCallback(() => {
    if (workflowId) setWorkflow(workflowId);
    completeOnboarding();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)");
  }, [completeOnboarding, router, setWorkflow, workflowId]);

  return (
    <ZoneBackground zone={currentStep === "complete" ? "trench" : "twilight"}>
      <UnderwaterCanvas
        zone={currentStep === "welcome" ? "surface" : "midnight"}
        particleCount={30}
      />
      <View style={styles.container}>
        <View style={styles.progressRow}>
          {FLOW_STEPS.map((step, index) => (
            <View
              key={step}
              style={[
                styles.progressDot,
                index <= stepIndex && styles.progressDotActive
              ]}
            />
          ))}
        </View>
        {currentStep === "complete" && (
          <Pressable
            onPress={goBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={tr.sessionDetail.back}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color={t.colors.text} />
          </Pressable>
        )}
        <ScreenScrollView>
          <MotiView
            key={currentStep}
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 280 }}
            style={[
              styles.content,
              currentStep === "welcome" && { justifyContent: "center" }
            ]}
          >
            {currentStep === "welcome" && (
              <WelcomeStep
                title={tr.onboarding.welcomeTitle}
                body={tr.onboarding.welcomeBody}
              />
            )}

            {currentStep === "goals" && (
              <View style={styles.stack}>
                <StepHeader
                  eyebrow={tr.onboarding.goalEyebrow}
                  title={tr.onboarding.goalTitle}
                  body={tr.onboarding.goalBody}
                />
                <View style={styles.goalGrid}>
                  {GOAL_IDS.map((goal) => (
                    <GoalCard
                      key={goal}
                      id={goal}
                      active={selectedGoals.includes(goal)}
                      label={tr.onboarding.goalOptions[goal]}
                      icon={GOAL_ICONS[goal]}
                      onPress={() => toggleGoal(goal)}
                    />
                  ))}
                </View>
                {selectedGoals.length === 0 && (
                  <Text style={styles.validationText}>
                    {tr.onboarding.goalValidation}
                  </Text>
                )}
              </View>
            )}

            {currentStep === "plan" && (
              <View style={styles.stack}>
                <StepHeader
                  eyebrow={tr.onboarding.planEyebrow}
                  title={tr.onboarding.planTitle}
                  body={tr.onboarding.planBody}
                />
                {status === "loading" && <RecommendationSkeleton />}
                {recommendation && status !== "loading" && (
                  <View style={styles.stack}>
                    <GlassCard radius={t.radii.md} padding={t.spacing[4]} glow>
                      <SectionLabel>
                        {tr.onboarding.recommendationReason}
                      </SectionLabel>
                      <Text style={styles.bodyText}>
                        {recommendation.shortExplanation}
                      </Text>
                    </GlassCard>
                    {error && (
                      <Text style={styles.fallbackText}>
                        {tr.onboarding.recommendationFallback}
                      </Text>
                    )}
                    {recommendation.recommendedItems.map((item) => (
                      <RecommendationItem
                        key={item.id}
                        item={item}
                        active={selectedItems.includes(item.id)}
                        onPress={() => toggleItem(item)}
                      />
                    ))}
                  </View>
                )}
                {!recommendation && status !== "loading" && (
                  <ActionButton
                    label={tr.onboarding.retryRecommendation}
                    icon="refresh"
                    tone="secondary"
                    onPress={() => {
                      void retry().then(applyRecommendationDefaults);
                    }}
                  />
                )}
              </View>
            )}

            {currentStep === "workflow" && (
              <View style={styles.stack}>
                <StepHeader
                  eyebrow={tr.onboarding.workflowEyebrow}
                  title={tr.onboarding.workflowTitle}
                  body={tr.onboarding.workflowBody}
                />
                {workflowOptions.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    active={workflowId === workflow.id}
                    icon={WORKFLOW_ICONS[workflow.id]}
                    onPress={() => chooseWorkflow(workflow.id)}
                  />
                ))}
              </View>
            )}

            {currentStep === "complete" && (
              <View style={styles.stack}>
                <StepHeader
                  eyebrow={tr.onboarding.completeEyebrow}
                  title={tr.onboarding.completeTitle}
                  body={tr.onboarding.completeBody}
                />
                <GlassCard radius={t.radii.md} padding={t.spacing[4]} glow>
                  <SectionLabel>{tr.onboarding.summaryTitle}</SectionLabel>
                  <Text style={styles.bodyText}>
                    {selectedGoals
                      .map((goal) => tr.onboarding.goalOptions[goal])
                      .join(" · ")}
                  </Text>
                  <View style={styles.summaryDivider} />
                  <Text style={styles.workflowTitle}>
                    {workflowOptions.find((item) => item.id === workflowId)
                      ?.title ??
                      recommendation?.recommendedWorkflow.title ??
                      tr.onboarding.defaultWorkflowTitle}
                  </Text>
                </GlassCard>
              </View>
            )}
          </MotiView>
        </ScreenScrollView>

        <View style={styles.footer}>
          {stepIndex > 0 && currentStep !== "complete" && (
            <ActionButton
              label={tr.onboarding.back}
              tone="secondary"
              size="md"
              onPress={goBack}
              containerStyle={styles.footerButton}
            />
          )}
          {currentStep === "complete" ? (
            <ActionButton
              label={tr.onboarding.startPersonalized}
              icon="water-sharp"
              tone="primary"
              size="md"
              onPress={finish}
              containerStyle={styles.footerButton}
            />
          ) : (
            <ActionButton
              label={tr.onboarding.next}
              tone="premium"
              size="md"
              disabled={currentStep === "goals" && selectedGoals.length === 0}
              onPress={goNext}
              containerStyle={styles.footerButton}
            />
          )}
        </View>
      </View>
    </ZoneBackground>
  );
}

function WelcomeStep({ title, body }: { title: string; body: string }) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.welcome}>
      <Image
        source={require("../../assets/images/logo.png")}
        resizeMode="cover"
        style={styles.orb}
      />
      <GlowText size={46} color={t.colors.text} style={styles.centerText}>
        {title}
      </GlowText>
      <Text style={styles.welcomeBody}>{body}</Text>
    </View>
  );
}

function StepHeader({
  eyebrow,
  title,
  body
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.stepHeader}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepBody}>{body}</Text>
    </View>
  );
}

function GoalCard({
  label,
  icon,
  active,
  onPress
}: {
  id: GoalId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.goalCard,
        active && styles.goalCardActive,
        pressed && styles.pressed
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={active ? t.colors.accent : t.colors.textSecondary}
      />
      <Text style={[styles.goalLabel, active && styles.goalLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function RecommendationItem({
  item,
  active,
  onPress
}: {
  item: RecommendedItem;
  active: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.recommendationCard,
        active && styles.recommendationCardActive,
        pressed && styles.pressed
      ]}
    >
      <View style={styles.cardIcon}>
        <Ionicons
          name={active ? "checkmark" : item.isPremium ? "diamond" : "sparkles"}
          size={16}
          color={item.isPremium ? t.colors.premium : t.colors.accent}
        />
      </View>
      <View style={styles.flex}>
        <Text style={styles.workflowTitle}>{item.title}</Text>
        <Text style={styles.bodyText}>{item.description}</Text>
        <Text style={styles.reasonText}>{item.reason}</Text>
      </View>
    </Pressable>
  );
}

function WorkflowCard({
  workflow,
  active,
  icon,
  onPress
}: {
  workflow: RecommendedWorkflow;
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.workflowCard,
        active && styles.workflowCardActive,
        pressed && styles.pressed
      ]}
    >
      <View style={styles.cardIcon}>
        <Ionicons
          name={icon}
          size={18}
          color={workflow.isPremium ? t.colors.premium : t.colors.accent}
        />
      </View>
      <View style={styles.flex}>
        <Text style={styles.workflowTitle}>{workflow.title}</Text>
        <Text style={styles.bodyText}>{workflow.description}</Text>
        <Text style={styles.reasonText}>{workflow.steps.join(" · ")}</Text>
      </View>
      {active && (
        <Ionicons name="checkmark-circle" size={20} color={t.colors.accent} />
      )}
    </Pressable>
  );
}

function RecommendationSkeleton() {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.stack}>
      <Skeleton style={styles.skeletonHero} />
      <Skeleton style={styles.skeletonLine} />
      <Skeleton style={styles.skeletonLineShort} />
    </View>
  );
}

function buildWorkflowOptions(
  recommended: RecommendedWorkflow | undefined,
  tr: ReturnType<typeof useTranslations>
): RecommendedWorkflow[] {
  const defaults = tr.onboarding.workflowOptions;
  const options: RecommendedWorkflow[] = [
    recommended,
    defaults.daily_focus,
    defaults.deep_work,
    defaults.recovery,
    defaults.learning,
    defaults.habit_building
  ].filter(Boolean) as RecommendedWorkflow[];
  return Array.from(new Map(options.map((item) => [item.id, item])).values());
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    backBtn: {
      width: 44,
      minHeight: 44,
      borderRadius: t.radii.lg,
      backgroundColor: t.colors.panelStrong,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: t.spacing[4]
    },
    container: {
      flex: 1,
      paddingTop: t.spacing[12]
    },
    content: {
      minHeight: 520,
      gap: t.spacing[5]
    },
    stack: {
      gap: t.spacing[3]
    },
    progressRow: {
      flexDirection: "row",
      gap: t.spacing[2],
      alignSelf: "center",
      marginVertical: t.spacing[5]
    },
    progressDot: {
      width: 28,
      height: 4,
      borderRadius: t.radii.pill,
      backgroundColor: t.colors.panelStrong
    },
    progressDotActive: {
      backgroundColor: t.colors.accent
    },
    welcome: {
      alignItems: "center",
      justifyContent: "center",
      gap: t.spacing[5],
      paddingVertical: t.spacing[10]
    },
    orb: {
      width: 120,
      height: 120,
      borderRadius: 60
    },
    centerText: { textAlign: "center" },
    welcomeBody: {
      color: t.colors.textSecondary,
      fontFamily: t.fonts.body,
      fontSize: 17,
      lineHeight: 26,
      textAlign: "center"
    },
    stepHeader: {
      gap: t.spacing[2],
      marginBottom: t.spacing[1]
    },
    eyebrow: {
      color: t.colors.accent,
      fontFamily: t.fonts.label,
      fontSize: 11,
      letterSpacing: 1
    },
    stepTitle: {
      color: t.colors.text,
      fontFamily: t.fonts.display,
      fontSize: 31,
      lineHeight: 37,
      letterSpacing: t.fonts.displayLetterSpacing
    },
    stepBody: {
      color: t.colors.textSecondary,
      fontFamily: t.fonts.body,
      fontSize: 15,
      lineHeight: 22
    },
    goalGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: t.spacing[2]
    },
    goalCard: {
      width: "48%",
      minHeight: 88,
      borderRadius: t.radii.md,
      padding: t.spacing[3],
      gap: t.spacing[2],
      justifyContent: "space-between",
      backgroundColor: t.colors.panelStrong,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge
    },
    goalCardActive: {
      borderColor: t.colors.accent,
      backgroundColor: t.colors.glass
    },
    goalLabel: {
      color: t.colors.textSecondary,
      fontFamily: t.fonts.body,
      fontSize: 13,
      lineHeight: 17
    },
    goalLabelActive: {
      color: t.colors.text
    },
    validationText: {
      color: t.colors.warning,
      fontFamily: t.fonts.body,
      fontSize: 12
    },
    recommendationCard: {
      flexDirection: "row",
      gap: t.spacing[3],
      padding: t.spacing[4],
      borderRadius: t.radii.md,
      backgroundColor: t.colors.panelStrong,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge
    },
    recommendationCardActive: {
      borderColor: t.colors.accent
    },
    workflowCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[3],
      padding: t.spacing[4],
      borderRadius: t.radii.md,
      backgroundColor: t.colors.panelStrong,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge
    },
    workflowCardActive: {
      borderColor: t.colors.accent,
      backgroundColor: t.colors.glass
    },
    cardIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.colors.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge
    },
    workflowTitle: {
      color: t.colors.text,
      fontFamily: t.fonts.label,
      fontSize: 14,
      lineHeight: 18
    },
    bodyText: {
      color: t.colors.textSecondary,
      fontFamily: t.fonts.body,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 2
    },
    reasonText: {
      color: t.colors.textMuted,
      fontFamily: t.fonts.body,
      fontSize: 12,
      lineHeight: 17,
      marginTop: t.spacing[1]
    },
    fallbackText: {
      color: t.colors.warning,
      fontFamily: t.fonts.body,
      fontSize: 12,
      lineHeight: 17
    },
    summaryDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: t.colors.panelEdge,
      marginVertical: t.spacing[3]
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: t.spacing[3],
      paddingTop: t.spacing[2],
      paddingHorizontal: t.spacing[5],
      paddingBottom: t.spacing[8]
    },
    footerButton: {
      flex: 1,
      minWidth: 0
    },
    pressed: {
      opacity: 0.78,
      transform: [{ scale: 0.99 }]
    },
    skeletonHero: {
      height: 106,
      borderRadius: t.radii.md
    },
    skeletonLine: {
      height: 64,
      borderRadius: t.radii.md
    },
    skeletonLineShort: {
      width: "72%",
      height: 64,
      borderRadius: t.radii.md
    }
  });
