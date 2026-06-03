import React, { useMemo } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeOutUp,
  FadeIn,
  FadeOut
} from "react-native-reanimated";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import type { AppTheme } from "../themes";
import { GlassCard } from "../atoms/GlassCard";
import { GlowText } from "../atoms/GlowText";
import { useTranslations } from "@/core/i18n";
import { useSettings } from "@/stores";
import { rarityColor } from "@/features/ocean";
import type { Discovery } from "@/features/ocean";

export type DiscoveryOverlayProps = {
  /** The discovery to present, or null when idle. */
  discovery: Discovery | null;
  /** Count of discoveries still queued behind this one. */
  pending: number;
  /** Called when the user taps the card to dismiss it early. */
  onDismiss: () => void;
};

/**
 * DiscoveryOverlay — non-blocking, tap-to-dismiss card that surfaces a single
 * live discovery during an active dive. Entrance/exit animations collapse to a
 * plain fade under reduced motion. Rendering nothing when `discovery` is null
 * keeps it cheap when idle.
 */
export const DiscoveryOverlay = React.memo(function DiscoveryOverlay({
  discovery,
  pending,
  onDismiss
}: DiscoveryOverlayProps) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();
  const reducedMotion = useSettings((s) => s.reducedMotion);

  const accent = useMemo(
    () =>
      discovery ? rarityColor(discovery.entry.rarity, t) : t.colors.accent,
    [discovery, t]
  );

  if (!discovery) return null;

  const entering = reducedMotion
    ? FadeIn.duration(160)
    : FadeInDown.springify().damping(18);
  const exiting = reducedMotion
    ? FadeOut.duration(140)
    : FadeOutUp.duration(220);
  const kindLabel =
    discovery.kind === "creature" ? tr.dive.creature : tr.dive.artifact;
  const icon = discovery.kind === "creature" ? "fish" : "diamond";

  return (
    <Animated.View
      key={`${discovery.kind}-${discovery.entry.id}-${discovery.atMinute}`}
      entering={entering}
      exiting={exiting}
      style={styles.wrap}
      pointerEvents="box-none"
    >
      <Pressable onPress={onDismiss} accessibilityRole="button">
        <GlassCard glow radius={t.radii.lg}>
          <View style={styles.row}>
            <View style={[styles.iconWrap, { borderColor: accent }]}>
              <Ionicons name={icon} size={20} color={accent} />
            </View>
            <View style={styles.body}>
              <Text style={[styles.eyebrow, { color: accent }]}>
                {tr.dive.discovered} · {kindLabel}
              </Text>
              <GlowText size={16} color={t.colors.text}>
                {discovery.entry.name}
              </GlowText>
            </View>
            {pending > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>+{pending}</Text>
              </View>
            ) : null}
          </View>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    wrap: {
      alignSelf: "stretch",
      zIndex: 50
    },
    row: { flexDirection: "row", alignItems: "center", gap: t.spacing[3] },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center"
    },
    body: { flex: 1, gap: 2 },
    eyebrow: {
      fontFamily: t.fonts.label,
      fontSize: 10,
      letterSpacing: 1.4,
      textTransform: "uppercase"
    },
    badge: {
      minWidth: 28,
      paddingHorizontal: t.spacing[2],
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.colors.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.glassEdge
    },
    badgeText: {
      fontFamily: t.fonts.mono,
      fontSize: 12,
      color: t.colors.textSecondary
    }
  });
