import { useTranslations } from "@/core/i18n";
import { useThemeStore } from "@/stores";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { MotiView } from "moti";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlowText } from "../atoms/GlowText";
import { PressableCard } from "../atoms/PressableCard";
import { Sheet } from "../atoms/Sheet";
import { ThemeSwatch } from "../atoms/ThemeSwatch";
import type { AppTheme, ThemeId } from "../themes";
import { combineThemes, THEME_LIST, THEMES } from "../themes";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";

const SWATCH_SIZE = 48;
const SWATCH_ITEM_WIDTH = 78;

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

/**
 * ThemePickerSheet — a horizontal carousel of theme swatches with a live
 * preview + descriptions.
 */
export function ThemePickerSheet({ visible, onDismiss }: Props) {
  const styles = useThemedStyles(makeStyles);
  const t = useTheme();
  const tr = useTranslations();
  const insets = useSafeAreaInsets();
  const activeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);

  const [draftTheme, setDraftTheme] = useState<ThemeId | null>(null);
  const selected = draftTheme ?? activeId;

  const dismiss = useCallback(() => {
    setDraftTheme(null);
    onDismiss();
  }, [onDismiss]);

  const handlePick = useCallback((id: ThemeId) => {
    setDraftTheme(id);
  }, []);

  const handleApply = useCallback(() => {
    setTheme(selected);
    setDraftTheme(null);
    onDismiss();
  }, [selected, setTheme, onDismiss]);

  const previewTheme =
    THEME_LIST.find((th) => th.id === selected) ?? THEME_LIST[0]!;

  return (
    <Sheet visible={visible} onDismiss={dismiss} noPadding>
      <BottomSheetScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom, t.spacing[8]) }
        ]}
        keyboardShouldPersistTaps="handled"
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <GlowText shadow={false} size={20} style={styles.title}>
            {tr.profile.themePickerTitle}
          </GlowText>
          <Text style={styles.subtitle}>{tr.profile.themePickerSub}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.swatchScroll}
          contentContainerStyle={styles.swatchRow}
        >
          {THEME_LIST.map((th) => {
            const isSelected = th.id === selected;
            return (
              <Pressable
                key={th.id}
                onPress={() => handlePick(th.id)}
                style={[
                  styles.swatchItem,
                  isSelected && styles.swatchItemSelected
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={th.name}
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
      </BottomSheetScrollView>
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
      paddingHorizontal: t.spacing[6],
      paddingTop: t.spacing[4],
      paddingBottom: t.spacing[8],
      gap: t.spacing[4]
    },
    header: {
      gap: t.spacing[1]
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
      minHeight: 80,
      paddingHorizontal: t.spacing[3],
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
    swatchLabel: {
      color: t.colors.textSecondary,
      fontSize: 12,
      fontFamily: t.fonts.label,
      letterSpacing: 0.8,
      maxWidth: SWATCH_ITEM_WIDTH - t.spacing[3],
      textAlign: "center"
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
