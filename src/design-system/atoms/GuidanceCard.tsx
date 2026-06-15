import { storage } from "@/core/storage/mmkv";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { AppTheme } from "../themes";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import { GlassCard } from "./GlassCard";

type Props = {
  storageKey: string;
  title: string;
  body: string;
  dismissLabel: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export const GuidanceCard = React.memo(function GuidanceCard({
  storageKey,
  title,
  body,
  dismissLabel,
  icon = "compass-outline"
}: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [visible, setVisible] = useState(
    () => !(storage.getBoolean(storageKey) ?? false)
  );

  const dismiss = useCallback(() => {
    storage.set(storageKey, true);
    setVisible(false);
  }, [storageKey]);

  if (!visible) return null;

  return (
    <GlassCard radius={t.radii.md} padding={t.spacing[4]}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={18} color={t.colors.accent} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </View>
        <Pressable
          onPress={dismiss}
          accessibilityRole="button"
          accessibilityLabel={dismissLabel}
          hitSlop={12}
          style={styles.close}
        >
          <Ionicons name="close" size={16} color={t.colors.textMuted} />
        </Pressable>
      </View>
    </GlassCard>
  );
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: t.spacing[3]
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: t.radii.s,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.colors.panelStrong,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border
    },
    copy: { flex: 1 },
    title: {
      color: t.colors.text,
      fontFamily: t.fonts.label,
      fontSize: 12,
      letterSpacing: 0.4
    },
    body: {
      color: t.colors.textSecondary,
      fontFamily: t.fonts.body,
      fontSize: 12,
      lineHeight: 18,
      marginTop: t.spacing[1]
    },
    close: {
      width: 44,
      minHeight: 44,
      marginTop: -t.spacing[2],
      marginRight: -t.spacing[2],
      alignItems: "center",
      justifyContent: "center"
    }
  });
