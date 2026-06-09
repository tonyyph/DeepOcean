import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import type { AppTheme } from "../themes";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";

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
  icon
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

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value
  }));

  const accent = tone === "danger" ? t.colors.danger : t.colors.accent;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          <BlurView
            intensity={32}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <Pressable
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(0,0,0,0.55)" }
            ]}
            onPress={onDismiss}
          />
        </Animated.View>

        <View style={styles.center} pointerEvents="box-none">
          <Animated.View style={[styles.card, cardStyle]}>
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

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            <View style={styles.actions}>
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
                      color: tone === "danger" ? "#FFFFFF" : t.colors.background
                    }
                  ]}
                >
                  {confirmLabel}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: t.spacing[6]
    },
    card: {
      overflow: "hidden",
      width: "100%",
      maxWidth: 360,
      borderRadius: t.radii.xl,
      backgroundColor: t.colors.surfaceElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.borderStrong,
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
      backgroundColor: "rgba(255,255,255,0.04)",
      shadowOpacity: 0.5,
      shadowRadius: 14,
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
      paddingVertical: t.spacing[3.5],
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
