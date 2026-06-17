import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import type { AppTheme } from "../themes";
import { GlowText } from "../atoms/GlowText";
import { Sheet } from "../atoms/Sheet";
import { PressableCard } from "../atoms/PressableCard";
import { useTranslations, type Language } from "@/core/i18n";

const LANGUAGES: { code: Language; native: string }[] = [
  { code: "en", native: "EN" },
  { code: "vi", native: "VI" },
];

type Props = {
  visible: boolean;
  current: Language;
  onConfirm: (lang: Language) => void;
  onDismiss: () => void;
};

export function LanguagePickerSheet({
  visible,
  current,
  onConfirm,
  onDismiss,
}: Props) {
  const t = useTheme();
  const tr = useTranslations();
  const styles = useThemedStyles(makeStyles);
  const [draft, setDraft] = useState<Language | null>(null);
  const selected = draft ?? current;

  const dismiss = useCallback(() => {
    setDraft(null);
    onDismiss();
  }, [onDismiss]);

  const confirm = useCallback(() => {
    onConfirm(selected);
    setDraft(null);
  }, [onConfirm, selected]);

  return (
    <Sheet visible={visible} onDismiss={dismiss}>
      <GlowText size={20} style={styles.title}>
        {tr.profile.language}
      </GlowText>
      <Text style={styles.subtitle}>{tr.profile.languageDesc}</Text>

      <View style={styles.list}>
        {LANGUAGES.map(({ code, native }) => {
          const active = selected === code;
          const label = tr.profile.languageNames[code];
          return (
            <Pressable
              key={code}
              onPress={() => setDraft(code)}
              style={[styles.row, active && styles.rowActive]}
            >
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioDot} />}
              </View>
              <Text
                style={[styles.label, active && { color: t.colors.accent }]}
              >
                {label}
              </Text>
              <Text
                style={[styles.native, active && { color: t.colors.accent }]}
              >
                {native}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
        <PressableCard haptic="medium" onPress={confirm} glow>
          <Text style={styles.confirmText}>{tr.profile.confirm}</Text>
        </PressableCard>
      </View>
    </Sheet>
  );
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    title: {
      color: t.colors.text,
      fontSize: 20,
      fontFamily: t.fonts.display,
      letterSpacing: t.fonts.displayLetterSpacing,
      marginBottom: t.spacing[1],
    },
    subtitle: {
      color: t.colors.textMuted,
      fontSize: 13,
      fontFamily: t.fonts.body,
      marginBottom: t.spacing[5],
    },
    list: {
      gap: t.spacing[2.5],
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[3.5],
      paddingVertical: t.spacing[3.5],
      paddingHorizontal: t.spacing[4],
      borderRadius: t.radii.md,
      backgroundColor: t.colors.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border,
    },
    rowActive: {
      backgroundColor: `${t.colors.accent}12`,
      borderColor: t.colors.accent,
    },
    radio: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: t.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    radioActive: { borderColor: t.colors.accent },
    radioDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: t.colors.accent,
    },
    label: {
      flex: 1,
      color: t.colors.text,
      fontSize: 15,
      fontFamily: t.fonts.body,
    },
    native: {
      color: t.colors.textMuted,
      fontSize: 13,
      letterSpacing: 1,
      fontFamily: t.fonts.label,
    },
    actions: {
      marginTop: t.spacing[8],
      gap: t.spacing[3.5],
    },
    confirmText: {
      color: t.colors.text,
      textAlign: "center",
      letterSpacing: 1,
      fontSize: 13,
      fontFamily: t.fonts.mono,
      paddingVertical: t.spacing[1],
    },
  });
