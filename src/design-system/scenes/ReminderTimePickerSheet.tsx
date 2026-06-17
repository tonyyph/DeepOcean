import { useTranslations } from "@/core/i18n";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GlowText } from "../atoms/GlowText";
import { PressableCard } from "../atoms/PressableCard";
import { Sheet } from "../atoms/Sheet";
import type { AppTheme } from "../themes";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import { Pressable } from "react-native-gesture-handler";

type Props = {
  visible: boolean;
  hour: number;
  minute: number;
  onConfirm: (hour: number, minute: number) => void;
  onDismiss: () => void;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 5-min steps

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function snapMinute(minute: number): number {
  return (Math.round(minute / 5) * 5) % 60;
}

/**
 * ReminderTimePickerSheet — lightweight 24h time picker built on the existing
 * Sheet atom. Avoids pulling a native date-time picker dependency (keeps the
 * managed-workflow footprint small) while staying fully theme-aware.
 */
export function ReminderTimePickerSheet({
  visible,
  hour,
  minute,
  onConfirm,
  onDismiss
}: Props) {
  const t = useTheme();
  const tr = useTranslations();
  const styles = useThemedStyles(makeStyles);
  const [draftHour, setDraftHour] = useState<number | null>(null);
  const [draftMinute, setDraftMinute] = useState<number | null>(null);
  const selHour = draftHour ?? hour;
  const selMinute = draftMinute ?? snapMinute(minute);

  const dismiss = useCallback(() => {
    setDraftHour(null);
    setDraftMinute(null);
    onDismiss();
  }, [onDismiss]);

  const confirm = useCallback(() => {
    onConfirm(selHour, selMinute);
    setDraftHour(null);
    setDraftMinute(null);
  }, [onConfirm, selHour, selMinute]);

  const preview = useMemo(
    () => `${pad(selHour)}:${pad(selMinute)}`,
    [selHour, selMinute]
  );

  return (
    <Sheet visible={visible} onDismiss={dismiss}>
      <GlowText size={20} shadow={false} style={styles.title}>
        {tr.notifications.pickerTitle}
      </GlowText>
      <Text style={styles.subtitle}>{tr.notifications.pickerSubtitle}</Text>

      <Text style={styles.preview}>{preview}</Text>

      <View style={styles.columns}>
        <View style={styles.column}>
          <Text style={styles.colLabel}>{tr.notifications.hours}</Text>
          <BottomSheetScrollView
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            overScrollMode="never"
            showsVerticalScrollIndicator={false}
          >
            {HOURS.map((h) => {
              const active = h === selHour;
              return (
                <Pressable
                  key={h}
                  onPress={() => setDraftHour(h)}
                  style={[styles.cell, active && styles.cellActive]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      active && { color: t.colors.accent }
                    ]}
                  >
                    {pad(h)}
                  </Text>
                </Pressable>
              );
            })}
          </BottomSheetScrollView>
        </View>

        <View style={styles.column}>
          <Text style={styles.colLabel}>{tr.notifications.minutes}</Text>
          <BottomSheetScrollView
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            overScrollMode="never"
            showsVerticalScrollIndicator={false}
          >
            {MINUTES.map((m) => {
              const active = m === selMinute;
              return (
                <Pressable
                  key={m}
                  onPress={() => setDraftMinute(m)}
                  style={[styles.cell, active && styles.cellActive]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      active && { color: t.colors.accent }
                    ]}
                  >
                    {pad(m)}
                  </Text>
                </Pressable>
              );
            })}
          </BottomSheetScrollView>
        </View>
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
      marginBottom: t.spacing[1]
    },
    subtitle: {
      color: t.colors.textMuted,
      fontSize: 13,
      fontFamily: t.fonts.body,
      marginBottom: t.spacing[4]
    },
    preview: {
      color: t.colors.accent,
      fontSize: 40,
      fontFamily: t.fonts.display,
      textAlign: "center",
      marginBottom: t.spacing[4]
    },
    columns: {
      flexDirection: "row",
      gap: t.spacing[4],
      height: 200
    },
    column: {
      flex: 1
    },
    colLabel: {
      color: t.colors.textMuted,
      fontSize: 12,
      fontFamily: t.fonts.body,
      textAlign: "center",
      marginBottom: t.spacing[2]
    },
    scroll: {
      flex: 1
    },
    cell: {
      paddingVertical: t.spacing[3],
      borderRadius: t.radii.md,
      alignItems: "center",
      marginBottom: t.spacing[1] + 1
    },
    cellActive: {
      backgroundColor: `${t.colors.accent}14`,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.accent
    },
    cellText: {
      color: t.colors.textSecondary,
      fontSize: 18,
      fontFamily: t.fonts.mono
    },
    actions: {
      marginTop: t.spacing[5]
    },
    confirmText: {
      color: t.colors.text,
      fontSize: 15,
      fontFamily: t.fonts.body,
      fontWeight: "600",
      textAlign: "center"
    }
  });
