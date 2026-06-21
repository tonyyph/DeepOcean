import { useTranslations } from "@/core/i18n";
import {
  pickerIndexFromOffset,
  REMINDER_HOURS,
  REMINDER_MINUTES,
  snapReminderMinute
} from "@/features/notifications/reminderTimePicker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import { GlowText } from "../atoms/GlowText";
import { PressableCard } from "../atoms/PressableCard";
import { Sheet } from "../atoms/Sheet";
import type { AppTheme } from "../themes";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

type Props = {
  visible: boolean;
  hour: number;
  minute: number;
  onConfirm: (hour: number, minute: number) => void;
  onDismiss: () => void;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

type TimeColumnProps = {
  values: readonly number[];
  selected: number;
  label: string;
  onSelect: (value: number) => void;
};

function TimeColumn({ values, selected, label, onSelect }: TimeColumnProps) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const listRef = useRef<FlatList<number>>(null);
  const selectedIndex = Math.max(0, values.indexOf(selected));

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: selectedIndex * ITEM_HEIGHT,
        animated: false
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedIndex]);

  const handlePress = useCallback(
    (value: number) => {
      const index = values.indexOf(value);
      if (index >= 0) {
        listRef.current?.scrollToOffset({
          offset: index * ITEM_HEIGHT,
          animated: true
        });
      }
      onSelect(value);
    },
    [onSelect, values]
  );

  const selectFromOffset = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.max(
        0,
        pickerIndexFromOffset(
          event.nativeEvent.contentOffset.y,
          ITEM_HEIGHT,
          values.length
        )
      );
      const value = values[index];
      if (value != null && value !== selected) {
        onSelect(value);
      }
    },
    [onSelect, selected, values]
  );

  return (
    <View style={styles.column}>
      <Text style={styles.colLabel}>{label}</Text>
      <View style={styles.wheel}>
        <View style={styles.selectionBand} pointerEvents="none" />
        <FlatList
          ref={listRef}
          data={values}
          keyExtractor={(value) => String(value)}
          renderItem={({ item }) => {
            const active = item === selected;
            return (
              <Pressable
                onPress={() => handlePress(item)}
                style={styles.cell}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={pad(item)}
              >
                <Text
                  style={[
                    styles.cellText,
                    active && styles.cellTextActive,
                    active && { color: t.colors.accent }
                  ]}
                >
                  {pad(item)}
                </Text>
              </Pressable>
            );
          }}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index
          })}
          initialScrollIndex={selectedIndex}
          contentContainerStyle={styles.wheelContent}
          snapToInterval={ITEM_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          nestedScrollEnabled
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={selectFromOffset}
          onScrollEndDrag={selectFromOffset}
          removeClippedSubviews={false}
        />
      </View>
    </View>
  );
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
  const tr = useTranslations();
  const styles = useThemedStyles(makeStyles);
  const { height: screenHeight } = useWindowDimensions();
  const [draftHour, setDraftHour] = useState<number | null>(null);
  const [draftMinute, setDraftMinute] = useState<number | null>(null);
  const selHour = draftHour ?? hour;
  const selMinute = draftMinute ?? snapReminderMinute(minute);

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
  const compact = screenHeight < 720;

  return (
    <Sheet
      visible={visible}
      onDismiss={dismiss}
      enableContentPanningGesture={false}
    >
      <GlowText size={20} shadow={false} style={styles.title}>
        {tr.notifications.pickerTitle}
      </GlowText>
      <Text style={styles.subtitle}>{tr.notifications.pickerSubtitle}</Text>
      <View style={styles.columns}>
        <TimeColumn
          values={REMINDER_HOURS}
          selected={selHour}
          label={tr.notifications.hours}
          onSelect={setDraftHour}
        />
        <Text style={styles.separator}>:</Text>
        <TimeColumn
          values={REMINDER_MINUTES}
          selected={selMinute}
          label={tr.notifications.minutes}
          onSelect={setDraftMinute}
        />
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
    previewCompact: {
      fontSize: 34,
      marginBottom: t.spacing[2]
    },
    columns: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[2],
      marginVertical: t.spacing[4]
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
    separator: {
      color: t.colors.textMuted,
      fontSize: 28,
      fontFamily: t.fonts.mono,
      marginTop: t.spacing[5]
    },
    wheel: {
      height: PICKER_HEIGHT,
      overflow: "hidden",
      borderRadius: t.radii.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.borderStrong,
      backgroundColor: t.colors.panelStrong
    },
    wheelContent: {
      paddingVertical: ITEM_HEIGHT * 2
    },
    selectionBand: {
      position: "absolute",
      left: t.spacing[2],
      right: t.spacing[2],
      top: ITEM_HEIGHT * 2,
      height: ITEM_HEIGHT,
      borderRadius: t.radii.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.accent,
      backgroundColor: `${t.colors.accent}14`,
      zIndex: 1
    },
    cell: {
      height: ITEM_HEIGHT,
      alignItems: "center",
      justifyContent: "center"
    },
    cellText: {
      color: t.colors.textSecondary,
      fontSize: 18,
      fontFamily: t.fonts.mono
    },
    cellTextActive: {
      fontSize: 21
    },
    actions: {
      marginTop: t.spacing[4]
    },
    confirmText: {
      color: t.colors.text,
      fontSize: 15,
      fontFamily: t.fonts.body,
      fontWeight: "600",
      textAlign: "center"
    }
  });
