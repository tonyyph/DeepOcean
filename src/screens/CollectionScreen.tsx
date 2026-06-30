import { useTranslations } from "@/core/i18n";
import { useScreenTransitionLoading } from "@/core/navigation/screenTransitionLoading";
import {
  AppHeader,
  CreatureStorySheet,
  GlassCard,
  GuidanceCard,
  ScreenSafeAreaView,
  SectionSkeleton,
  Skeleton,
  UnderwaterCanvas,
  ZoneBackground,
  ZoneSetCompleteModal,
  useTheme,
  useThemedStyles,
  type StoryRow
} from "@/design-system";
import type { CollectionEntry } from "@/domain/entities";
import { useCollection } from "@/features/diver";
import {
  ARTIFACTS,
  CREATURES,
  OCEAN_ZONES,
  ZONE_TABLE,
  rarityColor,
  type OceanZone
} from "@/features/ocean";
import { useAchievements } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { makeStyles } from "./CollectionScreen.styles";

// CREATURES and ARTIFACTS are static — precompute per-zone totals once so the
// zoneSets memo only needs to count discovered entries, not filter static arrays.
const ZONE_TOTALS: Partial<Record<OceanZone, number>> = (() => {
  const map: Partial<Record<OceanZone, number>> = {};
  for (const c of CREATURES) map[c.zone] = (map[c.zone] ?? 0) + 1;
  for (const a of ARTIFACTS) map[a.zone] = (map[a.zone] ?? 0) + 1;
  return map;
})();

// Precompute which ids belong to each zone (static).
const ZONE_IDS: Partial<Record<OceanZone, readonly string[]>> = (() => {
  const map: Partial<Record<OceanZone, string[]>> = {};
  for (const c of CREATURES) (map[c.zone] ??= []).push(c.id);
  for (const a of ARTIFACTS) (map[a.zone] ??= []).push(a.id);
  return map;
})();

type RarityFilter =
  | "all"
  | "common"
  | "uncommon"
  | "rare"
  | "legendary"
  | "mythic";

