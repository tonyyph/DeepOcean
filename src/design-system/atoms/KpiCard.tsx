import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { GlassCard } from "./GlassCard";
import { Skeleton } from "./Skeleton";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import type { AppTheme } from "../themes";

type Props = {
  label: string;
  value: string;
  loading?: boolean;
};

/**
 * KpiCard — shared KPI pattern used by stats/detail screens.
 */
export const KpiCard = React.memo(function KpiCard({
  label,
  value,
  loading
}: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <GlassCard style={styles.flex} radius={t.radii.md}>
      <Text style={styles.kpiLabel}>{label}</Text>
      {loading ? (
        <View style={styles.kpiValueSkeletonRow}>
          <Skeleton style={styles.kpiValueSkeletonMain} />
          <Skeleton style={styles.kpiValueSkeletonUnit} />
        </View>
      ) : (
        <Text style={styles.kpiValue}>{value}</Text>
      )}
    </GlassCard>
  );
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    kpiLabel: {
      color: t.colors.textSecondary,
      fontSize: 10,
      letterSpacing: 1,
      fontFamily: t.fonts.label
    },
    kpiValue: {
      color: t.colors.text,
      fontSize: 24,
      marginTop: t.spacing[1.5],
      fontFamily: t.fonts.mono
    },
    kpiValueSkeletonRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[1],
      marginTop: t.spacing[2]
    },
    kpiValueSkeletonMain: {
      width: 56,
      height: 24,
      borderRadius: t.radii.xs
    },
    kpiValueSkeletonUnit: {
      width: 24,
      height: 12,
      borderRadius: t.radii.xs
    }
  });
