import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import type { AppTheme } from "../themes";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import { GlowText } from "./GlowText";
import { ModalFrame } from "./ModalFrame";
import { Pressable } from "react-native-gesture-handler";

const tap = (style: Haptics.ImpactFeedbackStyle): void => {
  void Haptics.impactAsync(style).catch(() => {});
};

type Tone = "default" | "danger";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  onConfirm: () => void;
  /** Visual tone of the confirm action. */
  tone?: Tone;
  /** Optional Ionicon name shown above the title. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Hide the secondary action for acknowledgement-only messages. */
  showCancel?: boolean;
};

/**
 * ConfirmModal — centered, alert-style confirmation modal.
 * Use this for destructive / irreversible actions (e.g. abort dive) where a
 * bottom sheet feels too passive. Renders a blurred backdrop with a tight
 * card; tone="danger" tints the icon + confirm button with `colors.danger`.
 */
export const ConfirmModal = React.memo(function ConfirmModal({
  visible,
  onDismiss,
  title,
  message,
  cancelLabel,
  confirmLabel,
  onConfirm,
  tone = "default",
  icon,
  showCancel = true
}: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: 220,
      easing: Easing.bezier(0.16, 1, 0.3, 1)
    });
  }, [visible, progress]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: 0.94 + progress.value * 0.06 },
      { translateY: (1 - progress.value) * 12 }
    ]
  }));

  const accent = tone === "danger" ? t.colors.danger : t.colors.accent;

  return (
    <ModalFrame
      visible={visible}
      onDismiss={onDismiss}
      progress={progress}
      cardAnimatedStyle={cardStyle}
      cardStyle={styles.card}
      accentColor={accent}
    >
      {icon && (
        <View
          style={[
            styles.iconWrap,
            { borderColor: accent, shadowColor: accent }
          ]}
        >
          <Ionicons name={icon} size={32} color={accent} />
        </View>
      )}

      <GlowText size={20} style={styles.title}>
        {title}
      </GlowText>
      <Text style={styles.message}>{message}</Text>

      <View style={styles.actions}>
        {showCancel && (
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              styles.cancelBtn,
              pressed && { opacity: 0.7 }
            ]}
            onPress={() => {
              tap(Haptics.ImpactFeedbackStyle.Light);
              onDismiss();
            }}
          >
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </Pressable>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            styles.confirmBtn,
            { backgroundColor: accent },
            pressed && { opacity: 0.85 }
          ]}
          onPress={() => {
            tap(
              tone === "danger"
                ? Haptics.ImpactFeedbackStyle.Heavy
                : Haptics.ImpactFeedbackStyle.Medium
            );
            onConfirm();
          }}
        >
          <Text
            style={[
              styles.confirmText,
              {
                color: t.colors.background
              }
            ]}
          >
            {confirmLabel}
          </Text>
        </Pressable>
      </View>
    </ModalFrame>
  );
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    card: {
      maxWidth: 360,
      paddingVertical: t.spacing[6],
      paddingHorizontal: t.spacing[5],
      alignItems: "center",
      gap: t.spacing[3]
    },
    iconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.colors.glass,
      shadowOpacity: 0.18,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 0 },
      marginBottom: t.spacing[1]
    },
    title: {
      color: t.colors.text,
      fontSize: 20,
      fontFamily: t.fonts.display,
      letterSpacing: t.fonts.displayLetterSpacing,
      textAlign: "center"
    },
    message: {
      color: t.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: t.fonts.body,
      textAlign: "center",
      paddingHorizontal: t.spacing[2]
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: t.spacing[8],
      flexWrap: "wrap",
      marginTop: t.spacing[3]
    },
    btn: {
      flex: 1,
      paddingVertical: t.spacing[3],
      borderRadius: t.radii.md,
      alignItems: "center",
      justifyContent: "center"
    },
    cancelBtn: {
      backgroundColor: t.colors.surfaceElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border
    },
    confirmBtn: {
      backgroundColor: t.colors.accent
      // backgroundColor set inline per tone
    },
    cancelText: {
      color: t.colors.text,
      fontFamily: t.fonts.label,
      fontSize: 13,
      letterSpacing: 1,
      textAlign: "center"
    },
    confirmText: {
      fontFamily: t.fonts.label,
      fontSize: 13,
      letterSpacing: 1,
      fontWeight: "700",
      textAlign: "center"
    }
  });
