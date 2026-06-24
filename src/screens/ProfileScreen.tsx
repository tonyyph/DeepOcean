import { useTranslations, type Language } from "@/core/i18n";
import { container } from "@/data/container";
import {
  GlassCard,
  GlowText,
  LanguagePickerSheet,
  LevelUpModal,
  OptionPill,
  PaywallSheet,
  PremiumBadge,
  PressableCard,
  ReminderTimePickerSheet,
  ScreenSafeAreaView,
  ScreenScrollView,
  SectionLabel,
  SettingRow,
  ThemePickerSheet,
  THEMES,
  TitleAchievementModal,
  UnderwaterCanvas,
  useTheme,
  useThemedStyles,
  ZoneBackground,
  type ThemeId
} from "@/design-system";
import {
  checkNewAchievements,
  computeLevelUp,
  useDiverProfile,
  useUpdateDiver,
  xpForNextLevel
} from "@/features/diver";
import type { TitleAchievement } from "@/features/diver/titleAchievements";
import { useDiveReminders } from "@/features/notifications";
import {
  useAchievements,
  usePersonalization,
  usePremium,
  useSettings,
  useThemeStore
} from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import * as Application from "expo-application";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { PremiumSection } from "./ProfileScreen.components";
import { makeStyles } from "./ProfileScreen.styles";
const PREFERRED_OPTIONS = [15, 25, 45, 60] as const;
const SOUND_LEVELS = [
  { key: "off", value: 0 },
  { key: "low", value: 0.35 },
  { key: "full", value: 0.65 }
] as const;
type SoundLevelKey = (typeof SOUND_LEVELS)[number]["key"];
function volumeToKey(v: number): SoundLevelKey {
  if (v <= 0) return "off";
  if (v < 0.5) return "low";
  return "full";
}
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
  const debugPremiumEnabled = usePremium((s) => s.debugPremiumEnabled);
  const setDebugPremiumEnabled = usePremium((s) => s.setDebugPremiumEnabled);
  const resetOnboarding = usePersonalization((s) => s.resetOnboarding);
  const alreadyUnlocked = useAchievements((s) => s.unlockedTitleAchievements);
  const persistTitleAchievements = useAchievements(
    (s) => s.persistTitleAchievements
  );
  const reminders = useDiveReminders();
  const [langOpen, setLangOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [reminderTimeOpen, setReminderTimeOpen] = useState(false);
  const [intentTheme, setIntentTheme] = useState<ThemeId | undefined>(
    undefined
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const nameInputRef = useRef<TextInput>(null);
  const startEditName = useCallback(() => {
    setDraftName(profile?.name ?? "");
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 80);
  }, [profile?.name]);
  const confirmEditName = useCallback(() => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== profile?.name) {
      updateDiver({ name: trimmed });
    }
    setIsEditingName(false);
    Keyboard.dismiss();
  }, [draftName, profile?.name, updateDiver]);
  const cancelEditName = useCallback(() => {
    setIsEditingName(false);
    Keyboard.dismiss();
  }, []);
  type RewardItem =
    | { type: "levelUp"; from: number; to: number }
    | { type: "achievement"; achievement: TitleAchievement };
  const [rewardQueue, setRewardQueue] = useState<RewardItem[]>([]);
  const overflowChecked = useRef(false);
  useEffect(() => {
    if (!profile || overflowChecked.current) return;
    overflowChecked.current = true;
    let active = true;

    void (async () => {
      const threshold = xpForNextLevel(profile.level);
      if (profile.xp < threshold) return;
      const {
        level: newLevel,
        xp: newXp,
        levelsGained
      } = computeLevelUp(profile.level, profile.xp, 0);
      updateDiver({ level: newLevel, xp: newXp });
      const updatedProfile = { ...profile, level: newLevel, xp: newXp };
      const collectionItems = await container.collection.all().catch(() => []);
      if (!active) return;
      const newAchievements = checkNewAchievements(
        updatedProfile,
        { collectionCount: collectionItems.length },
        alreadyUnlocked
      );
      if (newAchievements.length > 0) {
        persistTitleAchievements(newAchievements);
      }
      const queue: RewardItem[] = [];
      if (levelsGained > 0) {
        queue.push({ type: "levelUp", from: profile.level, to: newLevel });
      }
      newAchievements.forEach((a) =>
        queue.push({ type: "achievement", achievement: a })
      );
      if (queue.length > 0) {
        setTimeout(() => {
          if (active) setRewardQueue(queue);
        }, 0);
      }
    })();

    return () => {
      active = false;
    };
  }, [profile, alreadyUnlocked, persistTitleAchievements, updateDiver]);
  const dismissReward = useCallback(() => {
    setRewardQueue((q) => q.slice(1));
  }, []);
  const nextLevelXp = xpForNextLevel(profile?.level ?? 1);
  const progress = profile ? Math.min(1, profile.xp / nextLevelXp) : 0;
  const currentLangLabel = tr.profile.languageNames[settings.language];
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
      <ScreenSafeAreaView style={styles.flex}>
        <ScreenScrollView>
          <View style={styles.profileHeader}>
            {!isEditingName && (
              <Text style={styles.headerEyebrow}>{tr.profile.title}</Text>
            )}
            <View style={styles.headerNameRow}>
              {isEditingName ? (
                <GlassCard
                  style={styles.nameEditCard}
                  radius={t.radii.sm}
                  padding={t.spacing[4]}
                >
                  <SectionLabel>{tr.profile.editNameTitle}</SectionLabel>
                  <View style={styles.nameEditRow}>
                    <TextInput
                      ref={nameInputRef}
                      value={draftName}
                      onChangeText={setDraftName}
                      placeholder={tr.profile.editNamePlaceholder}
                      placeholderTextColor={t.colors.textMuted}
                      style={styles.nameInput}
                      returnKeyType="done"
                      onSubmitEditing={confirmEditName}
                      autoCapitalize="words"
                      maxLength={32}
                    />
                    <View style={styles.nameEditActions}>
                      <PressableCard
                        haptic="light"
                        onPress={cancelEditName}
                        radius={t.radii.sm}
                        padding={t.spacing[2]}
                        accessibilityRole="button"
                        accessibilityLabel={tr.profile.cancel}
                      >
                        <Ionicons
                          name="close"
                          size={18}
                          color={t.colors.textMuted}
                        />
                      </PressableCard>
                      <PressableCard
                        haptic="medium"
                        onPress={confirmEditName}
                        radius={t.radii.sm}
                        padding={t.spacing[2]}
                        accessibilityRole="button"
                        accessibilityLabel={tr.profile.confirm}
                      >
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={t.colors.accent}
                        />
                      </PressableCard>
                    </View>
                  </View>
                </GlassCard>
              ) : (
                <GlowText size={36} pulse style={styles.base}>
                  {profile?.name ?? tr.home.diver}
                </GlowText>
              )}
              <PressableCard
                haptic="light"
                onPress={startEditName}
                radius={t.radii.s}
                padding={t.spacing[2]}
                accessibilityRole="button"
                accessibilityLabel={tr.profile.editNameTitle}
              >
                <Ionicons
                  name="pencil-outline"
                  size={16}
                  color={t.colors.textSecondary}
                />
              </PressableCard>
            </View>
            <Text style={styles.headerSub}>
              {tr.profile.level(profile?.level ?? 1)}
            </Text>
          </View>
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
          <PremiumSection
            isPremium={isPremium}
            onOpenPaywall={() => openPaywall(undefined)}
          />
          <GlassCard radius={t.radii.md} padding={t.spacing[5]}>
            <SectionLabel>{tr.profile.appearance}</SectionLabel>
            <SettingRow
              type="nav"
              title={tr.profile.theme}
              subtitle={tr.profile.themeDesc}
              value={activeTheme.name}
              onPress={() => setThemeOpen(true)}
              badge={activeTheme.premium && <PremiumBadge />}
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
                {tr.profile.soundVolume}
              </Text>
              <Text style={styles.preferredSub}>
                {tr.profile.soundVolumeDesc}
              </Text>
              <View style={styles.pillRow}>
                {SOUND_LEVELS.map(({ key, value }) => (
                  <OptionPill
                    key={key}
                    label={
                      key === "off"
                        ? tr.profile.soundOff
                        : key === "low"
                          ? tr.profile.soundLow
                          : tr.profile.soundFull
                    }
                    active={volumeToKey(settings.ambientVolume) === key}
                    onPress={() => settings.update({ ambientVolume: value })}
                    containerStyle={styles.pillItem}
                  />
                ))}
              </View>
            </View>
            <SettingRow
              type="switch"
              title={tr.profile.showDiscoveries}
              subtitle={tr.profile.showDiscoveriesDesc}
              value={settings.showDiscoveryAlerts}
              onChange={(v) => settings.update({ showDiscoveryAlerts: v })}
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
          <GlassCard radius={t.radii.md} padding={t.spacing[5]}>
            <SectionLabel>{tr.profile.notifications}</SectionLabel>
            <SettingRow
              type="switch"
              title={tr.profile.diveReminders}
              subtitle={tr.profile.diveRemindersDesc}
              value={reminders.enabled}
              onChange={(v) => {
                void reminders.setEnabled(v);
              }}
              divider={reminders.enabled}
            />
            {reminders.enabled && (
              <SettingRow
                type="nav"
                title={tr.profile.reminderTime}
                subtitle={tr.profile.reminderTimeDesc}
                value={reminders.timeLabel}
                onPress={() => setReminderTimeOpen(true)}
                divider={false}
              />
            )}
          </GlassCard>
          <GlassCard radius={t.radii.md} padding={t.spacing[5]}>
            <SectionLabel>{tr.profile.account}</SectionLabel>
            <SettingRow
              type="nav"
              title={tr.profile.changeGoals}
              subtitle={tr.profile.changeGoalsDesc}
              icon={
                <Ionicons
                  name="compass-outline"
                  size={22}
                  color={t.colors.textSecondary}
                />
              }
              divider={false}
              onPress={() => {
                resetOnboarding();
                router.replace("/onboarding");
              }}
            />
          </GlassCard>
          {process.env.EXPO_PUBLIC_ENABLE_PREMIUM === "true" && (
            <GlassCard radius={t.radii.md} padding={t.spacing[5]}>
              <SectionLabel>{tr.profile.developer}</SectionLabel>
              <SettingRow
                type="switch"
                title={tr.profile.devEnablePremium}
                subtitle={tr.profile.devEnablePremiumDesc}
                value={debugPremiumEnabled}
                onChange={setDebugPremiumEnabled}
                divider={false}
              />
            </GlassCard>
          )}
          <GlassCard radius={t.radii.md} padding={t.spacing[5]}>
            <SectionLabel>{tr.profile.about}</SectionLabel>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>{tr.profile.appVersion}</Text>
              <Text style={styles.aboutValue}>
                {Application.nativeApplicationVersion ??
                  tr.profile.appVersionValue}
              </Text>
            </View>
            <View style={[styles.aboutRow, { marginTop: t.spacing[2] }]}>
              <Text style={styles.aboutTagline}>{tr.profile.builtWith}</Text>
            </View>
          </GlassCard>
        </ScreenScrollView>
      </ScreenSafeAreaView>
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
      <ReminderTimePickerSheet
        visible={reminderTimeOpen}
        hour={reminders.hour}
        minute={reminders.minute}
        onConfirm={(h, m) => {
          void reminders.setTime(h, m);
          setReminderTimeOpen(false);
        }}
        onDismiss={() => setReminderTimeOpen(false)}
      />
      <PaywallSheet
        visible={paywallOpen}
        onDismiss={() => setPaywallOpen(false)}
        intentTheme={intentTheme}
      />
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
