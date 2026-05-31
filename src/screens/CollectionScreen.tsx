import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import {
  ZoneBackground,
  GlassCard,
  AppHeader,
  useTheme,
  useThemedStyles,
  type AppTheme
} from "@/design-system";
import { useCollection } from "@/features/diver";
import { CREATURES, ARTIFACTS, ZONE_TABLE } from "@/features/ocean";
import type { Rarity } from "@/features/ocean";
import type { CollectionEntry } from "@/domain/entities";
import { useTranslations } from "@/core/i18n";

type Row = {
  id: string;
  name: string;
  zone: string;
  rarity: Rarity;
  kind: "creature" | "artifact";
  description: string;
  seen: boolean;
  count: number;
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
      return "rgba(255,255,255,0.45)";
  }
}

export default function CollectionScreen() {
  const { data: entries = [] } = useCollection();
  const tr = useTranslations();
  const styles = useThemedStyles(makeStyles);

  const rows = useMemo<Row[]>(() => {
    const seenMap = new Map<string, CollectionEntry>(
      entries.map((e: CollectionEntry) => [e.id, e])
    );
    const fromCreatures: Row[] = CREATURES.map((c) => ({
      id: c.id,
      name: c.name,
      zone: ZONE_TABLE[c.zone].label,
      rarity: c.rarity,
      kind: "creature" as const,
      description: c.description,
      seen: seenMap.has(c.id),
      count: seenMap.get(c.id)?.count ?? 0
    }));
    const fromArtifacts: Row[] = ARTIFACTS.map((a) => ({
      id: a.id,
      name: a.name,
      zone: ZONE_TABLE[a.zone].label,
      rarity: a.rarity,
      kind: "artifact" as const,
      description: a.lore,
      seen: seenMap.has(a.id),
      count: seenMap.get(a.id)?.count ?? 0
    }));
    return [...fromCreatures, ...fromArtifacts].sort(
      (a, b) => Number(b.seen) - Number(a.seen)
    );
  }, [entries]);

  const discoveredCount = rows.filter((r) => r.seen).length;

  return (
    <ZoneBackground zone="midnight">
      <SafeAreaView style={styles.flex}>
        <View style={styles.headerWrap}>
          <AppHeader
            title={tr.collection.title}
            subtitle={tr.collection.catalogued(discoveredCount, rows.length)}
            size={28}
          />
        </View>
        <FlashList
          data={rows}
          keyExtractor={(r) => r.id}
          estimatedItemSize={110}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <CollectionRow row={item} />}
          ItemSeparatorComponent={Separator}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </ZoneBackground>
  );
}

const Separator = () => <View style={separatorStyles.sep} />;

const CollectionRow = React.memo(function CollectionRow({ row }: { row: Row }) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();
  const color = rarityColor(row.rarity, t);

  return (
    <GlassCard radius={t.radii.lg}>
      <View style={styles.itemRow}>
        <View
          style={[
            styles.iconBubble,
            {
              borderColor: color,
              opacity: row.seen ? 1 : 0.35
            }
          ]}
        >
          <Text style={[styles.iconText, { color }]}>
            {row.kind === "creature" ? "✦" : "◆"}
          </Text>
        </View>
        <View style={styles.flex}>
          <Text
            style={[styles.name, !row.seen && { color: t.colors.textMuted }]}
          >
            {row.seen ? row.name : tr.collection.undiscovered}
          </Text>
          <Text style={styles.zoneLabel}>
            {row.zone} · {row.rarity.toUpperCase()}
            {row.count > 1 ? `  ×${row.count}` : ""}
          </Text>
          {row.seen ? <Text style={styles.desc}>{row.description}</Text> : null}
        </View>
      </View>
    </GlassCard>
  );
});

const separatorStyles = StyleSheet.create({
  sep: { height: 10 }
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    headerWrap: {
      paddingHorizontal: t.spacing[5]
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
      backgroundColor: "rgba(255,255,255,0.04)"
    },
    iconText: { fontSize: 18 },
    name: {
      color: t.colors.text,
      fontSize: 16,
      fontFamily: t.fonts.body
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
    }
  });
