import { useTranslations } from "@/core/i18n";
import {
  AchievementModal,
  ConfirmModal,
  DepthIndicator,
  DiscoveryOverlay,
  DiveProgressRing,
  GlassCard,
  GlowText,
  LevelUpModal,
  PressableCard,
  Sheet,
  TitleAchievementModal,
  UnderwaterCanvas,
  useTheme,
  useThemedStyles,
  ZoneBackground,
  type AppTheme
} from "@/design-system";
import { useDiveAudio } from "@/features/audio/useDiveAudio";
import { useDiveEventEngine } from "@/features/discovery";
import type { TitleAchievement } from "@/features/diver/titleAchievements";
import type { OceanZone } from "@/features/ocean/zones";
import { useAchievements, useDiveSession } from "@/stores";
import { decideDiveLaunch } from "./diveLaunchPolicy";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, StyleSheet, Switch, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type DialogConfig = {
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  onConfirm: () => void;
};

type RewardItem =
  | { type: "completion" }
  | { type: "levelUp"; from: number; to: number }
  | { type: "achievement"; achievement: TitleAchievement };

/**
 * DiveScreen — fullscreen, immersive, minimal chrome.
 * UI hierarchy: zone background → particle canvas → ring + indicator → controls.
 */
export default function DiveScreen() {
  const router = useRouter();
  const { minutes } = useLocalSearchParams<{ minutes?: string }>();
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const session = useDiveSession((s) => s.session);
  const lastEndReason = useDiveSession((s) => s.lastEndReason);
  const start = useDiveSession((s) => s.start);
  const pause = useDiveSession((s) => s.pause);
  const resume = useDiveSession((s) => s.resume);
  const end = useDiveSession((s) => s.end);
  const cancel = useDiveSession((s) => s.cancel);

  const [dialog, setDialog] = useState<DialogConfig | null>(null);
  const [abortOpen, setAbortOpen] = useState(false);
  const [achievedZone, setAchievedZone] = useState<OceanZone | null>(null);
  const [rewardQueue, setRewardQueue] = useState<RewardItem[]>([]);

  const prevZoneRef = useRef<OceanZone | null>(null);
  const launchCheckedRef = useRef(false);
  const queueBuiltRef = useRef(false);
  const rewardQueuePresentedRef = useRef(false);
  const navigateAfterQueueRef = useRef(false);
  const unlockZone = useAchievements((s) => s.unlockZone);
  const pendingLevelUp = useDiveSession((s) => s.pendingLevelUp);
  const pendingAchievements = useDiveSession((s) => s.pendingAchievements);
  const clearPendingRewards = useDiveSession((s) => s.clearPendingRewards);
  const tr = useTranslations();
  const {
    musicEnabled,
    setMusicEnabled,
    naturalCompletion,
    completionSoundFinished
  } = useDiveAudio(session, lastEndReason);

  const liveDiscovery = useDiveEventEngine();

  useEffect(() => {
    const decision = decideDiveLaunch(
      launchCheckedRef.current,
      session?.status
    );
    launchCheckedRef.current = decision.hasChecked;

    if (decision.shouldStart) {
      const target = minutes ? parseInt(minutes, 10) : null;
      start(Number.isFinite(target) ? (target as number) : null);
    }
  }, [minutes, session, start]);

  const confirmSurface = useCallback(() => {
    setDialog({
      title: tr.dive.surfaceTitle,
      message: tr.dive.surfaceMsg,
      cancelLabel: tr.dive.keepDiving,
      confirmLabel: tr.dive.surface,
      onConfirm: async () => {
        await end();
        // Navigation is handled by the useEffect that watches session status
      }
    });
  }, [tr, end]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (session?.status === "diving" || session?.status === "paused") {
        confirmSurface();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [session?.status, confirmSurface]);

  // Detect zone changes and show achievement on first-ever entry
  useEffect(() => {
    const currentZone = session?.zone ?? null;
    if (
      currentZone &&
      currentZone !== "surface" &&
      currentZone !== prevZoneRef.current
    ) {
      const isNew = unlockZone(currentZone);
      if (isNew) {
        const achievementTimer = setTimeout(
          () => setAchievedZone(currentZone),
          0
        );
        prevZoneRef.current = currentZone;
        return () => clearTimeout(achievementTimer);
      }
    }
    prevZoneRef.current = currentZone;
  }, [session?.zone, unlockZone]);

  // Build reward queue once session surfaces, then navigate after it's drained
  useEffect(() => {
    if (session?.status === "surfaced" && !queueBuiltRef.current) {
      queueBuiltRef.current = true;
      const queue: RewardItem[] = [];
      if (naturalCompletion) {
        queue.push({ type: "completion" });
      }
      if (pendingLevelUp) {
        queue.push({
          type: "levelUp",
          from: pendingLevelUp.from,
          to: pendingLevelUp.to
        });
      }
      for (const a of pendingAchievements) {
        queue.push({ type: "achievement", achievement: a });
      }
      clearPendingRewards();
      if (queue.length > 0) {
        navigateAfterQueueRef.current = true;
        setTimeout(() => {
          rewardQueuePresentedRef.current = true;
          setRewardQueue(queue);
        }, 0);
      } else if (!naturalCompletion || completionSoundFinished) {
        router.replace("/(tabs)");
      }
    }
  }, [
    session?.status,
    pendingLevelUp,
    pendingAchievements,
    clearPendingRewards,
    completionSoundFinished,
    naturalCompletion,
    router
  ]);

  useEffect(() => {
    if (
      session?.status === "surfaced" &&
      queueBuiltRef.current &&
      rewardQueue.length === 0 &&
      !navigateAfterQueueRef.current &&
      naturalCompletion &&
      completionSoundFinished
    ) {
      router.replace("/(tabs)");
    }
  }, [
    completionSoundFinished,
    naturalCompletion,
    rewardQueue.length,
    router,
    session?.status
  ]);

  useEffect(() => {
    if (
      navigateAfterQueueRef.current &&
      rewardQueuePresentedRef.current &&
      rewardQueue.length === 0 &&
      (!naturalCompletion || completionSoundFinished)
    ) {
      navigateAfterQueueRef.current = false;
      router.replace("/(tabs)");
    }
  }, [completionSoundFinished, naturalCompletion, rewardQueue.length, router]);

  const progress = useMemo(() => {
    if (!session) return 0;
    if (!session.targetSeconds)
      return Math.min(1, session.elapsedSeconds / (60 * 60));
    return Math.min(1, session.elapsedSeconds / session.targetSeconds);
  }, [session]);

  const handleCancel = () => {
    setAbortOpen(true);
  };

  const dismissReward = useCallback(() => {
    setRewardQueue((queue) => queue.slice(1));
  }, []);

  if (!session) {
    return <ZoneBackground zone="surface" />;
  }

  const isPaused = session.status === "paused";

  return (
    <ZoneBackground
      zone={
        "midnight" /* Always show midnight zone in the background for better contrast */
      }
    >
      <UnderwaterCanvas zone={"midnight"} particleCount={12} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBlock}>
          <View style={styles.zoneRow}>
            <DepthIndicator
              depthMeters={session.depthMeters}
              zone={session.zone}
              progress={progress}
            />
            <View style={styles.musicToggle}>
              <Switch
                value={musicEnabled}
                onValueChange={setMusicEnabled}
                trackColor={{
                  false: t.colors.glass,
                  true: t.colors.accent
                }}
                thumbColor={t.colors.text}
                ios_backgroundColor={t.colors.glass}
                style={styles.musicSwitch}
              />
            </View>
          </View>
          {session.discoveries.length > 0 && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <GlowText size={13} shadow={false} color={t.colors.accentSoft}>
                {tr.dive.discoveries(session.discoveries.length)}
              </GlowText>
            </Animated.View>
          )}
          <DiscoveryOverlay
            discovery={liveDiscovery.current}
            pending={liveDiscovery.pending}
            onDismiss={liveDiscovery.dismiss}
          />
        </View>

        <View style={styles.ringWrap}>
          <DiveProgressRing
            progress={progress}
            elapsedSeconds={session.elapsedSeconds}
            size={280}
          />
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={isPaused ? resume : pause}
            style={styles.primaryBtn}
            accessibilityRole="button"
            accessibilityLabel={isPaused ? tr.dive.resumeDive : tr.dive.pause}
          >
            <GlassCard glow={isPaused}>
              <Text style={styles.primaryText}>
                {isPaused ? tr.dive.resumeDive : tr.dive.pause}
              </Text>
            </GlassCard>
          </Pressable>
          <View style={styles.row}>
            <Pressable
              onPress={confirmSurface}
              style={styles.flex}
              accessibilityRole="button"
              accessibilityLabel={tr.dive.surface}
            >
              <GlassCard>
                <Text style={styles.secondaryText}>{tr.dive.surface}</Text>
              </GlassCard>
            </Pressable>
            <Pressable
              onPress={handleCancel}
              style={styles.flex}
              accessibilityRole="button"
              accessibilityLabel={tr.dive.abort}
            >
              <GlassCard>
                <Text
                  style={[styles.secondaryText, { color: t.colors.danger }]}
                >
                  {tr.dive.abort}
                </Text>
              </GlassCard>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <Sheet visible={dialog !== null} onDismiss={() => setDialog(null)}>
        <View style={styles.dialogContent}>
          <GlowText size={20}>{dialog?.title}</GlowText>
          <Text style={styles.dialogMessage}>{dialog?.message}</Text>
          <View style={styles.dialogActions}>
            <PressableCard
              haptic="light"
              onPress={() => setDialog(null)}
              containerStyle={styles.flex}
              radius={t.radii.md}
            >
              <Text style={styles.dialogCancel}>{dialog?.cancelLabel}</Text>
            </PressableCard>
            <PressableCard
              haptic="medium"
              onPress={() => {
                const cfg = dialog;
                setDialog(null);
                cfg?.onConfirm();
              }}
              containerStyle={styles.flex}
              radius={t.radii.md}
              glow
            >
              <Text style={styles.dialogConfirm}>{dialog?.confirmLabel}</Text>
            </PressableCard>
          </View>
        </View>
      </Sheet>

      <ConfirmModal
        visible={rewardQueue[0]?.type === "completion"}
        onDismiss={dismissReward}
        title={tr.dive.completeTitle}
        message={tr.dive.completeMsg}
        cancelLabel={tr.dive.completeCta}
        confirmLabel={tr.dive.completeCta}
        tone="default"
        icon="checkmark-circle"
        showCancel={false}
        onConfirm={dismissReward}
      />

      <ConfirmModal
        visible={abortOpen}
        onDismiss={() => setAbortOpen(false)}
        title={tr.dive.abortTitle}
        message={tr.dive.abortMsg}
        cancelLabel={tr.dive.continue}
        confirmLabel={tr.dive.abort}
        tone="danger"
        icon="warning"
        onConfirm={() => {
          setAbortOpen(false);
          cancel();
          router.replace("/(tabs)");
        }}
      />

      <AchievementModal
        visible={achievedZone !== null}
        zone={achievedZone!}
        onDismiss={() => setAchievedZone(null)}
      />

      {/* Post-dive reward queue: level-up first, then title achievements */}
      <LevelUpModal
        visible={rewardQueue[0]?.type === "levelUp"}
        prevLevel={rewardQueue[0]?.type === "levelUp" ? rewardQueue[0].from : 1}
        newLevel={rewardQueue[0]?.type === "levelUp" ? rewardQueue[0].to : 2}
        onDismiss={dismissReward}
      />
      <TitleAchievementModal
        visible={rewardQueue[0]?.type === "achievement"}
        achievement={
          rewardQueue[0]?.type === "achievement"
            ? rewardQueue[0].achievement
            : null
        }
        onDismiss={dismissReward}
      />
    </ZoneBackground>
  );
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    safe: {
      flex: 1,
      justifyContent: "space-between",
      padding: t.spacing[4]
    },
    topBlock: { alignItems: "center", gap: t.spacing[3] },
    zoneRow: {
      position: "relative",
      width: "100%",
      alignItems: "center",
      justifyContent: "center"
    },
    musicToggle: {
      position: "absolute",
      right: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[1.5],
      minHeight: 30,
      paddingLeft: t.spacing[3],
      paddingRight: t.spacing[1]
    },
    musicSwitch: {
      transform: [{ scale: 0.8 }],
      marginHorizontal: -7
    },
    ringWrap: { alignItems: "center" },
    actions: { gap: t.spacing[3] + 2 },
    row: { flexDirection: "row", gap: t.spacing[3] },
    primaryBtn: { width: "100%" },
    primaryText: {
      color: t.colors.text,
      textAlign: "center",
      letterSpacing: 1,
      fontSize: 14,
      paddingVertical: 4,
      fontFamily: t.fonts.label
    },
    secondaryText: {
      color: t.colors.textSecondary,
      textAlign: "center",
      letterSpacing: 1,
      fontSize: 12,
      paddingVertical: 2,
      fontFamily: t.fonts.label
    },
    dialogContent: { gap: t.spacing[3], alignItems: "center" },
    dialogMessage: {
      color: t.colors.textSecondary,
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
      fontFamily: t.fonts.body
    },
    dialogActions: {
      flexDirection: "row",
      gap: t.spacing[3],
      marginTop: t.spacing[3],
      width: "100%"
    },
    dialogCancel: {
      color: t.colors.text,
      fontFamily: t.fonts.label,
      letterSpacing: 1,
      fontSize: 12,
      textAlign: "center",
      paddingVertical: 4
    },
    dialogConfirm: {
      color: t.colors.text,
      fontFamily: t.fonts.label,
      letterSpacing: 1,
      fontSize: 12,
      textAlign: "center",
      paddingVertical: 4
    }
  });
