import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import type { AppTheme, ThemeId } from "../themes";
import { THEMES } from "../themes";
import { Sheet } from "../atoms/Sheet";
import { PressableCard } from "../atoms/PressableCard";
import { usePremium } from "@/stores";
import { container } from "@/data/container";
import type { PurchaseOffering } from "@/domain/entities";
import { useTranslations } from "@/core/i18n";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  /** If set, indicates which theme the user was trying to unlock. */
  intentTheme?: ThemeId;
};

/**
 * PaywallSheet — premium upsell backed by the RevenueCat entitlement gateway.
 *
 * Prices and availability come from the live store offering; purchases route
 * through `usePremium` (which delegates to `container.premium`). When billing
 * is not configured the CTAs are disabled and an "unavailable" note is shown —
 * never a fake unlock.
 */
export function PaywallSheet({ visible, onDismiss, intentTheme }: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tr = useTranslations();
  const purchaseLifetime = usePremium((s) => s.purchaseLifetime);
  const purchaseTheme = usePremium((s) => s.purchaseTheme);
  const restore = usePremium((s) => s.restore);
  const isPremium = usePremium((s) => s.isPremium);
  const isConfigured = usePremium((s) => s.isConfigured);
  const status = usePremium((s) => s.status);

  const [offering, setOffering] = useState<PurchaseOffering | null>(null);
  const busy = status === "loading";

  const intent = intentTheme ? THEMES[intentTheme] : null;

  useEffect(() => {
    if (!visible || !isConfigured) return;
    let active = true;
    container.premium
      .offerings()
      .then((o) => {
        if (active) setOffering(o);
      })
      .catch(() => {
        if (active) setOffering(null);
      });
    return () => {
      active = false;
    };
  }, [visible, isConfigured]);

  const lifetimePrice =
    offering?.lifetime?.priceString ?? tr.paywall.lifetimePrice;
  const singlePackPrice = intentTheme
    ? (offering?.themePacks[intentTheme]?.priceString ??
      tr.paywall.singlePackPrice)
    : tr.paywall.singlePackPrice;

  const reportError = useCallback(() => {
    Alert.alert(tr.paywall.errorTitle, tr.paywall.errorBody);
  }, [tr]);

  const handleLifetime = useCallback(async () => {
    if (!isConfigured) return;
    try {
      const ok = await purchaseLifetime();
      if (ok) onDismiss();
    } catch {
      reportError();
    }
  }, [isConfigured, purchaseLifetime, onDismiss, reportError]);

  const handleSinglePack = useCallback(async () => {
    if (!isConfigured || !intentTheme) return;
    try {
      const ok = await purchaseTheme(intentTheme);
      if (ok) onDismiss();
    } catch {
      reportError();
    }
  }, [isConfigured, intentTheme, purchaseTheme, onDismiss, reportError]);

  const handleRestore = useCallback(async () => {
    if (!isConfigured) return;
    try {
      const ok = await restore();
      if (ok) onDismiss();
    } catch {
      reportError();
    }
  }, [isConfigured, restore, onDismiss, reportError]);

  const benefits = useMemo(() => tr.paywall.benefits, [tr]);

  return (
    <Sheet visible={visible} onDismiss={onDismiss}>
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 360 }}
      >
        <LinearGradient
          colors={[t.gradients.bioGlow[0], t.gradients.bioGlow[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.crest}
        >
          <Ionicons name="diamond" size={28} color="#fff" />
        </LinearGradient>

        <Text style={styles.title}>{tr.paywall.title}</Text>
        <Text style={styles.subtitle}>{tr.paywall.subtitle}</Text>

        {intent ? (
          <View style={styles.intentCard}>
            <Ionicons name="lock-open" size={14} color={t.colors.premium} />
            <Text style={styles.intentText}>
              {tr.paywall.unlockingTheme(intent.name)}
            </Text>
          </View>
        ) : null}

        <View style={styles.benefitList}>
          {benefits.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={styles.checkDot}>
                <Ionicons name="checkmark" size={12} color={t.colors.accent} />
              </View>
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <PressableCard
            haptic="heavy"
            onPress={handleLifetime}
            disabled={busy || !isConfigured}
            glow
            radius={t.radii.pill}
          >
            <View style={styles.ctaContent}>
              {busy ? (
                <ActivityIndicator color={t.colors.text} />
              ) : (
                <>
                  <Text style={styles.ctaPrimary}>
                    {tr.paywall.lifetimeCta}
                  </Text>
                  <Text style={styles.ctaPrice}>{lifetimePrice}</Text>
                </>
              )}
            </View>
          </PressableCard>

          {intentTheme ? (
            <PressableCard
              haptic="medium"
              onPress={handleSinglePack}
              disabled={busy || !isConfigured}
              radius={t.radii.pill}
            >
              <View style={styles.ctaContent}>
                <Text style={styles.ctaSecondary}>
                  {tr.paywall.singlePackCta}
                </Text>
                <Text style={styles.ctaPrice}>{singlePackPrice}</Text>
              </View>
            </PressableCard>
          ) : null}

          {isConfigured ? (
            <PressableCard
              haptic="light"
              onPress={handleRestore}
              disabled={busy}
              radius={t.radii.pill}
            >
              <Text style={styles.skip}>{tr.paywall.restore}</Text>
            </PressableCard>
          ) : (
            <Text style={styles.unavailable}>{tr.paywall.unavailable}</Text>
          )}

          <PressableCard
            haptic="light"
            onPress={onDismiss}
            disabled={busy}
            radius={t.radii.pill}
          >
            <Text style={styles.skip}>
              {isPremium ? tr.profile.cancel : tr.paywall.maybeLater}
            </Text>
          </PressableCard>
        </View>

        {/* <Text style={styles.disclaimer}>{tr.paywall.disclaimer}</Text> */}
      </MotiView>
    </Sheet>
  );
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    crest: {
      alignSelf: "center",
      width: 64,
      height: 64,
      borderRadius: t.radii.xl,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: t.spacing[4],
      shadowColor: t.colors.accent,
      shadowOpacity: 0.5,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 0 }
    },
    title: {
      color: t.colors.text,
      fontSize: 26,
      fontFamily: t.fonts.display,
      letterSpacing: t.fonts.displayLetterSpacing,
      textAlign: "center"
    },
    subtitle: {
      color: t.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: t.fonts.body,
      textAlign: "center",
      marginTop: t.spacing[2]
    },
    intentCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[2],
      marginTop: t.spacing[4],
      paddingVertical: t.spacing[2] + 2,
      paddingHorizontal: t.spacing[3],
      borderRadius: t.radii.pill,
      backgroundColor: "rgba(255,210,122,0.08)",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.premium,
      alignSelf: "center"
    },
    intentText: {
      color: t.colors.premium,
      fontSize: 12,
      fontFamily: t.fonts.label,
      letterSpacing: 1
    },
    benefitList: {
      marginTop: t.spacing[5],
      gap: t.spacing[3]
    },
    benefitRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: t.spacing[3]
    },
    checkDot: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: "rgba(34,228,255,0.10)",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1
    },
    benefitText: {
      flex: 1,
      color: t.colors.text,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: t.fonts.body
    },
    actions: {
      marginTop: t.spacing[6],
      gap: t.spacing[3]
    },
    ctaContent: {
      alignItems: "center",
      gap: 2
    },
    ctaPrimary: {
      color: t.colors.text,
      fontSize: 14,
      letterSpacing: 1,
      fontFamily: t.fonts.label
    },
    ctaSecondary: {
      color: t.colors.textSecondary,
      fontSize: 13,
      letterSpacing: 1,
      fontFamily: t.fonts.label
    },
    ctaPrice: {
      color: t.colors.accent,
      fontSize: 12,
      fontFamily: t.fonts.mono,
      marginTop: 2
    },
    skip: {
      color: t.colors.textMuted,
      textAlign: "center",
      fontSize: 14,
      letterSpacing: 1,
      fontFamily: t.fonts.label,
      paddingVertical: t.spacing[1]
    },
    unavailable: {
      color: t.colors.textMuted,
      textAlign: "center",
      fontSize: 12,
      lineHeight: 18,
      fontFamily: t.fonts.body,
      paddingVertical: t.spacing[2]
    },
    disclaimer: {
      color: t.colors.textFaint,
      fontSize: 10,
      textAlign: "center",
      marginTop: t.spacing[4],
      fontFamily: t.fonts.body,
      lineHeight: 14
    }
  });
