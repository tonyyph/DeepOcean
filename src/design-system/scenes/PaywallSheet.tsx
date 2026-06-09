import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  TextInput,
  TouchableOpacity,
  Dimensions,
  type ListRenderItemInfo,
  type NativeSyntheticEvent,
  type NativeScrollEvent
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import { THEME_LIST, type AppTheme, type ThemeId } from "../themes";
import { Sheet } from "../atoms/Sheet";
import { PressableCard } from "../atoms/PressableCard";
import { usePremium } from "@/stores";
import { container } from "@/data/container";
import type { PromoCodeResult, PurchaseOffering } from "@/domain/entities";
import { useTranslations } from "@/core/i18n";
import { Colors } from "@/theme";

type PlanId = "lifetime" | "annual" | "monthly";

type BenefitSlide = {
  readonly icon: string;
  readonly title: string;
  readonly body: string;
};

type Props = {
  visible: boolean;
  onDismiss: () => void;
  intentTheme?: ThemeId;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  water: "water-outline",
  diamond: "diamond-outline",
  sparkles: "sparkles-outline",
  telescope: "telescope-outline"
};

/**
 * PaywallSheet — full-screen premium upsell with:
 *   - Benefit carousel (4 slides with icon illustration + title + body)
 *   - 3 plan cards: Lifetime / Annual (pre-selected, best value) / Monthly
 *   - 7-day free trial CTA (when no active trial)
 *   - Experience / promo code input (3-day unlock)
 *   - Restore Purchases link
 *
 * Prices come from the live RC offering when configured; VND fallbacks are
 * rendered from translations when billing is unconfigured — never fake unlock.
 */
