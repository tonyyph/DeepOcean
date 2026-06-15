import { useTranslations } from "@/core/i18n";
import { canUseTheme, usePremium, useThemeStore } from "@/stores";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { PremiumBadge } from "../atoms/PremiumBadge";
import { GlowText } from "../atoms/GlowText";
import { PressableCard } from "../atoms/PressableCard";
import { Sheet } from "../atoms/Sheet";
import { ThemeSwatch } from "../atoms/ThemeSwatch";
import type { AppTheme, ThemeId } from "../themes";
import { combineThemes, THEME_LIST, THEMES } from "../themes";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";

const SWATCH_SIZE = 62;
const SWATCH_ITEM_WIDTH = 92;

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

  const [draftTheme, setDraftTheme] = useState<ThemeId | null>(null);
  const selected = draftTheme ?? activeId;

  const dismiss = useCallback(() => {
    setDraftTheme(null);
    onDismiss();
  }, [onDismiss]);

  const handlePick = useCallback(
    (id: ThemeId, premium: boolean) => {
      if (!canUseTheme(id, premium, isPremium, unlocked)) {
        onRequestPaywall(id);
        return;
      }
      setDraftTheme(id);
    },
    [isPremium, unlocked, onRequestPaywall]
  );

  const handleApply = useCallback(() => {
    setTheme(selected);
    setDraftTheme(null);
    onDismiss();
  }, [selected, setTheme, onDismiss]);

  const previewTheme =
    THEME_LIST.find((th) => th.id === selected) ?? THEME_LIST[0]!;

  return (
    <Sheet visible={visible} onDismiss={dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <GlowText size={20} style={styles.title}>
            {tr.profile.themePickerTitle}
          </GlowText>
          <Text style={styles.subtitle}>{tr.profile.themePickerSub}</Text>
        </View>
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
              ? tr.profile.themePickerPremiumActive
              : tr.profile.themeLockedCount(
                  THEME_LIST.filter((theme) => theme.premium).length
                )}
          </Text>
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
                style={[
                  styles.swatchItem,
                  isSelected && styles.swatchItemSelected,
                  locked && styles.swatchItemLocked
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${th.name}${
                  locked ? `, ${tr.profile.proOnly}` : ""
                }`}
              >
                <MotiView
                  from={{ scale: 0.96 }}
                  animate={{ scale: isSelected ? 1.05 : 1 }}
                  transition={{ type: "spring", damping: 16, stiffness: 220 }}
                  style={styles.swatchMotion}
                >
                  <ThemeSwatch
                    theme={th}
                    size={SWATCH_SIZE}
                    active={isSelected}
                  />
                  {locked && (
                    <View style={styles.lockBadge}>
                      <PremiumBadge variant="lock" label="PRO" />
                    </View>
                  )}
                </MotiView>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.82}
                  style={[
                    styles.swatchLabel,
                    isSelected && { color: th.colors.accent }
                  ]}
                >
                  {th.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View
              style={[
                styles.previewAccent,
                { backgroundColor: previewTheme.colors.accent }
              ]}
            />
            <Text
              numberOfLines={1}
              style={[
                styles.previewName,
                { color: previewTheme.colors.accent }
              ]}
            >
              {previewTheme.name}
            </Text>
          </View>
          <Text style={styles.previewDesc} numberOfLines={3}>
            {previewTheme.description}
          </Text>
          <View style={styles.palettePanel}>
            <View style={styles.paletteHeader}>
              <Text style={styles.comboTitle} numberOfLines={1}>
                {tr.profile.themeColorIdentity}
              </Text>
              <View style={styles.paletteDots}>
                {[
                  previewTheme.colors.accent,
                  previewTheme.colors.accentSoft,
                  previewTheme.colors.background
                ].map((color) => (
                  <View
                    key={color}
                    style={[styles.paletteDot, { backgroundColor: color }]}
                  />
                ))}
              </View>
            </View>
            {previewTheme.colorStory.map((line) => (
              <Text key={line} style={styles.paletteLine} numberOfLines={2}>
                {line}
              </Text>
            ))}
          </View>
          <View style={styles.comboPanel}>
            <Text style={styles.comboTitle} numberOfLines={1}>
              {previewTheme.combo?.ingredients
                ? tr.profile.themeElementFusion
                : tr.profile.themeBaseElement}
            </Text>
            <Text style={styles.comboBody} numberOfLines={2}>
              {describeThemeCombo(previewTheme, tr)}
            </Text>
          </View>
          <View style={styles.previewMeta}>
            <View style={styles.previewMetaPill}>
              <Text style={styles.previewMetaItem} numberOfLines={1}>
                {tr.profile.themeElement}: {previewTheme.element}
              </Text>
            </View>
            <View style={styles.previewMetaPill}>
              <Text style={styles.previewMetaItem} numberOfLines={1}>
                {tr.profile.themeParticles}: {previewTheme.particles.effect}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <PressableCard
            haptic="medium"
            onPress={handleApply}
            accessibilityRole="button"
            accessibilityLabel={tr.profile.applyTheme}
          >
            <Text style={styles.applyText}>{tr.profile.applyTheme}</Text>
          </PressableCard>
          <PressableCard
            haptic="light"
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel={tr.profile.cancel}
          >
            <Text style={styles.cancelText}>{tr.profile.cancel}</Text>
          </PressableCard>
        </View>
      </View>
    </Sheet>
  );
}

function describeThemeCombo(
  theme: AppTheme,
  tr: ReturnType<typeof useTranslations>
): string {
  if (theme.combo?.ingredients) {
    const [first, second] = theme.combo.ingredients;
    const firstTheme = THEMES[first];
    const secondTheme = THEMES[second];
    return tr.profile.themeFusionDescription(
      firstTheme.element,
      secondTheme.element,
      theme.name
    );
  }

  const resultIds = (theme.combo?.combinesWith ?? [])
    .map((otherId) => combineThemes(theme.id, otherId))
    .filter((id): id is ThemeId => id != null);
  if (resultIds.length === 0) {
    return tr.profile.themeStandaloneDescription;
  }

  const names = resultIds.map((id) => THEMES[id].name).join(", ");
  return tr.profile.themeCombinationDescription(names);
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    container: {
      gap: t.spacing[4]
    },
    header: {
      gap: t.spacing[1]
    },
    membershipBanner: {
      borderRadius: t.radii.md,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: t.spacing[4],
      paddingVertical: t.spacing[3],
      minHeight: 44,
      justifyContent: "center"
    },
    membershipBannerPremium: {
      borderColor: t.colors.borderStrong,
      backgroundColor: t.colors.panelStrong
    },
    membershipBannerFree: {
      borderColor: t.colors.borderStrong,
      backgroundColor: t.colors.panelStrong
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
      letterSpacing: t.fonts.displayLetterSpacing,
      textAlign: "center"
    },
    subtitle: {
      color: t.colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
      fontFamily: t.fonts.body,
      textAlign: "center"
    },
    swatchScroll: {
      marginHorizontal: -t.spacing[6]
    },
    swatchRow: {
      gap: t.spacing[3],
      paddingVertical: t.spacing[2],
      paddingHorizontal: t.spacing[6]
    },
    swatchItem: {
      alignItems: "center",
      justifyContent: "space-between",
      gap: t.spacing[2],
      width: SWATCH_ITEM_WIDTH,
      minHeight: 108,
      paddingHorizontal: t.spacing[2],
      paddingVertical: t.spacing[2],
      borderRadius: t.radii.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "transparent"
    },
    swatchItemSelected: {
      borderColor: t.colors.panelEdge,
      backgroundColor: t.colors.panel
    },
    swatchMotion: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: SWATCH_SIZE + 10
    },
    swatchItemLocked: {
      opacity: 0.72
    },
    swatchLabel: {
      color: t.colors.textSecondary,
      fontSize: 12,
      fontFamily: t.fonts.label,
      letterSpacing: 0.8,
      maxWidth: SWATCH_ITEM_WIDTH - t.spacing[3],
      textAlign: "center"
    },
    lockBadge: {
      position: "absolute",
      top: 2,
      right: -8
    },
    previewCard: {
      padding: t.spacing[4],
      borderRadius: t.radii.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge,
      backgroundColor: t.colors.panel,
      gap: t.spacing[3]
    },
    previewHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[2]
    },
    previewAccent: {
      width: 4,
      height: 24,
      borderRadius: 2
    },
    previewName: {
      flex: 1,
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
    comboPanel: {
      borderRadius: t.radii.s,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border,
      backgroundColor: t.colors.panelStrong,
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[2],
      gap: t.spacing[1]
    },
    palettePanel: {
      borderRadius: t.radii.s,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge,
      backgroundColor: t.colors.panelStrong,
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[2],
      gap: t.spacing[1.5]
    },
    paletteHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: t.spacing[2]
    },
    paletteDots: {
      flexDirection: "row",
      gap: t.spacing[1]
    },
    paletteDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border
    },
    paletteLine: {
      color: t.colors.textSecondary,
      fontSize: 11,
      lineHeight: 16,
      fontFamily: t.fonts.body
    },
    effectPanel: {
      borderRadius: t.radii.s,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border,
      backgroundColor: t.colors.panelStrong,
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[2],
      gap: t.spacing[1]
    },
    comboTitle: {
      color: t.colors.accent,
      fontSize: 11,
      letterSpacing: 0.8,
      fontFamily: t.fonts.label,
      textTransform: "uppercase"
    },
    comboBody: {
      color: t.colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
      fontFamily: t.fonts.body
    },
    previewMeta: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: t.spacing[2]
    },
    previewMetaPill: {
      flexGrow: 1,
      flexBasis: "47%",
      minHeight: 44,
      justifyContent: "center",
      paddingHorizontal: t.spacing[3],
      borderRadius: t.radii.s,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge,
      backgroundColor: t.colors.panelStrong
    },
    previewMetaItem: {
      color: t.colors.textMuted,
      fontSize: 11,
      letterSpacing: 0.8,
      fontFamily: t.fonts.label,
      textTransform: "uppercase"
    },
    actions: {
      gap: t.spacing[3]
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
