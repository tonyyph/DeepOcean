import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePremium } from "@/stores";
import type { ThemeId } from "../themes";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import type { AppTheme } from "../themes";
import { PressableCard } from "./PressableCard";

type Props = {
  /** Premium content rendered once the user is entitled. */
  children: React.ReactNode;
  /**
   * When set, the guard unlocks if the user owns this specific theme pack OR
   * holds the all-access pass. Otherwise only the all-access pass unlocks.
   */
  themeId?: ThemeId;
  /** Called when the user taps the locked overlay (open the paywall). */
  onRequestUnlock?: () => void;
  /** Optional locked-state label. */
  label?: string;
  /**
   * Custom locked fallback. When provided it fully replaces the default
   * lock card (the `onRequestUnlock` wiring is the caller's responsibility).
   */
  fallback?: React.ReactNode;
};

/**
 * PremiumGuard — gates premium UI behind the entitlement gateway.
 *
 * Pure presentation: it reads resolved entitlement state from `usePremium`
 * (sourced from RevenueCat) and renders either the children or a tappable
 * locked card that invites the user to unlock.
 */
export function PremiumGuard({
  children,
  themeId,
  onRequestUnlock,
  label,
  fallback
}: Props) {
  const isPremium = usePremium((s) => s.isPremium);
  const unlockedThemes = usePremium((s) => s.unlockedThemes);

  const entitled =
    isPremium || (themeId ? unlockedThemes.includes(themeId) : false);

  if (entitled) return <>{children}</>;
  if (fallback) return <>{fallback}</>;

  return <LockedCard label={label} onPress={onRequestUnlock} />;
}

function LockedCard({
  label,
  onPress
}: {
  label?: string;
  onPress?: () => void;
}) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <PressableCard haptic="light" onPress={onPress} radius={t.radii.md}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name="lock-closed" size={16} color={t.colors.premium} />
        </View>
        {label ? <Text style={styles.label}>{label}</Text> : null}
      </View>
    </PressableCard>
  );
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[3]
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,210,122,0.10)"
    },
    label: {
      flex: 1,
      color: t.colors.textSecondary,
      fontSize: 14,
      fontFamily: t.fonts.body
    }
  });
