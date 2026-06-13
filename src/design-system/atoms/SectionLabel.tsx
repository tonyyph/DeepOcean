import React from "react";
import { Text, StyleSheet, View, TextProps } from "react-native";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import type { AppTheme } from "../themes";

type Props = TextProps & {
  children: React.ReactNode;
  /** Optional right-aligned hint, e.g. `"5 / 12"`. */
  hint?: string;
  /** Outer wrapper margins. */
  spacing?: "default" | "tight" | "none";
};

/**
 * SectionLabel — small uppercase eyebrow label used to head a card/section.
 * Replaces the ad-hoc `<Text style={styles.label}>` pattern across screens.
 */
export const SectionLabel = React.memo(function SectionLabel({
  children,
  hint,
  spacing = "default",
  style,
  ...rest
}: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);

  const wrapperStyle =
    spacing === "tight"
      ? styles.wrapTight
      : spacing === "none"
        ? undefined
        : styles.wrap;

  return (
    <View style={[styles.row, wrapperStyle]}>
      <Text style={[styles.label, style]} {...rest}>
        {typeof children === "string" ? children.toUpperCase() : children}
      </Text>
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },
    wrap: { marginBottom: t.spacing[3] },
    wrapTight: { marginBottom: t.spacing[2] },
    label: {
      fontSize: 12,
      letterSpacing: 1,
      color: t.colors.textSecondary,
      fontFamily: t.fonts.label
    },
    hint: {
      color: t.colors.textMuted,
      fontSize: 10,
      letterSpacing: 1,
      fontFamily: t.fonts.label
    }
  });
