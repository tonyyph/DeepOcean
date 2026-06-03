import React, { useCallback, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import type { AppTheme } from "../themes";
import { useTranslations } from "@/core/i18n";
import { rarityColor, ZONE_TABLE } from "@/features/ocean";
import type { Discovery } from "@/features/ocean";

export type DiscoveryTimelineProps = {
  discoveries: readonly Discovery[];
};

/**
 * DiscoveryTimeline — chronological, virtualised log of every creature/artifact
 * surfaced during a dive. Uses FlashList for constant-memory rendering even on
 * marathon dives with many discoveries.
 */
export const DiscoveryTimeline = React.memo(function DiscoveryTimeline({
  discoveries
}: DiscoveryTimelineProps) {
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();

  const data = useMemo(
    () => [...discoveries].sort((a, b) => a.atMinute - b.atMinute),
    [discoveries]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Discovery>) => (
      <DiscoveryRow discovery={item} />
    ),
    []
  );

  const keyExtractor = useCallback(
    (item: Discovery, index: number) =>
      `${item.kind}-${item.entry.id}-${item.atMinute}-${index}`,
    []
  );

  if (data.length === 0) {
    return <Text style={styles.empty}>{tr.sessionDetail.noDiscoveries}</Text>;
  }

  return (
    <View style={styles.listWrap}>
      <FlashList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={64}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
});

const DiscoveryRow = React.memo(function DiscoveryRow({
  discovery
}: {
  discovery: Discovery;
}) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();
  const accent = rarityColor(discovery.entry.rarity, t);
  const icon = discovery.kind === "creature" ? "fish" : "diamond";
  const kindLabel =
    discovery.kind === "creature" ? tr.dive.creature : tr.dive.artifact;
  const zoneLabel = ZONE_TABLE[discovery.entry.zone].label;

  return (
    <View style={styles.row}>
      <Text style={styles.minute}>
        {tr.sessionDetail.minuteMark(discovery.atMinute)}
      </Text>
      <View style={[styles.iconWrap, { borderColor: accent }]}>
        <Ionicons name={icon} size={16} color={accent} />
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{discovery.entry.name}</Text>
        <Text style={styles.meta}>
          {kindLabel} · {zoneLabel}
        </Text>
      </View>
      <Text style={[styles.rarity, { color: accent }]}>
        {discovery.entry.rarity}
      </Text>
    </View>
  );
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    listWrap: { minHeight: 2 },
    empty: {
      fontFamily: t.fonts.body,
      fontSize: 13,
      color: t.colors.textMuted,
      paddingVertical: t.spacing[2]
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[3],
      paddingVertical: t.spacing[2] + 2
    },
    minute: {
      width: 44,
      fontFamily: t.fonts.mono,
      fontSize: 12,
      color: t.colors.textMuted
    },
    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center"
    },
    body: { flex: 1 },
    name: { fontFamily: t.fonts.body, fontSize: 14, color: t.colors.text },
    meta: {
      fontFamily: t.fonts.label,
      fontSize: 11,
      color: t.colors.textMuted,
      marginTop: 1
    },
    rarity: {
      fontFamily: t.fonts.label,
      fontSize: 10,
      letterSpacing: 1,
      textTransform: "uppercase"
    }
  });
