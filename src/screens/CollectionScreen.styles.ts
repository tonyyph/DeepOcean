import { StyleSheet } from "react-native";
import type { AppTheme } from "@/design-system";

export const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    headerWrap: {
      gap: t.spacing[3]
    },
    filterTitle: {
      color: t.colors.textSecondary,
      fontSize: 11,
      letterSpacing: 1,
      fontFamily: t.fonts.label,
      marginTop: t.spacing[1]
    },
    stickyFilterWrap: {
      marginBottom: t.spacing[2],
      gap: t.spacing[4]
    },
    codexBlock: {
      gap: t.spacing[1.5]
    },
    codexTitle: {
      color: t.colors.textSecondary,
      fontSize: 11,
      letterSpacing: 1,
      fontFamily: t.fonts.label,
      marginTop: t.spacing[1]
    },
    codexRow: {
      gap: t.spacing[2],
      paddingRight: t.spacing[2]
    },
    codexCard: {
      minWidth: 90,
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[3],
      borderRadius: t.radii.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border,
      backgroundColor: t.colors.glass,
      alignItems: "center",
      gap: t.spacing[1]
    },
    codexZoneLabel: {
      fontSize: 10,
      fontFamily: t.fonts.label,
      letterSpacing: 0.8,
      color: t.colors.textSecondary
    },
    codexProgress: {
      fontSize: 16,
      fontFamily: t.fonts.display,
      color: t.colors.text
    },
    codexComplete: {
      fontSize: 9,
      fontFamily: t.fonts.label,
      letterSpacing: 1.2
    },
    compactFilterBlock: {
      gap: t.spacing[1]
    },
    compactRow: {
      gap: t.spacing[1.5],
      paddingRight: t.spacing[2]
    },
    compactChip: {
      borderRadius: t.radii.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge,
      padding: t.spacing[3],
      justifyContent: "center",
      backgroundColor: t.colors.panelStrong
    },
    compactChipActive: {
      borderColor: t.colors.accent,
      backgroundColor: t.colors.glassEdge
    },
    compactChipText: {
      color: t.colors.textSecondary,
      fontSize: 11,
      fontFamily: t.fonts.label,
      letterSpacing: 0.4
    },
    compactChipTextActive: {
      color: t.colors.accent
    },
    listContent: {
      paddingBottom: t.spacing[24]
    },
    emptyFilterWrap: {
      paddingHorizontal: t.spacing[4],
      marginTop: t.spacing[2]
    },
    emptyFilterText: {
      color: t.colors.textSecondary,
      fontFamily: t.fonts.body,
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center"
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[4]
    },
    iconBubble: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.colors.glass,
      shadowOpacity: 0.22,
      shadowRadius: 6,
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
    zoneLabel: {
      color: t.colors.textSecondary,
      fontSize: 11,
      letterSpacing: 1,
      marginTop: 3,
      fontFamily: t.fonts.label
    },
    desc: {
      color: t.colors.textSecondary,
      fontSize: 13,
      marginTop: t.spacing[1.5],
      lineHeight: 19,
      fontFamily: t.fonts.body
    },
    whisper: {
      color: t.colors.textMuted,
      fontSize: 12,
      marginTop: t.spacing[1.5],
      lineHeight: 17,
      fontFamily: t.fonts.body,
      fontStyle: "italic"
    },
    nameSkeleton: {
      height: 16,
      width: "58%",
      borderRadius: t.radii.xs
    },
    metaSkeleton: {
      width: "44%",
      height: 11,
      borderRadius: t.radii.xs,
      marginTop: t.spacing[1]
    },
    descSectionSkeleton: {
      marginTop: t.spacing[1.5]
    },
    chevronSkeleton: {
      opacity: 0.65
    }
  });
