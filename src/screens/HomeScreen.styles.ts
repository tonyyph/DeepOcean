import { StyleSheet } from "react-native";
import type { AppTheme } from "@/design-system";
import { Colors } from "@/theme";

export const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    base: {
      color: t.colors.accent,
      fontSize: 36,
      fontFamily: t.fonts.display,
      letterSpacing: t.fonts.displayLetterSpacing
    },
    scroll: {
      padding: t.spacing[5],
      paddingBottom: t.spacing[24],
      gap: t.spacing[4]
    },
    header: { paddingBottom: t.spacing[3], gap: t.spacing[1] },
    greeting: {
      color: t.colors.textSecondary,
      fontSize: 13,
      letterSpacing: 1,
      fontFamily: t.fonts.label
    },
    rankRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[1],
      marginTop: t.spacing[1]
    },
    rankLabel: {
      color: t.colors.accent,
      fontSize: 12,
      fontFamily: t.fonts.label,
      letterSpacing: 0.6
    },
    sub: {
      color: t.colors.textSecondary,
      marginTop: t.spacing[1],
      fontSize: 14,
      fontFamily: t.fonts.body
    },
    nameSkeleton: {
      width: 190,
      height: 42,
      borderRadius: t.radii.s
    },
    subSkeleton: {
      width: 150,
      height: 14,
      marginTop: t.spacing[1],
      borderRadius: t.radii.xs
    },
    heroCard: { marginTop: t.spacing[0] },
    heroContent: { alignItems: "center", paddingVertical: t.spacing[5] },
    heroLabel: {
      color: t.colors.accent,
      letterSpacing: 1,
      fontSize: 12,
      fontFamily: t.fonts.label
    },
    heroDuration: {
      color: t.colors.text,
      fontSize: 56,
      fontFamily: t.fonts.display,
      marginTop: t.spacing[1.5],
      lineHeight: 60
    },
    heroDurationSub: {
      color: t.colors.textSecondary,
      fontSize: 13,
      fontFamily: t.fonts.body,
      marginTop: -2
    },
    heroHint: {
      color: t.colors.textSecondary,
      marginTop: t.spacing[2],
      fontSize: 12,
      fontFamily: t.fonts.body
    },
    quickRow: { flexDirection: "row", gap: t.spacing[2.5] },
    quickItem: { flex: 1 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },
    companionBody: {
      color: t.colors.text,
      fontSize: 15,
      lineHeight: 22,
      fontFamily: t.fonts.body
    },
    companionSectionSkeleton: {
      marginTop: t.spacing[2]
    },
    // Last dive card
    lastDiveRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[3],
      marginTop: t.spacing[2]
    },
    lastDiveZoneBadge: {
      width: 44,
      height: 44,
      borderRadius: t.radii.sm,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      backgroundColor: `${Colors.base.white}0D`
    },
    lastDiveIconSkeleton: {
      width: 44,
      height: 44,
      borderRadius: t.radii.sm
    },
    lastDiveMetaSkeleton: {
      width: 120,
      height: 12,
      borderRadius: t.radii.xs
    },
    lastDiveMetaSkeletonShort: {
      width: 86,
      height: 14,
      borderRadius: t.radii.xs,
      marginTop: t.spacing[1.5]
    },
    lastDiveXpSkeleton: {
      width: 58,
      height: 24,
      borderRadius: t.radii.pill
    },
    lastDiveZoneLabel: {
      fontSize: 11,
      fontFamily: t.fonts.label,
      letterSpacing: 0.8
    },
    lastDiveDuration: {
      color: t.colors.text,
      fontSize: 15,
      fontFamily: t.fonts.body,
      marginTop: 2
    },
    lastDiveXpBadge: {
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[1],
      borderRadius: t.radii.pill,
      backgroundColor: t.colors.accent + "22",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.accent + "55"
    },
    lastDiveXpText: {
      color: t.colors.accent,
      fontSize: 13,
      fontFamily: t.fonts.mono
    },
    emptyLastDiveText: {
      color: t.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: t.fonts.body,
      marginTop: t.spacing[2]
    },
    emptyLastDiveCtaWrap: {
      marginTop: t.spacing[3]
    },
    // Zone progress
    zoneStrip: {
      flexDirection: "row",
      gap: t.spacing[2],
      marginTop: t.spacing[2]
    },
    zoneChip: {
      flex: 1,
      alignItems: "center",
      paddingVertical: t.spacing[3],
      paddingHorizontal: t.spacing[1],
      borderRadius: t.radii.sm,
      gap: t.spacing[1],
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border,
      backgroundColor: t.colors.panelStrong
    },
    zoneChipUnlocked: {
      borderColor: t.colors.borderStrong
    },
    zoneChipLocked: {
      borderColor: t.colors.border,
      opacity: 1
    },
    zoneChipDeepest: {
      borderWidth: 1
    },
    zoneChipLabel: {
      fontSize: 10,
      fontFamily: t.fonts.label,
      letterSpacing: 0.3,
      textAlign: "center",
      textShadowColor: "rgba(0,0,0,0.42)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2
    },
    zoneDeepestDot: {
      width: 4,
      height: 4,
      borderRadius: 2
    },
    // Stats
    statsRow: { flexDirection: "row", gap: t.spacing[2.5] },
    statValueRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 2,
      marginTop: t.spacing[1]
    },
    statValue: {
      color: t.colors.text,
      fontSize: 22,
      fontFamily: t.fonts.mono
    },
    statUnit: {
      color: t.colors.textSecondary,
      fontSize: 13,
      fontFamily: t.fonts.label
    },
    statLabel: {
      color: t.colors.textSecondary,
      fontSize: 10,
      letterSpacing: 0.8,
      fontFamily: t.fonts.label,
      marginTop: t.spacing[1]
    },
    skeletonLabel: {
      width: 110,
      height: 11,
      borderRadius: t.radii.xs
    },
    streakMilestoneHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[2]
    },
    streakMilestoneBody: {
      color: t.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: t.fonts.body,
      marginTop: t.spacing[2]
    },
    streakMilestoneCtaWrap: {
      marginTop: t.spacing[3]
    }
  });
