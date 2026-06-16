import { StyleSheet } from "react-native";
import type { AppTheme } from "../themes";

export function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: t.spacing[5]
    },
    closeBtn: {
      alignSelf: "flex-end",
      width: 44,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
      padding: t.spacing[2],
      marginRight: -t.spacing[2],
      marginBottom: t.spacing[1]
    },
    pressed: {
      opacity: 0.72
    },
    // ── Header ───────────────────────────────────────────────────────────
    heading: {
      fontFamily: t.fonts.display,
      fontSize: 26,
      color: t.colors.text,
      textAlign: "center",
      letterSpacing: t.fonts.displayLetterSpacing,
      marginBottom: t.spacing[1]
    },
    headingSub: {
      fontFamily: t.fonts.body,
      fontSize: 13,
      color: t.colors.textMuted,
      textAlign: "center",
      lineHeight: 18,
      marginBottom: t.spacing[3]
    },
    intentBanner: {
      borderRadius: t.radii.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.borderStrong,
      backgroundColor: t.colors.panelStrong,
      paddingHorizontal: t.spacing[4],
      paddingVertical: t.spacing[3],
      marginBottom: t.spacing[3]
    },
    intentBannerTitle: {
      fontFamily: t.fonts.label,
      fontSize: 11,
      letterSpacing: 0.8,
      color: t.colors.premium,
      textTransform: "uppercase"
    },
    intentBannerBody: {
      fontFamily: t.fonts.body,
      fontSize: 12,
      color: t.colors.textSecondary,
      marginTop: t.spacing[1]
    },
    activeBanner: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "center",
      gap: 6,
      backgroundColor: t.colors.panelStrong,
      borderRadius: t.radii.pill,
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[1],
      marginBottom: t.spacing[3]
    },
    activeBannerText: {
      fontFamily: t.fonts.label,
      fontSize: 11,
      color: t.colors.accent
    },
    // ── Carousel ─────────────────────────────────────────────────────────
    carouselWrap: {
      marginBottom: t.spacing[4]
    },
    slide: {
      alignItems: "center",
      paddingHorizontal: t.spacing[6]
    },
    slideIconWrap: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      marginTop: t.spacing[2],
      marginBottom: t.spacing[3],
      backgroundColor: t.colors.surfaceElevated
    },
    slideTitle: {
      fontFamily: t.fonts.display,
      fontSize: 20,
      color: t.colors.text,
      textAlign: "center",
      letterSpacing: t.fonts.displayLetterSpacing,
      marginBottom: t.spacing[2]
    },
    slideBody: {
      fontFamily: t.fonts.body,
      fontSize: 13,
      color: t.colors.textSecondary,
      textAlign: "center",
      lineHeight: 20
    },
    dotsRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
      marginTop: t.spacing[3]
    },
    dot: {
      height: 6,
      borderRadius: 3
    },
    dotActive: {
      width: 20,
      backgroundColor: t.colors.accent
    },
    dotInactive: {
      width: 6,
      backgroundColor: t.colors.textMuted,
      opacity: 0.4
    },
    // ── Plan cards ───────────────────────────────────────────────────────
    plansRow: {
      flexDirection: "row",
      gap: t.spacing[2],
      marginBottom: t.spacing[4]
    },
    planCard: {
      flex: 1,
      borderWidth: 1.15,
      borderColor: t.colors.glassEdge,
      borderRadius: 16
    },
    planCardFeatured: {
      flex: 1.15,
      borderRadius: 16
    },
    planCardSelected: {
      borderRadius: 16
    },
    savingBadge: {
      backgroundColor: t.colors.panelStrong,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.borderStrong,
      borderRadius: t.radii.pill,
      paddingHorizontal: t.spacing[2],
      paddingVertical: 3,
      alignSelf: "center",
      marginTop: t.spacing[2]
    },
    savingBadgeText: {
      fontFamily: t.fonts.label,
      fontSize: 10,
      color: t.colors.text
    },
    planInner: {
      paddingVertical: t.spacing[3],
      paddingHorizontal: t.spacing[1],
      alignItems: "center"
    },
    planLabel: {
      fontFamily: t.fonts.label,
      fontSize: 10,
      color: t.colors.textMuted,
      letterSpacing: 0.5,
      marginBottom: t.spacing[1]
    },
    planLabelAccent: {
      color: t.colors.accent
    },
    planPrice: {
      fontFamily: t.fonts.display,
      fontSize: 13,
      color: t.colors.text,
      textAlign: "center",
      letterSpacing: t.fonts.displayLetterSpacing,
      marginBottom: 2
    },
    planSub: {
      fontFamily: t.fonts.body,
      fontSize: 10,
      color: t.colors.textMuted,
      textAlign: "center"
    },
    // ── Trial CTA ────────────────────────────────────────────────────────
    trialCard: {
      marginBottom: t.spacing[3],
      borderRadius: 14,
      overflow: "hidden"
    },
    trialGradient: {
      paddingVertical: t.spacing[4],
      paddingHorizontal: t.spacing[4],
      alignItems: "center",
      borderRadius: 14
    },
    trialPill: {
      backgroundColor: t.surfaces.glassHighlight,
      borderRadius: t.radii.pill,
      paddingHorizontal: t.spacing[3],
      paddingVertical: 3,
      marginBottom: t.spacing[2]
    },
    trialPillText: {
      fontFamily: t.fonts.label,
      fontSize: 10,
      color: t.colors.text,
      letterSpacing: 1
    },
    trialCtaLabel: {
      fontFamily: t.fonts.display,
      fontSize: 18,
      color: t.colors.text,
      letterSpacing: t.fonts.displayLetterSpacing,
      marginBottom: 4
    },
    trialCtaSub: {
      fontFamily: t.fonts.body,
      fontSize: 11,
      color: t.colors.textSecondary,
      textAlign: "center"
    },
    // ── Purchase CTA ─────────────────────────────────────────────────────
    purchaseButton: {
      marginBottom: t.spacing[2],
      borderRadius: 14
    },
    unavailableNote: {
      fontFamily: t.fonts.body,
      fontSize: 11,
      color: t.colors.textMuted,
      textAlign: "center",
      marginBottom: t.spacing[2]
    },
    // ── Promo code ───────────────────────────────────────────────────────
    promoRow: {
      flexDirection: "row",
      gap: t.spacing[2],
      marginBottom: t.spacing[1]
    },
    promoInput: {
      flex: 1,
      height: 44,
      borderRadius: 10,
      backgroundColor: t.colors.surfaceElevated,
      paddingHorizontal: t.spacing[3],
      fontFamily: t.fonts.body,
      fontSize: 14,
      color: t.colors.text,
      borderWidth: 1,
      borderColor: t.colors.glassEdge
    },
    promoInputSuccess: {
      borderColor: t.colors.success
    },
    promoApplyBtn: {
      height: 44,
      paddingHorizontal: t.spacing[3],
      borderRadius: 10,
      backgroundColor: t.colors.surfaceElevated,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: t.colors.glassEdge
    },
    promoApplyBtnDisabled: {
      opacity: 0.45
    },
    promoApplyText: {
      fontFamily: t.fonts.label,
      fontSize: 11,
      color: t.colors.accent,
      letterSpacing: 0.5
    },
    promoFeedbackError: {
      fontFamily: t.fonts.body,
      fontSize: 11,
      color: t.colors.danger,
      textAlign: "center",
      marginBottom: t.spacing[2]
    },
    promoFeedbackSuccess: {
      fontFamily: t.fonts.body,
      fontSize: 11,
      color: t.colors.success,
      textAlign: "center",
      marginBottom: t.spacing[2]
    },
    // ── Footer ────────────────────────────────────────────────────────────
    footerRow: {
      alignItems: "center",
      marginVertical: t.spacing[2]
    },
    restoreLink: {
      fontFamily: t.fonts.label,
      fontSize: 11,
      color: t.colors.textMuted,
      letterSpacing: 0.3
    },
    restoreLinkDisabled: {
      opacity: 0.4
    },
    disclaimer: {
      fontFamily: t.fonts.body,
      fontSize: 10,
      color: t.colors.textFaint,
      textAlign: "center",
      lineHeight: 16
    }
  });
}
