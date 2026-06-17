import { useTranslations } from "@/core/i18n";
import {
  GlassCard,
  PremiumBadge,
  PressableCard,
  useTheme,
  useThemedStyles,
} from "@/design-system";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { makeStyles } from "./ProfileScreen.styles";

export function PremiumSection({
  isPremium,
  onOpenPaywall,
}: {
  isPremium: boolean;
  onOpenPaywall: () => void;
}) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();

  if (isPremium) {
    return (
      <GlassCard radius={t.radii.md} padding={t.spacing[5]}>
        <View style={styles.premiumActiveRow}>
          <View
            style={[styles.premiumCrest, { backgroundColor: t.colors.glass }]}
          >
            <Ionicons name="diamond" size={20} color={t.colors.premium} />
          </View>
          <View style={styles.premiumText}>
            <Text style={styles.premiumTitle}>{tr.profile.premium}</Text>
            <Text style={styles.premiumSub}>{tr.profile.premiumActive}</Text>
          </View>
          <PremiumBadge label={tr.profile.premiumActiveBadge} size="md" />
        </View>
      </GlassCard>
    );
  }

  return (
    <PressableCard
      haptic="medium"
      onPress={onOpenPaywall}
      radius={t.radii.md}
      padding={t.spacing[5]}
      accessibilityRole="button"
      accessibilityLabel={tr.profile.premium}
    >
      <View style={styles.premiumActiveRow}>
        <View style={[styles.premiumCrest, styles.premiumCrestLocked]}>
          <Ionicons name="diamond" size={20} color={t.colors.premium} />
        </View>
        <View style={styles.premiumText}>
          <Text style={styles.premiumTitle}>{tr.profile.premium}</Text>
          <Text style={styles.premiumSub}>{tr.profile.premiumDesc}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={t.colors.premium} />
      </View>
    </PressableCard>
  );
}
