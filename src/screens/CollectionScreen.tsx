import { useTranslations } from "@/core/i18n";
import { useScreenTransitionLoading } from "@/core/navigation/screenTransitionLoading";
import {
  AppHeader,
  CreatureStorySheet,
  GuidanceCard,
  GlassCard,
  PaywallSheet,
  PremiumBadge,
  SectionSkeleton,
  Skeleton,
  type StoryRow,
  UnderwaterCanvas,
  ZoneBackground,
  useTheme,
  useThemedStyles
} from "@/design-system";
import type { CollectionEntry } from "@/domain/entities";
import { useCollection } from "@/features/diver";
import {
  ARTIFACTS,
  CREATURES,
  ZONE_TABLE,
  rarityColor
} from "@/features/ocean";
import { usePremium } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import React, { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import { makeStyles } from "./CollectionScreen.styles";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const isPremium = usePremium((s) => s.isPremium);
  useScreenTransitionLoading(isLoading, "collection");

  const [activeRow, setActiveRow] = useState<StoryRow | null>(null);
  const [storyOpen, setStoryOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
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

  const handlePaywall = useCallback(() => {
    setPaywallOpen(true);
  }, []);

  const renderListHeader = useCallback(
    () => (
      <View style={styles.stickyFilterWrap}>
        <View style={styles.compactFilterBlock}>
          <Text style={styles.filterTitle}>{tr.collection.filters.rarity}</Text>
          <ScrollView
            horizontal
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
        {!isPremium && (
          <Pressable
            onPress={handlePaywall}
            style={styles.proCallout}
            accessibilityRole="button"
            accessibilityLabel={tr.collection.story.proUnlockCta}
          >
            <PremiumBadge variant="lock" />
            <Text style={styles.proCalloutText} numberOfLines={2}>
              {tr.collection.story.proLocked}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={t.colors.textMuted}
            />
          </Pressable>
        )}
      </View>
    ),
    [
      handlePaywall,
      isPremium,
      rarityFilter,
      rarityOptions,
      styles,
      t.colors.textMuted,
      tr.collection.filters.rarity,
      tr.collection.story.proLocked
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
        <CollectionRow
          row={item}
          isPremium={isPremium}
          onPress={handleRowPress}
        />
      ),
    [isPremium, handleRowPress]
  );

  const getItemType = useCallback(
    (item: StoryRow | number) =>
      typeof item === "number" ? "skeleton" : "row",
    []
  );

  return (
    <ZoneBackground zone="abyss">
      <UnderwaterCanvas zone="abyss" particleCount={20} />
      <SafeAreaView style={styles.flex}>
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
          extraData={isPremium}
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
  isPremium: boolean;
  onPress: (row: StoryRow) => void;
};

const CollectionRow = React.memo(function CollectionRow({
  row,
  isPremium,
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
      <GlassCard radius={t.radii.lg}>
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
              {row.seen && !isPremium && (
                <View style={styles.proHint}>
                  <Ionicons
                    name="lock-closed"
                    size={10}
                    color={t.colors.premium}
                  />
                </View>
              )}
            </View>
            <Text style={styles.zoneLabel}>
              {row.seen ? row.zone : "???"} · {row.rarity.toUpperCase()}
              {row.count > 1 ? `  ×${row.count}` : ""}
            </Text>
            {row.seen && isPremium ? (
              <Text style={styles.desc} numberOfLines={2}>
                {row.description}
              </Text>
            ) : row.seen ? (
              <View style={styles.premiumTeaserWrap}>
                <Text style={styles.premiumRibbonText}>
                  {tr.collection.filters.proDetailsLabel}
                </Text>
                <Text style={styles.premiumTeaser} numberOfLines={2}>
                  {tr.collection.story.proLocked}
                </Text>
              </View>
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
    prev.isPremium === next.isPremium &&
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
    <GlassCard radius={t.radii.lg}>
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
            <Skeleton
              style={styles.lockSkeleton}
              width={18}
              height={18}
              radius={9}
            />
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
