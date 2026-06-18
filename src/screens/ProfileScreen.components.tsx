import { useTranslations } from "@/core/i18n";
import {
  GlassCard,
  PremiumBadge,
  PressableCard,
  useTheme,
  useThemedStyles,
} from "@/design-system";
import { Ionicons } from "@expo/vector-icons";
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
      <GlassCard radius={t.radii.md} padding={t.spacing[5]} glow>
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
        <View style={styles.premiumDashboardGrid}>
          <PremiumSignal
            icon="sparkles"
            label={tr.profile.premiumSignalPlan}
            value={tr.profile.premiumSignalPlanValue}
          />
          <PremiumSignal
            icon="stats-chart"
            label={tr.profile.premiumSignalInsight}
            value={tr.profile.premiumSignalInsightValue}
          />
          <PremiumSignal
            icon="color-palette"
            label={tr.profile.premiumSignalTheme}
            value={tr.profile.premiumSignalThemeValue}
          />
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
      <View style={styles.premiumPreviewGrid}>
        <Text style={styles.premiumPreviewText}>
          {tr.profile.premiumPreviewPlan}
        </Text>
        <Text style={styles.premiumPreviewText}>
          {tr.profile.premiumPreviewInsight}
        </Text>
      </View>
    </PressableCard>
  );
}

function PremiumSignal({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.premiumSignal}>
      <Ionicons name={icon} size={14} color={t.colors.premium} />
      <Text style={styles.premiumSignalLabel}>{label}</Text>
      <Text style={styles.premiumSignalValue}>{value}</Text>
    </View>
  );
}
