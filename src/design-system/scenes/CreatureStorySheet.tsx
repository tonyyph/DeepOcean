import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import type { AppTheme } from "../themes";
import { Sheet } from "../atoms/Sheet";
import { PressableCard } from "../atoms/PressableCard";
import { PremiumBadge } from "../atoms/PremiumBadge";
import { useTranslations } from "@/core/i18n";
import { usePremium } from "@/stores";
import { getLore } from "@/features/ocean";
import type { Rarity } from "@/features/ocean";

export type StoryRow = {
  id: string;
  name: string;
  zone: string;
  rarity: Rarity;
  kind: "creature" | "artifact";
  description: string;
  seen: boolean;
  count: number;
  firstSeenAt?: number;
};

type Props = {
  visible: boolean;
  onDismiss: () => void;
  row: StoryRow | null;
  /** Triggered when locked Pro section is tapped. */
  onRequestPaywall: () => void;
};

function rarityColor(rarity: Rarity, t: AppTheme): string {
  switch (rarity) {
    case "uncommon":
      return t.colors.success;
    case "rare":
      return t.colors.accent;
    case "legendary":
      return t.colors.warning;
    case "mythic":
      return t.colors.danger;
    default:
      return t.colors.textMuted;
  }
}

function formatDate(ts: number, locale: string): string {
  try {
    return new Date(ts).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return new Date(ts).toISOString().slice(0, 10);
  }
}

/**
 * CreatureStorySheet — narrative detail for a collection entry.
 * Adds atmosphere (silhouette, whisper) for undiscovered rows, and gates the
 * deeper "expedition journal" passage behind Pro.
 */
