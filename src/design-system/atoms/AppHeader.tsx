import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import type { AppTheme } from "../themes";
import { GlowText } from "./GlowText";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  pulse?: boolean;
  /** Override headline size. */
  size?: number;
};

/**
 * AppHeader — consistent page header. Replaces 6+ ad-hoc header blocks across
 * screens. Always wrapped in proper padding from the parent ScrollView.
 */
export const AppHeader = React.memo(function AppHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  pulse = false,
  size = 32
}: Props) {
  const styles = useThemedStyles(makeStyles);
  const alignStyle = align === "center" ? styles.center : styles.left;

  return (
    <View style={[styles.wrap, alignStyle]}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <GlowText size={size} pulse={pulse}>
        {title}
      </GlowText>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    wrap: {
      paddingVertical: t.spacing[4],
      gap: t.spacing[1]
    },
    left: { alignItems: "flex-start" },
    center: { alignItems: "center" },
    eyebrow: {
      color: t.colors.textMuted,
      fontSize: 11,
      letterSpacing: 1,
      fontFamily: t.fonts.label
    },
    sub: {
      color: t.colors.textSecondary,
      marginTop: t.spacing[1.5],
      fontSize: 14,
      lineHeight: 20,
      fontFamily: t.fonts.body
    }
  });

// Re-export for convenience
export { GlowText };
