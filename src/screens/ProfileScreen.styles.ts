import { StyleSheet } from "react-native";
import type { AppTheme } from "@/design-system";

export const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1, minWidth: 0 },
    base: {
      color: t.colors.accent,
      fontSize: 36,
      fontFamily: t.fonts.display,
      letterSpacing: t.fonts.displayLetterSpacing
    },
    // Custom profile header
    profileHeader: {
      paddingVertical: t.spacing[4],
      gap: t.spacing[1]
    },
    headerEyebrow: {
      color: t.colors.textSecondary,
      fontSize: 11,
      letterSpacing: 1,
      fontFamily: t.fonts.label
    },
    headerNameRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: t.spacing[5]
    },
    headerSub: {
      color: t.colors.textSecondary,
      marginTop: t.spacing[2],
      fontSize: 14,
      lineHeight: 20,
      fontFamily: t.fonts.mono
    },
    xpTrack: {
      height: 10,
      borderRadius: t.radii.pill,
      backgroundColor: t.colors.glass,
      overflow: "hidden"
    },
    xpFill: {
      height: "100%",
      borderRadius: t.radii.pill,
      overflow: "hidden",
      shadowColor: t.colors.accent,
      shadowOpacity: 0.18,
      shadowRadius: 5
    },
    preferredBlock: {
      paddingTop: t.spacing[4],
      gap: t.spacing[3]
    },
    preferredTitle: {
      color: t.colors.text,
      fontSize: 15,
      fontFamily: t.fonts.body
    },
    pillRow: {
      flexDirection: "row",
      gap: t.spacing[2]
    },
    pillItem: { flex: 1 },
    preferredSub: {
      color: t.colors.textSecondary,
      fontSize: 12,
      fontFamily: t.fonts.body,
      marginTop: t.spacing[1]
    },
    // Name editing
    nameEditRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[2],
      marginTop: t.spacing[2]
    },
    nameInput: {
      flex: 1,
      color: t.colors.text,
      fontSize: 18,
      fontFamily: t.fonts.body,
      paddingVertical: t.spacing[2],
      paddingHorizontal: t.spacing[3],
      borderRadius: t.radii.sm,
      backgroundColor: t.colors.panel,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge
    },
    nameEditActions: {
      flexDirection: "row",
      gap: t.spacing[1]
    },
    // About
    aboutRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: t.spacing[3]
    },
    aboutLabel: {
      color: t.colors.textSecondary,
      fontSize: 14,
      fontFamily: t.fonts.body
    },
    aboutValue: {
      color: t.colors.text,
      fontSize: 14,
      fontFamily: t.fonts.mono
    },
    aboutTagline: {
      color: t.colors.textSecondary,
      fontSize: 12,
      fontFamily: t.fonts.body,
      fontStyle: "italic"
    },
    premiumActiveRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: t.spacing[3],
      flexWrap: "wrap"
    },
    premiumCrest: {
      width: 44,
      height: 44,
      borderRadius: t.radii.md,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    },
    premiumCrestLocked: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.borderStrong,
      backgroundColor: t.colors.panelStrong
    },
    premiumText: {
      flex: 1,
      minWidth: 0
    },
    premiumTitle: {
      color: t.colors.text,
      fontSize: 16,
      fontFamily: t.fonts.display,
      letterSpacing: t.fonts.displayLetterSpacing
    },
    premiumSub: {
      color: t.colors.textSecondary,
      fontSize: 12,
      marginTop: t.spacing[1],
      fontFamily: t.fonts.body
    },
    premiumDashboardGrid: {
      gap: t.spacing[2],
      marginTop: t.spacing[4]
    },
    premiumSignal: {
      minHeight: 66,
      borderRadius: t.radii.sm,
      backgroundColor: t.colors.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.borderStrong,
      padding: t.spacing[3],
      justifyContent: "center"
    },
    premiumSignalLabel: {
      color: t.colors.textMuted,
      fontFamily: t.fonts.label,
      fontSize: 9,
      letterSpacing: 0.4,
      marginTop: t.spacing[2]
    },
    premiumSignalValue: {
      color: t.colors.text,
      fontFamily: t.fonts.body,
      fontSize: 12,
      lineHeight: 16,
      marginTop: t.spacing[1]
    },
    premiumPreviewGrid: {
      gap: t.spacing[2],
      marginTop: t.spacing[4],
      paddingTop: t.spacing[3],
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.colors.panelEdge
    },
    premiumPreviewText: {
      color: t.colors.textSecondary,
      fontFamily: t.fonts.body,
      fontSize: 12,
      lineHeight: 17
    },
    nameEditCard: {
      flex: 1,
      marginTop: t.spacing[2]
    }
  });
