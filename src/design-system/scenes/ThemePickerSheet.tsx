import { useTranslations } from "@/core/i18n";
import { canUseTheme, usePremium, useThemeStore } from "@/stores";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { PremiumBadge } from "../atoms/PremiumBadge";
import { PressableCard } from "../atoms/PressableCard";
import { Sheet } from "../atoms/Sheet";
import { ThemeSwatch } from "../atoms/ThemeSwatch";
import type { AppTheme, ThemeId } from "../themes";
import { THEME_LIST } from "../themes";
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
      <View style={styles.container}>
        <View
          style={[
            styles.membershipBanner,
            isPremium
              ? styles.membershipBannerPremium
              : styles.membershipBannerFree
          ]}
        >
          <Text style={styles.membershipBannerTitle} numberOfLines={2}>
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
                style={[
                  styles.swatchItem,
                  isSelected && styles.swatchItemSelected,
                  locked && styles.swatchItemLocked
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
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
          <View style={styles.previewMeta}>
            <View style={styles.previewMetaPill}>
              <Text style={styles.previewMetaItem} numberOfLines={1}>
                {tr.profile.themeFont}:{" "}
                {readableFontName(previewTheme.fonts.display)}
              </Text>
            </View>
            <View style={styles.previewMetaPill}>
              <Text style={styles.previewMetaItem} numberOfLines={1}>
                {tr.profile.themeParticles}: {previewTheme.particles.style}
              </Text>
            </View>
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
      </View>
    </Sheet>
  );
}

function readableFontName(family: string): string {
  return family.split("_")[0] ?? family;
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
      borderColor: t.colors.glassEdge,
      backgroundColor: `${t.colors.glass}66`
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
      borderColor: t.colors.border,
      backgroundColor: t.colors.glass,
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
    previewMeta: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: t.spacing[2]
    },
    previewMetaPill: {
      flexGrow: 1,
      flexBasis: "47%",
      minHeight: 34,
      justifyContent: "center",
      paddingHorizontal: t.spacing[3],
      borderRadius: t.radii.s,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border,
      backgroundColor: `${t.colors.surfaceElevated}99`
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