export function CreatureStorySheet({
  visible,
  onDismiss,
  row,
  onRequestPaywall
}: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();
  const isPremium = usePremium((s) => s.isPremium);

  const handlePaywall = useCallback(() => {
    onDismiss();
    setTimeout(onRequestPaywall, 220);
  }, [onDismiss, onRequestPaywall]);

  if (!row) {
    return (
      <Sheet visible={visible} onDismiss={onDismiss}>
        {null}
      </Sheet>
    );
  }

  const lore = getLore(row.id);
  const accent = rarityColor(row.rarity, t);
  const kindLabel =
    row.kind === "creature"
      ? tr.collection.story.creature
      : tr.collection.story.artifact;
  const sigil = row.kind === "creature" ? "✦" : "◆";

  return (
    <Sheet visible={visible} onDismiss={onDismiss}>
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 320 }}
      >
        {/* Crest / silhouette */}
        <LinearGradient
          colors={[
            row.seen ? accent : t.colors.surfaceElevated,
            t.colors.surface
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.crest,
            {
              shadowColor: row.seen ? accent : "transparent",
              opacity: row.seen ? 1 : 0.55
            }
          ]}
        >
          <Text
            style={[
              styles.sigil,
              { color: row.seen ? "#fff" : t.colors.textFaint }
            ]}
          >
            {row.seen ? sigil : "?"}
          </Text>
        </LinearGradient>

        <Text style={styles.kindLabel}>{kindLabel}</Text>
        <Text style={styles.title}>
          {row.seen ? row.name : tr.collection.undiscovered}
        </Text>

        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="locate" size={11} color={t.colors.textMuted} />
            <Text style={styles.metaText}>{row.zone}</Text>
          </View>
          <View style={[styles.metaChip, { borderColor: accent + "55" }]}>
            <View style={[styles.rarityDot, { backgroundColor: accent }]} />
            <Text style={[styles.metaText, { color: accent }]}>
              {row.rarity.toUpperCase()}
            </Text>
          </View>
          {row.seen && row.count > 0 && (
            <View style={styles.metaChip}>
              <Ionicons name="eye" size={11} color={t.colors.textMuted} />
              <Text style={styles.metaText}>
                {tr.collection.story.sightings(row.count)}
              </Text>
            </View>
          )}
        </View>

        {row.seen ? (
          <>
            {/* Story */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                {tr.collection.story.storyTitle}
              </Text>
              <Text style={styles.body}>{lore.story}</Text>
              {row.firstSeenAt && (
                <Text style={styles.metaFoot}>
                  {tr.collection.story.firstSeen} ·{" "}
                  {formatDate(row.firstSeenAt, "en-US")}
                </Text>
              )}
            </View>

            {/* Pro section */}
            <View style={[styles.section, styles.proSection]}>
              <View style={styles.proHeader}>
                <Text
                  style={[styles.sectionLabel, { color: t.colors.premium }]}
                >
                  {tr.collection.story.proTitle}
                </Text>
                {!isPremium && <PremiumBadge variant="lock" />}
              </View>
              {isPremium ? (
                <Text style={styles.body}>{lore.proStory}</Text>
              ) : (
                <>
                  <Text style={styles.bodyMuted}>
                    {tr.collection.story.proLocked}
                  </Text>
                  <PressableCard
                    haptic="medium"
                    onPress={handlePaywall}
                    glow
                    radius={t.radii.md}
                  >
                    <Text style={styles.proCta}>
                      {tr.collection.story.proUnlockCta}
                    </Text>
                  </PressableCard>
                </>
              )}
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {tr.collection.story.whisperLabel}
            </Text>
            <Text style={[styles.body, styles.whisper]}>{lore.whisper}</Text>
            <View style={styles.lockedFoot}>
              <Ionicons
                name="lock-closed"
                size={12}
                color={t.colors.textMuted}
              />
              <Text style={styles.metaFoot}>
                {tr.collection.story.lockedBody}
              </Text>
            </View>
          </View>
        )}

        <PressableCard
          haptic="light"
          onPress={onDismiss}
          radius={t.radii.md}
          style={{ marginTop: t.spacing[5] }}
        >
          <Text style={styles.closeText}>{tr.collection.story.close}</Text>
        </PressableCard>
      </MotiView>
    </Sheet>
  );
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    crest: {
      alignSelf: "center",
      width: 78,
      height: 78,
      borderRadius: t.radii["2xl"],
      alignItems: "center",
      justifyContent: "center",
      shadowOpacity: 0.45,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 0 },
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.borderStrong
    },
    sigil: {
      fontSize: 32,
      fontFamily: t.fonts.display
    },
    kindLabel: {
      color: t.colors.textMuted,
      fontFamily: t.fonts.label,
      letterSpacing: 2,
      fontSize: 10,
      textAlign: "center",
      marginTop: t.spacing[4]
    },
    title: {
      color: t.colors.text,
      fontFamily: t.fonts.display,
      letterSpacing: t.fonts.displayLetterSpacing,
      fontSize: 24,
      textAlign: "center",
      marginTop: t.spacing[1]
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: t.spacing[2],
      marginTop: t.spacing[3]
    },
    metaChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[1.5],
      borderRadius: t.radii.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border,
      backgroundColor: t.colors.glass
    },
    rarityDot: { width: 6, height: 6, borderRadius: 3 },
    metaText: {
      color: t.colors.textSecondary,
      fontFamily: t.fonts.label,
      fontSize: 10,
      letterSpacing: 1
    },
    section: {
      marginTop: t.spacing[5],
      gap: t.spacing[2]
    },
    proSection: {
      padding: t.spacing[4],
      borderRadius: t.radii.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255,210,122,0.28)",
      backgroundColor: "rgba(255,210,122,0.06)"
    },
    proHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },
    sectionLabel: {
      color: t.colors.textMuted,
      fontFamily: t.fonts.label,
      letterSpacing: 2,
      fontSize: 10
    },
    body: {
      color: t.colors.text,
      fontFamily: t.fonts.body,
      fontSize: 14,
      lineHeight: 21
    },
    bodyMuted: {
      color: t.colors.textSecondary,
      fontFamily: t.fonts.body,
      fontSize: 13,
      lineHeight: 19
    },
    whisper: {
      fontStyle: "italic",
      color: t.colors.textSecondary
    },
    metaFoot: {
      color: t.colors.textMuted,
      fontFamily: t.fonts.body,
      fontSize: 11,
      marginTop: t.spacing[1.5]
    },
    lockedFoot: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[2],
      marginTop: t.spacing[2]
    },
    proCta: {
      color: t.colors.premium,
      fontFamily: t.fonts.label,
      letterSpacing: 1.5,
      fontSize: 12,
      textAlign: "center",
      paddingVertical: t.spacing[2],
      fontWeight: "700"
    },
    closeText: {
      color: t.colors.textSecondary,
      fontFamily: t.fonts.label,
      fontSize: 11,
      textAlign: "center"
    }
  });
