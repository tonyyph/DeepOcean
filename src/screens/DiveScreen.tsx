import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, BackHandler } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useDiveSession } from "@/stores";
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
  useTheme,
  useThemedStyles,
  type AppTheme
} from "@/design-system";
import { useTranslations } from "@/core/i18n";

type DialogConfig = {
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  onConfirm: () => void;
};

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
  const tr = useTranslations();

  useEffect(() => {
    if (!session) {
      const target = minutes ? parseInt(minutes, 10) : null;
      start(Number.isFinite(target) ? (target as number) : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmSurface = useCallback(() => {
    setDialog({
      title: tr.dive.surfaceTitle,
      message: tr.dive.surfaceMsg,
      cancelLabel: tr.dive.keepDiving,
      confirmLabel: tr.dive.surface,
      onConfirm: async () => {
        await end();
        router.replace("/(tabs)");
      }
    });
  }, [tr, end, router]);

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

  const progress = useMemo(() => {
    if (!session) return 0;
    if (!session.targetSeconds)
      return Math.min(1, session.elapsedSeconds / (60 * 60));
    return session.elapsedSeconds / session.targetSeconds;
  }, [session]);

  const handleCancel = () => {
    setAbortOpen(true);
  };

  if (!session) {
    return <ZoneBackground zone="surface">{null}</ZoneBackground>;
  }

  const isPaused = session.status === "paused";

  return (
    <ZoneBackground zone={session.zone}>
      <UnderwaterCanvas zone={session.zone} particleCount={32} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBlock}>
          <DepthIndicator
            depthMeters={session.depthMeters}
            zone={session.zone}
          />
          {session.discoveries.length > 0 ? (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <GlowText size={13} color={t.colors.accentSoft}>
                {tr.dive.discoveries(session.discoveries.length)}
              </GlowText>
            </Animated.View>
          ) : null}
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
          >
            <GlassCard glow={isPaused}>
              <Text style={styles.primaryText}>
                {isPaused ? tr.dive.resumeDive : tr.dive.pause}
              </Text>
            </GlassCard>
          </Pressable>
          <View style={styles.row}>
            <Pressable onPress={confirmSurface} style={styles.flex}>
              <GlassCard>
                <Text style={styles.secondaryText}>{tr.dive.surface}</Text>
              </GlassCard>
            </Pressable>
            <Pressable onPress={handleCancel} style={styles.flex}>
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
    </ZoneBackground>
  );
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    safe: {
      flex: 1,
      justifyContent: "space-between",
      padding: t.spacing[6]
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
