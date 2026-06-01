import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing
} from "react-native-reanimated";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import {
  ZoneBackground,
  UnderwaterCanvas,
  GlassCard,
  PressableCard,
  AppHeader,
  SectionLabel,
  SettingRow,
  OptionPill,
  PremiumBadge,
  ThemePickerSheet,
  LanguagePickerSheet,
  PaywallSheet,
  LevelUpModal,
  TitleAchievementModal,
  useTheme,
  useThemedStyles,
  THEMES,
  type AppTheme,
  type ThemeId
} from "@/design-system";
import {
  useDiverProfile,
  useUpdateDiver,
  computeLevelUp,
  xpForNextLevel,
  checkNewAchievements
} from "@/features/diver";
import {
  useSettings,
  useThemeStore,
  usePremium,
  useAchievements
} from "@/stores";
import { container } from "@/data/container";
import { storage, StorageKeys } from "@/core/storage/mmkv";
import { useTranslations, type Language } from "@/core/i18n";
import type { TitleAchievement } from "@/features/diver/titleAchievements";

const PREFERRED_OPTIONS = [15, 25, 45, 60] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();

  const { data: profile } = useDiverProfile();
  const { mutate: updateDiver } = useUpdateDiver();
  const settings = useSettings();
  const themeId = useThemeStore((s) => s.themeId);
  const isPremium = usePremium((s) => s.isPremium);
  const alreadyUnlocked = useAchievements((s) => s.unlockedTitleAchievements);
  const persistTitleAchievements = useAchievements(
    (s) => s.persistTitleAchievements
  );

  const [langOpen, setLangOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [intentTheme, setIntentTheme] = useState<ThemeId | undefined>(
    undefined
  );

  // ─── Level-up reward queue ────────────────────────────────────────────────
  type RewardItem =
    | { type: "levelUp"; from: number; to: number }
    | { type: "achievement"; achievement: TitleAchievement };

  const [rewardQueue, setRewardQueue] = useState<RewardItem[]>([]);
  const overflowChecked = useRef(false);

  // Detect XP overflow on profile load and auto-correct + show modal
  useEffect(() => {
    if (!profile || overflowChecked.current) return;
    overflowChecked.current = true;

    const threshold = xpForNextLevel(profile.level);
    if (profile.xp < threshold) return; // nothing to do

    const {
      level: newLevel,
      xp: newXp,
      levelsGained
    } = computeLevelUp(profile.level, profile.xp, 0);

    // Persist corrected level immediately
    updateDiver({ level: newLevel, xp: newXp });

    // Also check if any achievements were just unlocked by the new level
    const updatedProfile = { ...profile, level: newLevel, xp: newXp };
    const collectionItems = container.collection
      ? (() => {
          try {
            return (container as any).collection?.allSync?.() ?? [];
          } catch {
            return [];
          }
        })()
      : [];

    const newAchievements = checkNewAchievements(
      updatedProfile,
      { collectionCount: collectionItems.length },
      alreadyUnlocked
    );
    if (newAchievements.length > 0) {
      persistTitleAchievements(newAchievements);
    }

    // Build reward queue
    const queue: RewardItem[] = [];
    if (levelsGained > 0) {
      queue.push({ type: "levelUp", from: profile.level, to: newLevel });
    }
    newAchievements.forEach((a) =>
      queue.push({ type: "achievement", achievement: a })
    );
    if (queue.length > 0) setRewardQueue(queue);
  }, [profile, alreadyUnlocked, persistTitleAchievements, updateDiver]);

  const dismissReward = useCallback(() => {
    setRewardQueue((q) => q.slice(1));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────

  const nextLevelXp = xpForNextLevel(profile?.level ?? 1);
  const progress = profile ? Math.min(1, profile.xp / nextLevelXp) : 0;

  const currentLangLabel =
    settings.language === "vi" ? "Tiếng Việt" : "English";
  const activeTheme = THEMES[themeId];

  const openPaywall = useCallback((target?: ThemeId) => {
    setIntentTheme(target);
    setThemeOpen(false);
    setTimeout(() => setPaywallOpen(true), 250); // let sheet finish dismissing
  }, []);

  const xpWidth = useSharedValue(0);
  useEffect(() => {
    xpWidth.value = withTiming(progress, {
      duration: 900,
      easing: Easing.bezier(0.16, 1, 0.3, 1)
    });
  }, [progress, xpWidth]);
  const xpStyle = useAnimatedStyle(() => ({
    width: `${xpWidth.value * 100}%`
  }));

  return (
    <ZoneBackground zone="trench">
      <UnderwaterCanvas zone="trench" />
      <SafeAreaView style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <AppHeader
            eyebrow={tr.profile.title}
            title={profile?.name ?? tr.home.diver}
            subtitle={tr.profile.level(profile?.level ?? 1)}
            size={34}
          />

          {/* XP Card */}
          <GlassCard radius={t.radii.md} padding={t.spacing[5]}>
            <SectionLabel hint={`${profile?.xp ?? 0} / ${nextLevelXp}`}>
              {tr.profile.xp}
            </SectionLabel>
            <View style={styles.xpTrack}>
              <Animated.View style={[styles.xpFill, xpStyle]}>
                <LinearGradient
                  colors={[t.colors.accentSoft, t.colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
          </GlassCard>

          {/* Premium */}
          <PremiumSection
            isPremium={isPremium}
            onOpenPaywall={() => openPaywall(undefined)}
          />

          {/* Appearance */}
          <GlassCard radius={t.radii.md} padding={t.spacing[5]}>
            <SectionLabel>{tr.profile.appearance}</SectionLabel>
            <SettingRow
              type="nav"
              title={tr.profile.theme}
              subtitle={tr.profile.themeDesc}
              value={activeTheme.name}
              onPress={() => setThemeOpen(true)}
              badge={activeTheme.premium ? <PremiumBadge /> : null}
            />
            <SettingRow
              type="nav"
              title={tr.profile.language}
              subtitle={tr.profile.languageDesc}
              value={currentLangLabel}
              onPress={() => setLangOpen(true)}
            />
            <SettingRow
              type="switch"
              title={tr.profile.reducedMotion}
              subtitle={tr.profile.reducedMotionDesc}
              value={settings.reducedMotion}
              onChange={(v) => settings.update({ reducedMotion: v })}
              divider={false}
            />
          </GlassCard>

          {/* Dive */}
          <GlassCard radius={t.radii.md} padding={t.spacing[5]}>
            <SectionLabel>{tr.profile.settings}</SectionLabel>
            <SettingRow
              type="switch"
              title={tr.profile.haptics}
              subtitle={tr.profile.hapticsDesc}
              value={settings.hapticsEnabled}
              onChange={(v) => settings.update({ hapticsEnabled: v })}
            />
            <View style={styles.preferredBlock}>
              <Text style={styles.preferredTitle}>
                {tr.profile.preferredLength}
              </Text>
              <View style={styles.pillRow}>
                {PREFERRED_OPTIONS.map((m) => (
                  <OptionPill
                    key={m}
                    label={`${m}m`}
                    active={settings.preferredSessionMinutes === m}
                    onPress={() =>
                      settings.update({ preferredSessionMinutes: m })
                    }
                    containerStyle={styles.pillItem}
                  />
                ))}
              </View>
            </View>
          </GlassCard>

          {/* Account / Onboarding */}
          <GlassCard radius={t.radii.md} padding={t.spacing[5]}>
            <SectionLabel>{tr.profile.account}</SectionLabel>
            <SettingRow
              type="nav"
              title={tr.profile.replayOnboarding}
              icon={
                <Ionicons
                  name="refresh-circle-outline"
                  size={22}
                  color={t.colors.textSecondary}
                />
              }
              onPress={() => {
                storage.delete(StorageKeys.onboardingComplete);
                router.replace("/onboarding");
              }}
              divider={false}
            />
          </GlassCard>
        </ScrollView>
      </SafeAreaView>

      <ThemePickerSheet
        visible={themeOpen}
        onDismiss={() => setThemeOpen(false)}
        onRequestPaywall={(id) => openPaywall(id)}
      />
      <LanguagePickerSheet
        visible={langOpen}
        current={(settings.language ?? "en") as Language}
        onConfirm={(lang) => {
          settings.update({ language: lang });
          setLangOpen(false);
        }}
        onDismiss={() => setLangOpen(false)}
      />
      <PaywallSheet
        visible={paywallOpen}
        onDismiss={() => setPaywallOpen(false)}
        intentTheme={intentTheme}
      />

      {/* Level-up reward queue */}
      <LevelUpModal
        visible={rewardQueue[0]?.type === "levelUp"}
        prevLevel={rewardQueue[0]?.type === "levelUp" ? rewardQueue[0].from : 1}
        newLevel={rewardQueue[0]?.type === "levelUp" ? rewardQueue[0].to : 1}
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

function PremiumSection({
  isPremium,
  onOpenPaywall
}: {
  isPremium: boolean;
  onOpenPaywall: () => void;
}) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();

  if (isPremium) {
    return (
      <MotiView
        from={{ opacity: 0, translateY: 6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 420 }}
      >
        <GlassCard radius={t.radii.md} padding={t.spacing[5]}>
          <View style={styles.premiumActiveRow}>
            <View
              style={[
                styles.premiumCrest,
                { backgroundColor: "rgba(255,210,122,0.15)" }
              ]}
            >
              <Ionicons name="diamond" size={20} color={t.colors.premium} />
            </View>
            <View style={styles.premiumText}>
              <Text style={styles.premiumTitle}>{tr.profile.premium}</Text>
              <Text style={styles.premiumSub}>{tr.profile.premiumActive}</Text>
            </View>
            <PremiumBadge label="ACTIVE" size="md" />
          </View>
        </GlassCard>
      </MotiView>
    );
  }

  return (
    <PressableCard
      haptic="medium"
      onPress={onOpenPaywall}
      radius={t.radii.md}
      padding={t.spacing[5]}
    >
      <View style={styles.premiumActiveRow}>
        <LinearGradient
          colors={["#FFD27A", "#FF9F43"]}
          style={styles.premiumCrest}
        >
          <Ionicons name="diamond" size={20} color="#1A0F00" />
        </LinearGradient>
        <View style={styles.premiumText}>
          <Text style={styles.premiumTitle}>{tr.profile.premium}</Text>
          <Text style={styles.premiumSub}>{tr.profile.premiumDesc}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={t.colors.premium} />
      </View>
    </PressableCard>
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
    xpTrack: {
      height: 10,
      borderRadius: t.radii.pill,
      backgroundColor: "rgba(255,255,255,0.08)",
      overflow: "hidden"
    },
    xpFill: {
      height: "100%",
      borderRadius: t.radii.pill,
      overflow: "hidden",
      shadowColor: t.colors.accent,
      shadowOpacity: 0.8,
      shadowRadius: 8
    },
    preferredBlock: {
      paddingTop: t.spacing[4],
      gap: t.spacing[3]
    },
    preferredTitle: {
      color: t.colors.text,
      fontSize: 15,
      fontFamily: t.fonts.body
    },
    pillRow: {
      flexDirection: "row",
      gap: t.spacing[2]
    },
    pillItem: { flex: 1 },
    premiumActiveRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[3] + 2
    },
    premiumCrest: {
      width: 44,
      height: 44,
      borderRadius: t.radii.md,
      alignItems: "center",
      justifyContent: "center"
    },
    premiumText: { flex: 1 },
    premiumTitle: {
      color: t.colors.text,
      fontSize: 16,
      fontFamily: t.fonts.display,
      letterSpacing: t.fonts.displayLetterSpacing
    },
    premiumSub: {
      color: t.colors.textMuted,
      fontSize: 12,
      marginTop: 2,
      fontFamily: t.fonts.body
    }
  });
