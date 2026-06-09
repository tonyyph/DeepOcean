import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
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
      // TODO: remove this ones
      // if (!canUseTheme(id, premium, isPremium, unlocked)) {
      //   onRequestPaywall(id);
      //   return;
      // }
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

  return (
    <Sheet visible={visible} onDismiss={onDismiss}>
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
              style={styles.swatchItem}
            >
              <MotiView
                from={{ scale: 0.94 }}
                animate={{ scale: isSelected ? 1.06 : 1 }}
                transition={{ type: "spring", damping: 14, stiffness: 220 }}
              >
                <ThemeSwatch theme={th} size={64} active={isSelected} />
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
