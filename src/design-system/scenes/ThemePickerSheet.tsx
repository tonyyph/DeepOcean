import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import type { AppTheme, ThemeId } from "../themes";
import { THEME_LIST } from "../themes";
import { Sheet } from "../atoms/Sheet";
import { ThemeSwatch } from "../atoms/ThemeSwatch";
import { PremiumBadge } from "../atoms/PremiumBadge";
import { PressableCard } from "../atoms/PressableCard";
import { useThemeStore, usePremium, canUseTheme } from "@/stores";
import { useTranslations } from "@/core/i18n";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  /** Called when the user requests to open the paywall (locked theme tapped). */
  onRequestPaywall: (themeId: ThemeId) => void;
};

/**
 * ThemePickerSheet — a horizontal carousel of theme swatches with a live
 * preview + descriptions. Tapping a locked premium theme triggers paywall.
 */
export function ThemePickerSheet({
  visible,
  onDismiss,
  onRequestPaywall
}: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();
  const activeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);
  const isPremium = usePremium((s) => s.isPremium);
  const unlocked = usePremium((s) => s.unlockedThemes);

  const [selected, setSelected] = useState<ThemeId>(activeId);
  useEffect(() => {
    if (visible) setSelected(activeId);
  }, [visible, activeId]);

  const handlePick = useCallback(
    (id: ThemeId, premium: boolean) => {
      if (!canUseTheme(id, premium, isPremium, unlocked)) {
        onRequestPaywall(id);
        return;
      }
      setSelected(id);
    },
    [isPremium, unlocked, onRequestPaywall]
  );

  const handleApply = useCallback(() => {
    setTheme(selected);
    onDismiss();
  }, [selected, setTheme, onDismiss]);

  const previewTheme =
    THEME_LIST.find((th) => th.id === selected) ?? THEME_LIST[0]!;
  const lockedThemesCount = THEME_LIST.filter(
    (theme) =>
      theme.premium && !canUseTheme(theme.id, true, isPremium, unlocked)
  ).length;

  return (
    <Sheet visible={visible} onDismiss={onDismiss}>
      <View
        style={[
          styles.membershipBanner,
          isPremium
            ? styles.membershipBannerPremium
            : styles.membershipBannerFree
        ]}
      >
        <Text style={styles.membershipBannerTitle}>
          {isPremium
            ? tr.profile.premiumActive
            : tr.profile.themeLockedCount(lockedThemesCount)}
        </Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>{tr.profile.themePickerTitle}</Text>
        <Text style={styles.subtitle}>{tr.profile.themePickerSub}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.swatchScroll}
        contentContainerStyle={styles.swatchRow}
      >
        {THEME_LIST.map((th) => {
          const locked = !canUseTheme(th.id, th.premium, isPremium, unlocked);
          const isSelected = th.id === selected;
          return (
            <Pressable
              key={th.id}
              onPress={() => handlePick(th.id, th.premium)}
              style={[styles.swatchItem, locked && styles.swatchItemLocked]}
            >
              <MotiView
                from={{ scale: 0.94 }}
                animate={{ scale: isSelected ? 1.06 : 1 }}
                transition={{ type: "spring", damping: 14, stiffness: 220 }}
              >
                <View style={styles.swatchVisualWrap}>
                  <ThemeSwatch theme={th} size={64} active={isSelected} />
                  {locked && (
                    <View style={styles.swatchLockVeil}>
                      <Ionicons
                        name="lock-closed"
                        size={12}
                        color={t.colors.text}
                      />
                      <Text style={styles.swatchLockText}>
                        {tr.profile.proOnly}
                      </Text>
                    </View>
                  )}
                </View>
              </MotiView>
              <Text
                style={[
                  styles.swatchLabel,
                  isSelected && { color: th.colors.accent }
                ]}
              >
                {th.name}
              </Text>
              {locked && (
                <View style={styles.lockBadge}>
                  <PremiumBadge variant="lock" label="PRO" />
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.previewCard}>
        <Text
          style={[styles.previewName, { color: previewTheme.colors.accent }]}
        >
          {previewTheme.name}
        </Text>
        <Text style={styles.previewDesc}>{previewTheme.description}</Text>
        <View style={styles.previewMeta}>
          <Text style={styles.previewMetaItem}>
            {tr.profile.themeFont}:{" "}
            {readableFontName(previewTheme.fonts.display)}
          </Text>
          <Text style={styles.previewMetaItem}>
            {tr.profile.themeParticles}: {previewTheme.particles.style}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <PressableCard haptic="medium" onPress={handleApply} glow>
          <Text style={styles.applyText}>{tr.profile.applyTheme}</Text>
        </PressableCard>
        <PressableCard haptic="light" onPress={onDismiss}>
          <Text style={styles.cancelText}>{tr.profile.cancel}</Text>
        </PressableCard>
      </View>
    </Sheet>
  );
}

function readableFontName(family: string): string {
  return family.split("_")[0] ?? family;
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    header: {
      gap: t.spacing[1],
      marginBottom: t.spacing[4]
    },
    membershipBanner: {
      borderRadius: t.radii.md,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: t.spacing[4],
      paddingVertical: t.spacing[3],
      marginBottom: t.spacing[3]
    },
    membershipBannerPremium: {
      borderColor: `${t.colors.accent}66`,
      backgroundColor: `${t.colors.accent}1F`
    },
    membershipBannerFree: {
      borderColor: `${t.colors.premium}66`,
      backgroundColor: `${t.colors.premium}14`
    },
    membershipBannerTitle: {
      color: t.colors.text,
      fontSize: 12,
      lineHeight: 17,
      letterSpacing: 0.6,
      fontFamily: t.fonts.label,
      textAlign: "center"
    },
    title: {
      color: t.colors.text,
      fontSize: 20,
      fontFamily: t.fonts.display,
      letterSpacing: t.fonts.displayLetterSpacing
    },
    subtitle: {
      color: t.colors.textMuted,
      fontSize: 13,
      fontFamily: t.fonts.body
    },
    swatchScroll: {
      height: 128
    },
    swatchRow: {
      gap: t.spacing[5],
      paddingVertical: t.spacing[4],
      paddingHorizontal: t.spacing[4]
    },
    swatchItem: {
      alignItems: "center",
      gap: t.spacing[2],
      position: "relative"
    },
    swatchVisualWrap: {
      position: "relative"
    },
    swatchItemLocked: {
      opacity: 0.72
    },
    swatchLockVeil: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      borderBottomLeftRadius: t.radii.sm,
      borderBottomRightRadius: t.radii.sm,
      backgroundColor: `${t.colors.surface}CC`,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: `${t.colors.premium}88`,
      paddingVertical: 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4
    },
    swatchLockText: {
      color: t.colors.text,
      fontSize: 9,
      letterSpacing: 0.6,
      fontFamily: t.fonts.label
    },
    swatchLabel: {
      color: t.colors.textSecondary,
      fontSize: 12,
      fontFamily: t.fonts.label,
      letterSpacing: 1
    },
    lockBadge: {
      position: "absolute",
      top: -4,
      right: -10
    },
    previewCard: {
      marginVertical: t.spacing[4],
      padding: t.spacing[4],
      borderRadius: t.radii.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border,
      backgroundColor: t.colors.glass,
      gap: t.spacing[2]
    },
    previewName: {
      fontSize: 18,
      fontFamily: t.fonts.display,
      letterSpacing: t.fonts.displayLetterSpacing
    },
    previewDesc: {
      color: t.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: t.fonts.body
    },
    previewMeta: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: t.spacing[3],
      marginTop: t.spacing[1]
    },
    previewMetaItem: {
      color: t.colors.textMuted,
      fontSize: 11,
      letterSpacing: 1,
      fontFamily: t.fonts.label,
      textTransform: "uppercase"
    },
    actions: {
      marginTop: t.spacing[8],
      gap: t.spacing[3.5]
    },
    applyText: {
      color: t.colors.text,
      textAlign: "center",
      letterSpacing: 1,
      fontSize: 13,
      fontFamily: t.fonts.label,
      paddingVertical: t.spacing[1]
    },
    cancelText: {
      color: t.colors.textSecondary,
      textAlign: "center",
      letterSpacing: 1,
      fontSize: 12,
      fontFamily: t.fonts.label,
      paddingVertical: t.spacing[1]
    }
  });