export function PaywallSheet({ visible, onDismiss, intentTheme }: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();
  const insets = useSafeAreaInsets();

  const purchaseLifetime = usePremium((s) => s.purchaseLifetime);
  const purchaseAnnual = usePremium((s) => s.purchaseAnnual);
  const purchaseMonthly = usePremium((s) => s.purchaseMonthly);
  const startTrial = usePremium((s) => s.startTrial);
  const applyPromoCode = usePremium((s) => s.applyPromoCode);
  const restore = usePremium((s) => s.restore);
  const isPremium = usePremium((s) => {
    return s.isPremium;
  });
  const isConfigured = usePremium((s) => s.isConfigured);
  const status = usePremium((s) => s.status);
  const trialState = usePremium((s) => s.trialState);

  const [selectedPlan, setSelectedPlan] = useState<PlanId>("annual");
  const [offering, setOffering] = useState<PurchaseOffering | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoResult, setPromoResult] = useState<PromoCodeResult | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<FlatList<BenefitSlide>>(null);

  const busy = status === "loading";
  const pw = tr.paywall;

  useEffect(() => {
    if (!visible || !isConfigured) return;
    let active = true;
    container.premium
      .offerings()
      .then((o) => {
        if (active) setOffering(o);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [visible, isConfigured]);

  useEffect(() => {
    if (isPremium && visible) {
      onDismiss();
    }
  }, [isPremium, visible, onDismiss]);

  useEffect(() => {
    if (!visible) {
      setPromoInput("");
      setPromoResult(null);
      setPromoError(null);
      setCarouselIndex(0);
      setSelectedPlan("annual");
    }
  }, [visible]);

  const slides = useMemo<BenefitSlide[]>(
    () =>
      (pw.benefits as readonly BenefitSlide[]).map((b) => ({
        icon: b.icon,
        title: b.title,
        body: b.body
      })),
    [pw.benefits]
  );

  const trialActive =
    trialState != null &&
    trialState.kind === "trial" &&
    Date.now() < trialState.expiresAt;
  const promoActive =
    trialState != null &&
    trialState.kind === "promo" &&
    Date.now() < trialState.expiresAt;
  const showTrialCta = !trialActive && !promoActive;

  const activeBadgeDays =
    trialState != null
      ? Math.max(
          1,
          Math.ceil((trialState.expiresAt - Date.now()) / (24 * 60 * 60 * 1000))
        )
      : 0;

  const handlePurchase = useCallback(async () => {
    if (busy || !isConfigured) return;
    try {
      let success = false;
      if (selectedPlan === "lifetime") {
        success = await purchaseLifetime();
      } else if (selectedPlan === "annual") {
        success = await purchaseAnnual();
      } else {
        success = await purchaseMonthly();
      }
      if (success) onDismiss();
    } catch {
      Alert.alert(pw.errorTitle, pw.errorBody);
    }
  }, [
    busy,
    isConfigured,
    selectedPlan,
    purchaseLifetime,
    purchaseAnnual,
    purchaseMonthly,
    onDismiss,
    pw.errorTitle,
    pw.errorBody
  ]);

  const handleTrial = useCallback(async () => {
    if (busy) return;
    try {
      const plan = selectedPlan === "lifetime" ? "annual" : selectedPlan;
      const state = await startTrial(plan as "annual" | "monthly");
      if (state) onDismiss();
    } catch {
      Alert.alert(pw.errorTitle, pw.errorBody);
    }
  }, [busy, selectedPlan, startTrial, onDismiss, pw.errorTitle, pw.errorBody]);

  const handleRestore = useCallback(async () => {
    if (busy || !isConfigured) return;
    try {
      const success = await restore();
      if (success) onDismiss();
    } catch {
      Alert.alert(pw.errorTitle, pw.errorBody);
    }
  }, [busy, isConfigured, restore, onDismiss, pw.errorTitle, pw.errorBody]);

  const handlePromoApply = useCallback(async () => {
    if (!promoInput.trim() || promoLoading) return;
    setPromoLoading(true);
    setPromoError(null);
    setPromoResult(null);
    try {
      const result = await applyPromoCode(promoInput.trim());

      if (result.valid) {
        setPromoResult(result);
      } else {
        setPromoError(
          result.reason === "expired" ? pw.promoExpired : pw.promoInvalid
        );
      }
    } finally {
      setPromoLoading(false);
    }
  }, [
    promoInput,
    promoLoading,
    applyPromoCode,
    pw.promoExpired,
    pw.promoInvalid
  ]);

  const handleCarouselScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setCarouselIndex(idx);
    },
    []
  );

  const lifetimePrice = offering?.lifetime?.priceString ?? pw.lifetimePrice;
  const annualPrice = offering?.annual?.priceString ?? pw.annualPrice;
  const monthlyPrice = offering?.monthly?.priceString ?? pw.monthlyPrice;
  const intentThemeName = useMemo(() => {
    if (!intentTheme) return null;
    return THEME_LIST.find((theme) => theme.id === intentTheme)?.name ?? null;
  }, [intentTheme]);

  const renderSlide = useCallback(
    ({ item }: ListRenderItemInfo<BenefitSlide>) => {
      const iconName =
        (ICON_MAP[item.icon] as keyof typeof Ionicons.glyphMap | undefined) ??
        "star-outline";
      return (
        <View style={[styles.slide, { width: SCREEN_WIDTH - 40 }]}>
          <View style={styles.slideIconWrap}>
            <LinearGradient
              colors={[t.colors.accent + "44", t.colors.accent + "11"]}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name={iconName} size={44} color={t.colors.accent} />
          </View>
          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideBody}>{item.body}</Text>
        </View>
      );
    },
    [styles, t.colors.accent]
  );

  const keyExtractor = useCallback(
    (_: BenefitSlide, i: number) => String(i),
    []
  );

  return (
    <Sheet
      visible={visible}
      onDismiss={onDismiss}
      snapPoints={["100%"]}
      noPadding
      showHandle={false}
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, 24),
            paddingBottom: Math.max(insets.bottom, 24)
          }
        ]}
      >
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onDismiss}
          hitSlop={{ top: 12, left: 12, bottom: 12, right: 12 }}
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={28} color={t.colors.textMuted} />
        </TouchableOpacity>

        <Text style={styles.heading}>{pw.title}</Text>
        <Text style={styles.headingSub}>{pw.subtitle}</Text>

        {intentThemeName != null && (
          <View style={styles.intentBanner}>
            <Text style={styles.intentBannerTitle}>
              {pw.unlockingTheme(intentThemeName)}
            </Text>
            <Text style={styles.intentBannerBody}>{pw.unlockingThemeHint}</Text>
          </View>
        )}

        {(trialActive || promoActive) && trialState != null && (
          <View style={styles.activeBanner}>
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={t.colors.accent}
            />
            <Text style={styles.activeBannerText}>
              {pw.promoSuccess(activeBadgeDays)}
            </Text>
          </View>
        )}

        <View style={styles.carouselWrap}>
          <FlatList
            ref={carouselRef}
            data={slides}
            renderItem={renderSlide}
            keyExtractor={keyExtractor}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleCarouselScroll}
            scrollEventThrottle={16}
            bounces={false}
            getItemLayout={(_, i) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * i,
              index: i
            })}
          />
          {/* Pagination dots */}
          <View style={styles.dotsRow}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === carouselIndex ? styles.dotActive : styles.dotInactive
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.plansRow}>
          {/* Lifetime */}
          <PressableCard
            selected={selectedPlan === "lifetime"}
            onPress={() => setSelectedPlan("lifetime")}
            containerStyle={{
              ...styles.planCard,
              ...(selectedPlan === "lifetime"
                ? styles.planCardSelected
                : undefined)
            }}
            haptic="light"
            radius={16}
            glow
            padding={0}
          >
            <View style={styles.planInner}>
              <Text style={styles.planLabel}>{pw.planLifetime}</Text>
              <Text style={styles.planPrice}>{lifetimePrice}</Text>
              <Text style={styles.planSub}>{pw.planLifetimeSub}</Text>
            </View>
          </PressableCard>
          {/* Annual */}
          <PressableCard
            selected={selectedPlan === "annual"}
            onPress={() => setSelectedPlan("annual")}
            containerStyle={{
              ...styles.planCard,
              ...styles.planCardFeatured,
              ...(selectedPlan === "annual"
                ? styles.planCardSelected
                : undefined)
            }}
            haptic="light"
            radius={16}
            glow
            padding={0}
          >
            <View style={styles.savingBadge}>
              <Text style={styles.savingBadgeText}>{pw.annualSaving}</Text>
            </View>
            <View style={styles.planInner}>
              <Text style={[styles.planLabel, styles.planLabelAccent]}>
                {pw.planAnnual}
              </Text>
              <Text style={styles.planPrice}>{annualPrice}</Text>
              <Text style={styles.planSub}>{pw.annualPricePerMonth}</Text>
            </View>
          </PressableCard>
          {/* Monthly */}
          <PressableCard
            selected={selectedPlan === "monthly"}
            onPress={() => setSelectedPlan("monthly")}
            containerStyle={{
              ...styles.planCard,
              ...(selectedPlan === "monthly"
                ? styles.planCardSelected
                : undefined)
            }}
            haptic="light"
            radius={16}
            glow
            padding={0}
          >
            <View style={styles.planInner}>
              <Text style={styles.planLabel}>{pw.planMonthly}</Text>
              <Text style={styles.planPrice}>{monthlyPrice}</Text>
              <Text style={styles.planSub}>{pw.planMonthlySub}</Text>
            </View>
          </PressableCard>
        </View>

        {showTrialCta && (
          <PressableCard
            onPress={handleTrial}
            containerStyle={styles.trialCard}
            haptic="medium"
            radius={14}
            padding={0}
            disabled={busy}
          >
            <LinearGradient
              colors={[t.colors.accent, `${t.colors.accent}AA`]}
              style={styles.trialGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {busy ? (
                <ActivityIndicator color={Colors.base.white} size="small" />
              ) : (
                <>
                  <View style={styles.trialPill}>
                    <Text style={styles.trialPillText}>{pw.trialBadge}</Text>
                  </View>
                  <Text style={styles.trialCtaLabel}>{pw.trialCta}</Text>
                  <Text style={styles.trialCtaSub}>{pw.trialDescription}</Text>
                </>
              )}
            </LinearGradient>
          </PressableCard>
        )}

        <PressableCard
          onPress={handlePurchase}
          containerStyle={styles.purchaseCard}
          haptic="medium"
          radius={14}
          padding={0}
          disabled={busy || !isConfigured}
        >
          <View
            style={[
              styles.purchaseInner,
              (!isConfigured || busy) && styles.purchaseDisabled
            ]}
          >
            {busy ? (
              <ActivityIndicator color={Colors.base.white} size="small" />
            ) : (
              <Text style={styles.purchaseLabel}>
                {selectedPlan === "lifetime"
                  ? pw.lifetimeCta
                  : selectedPlan === "annual"
                    ? pw.annualCta
                    : pw.monthlyCta}
              </Text>
            )}
          </View>
        </PressableCard>

        {!isConfigured && (
          <Text style={styles.unavailableNote}>{pw.unavailable}</Text>
        )}

        <View style={styles.promoRow}>
          <TextInput
            style={[
              styles.promoInput,
              promoResult?.valid === true && styles.promoInputSuccess
            ]}
            value={promoInput}
            onChangeText={(text) => {
              setPromoInput(text);
              setPromoError(null);
              setPromoResult(null);
            }}
            placeholder={pw.promoPlaceholder}
            placeholderTextColor={t.colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handlePromoApply}
          />
          <TouchableOpacity
            style={[
              styles.promoApplyBtn,
              (promoLoading || !promoInput.trim()) &&
                styles.promoApplyBtnDisabled
            ]}
            onPress={handlePromoApply}
            disabled={promoLoading || !promoInput.trim()}
          >
            {promoLoading ? (
              <ActivityIndicator size="small" color={t.colors.accent} />
            ) : (
              <Text style={styles.promoApplyText}>{pw.promoApply}</Text>
            )}
          </TouchableOpacity>
        </View>

        {promoError != null && (
          <Text style={styles.promoFeedbackError}>{promoError}</Text>
        )}
        {promoResult?.valid === true && (
          <Text style={styles.promoFeedbackSuccess}>
            {pw.promoSuccess(
              Math.max(
                1,
                Math.ceil(
                  (promoResult.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)
                )
              )
            )}
          </Text>
        )}

        <View style={styles.footerRow}>
          <TouchableOpacity
            onPress={handleRestore}
            disabled={busy || !isConfigured}
          >
            <Text
              style={[
                styles.restoreLink,
                (!isConfigured || busy) && styles.restoreLinkDisabled
              ]}
            >
              {pw.restore}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.disclaimer}>{pw.disclaimer}</Text>
      </View>
    </Sheet>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: t.spacing[5]
    },
    closeBtn: {
      alignSelf: "flex-end",
      padding: t.spacing[2],
      marginRight: -t.spacing[2],
      marginBottom: t.spacing[1]
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
      borderColor: `${Colors.premium.gold}5A`,
      backgroundColor: `${Colors.premium.gold}14`,
      paddingHorizontal: t.spacing[4],
      paddingVertical: t.spacing[3],
      marginBottom: t.spacing[3]
    },
    intentBannerTitle: {
      fontFamily: t.fonts.label,
      fontSize: 11,
      letterSpacing: 0.8,
      color: Colors.premium.gold,
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
      backgroundColor: t.colors.accent + "22",
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
      backgroundColor: t.colors.accent,
      borderRadius: t.radii.pill,
      paddingHorizontal: t.spacing[2],
      paddingVertical: 3,
      alignSelf: "center",
      marginTop: t.spacing[2]
    },
    savingBadgeText: {
      fontFamily: t.fonts.label,
      fontSize: 10,
      color: Colors.base.white
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
      backgroundColor: `${Colors.base.white}38`,
      borderRadius: t.radii.pill,
      paddingHorizontal: t.spacing[3],
      paddingVertical: 3,
      marginBottom: t.spacing[2]
    },
    trialPillText: {
      fontFamily: t.fonts.label,
      fontSize: 10,
      color: Colors.base.white,
      letterSpacing: 1
    },
    trialCtaLabel: {
      fontFamily: t.fonts.display,
      fontSize: 18,
      color: Colors.base.white,
      letterSpacing: t.fonts.displayLetterSpacing,
      marginBottom: 4
    },
    trialCtaSub: {
      fontFamily: t.fonts.body,
      fontSize: 11,
      color: `${Colors.base.white}B8`,
      textAlign: "center"
    },
    // ── Purchase CTA ─────────────────────────────────────────────────────
    purchaseCard: {
      marginBottom: t.spacing[2],
      borderRadius: 14
    },
    purchaseInner: {
      backgroundColor: t.colors.accent,
      paddingVertical: t.spacing[4],
      alignItems: "center",
      borderRadius: 14
    },
    purchaseDisabled: {
      opacity: 0.45
    },
    purchaseLabel: {
      fontFamily: t.fonts.label,
      fontSize: 13,
      color: Colors.base.white,
      letterSpacing: 1
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
      borderColor: Colors.bio.cyan
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
      color: Colors.bio.coral,
      textAlign: "center",
      marginBottom: t.spacing[2]
    },
    promoFeedbackSuccess: {
      fontFamily: t.fonts.body,
      fontSize: 11,
      color: Colors.bio.cyan,
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
