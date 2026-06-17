import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef
} from "react";
import { View, Text, StyleSheet, BackHandler } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useDiveSession, useAchievements } from "@/stores";
import {
  ZoneBackground,
  UnderwaterCanvas,
  DiveProgressRing,
  DepthIndicator,
  GlassCard,
  GlowText,
  Sheet,
  PressableCard,
  ConfirmModal,
  AchievementModal,
  LevelUpModal,
  TitleAchievementModal,
  DiscoveryOverlay,
  useTheme,
  useThemedStyles,
  type AppTheme
} from "@/design-system";
import { useTranslations } from "@/core/i18n";
import { useDiveEventEngine } from "@/features/discovery";
import type { OceanZone } from "@/features/ocean/zones";
import type { TitleAchievement } from "@/features/diver/titleAchievements";
import { Pressable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

type DialogConfig = {
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  onConfirm: () => void;
};

type RewardItem =
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
  const queueBuiltRef = useRef(false);
  const navigateAfterQueueRef = useRef(false);
  const unlockZone = useAchievements((s) => s.unlockZone);
  const pendingLevelUp = useDiveSession((s) => s.pendingLevelUp);
  const pendingAchievements = useDiveSession((s) => s.pendingAchievements);
  const clearPendingRewards = useDiveSession((s) => s.clearPendingRewards);
  const tr = useTranslations();

  const liveDiscovery = useDiveEventEngine();

  useEffect(() => {
    if (!session) {
      const target = minutes ? parseInt(minutes, 10) : null;
      start(Number.isFinite(target) ? (target as number) : null);
    }
  }, []);

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
        setTimeout(() => setRewardQueue(queue), 0);
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [
    session?.status,
    pendingLevelUp,
    pendingAchievements,
    clearPendingRewards,
    router
  ]);

  useEffect(() => {
    if (navigateAfterQueueRef.current && rewardQueue.length === 0) {
      navigateAfterQueueRef.current = false;
      router.replace("/(tabs)");
    }
  }, [rewardQueue.length, router]);

  const progress = useMemo(() => {
    if (!session) return 0;
    if (!session.targetSeconds)
      return Math.min(1, session.elapsedSeconds / (60 * 60));
    return Math.min(1, session.elapsedSeconds / session.targetSeconds);
  }, [session]);

  const handleCancel = () => {
    setAbortOpen(true);
  };

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
          <DepthIndicator
            depthMeters={session.depthMeters}
            zone={session.zone}
            progress={progress}
          />
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
        onDismiss={() => setRewardQueue((q) => q.slice(1))}
      />
      <TitleAchievementModal
        visible={rewardQueue[0]?.type === "achievement"}
        achievement={
          rewardQueue[0]?.type === "achievement"
            ? rewardQueue[0].achievement
            : null
        }
        onDismiss={() => setRewardQueue((q) => q.slice(1))}
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
    topBlock: { alignItems: "center", gap: t.spacing[4] + 2 },
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
