import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import type { AppTheme } from "../themes";
import { useTranslations } from "@/core/i18n";
import {
  OCEAN_ZONES,
  ZONE_TABLE,
  ZONE_ICONS,
  type OceanZone
} from "@/features/ocean";

export type SessionTimelineProps = {
  /** Total focused seconds for the dive. */
  elapsedSeconds: number;
  /** Deepest zone the dive actually reached. */
  finalZone: OceanZone;
};

type ZoneStep = {
  zone: OceanZone;
  label: string;
  unlockMinutes: number;
  reached: boolean;
};

/**
 * SessionTimeline — vertical progression of ocean zones for a single dive.
 * Each zone is "reached" once focus minutes pass its unlock threshold, so the
 * journey is reconstructed deterministically from `elapsedSeconds`.
 */
export const SessionTimeline = React.memo(function SessionTimeline({
  elapsedSeconds,
  finalZone
}: SessionTimelineProps) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();

  const steps = useMemo<ZoneStep[]>(() => {
    const minutes = elapsedSeconds / 60;
    return OCEAN_ZONES.map((zone) => {
      const def = ZONE_TABLE[zone];
      return {
        zone,
        label: def.label,
        unlockMinutes: def.unlockMinutes,
        reached: minutes >= def.unlockMinutes
      };
    });
  }, [elapsedSeconds]);

  return (
    <View style={styles.wrap}>
      {steps.map((step, i) => {
        const isFinal = step.zone === finalZone;
        const color = step.reached ? t.colors.accent : t.colors.textFaint;
        return (
          <View key={step.zone} style={styles.row}>
            <View style={styles.railCol}>
              <View
                style={[
                  styles.node,
                  {
                    borderColor: color,
                    backgroundColor: isFinal ? color : "transparent"
                  }
                ]}
              >
                <Ionicons
                  name={ZONE_ICONS[step.zone]}
                  size={14}
                  color={isFinal ? t.colors.background : color}
                />
              </View>
              {i < steps.length - 1 ? (
                <View
                  style={[
                    styles.rail,
                    {
                      backgroundColor: steps[i + 1]?.reached
                        ? t.colors.accent
                        : t.colors.border
                    }
                  ]}
                />
              ) : null}
            </View>
            <View style={styles.body}>
              <Text
                style={[
                  styles.zoneLabel,
                  { color: step.reached ? t.colors.text : t.colors.textFaint }
                ]}
              >
                {step.label}
              </Text>
              {step.reached ? (
                <Text style={styles.meta}>
                  {step.unlockMinutes === 0
                    ? tr.sessionDetail.reachedAt(0)
                    : tr.sessionDetail.reachedAt(step.unlockMinutes)}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    wrap: { marginTop: t.spacing[2] },
    row: { flexDirection: "row", gap: t.spacing[3] },
    railCol: { alignItems: "center", width: 32 },
    node: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center"
    },
    rail: { width: 2, flex: 1, minHeight: 18, marginVertical: 2 },
    body: { flex: 1, paddingBottom: t.spacing[3], justifyContent: "center" },
    zoneLabel: { fontFamily: t.fonts.body, fontSize: 14 },
    meta: {
      fontFamily: t.fonts.mono,
      fontSize: 11,
      color: t.colors.textMuted,
      marginTop: 2
    }
  });
