import { useTranslations } from "@/core/i18n";
import { useScreenTransitionLoading } from "@/core/navigation/screenTransitionLoading";
import {
  AppHeader,
  CreatureStorySheet,
  GlassCard,
  GuidanceCard,
  PaywallSheet,
  PremiumBadge,
  ScreenSafeAreaView,
  SectionSkeleton,
  Skeleton,
  ZoneSetCompleteModal,
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
  OCEAN_ZONES,
  ZONE_TABLE,
  rarityColor,
  type OceanZone
} from "@/features/ocean";
import { useAchievements, usePremium } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { makeStyles } from "./CollectionScreen.styles";

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

  const completedZoneSets = useAchievements((s) => s.completedZoneSets);
  const markZoneSetComplete = useAchievements((s) => s.markZoneSetComplete);

  const [activeRow, setActiveRow] = useState<StoryRow | null>(null);
  const [storyOpen, setStoryOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [codexCompleteZone, setCodexCompleteZone] = useState<OceanZone | null>(null);
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
      const total =
        CREATURES.filter((c) => c.zone === zone).length +
        ARTIFACTS.filter((a) => a.zone === zone).length;
      const found =
        CREATURES.filter((c) => c.zone === zone && seenIds.has(c.id)).length +
        ARTIFACTS.filter((a) => a.zone === zone && seenIds.has(a.id)).length;
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
          prevCompletedRef.current = new Set([...prevCompletedRef.current, s.zone]);
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

  const handlePaywall = useCallback(() => {
    setPaywallOpen(true);
  }, []);

  const renderListHeader = useCallback(
    () => (
      <View style={styles.stickyFilterWrap}>
        {/* Zone Codex strip */}
        <View style={styles.codexBlock}>
          <Text style={styles.codexTitle}>{tr.codex.setsTitle}</Text>
          <ScrollView
            horizontal
            overScrollMode="never"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.codexRow}
          >
            {zoneSets.map((s) => (
              <View
                key={s.zone}
                style={[
                  styles.codexCard,
                  s.complete && { borderColor: t.colors.accent }
                ]}
              >
                <Text
                  style={[
                    styles.codexZoneLabel,
                    s.complete && { color: t.colors.accent }
                  ]}
                  numberOfLines={1}
                >
                  {s.label}
                </Text>
                <Text style={styles.codexProgress}>
                  {tr.codex.setProgress(s.found, s.total)}
                </Text>
                {s.complete && (
                  <Text style={[styles.codexComplete, { color: t.colors.accent }]}>
                    {tr.codex.setComplete}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

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
      t.colors.accent,
      t.colors.textMuted,
      tr.codex.setsTitle,
      tr.codex.setProgress,
      tr.codex.setComplete,
      tr.collection.filters.rarity,
      tr.collection.story.proLocked,
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
      <ScreenSafeAreaView style={styles.flex}>
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
      </ScreenSafeAreaView>

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
