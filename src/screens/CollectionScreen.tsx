import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import {
  ZoneBackground,
  GlassCard,
  AppHeader,
  CreatureStorySheet,
  PaywallSheet,
  PremiumBadge,
  type StoryRow,
  useTheme,
  useThemedStyles,
  type AppTheme
} from "@/design-system";
import { useCollection } from "@/features/diver";
import { CREATURES, ARTIFACTS, ZONE_TABLE } from "@/features/ocean";
import type { Rarity } from "@/features/ocean";
import type { CollectionEntry } from "@/domain/entities";
import { useTranslations } from "@/core/i18n";
import { usePremium } from "@/stores";

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

export default function CollectionScreen() {
  const { data: entries = [] } = useCollection();
  const tr = useTranslations();
  const styles = useThemedStyles(makeStyles);
  const isPremium = usePremium((s) => s.isPremium);

  const [activeRow, setActiveRow] = useState<StoryRow | null>(null);
  const [storyOpen, setStoryOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const rows = useMemo<StoryRow[]>(() => {
    const seenMap = new Map<string, CollectionEntry>(
      entries.map((e: CollectionEntry) => [e.id, e])
    );
    const fromCreatures: StoryRow[] = CREATURES.map((c) => {
      const entry = seenMap.get(c.id);
      return {
        id: c.id,
        name: c.name,
        zone: ZONE_TABLE[c.zone].label,
        rarity: c.rarity,
        kind: "creature" as const,
        description: c.description,
        seen: !!entry,
        count: entry?.count ?? 0,
        firstSeenAt: entry?.firstSeenAt
      };
    });
    const fromArtifacts: StoryRow[] = ARTIFACTS.map((a) => {
      const entry = seenMap.get(a.id);
      return {
        id: a.id,
        name: a.name,
        zone: ZONE_TABLE[a.zone].label,
        rarity: a.rarity,
        kind: "artifact" as const,
        description: a.lore,
        seen: !!entry,
        count: entry?.count ?? 0,
        firstSeenAt: entry?.firstSeenAt
      };
    });
    return [...fromCreatures, ...fromArtifacts].sort(
      (a, b) => Number(b.seen) - Number(a.seen)
    );
  }, [entries]);

  const discoveredCount = rows.filter((r) => r.seen).length;

  const handleRowPress = useCallback((row: StoryRow) => {
    setActiveRow(row);
    setStoryOpen(true);
  }, []);

  const handlePaywall = useCallback(() => {
    setPaywallOpen(true);
  }, []);

  return (
    <ZoneBackground zone="midnight">
      <SafeAreaView style={styles.flex}>
        <View style={styles.headerWrap}>
          <AppHeader
            title={tr.collection.title}
            subtitle={tr.collection.catalogued(discoveredCount, rows.length)}
            size={28}
          />
          {!isPremium ? (
            <Pressable
              onPress={handlePaywall}
              style={styles.proCallout}
              accessibilityRole="button"
            >
              <PremiumBadge variant="lock" />
              <Text style={styles.proCalloutText} numberOfLines={2}>
                {tr.collection.story.proLocked}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color="rgba(255,210,122,0.85)"
              />
            </Pressable>
          ) : null}
        </View>
        <FlashList
          data={rows}
          keyExtractor={(r) => r.id}
          estimatedItemSize={120}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <CollectionRow
              row={item}
              index={index}
              isPremium={isPremium}
              onPress={handleRowPress}
            />
          )}
          ItemSeparatorComponent={Separator}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>

      <CreatureStorySheet
        visible={storyOpen}
        onDismiss={() => setStoryOpen(false)}
        row={activeRow}
        onRequestPaywall={handlePaywall}
      />

      <PaywallSheet
        visible={paywallOpen}
        onDismiss={() => setPaywallOpen(false)}
      />
    </ZoneBackground>
  );
}

const Separator = () => <View style={separatorStyles.sep} />;

type RowProps = {
  row: StoryRow;
  index: number;
  isPremium: boolean;
  onPress: (row: StoryRow) => void;
};

