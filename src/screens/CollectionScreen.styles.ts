import { StyleSheet } from "react-native";
import type { AppTheme } from "@/design-system";
import { Colors } from "@/theme";

export const makeStyles = (t: AppTheme) =>
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
      borderRadius: t.radii.sm,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${Colors.premium.gold}47`,
      backgroundColor: `${Colors.premium.gold}0F`,
      marginBottom: t.spacing[2]
    },
    proCalloutText: {
      flex: 1,
      color: t.colors.text,
      fontFamily: t.fonts.body,
      fontSize: 12,
      lineHeight: 17
    },
    filterTitle: {
      color: t.colors.textMuted,
      fontSize: 11,
      letterSpacing: 1,
      fontFamily: t.fonts.label,
      marginTop: t.spacing[1]
    },
    stickyFilterWrap: {
      marginBottom: t.spacing[2],
      gap: t.spacing[4]
    },
    compactFilterBlock: {
      gap: t.spacing[1],
      paddingHorizontal: t.spacing[2]
    },
    compactRow: {
      gap: t.spacing[1.5],
      paddingRight: t.spacing[2]
    },
    compactChip: {
      borderRadius: t.radii.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border,
      paddingHorizontal: t.spacing[2.5],
      paddingVertical: t.spacing[1],
      backgroundColor: t.colors.glass
    },
    compactChipActive: {
      borderColor: t.colors.accent,
      backgroundColor: `${t.colors.accent}20`
    },
    compactChipText: {
      color: t.colors.textMuted,
      fontSize: 11,
      fontFamily: t.fonts.label,
      letterSpacing: 0.4
    },
    compactChipTextActive: {
      color: t.colors.accent
    },
    listContent: {
      paddingHorizontal: t.spacing[4],
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
      gap: t.spacing[3.5]
    },
    iconBubble: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${Colors.base.white}0A`,
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
      backgroundColor: `${Colors.premium.gold}1A`
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
      marginTop: t.spacing[1.5],
      lineHeight: 19,
      fontFamily: t.fonts.body
    },
    premiumTeaser: {
      color: t.colors.premium,
      fontSize: 12,
      marginTop: t.spacing[1.5],
      lineHeight: 17,
      fontFamily: t.fonts.body
    },
    premiumTeaserWrap: {
      marginTop: t.spacing[1.5],
      gap: t.spacing[1]
    },
    premiumRibbonText: {
      alignSelf: "flex-start",
      borderRadius: t.radii.pill,
      overflow: "hidden",
      color: t.colors.surface,
      backgroundColor: t.colors.premium,
      fontSize: 9,
      letterSpacing: 0.7,
      fontFamily: t.fonts.label,
      paddingHorizontal: t.spacing[2],
      paddingVertical: 2,
      textTransform: "uppercase"
    },
    whisper: {
      color: t.colors.textFaint,
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
    lockSkeleton: {
      marginLeft: t.spacing[1.5]
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
