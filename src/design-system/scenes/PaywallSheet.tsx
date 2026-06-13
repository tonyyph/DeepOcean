import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View, Text,
  StyleSheet, ActivityIndicator,
  Alert,
  FlatList,
  TextInput,
  TouchableOpacity,
  type ListRenderItemInfo,
  type NativeSyntheticEvent,
  type NativeScrollEvent
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import { THEME_LIST, type ThemeId } from "../themes";
import { makeStyles } from "./PaywallSheet.styles";
import { GlowText } from "../atoms/GlowText";
import { Sheet } from "../atoms/Sheet";
import { PressableCard } from "../atoms/PressableCard";
import { ActionButton } from "../atoms/ActionButton";
import { usePremium } from "@/stores";
import { container } from "@/data/container";
import type { PromoCodeResult, PurchaseOffering } from "@/domain/entities";
import { useTranslations } from "@/core/i18n";
import {
  ICON_MAP,
  SCREEN_WIDTH,
  type BenefitSlide,
  type PlanId
} from "./PaywallSheet.constants";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  intentTheme?: ThemeId;
};

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
          <GlowText size={20} style={styles.slideTitle}>
            {item.title}
          </GlowText>
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
        <GlowText size={26} style={styles.heading}>
          {pw.title}
        </GlowText>
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
                <ActivityIndicator color={t.colors.background} size="small" />
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
        <ActionButton
          label={
            selectedPlan === "lifetime"
              ? pw.lifetimeCta
              : selectedPlan === "annual"
                ? pw.annualCta
                : pw.monthlyCta
          }
          tone="premium"
          size="lg"
          fullWidth
          icon="sparkles"
          onPress={handlePurchase}
          disabled={busy || !isConfigured}
          loading={busy}
          containerStyle={styles.purchaseButton}
        />
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
