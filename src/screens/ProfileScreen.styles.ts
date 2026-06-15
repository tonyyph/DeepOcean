import { StyleSheet } from "react-native";
import type { AppTheme } from "@/design-system";

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
      marginTop: t.spacing[1.5],
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
      marginTop: 2
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
      alignItems: "center",
      gap: t.spacing[3.5]
    },
    premiumCrest: {
      width: 44,
      height: 44,
      borderRadius: t.radii.md,
      alignItems: "center",
      justifyContent: "center"
    },
    premiumCrestLocked: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.borderStrong,
      backgroundColor: t.colors.panelStrong
    },
    premiumText: { flex: 1 },
    premiumTitle: {
      color: t.colors.text,
      fontSize: 16,
      fontFamily: t.fonts.display,
      letterSpacing: t.fonts.displayLetterSpacing
    },
    premiumSub: {
      color: t.colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
      fontFamily: t.fonts.body
    },
    nameEditCard: {
      flex: 1,
      marginTop: t.spacing[2]
    }
  });
