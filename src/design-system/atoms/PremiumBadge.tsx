import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import type { AppTheme } from "../themes";
import { Colors } from "@/theme";

type Props = {
  /** "lock" shows a padlock; "star" shows a premium star. */
  variant?: "lock" | "star";
  label?: string;
  size?: "sm" | "md";
};

/**
 * PremiumBadge — small pill indicator for paywalled content.
 * Uses theme `colors.premium` (gold) for visibility on any background.
 */
export const PremiumBadge = React.memo(function PremiumBadge({
  variant = "star",
  label = "PRO",
  size = "sm"
}: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const iconName = variant === "lock" ? "lock-closed" : "star";
  const iconSize = size === "sm" ? 9 : 11;
  const padV = size === "sm" ? 3 : 4;
  const padH = size === "sm" ? 7 : 9;

  return (
    <View
      style={[styles.badge, { paddingVertical: padV, paddingHorizontal: padH }]}
    >
      <Ionicons name={iconName} size={iconSize} color={t.colors.premium} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderRadius: t.radii.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.premium,
      backgroundColor: `${Colors.premium.gold}1A`
    },
    text: {
      color: t.colors.premium,
      fontSize: 9,
      letterSpacing: 1,
      fontFamily: t.fonts.label
    }
  });