export default function CollectionScreen() {
  const { data: entries = [], isLoading } = useCollection();
  const { height } = useWindowDimensions();
  const t = useTheme();
  const tr = useTranslations();
  const styles = useThemedStyles(makeStyles);
  useScreenTransitionLoading(isLoading, "collection");

  const completedZoneSets = useAchievements((s) => s.completedZoneSets);
  const markZoneSetComplete = useAchievements((s) => s.markZoneSetComplete);

  const [activeRow, setActiveRow] = useState<StoryRow | null>(null);
  const [storyOpen, setStoryOpen] = useState(false);
  const [codexCompleteZone, setCodexCompleteZone] = useState<OceanZone | null>(
    null
  );
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("all");

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

  const discoveredCount = useMemo(
    () => rows.filter((r) => r.seen).length,
    [rows]
  );

  type ZoneSetStatus = {
    zone: OceanZone;
    label: string;
    found: number;
    total: number;
    complete: boolean;
  };

  const zoneSets = useMemo<ZoneSetStatus[]>(() => {
    const seenIds = new Set(entries.map((e: CollectionEntry) => e.id));
    return OCEAN_ZONES.map((zone) => {
      const total = ZONE_TOTALS[zone] ?? 0;
      const ids = ZONE_IDS[zone] ?? [];
      const found = ids.filter((id) => seenIds.has(id)).length;
      return {
        zone,
        label: ZONE_TABLE[zone].label,
        found,
        total,
        complete: total > 0 && found >= total
      };
    });
  }, [entries]);

  // Detect newly completed zone sets and trigger the modal
  const prevCompletedRef = useRef<Set<OceanZone>>(new Set(completedZoneSets));
  useEffect(() => {
    for (const s of zoneSets) {
      if (s.complete && !prevCompletedRef.current.has(s.zone)) {
        const isNew = markZoneSetComplete(s.zone);
        if (isNew) {
          prevCompletedRef.current = new Set([
            ...prevCompletedRef.current,
            s.zone
          ]);
          // Defer to avoid synchronous setState-in-effect lint violation
          setTimeout(() => setCodexCompleteZone(s.zone), 0);
          break;
        }
      }
    }
  }, [zoneSets, markZoneSetComplete]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const passRarity = rarityFilter === "all" || r.rarity === rarityFilter;
      return passRarity;
    });
  }, [rows, rarityFilter]);

  const skeletonRows = useMemo(
    () => Array.from({ length: 8 }, (_, i) => i),
    []
  );

  const rarityOptions = useMemo<readonly [RarityFilter, string][]>(
    () => [
      ["all", tr.collection.filters.all],
      ["common", tr.collection.filters.common],
      ["uncommon", tr.collection.filters.uncommon],
      ["rare", tr.collection.filters.rare],
      ["legendary", tr.collection.filters.legendary],
      ["mythic", tr.collection.filters.mythic]
    ],
    [tr.collection.filters]
  );

  const handleRowPress = useCallback((row: StoryRow) => {
    setActiveRow(row);
    setStoryOpen(true);
  }, []);

  const renderListHeader = useCallback(
    () => (
      <View style={styles.stickyFilterWrap}>
        <View style={styles.compactFilterBlock}>
          <Text style={styles.filterTitle}>{tr.collection.filters.rarity}</Text>
          <ScrollView
            horizontal
            overScrollMode="never"
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.compactRow}
          >
            {rarityOptions.map(([value, label]) => {
              const active = rarityFilter === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => setRarityFilter(value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${tr.collection.filters.rarity}: ${label}`}
                  style={[
                    styles.compactChip,
                    active && styles.compactChipActive
                  ]}
                >
                  <Text
                    style={[
                      styles.compactChipText,
                      active && styles.compactChipTextActive
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    ),
    [
      rarityFilter,
      rarityOptions,
      styles,
      t.colors.accent,
      tr.codex.setsTitle,
      tr.codex.setProgress,
      tr.codex.setComplete,
      tr.collection.filters.rarity,
      zoneSets
    ]
  );

  const keyExtractor = useCallback(
    (item: StoryRow | number) =>
      typeof item === "number" ? `skeleton-${item}` : item.id,
    []
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<StoryRow | number>) =>
      typeof item === "number" ? (
        <CollectionRowSkeleton />
      ) : (
        <CollectionRow row={item} onPress={handleRowPress} />
      ),
    [handleRowPress]
  );

  const getItemType = useCallback(
    (item: StoryRow | number) =>
      typeof item === "number" ? "skeleton" : "row",
    []
  );

  return (
    <ZoneBackground zone="abyss">
      <UnderwaterCanvas zone="abyss" particleCount={20} />
      <ScreenSafeAreaView style={styles.container}>
        <View style={styles.headerWrap}>
          <AppHeader
            title={tr.collection.title}
            subtitle={tr.collection.catalogued(discoveredCount, rows.length)}
            size={28}
          />
          {discoveredCount === 0 && !isLoading && (
            <GuidanceCard
              storageKey="guidance.collection.first"
              title={tr.guidance.collection.title}
              body={tr.guidance.collection.body}
              dismissLabel={tr.common.dismiss}
              icon="book-outline"
            />
          )}
        </View>
        <FlashList<StoryRow | number>
          data={isLoading ? skeletonRows : filteredRows}
          keyExtractor={keyExtractor}
          drawDistance={height * 1.5}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          ListHeaderComponent={renderListHeader}
          getItemType={getItemType}
          ItemSeparatorComponent={Separator}
          contentContainerStyle={styles.listContent}
        />
        {!isLoading && filteredRows.length === 0 && (
          <View style={styles.emptyFilterWrap}>
            <GlassCard radius={t.radii.md} padding={t.spacing[4]}>
              <Text style={styles.emptyFilterText}>
                {tr.collection.filters.noResults}
              </Text>
            </GlassCard>
          </View>
        )}
      </ScreenSafeAreaView>

      <CreatureStorySheet
        visible={storyOpen}
        onDismiss={() => setStoryOpen(false)}
        row={activeRow}
      />

      <ZoneSetCompleteModal
        visible={codexCompleteZone !== null}
        zone={codexCompleteZone}
        onDismiss={() => setCodexCompleteZone(null)}
      />
    </ZoneBackground>
  );
}

const Separator = () => <View style={separatorStyles.sep} />;

type RowProps = {
  row: StoryRow;
  onPress: (row: StoryRow) => void;
};

const CollectionRow = React.memo(function CollectionRow({
  row,
  onPress
}: RowProps) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();
  const color = rarityColor(row.rarity, t);

  const handlePress = useCallback(() => onPress(row), [onPress, row]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={row.seen ? row.name : tr.collection.story.lockedTitle}
    >
      <GlassCard radius={t.radii.lg} blur={false}>
        <View style={styles.itemRow}>
          <View
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
          </View>
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
}, areCollectionRowsEqual);

function areCollectionRowsEqual(prev: RowProps, next: RowProps): boolean {
  return (
    prev.onPress === next.onPress &&
    prev.row.id === next.row.id &&
    prev.row.seen === next.row.seen &&
    prev.row.count === next.row.count &&
    prev.row.rarity === next.row.rarity &&
    prev.row.description === next.row.description
  );
}

function CollectionRowSkeleton() {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <GlassCard radius={t.radii.lg} blur={false}>
      <View style={styles.itemRow}>
        <Skeleton
          style={styles.iconBubble}
          width={44}
          height={44}
          radius={22}
        />
        <View style={styles.flex}>
          <View style={styles.nameRow}>
            <Skeleton style={styles.nameSkeleton} />
          </View>
          <Skeleton style={styles.metaSkeleton} />
          <SectionSkeleton
            style={styles.descSectionSkeleton}
            lines={2}
            widths={["100%", "68%"]}
            lineHeight={12}
          />
        </View>
        <Skeleton style={styles.chevronSkeleton} width={12} height={12} />
      </View>
    </GlassCard>
  );
}

const separatorStyles = StyleSheet.create({
  sep: { height: 10 }
});