const CollectionRow = React.memo(function CollectionRow({
  row,
  index,
  isPremium,
  onPress
}: RowProps) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();
  const color = rarityColor(row.rarity, t);

  const handlePress = useCallback(() => onPress(row), [onPress, row]);

  const isMystery = !row.seen;
  const pulseDelay = (index % 6) * 240;

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={row.seen ? row.name : tr.collection.story.lockedTitle}
    >
      <GlassCard radius={t.radii.lg}>
        <View style={styles.itemRow}>
          <MotiView
            from={{ opacity: isMystery ? 0.35 : 1, scale: 1 }}
            animate={{
              opacity: isMystery ? 0.55 : 1,
              scale: isMystery ? 1.05 : 1
            }}
            transition={{
              type: "timing",
              duration: 2600,
              loop: isMystery,
              repeatReverse: true,
              delay: pulseDelay
            }}
            style={[
              styles.iconBubble,
              {
                borderColor: row.seen ? color : t.colors.border,
                shadowColor: row.seen ? color : "transparent"
              }
            ]}
          >
            <Text
              style={[
                styles.iconText,
                { color: row.seen ? color : t.colors.textFaint }
              ]}
            >
              {row.seen ? (row.kind === "creature" ? "✦" : "◆") : "?"}
            </Text>
          </MotiView>
          <View style={styles.flex}>
            <View style={styles.nameRow}>
              <Text
                style={[
                  styles.name,
                  !row.seen && { color: t.colors.textMuted }
                ]}
              >
                {row.seen ? row.name : tr.collection.undiscovered}
              </Text>
              {row.seen && !isPremium ? (
                <View style={styles.proHint}>
                  <Ionicons
                    name="lock-closed"
                    size={10}
                    color={t.colors.premium}
                  />
                </View>
              ) : null}
            </View>
            <Text style={styles.zoneLabel}>
              {row.seen ? row.zone : "???"} · {row.rarity.toUpperCase()}
              {row.count > 1 ? `  ×${row.count}` : ""}
            </Text>
            {row.seen ? (
              <Text style={styles.desc} numberOfLines={2}>
                {row.description}
              </Text>
            ) : (
              <Text style={styles.whisper} numberOfLines={2}>
                {tr.collection.story.lockedBody}
              </Text>
            )}
          </View>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={t.colors.textMuted}
          />
        </View>
      </GlassCard>
    </Pressable>
  );
});

const separatorStyles = StyleSheet.create({
  sep: { height: 10 }
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    headerWrap: {
      paddingHorizontal: t.spacing[5],
      gap: t.spacing[3]
    },
    proCallout: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[3],
      paddingVertical: t.spacing[3],
      paddingHorizontal: t.spacing[4],
      borderRadius: t.radii.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255,210,122,0.28)",
      backgroundColor: "rgba(255,210,122,0.06)",
      marginBottom: t.spacing[2]
    },
    proCalloutText: {
      flex: 1,
      color: t.colors.text,
      fontFamily: t.fonts.body,
      fontSize: 12,
      lineHeight: 17
    },
    listContent: {
      paddingHorizontal: t.spacing[4],
      paddingBottom: t.spacing[24]
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[3] + 2
    },
    iconBubble: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.04)",
      shadowOpacity: 0.55,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 0 }
    },
    iconText: { fontSize: 18, fontFamily: t.fonts.display },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[2]
    },
    name: {
      color: t.colors.text,
      fontSize: 16,
      fontFamily: t.fonts.body,
      flexShrink: 1
    },
    proHint: {
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.premium,
      backgroundColor: "rgba(255,210,122,0.10)"
    },
    zoneLabel: {
      color: t.colors.textMuted,
      fontSize: 11,
      letterSpacing: 1,
      marginTop: 3,
      fontFamily: t.fonts.label
    },
    desc: {
      color: t.colors.textSecondary,
      fontSize: 13,
      marginTop: t.spacing[2] - 2,
      lineHeight: 19,
      fontFamily: t.fonts.body
    },
    whisper: {
      color: t.colors.textFaint,
      fontSize: 12,
      marginTop: t.spacing[2] - 2,
      lineHeight: 17,
      fontFamily: t.fonts.body,
      fontStyle: "italic"
    }
  });
