import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * In-app purchase / RevenueCat configuration.
 *
 * Keys are read first from public env vars (`EXPO_PUBLIC_*`, inlined at build
 * time from `.env` / EAS secrets) and fall back to `app.json` →
 * `expo.extra.revenuecat`. Nothing secret is committed. A missing platform key
 * simply means billing is unavailable and premium stays locked (the paywall
 * surfaces an "unavailable" state rather than a fake unlock).
 *
 * Dashboard contract (configure these identifiers in RevenueCat):
 *  - Entitlement `premium`          → lifetime all-access pass.
 *  - Entitlement `theme_<themeId>`  → a single unlocked premium theme.
 *  - Offering packages: a `lifetime` package for the pass, and one package per
 *    theme whose store product id is `theme_<themeId>`.
 */
export type IapConfig = {
  /** Resolved public SDK key for the current platform, or null. */
  apiKey: string | null;
  /** Entitlement id that grants the all-access lifetime pass. */
  premiumEntitlement: string;
  /** Prefix for per-theme entitlement ids (e.g. `theme_ember`). */
  themeEntitlementPrefix: string;
  /** RevenueCat offering package identifier for the lifetime pass. */
  lifetimePackageId: string;
  /** RevenueCat offering package identifier for the annual subscription. */
  annualPackageId: string;
  /** RevenueCat offering package identifier for the monthly subscription. */
  monthlyPackageId: string;
  /** Promo codes are validated locally against this shared secret prefix. */
  promoCodePrefix: string;
};

const DEFAULT_PREMIUM_ENTITLEMENT = "premium";
const DEFAULT_THEME_ENTITLEMENT_PREFIX = "theme_";
const DEFAULT_LIFETIME_PACKAGE_ID = "lifetime";
const DEFAULT_ANNUAL_PACKAGE_ID = "annual";
const DEFAULT_MONTHLY_PACKAGE_ID = "monthly";
const DEFAULT_PROMO_CODE_PREFIX = "DEEPOCEAN-";

function extraIap(): Record<string, unknown> {
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;
  const iap = extra.revenuecat;
  return iap && typeof iap === "object" ? (iap as Record<string, unknown>) : {};
}

function pick(
  envValue: string | undefined,
  extraValue: unknown
): string | null {
  if (envValue && envValue.trim().length > 0) return envValue.trim();
  if (typeof extraValue === "string" && extraValue.trim().length > 0) {
    return extraValue.trim();
  }
  return null;
}

export function getIapConfig(): IapConfig {
  const iap = extraIap();

  const iosKey = pick(process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY, iap.iosKey);
  const androidKey = pick(
    process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
    iap.androidKey
  );

  const apiKey =
    Platform.select({
      ios: iosKey,
      android: androidKey,
      default: iosKey ?? androidKey
    }) ?? null;

  return {
    apiKey,
    premiumEntitlement:
      pick(
        process.env.EXPO_PUBLIC_REVENUECAT_PREMIUM_ENTITLEMENT,
        iap.premiumEntitlement
      ) ?? DEFAULT_PREMIUM_ENTITLEMENT,
    themeEntitlementPrefix:
      pick(
        process.env.EXPO_PUBLIC_REVENUECAT_THEME_PREFIX,
        iap.themeEntitlementPrefix
      ) ?? DEFAULT_THEME_ENTITLEMENT_PREFIX,
    lifetimePackageId:
      pick(
        process.env.EXPO_PUBLIC_REVENUECAT_LIFETIME_PACKAGE,
        iap.lifetimePackageId
      ) ?? DEFAULT_LIFETIME_PACKAGE_ID,
    annualPackageId:
      pick(
        process.env.EXPO_PUBLIC_REVENUECAT_ANNUAL_PACKAGE,
        iap.annualPackageId
      ) ?? DEFAULT_ANNUAL_PACKAGE_ID,
    monthlyPackageId:
      pick(
        process.env.EXPO_PUBLIC_REVENUECAT_MONTHLY_PACKAGE,
        iap.monthlyPackageId
      ) ?? DEFAULT_MONTHLY_PACKAGE_ID,
    promoCodePrefix:
      pick(process.env.EXPO_PUBLIC_PROMO_CODE_PREFIX, iap.promoCodePrefix) ??
      DEFAULT_PROMO_CODE_PREFIX
  };
}
