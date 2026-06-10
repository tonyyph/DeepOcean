# Store Readiness and Premium Plan

This document captures the v1 store and monetization decisions for Deep Ocean.
The app should launch as freemium: the core dive habit stays usable for free,
while Pro adds aesthetic depth, insight, and narrative value.

## Target Customers

- Primary: students, freelancers, designers, developers, writers, language
  learners, and anyone doing 20-60 minute deep-work sessions.
- Secondary: users who like self-care, journaling, cozy productivity, light
  game loops, and dark cinematic interfaces.
- Highest purchase intent: users with a 5-7 day streak, discovered collection
  entries, and visible attachment to themes, AI insights, or field journals.

## Pricing

Use localized store prices where available. These app strings are only fallback
display values when RevenueCat offerings are unavailable.

- US/global MVP: monthly $3.99, annual $23.99, lifetime $44.99.
- Vietnam MVP: monthly 49.000d, annual 299.000d, lifetime 799.000d.
- Default trial: 7-day free trial on annual.
- Preferred paywall emphasis: annual as best value, lifetime as an indie-friendly
  one-time option.

## Free vs Pro

Free should include:

- Core dive timer, free/custom duration, pause/resume/surface.
- Basic XP, streak, level progress, and recent expedition history.
- Basic reminders, basic collection entries after discovery, and at least two
  free themes.

Pro should include:

- Premium themes and Pro visual polish.
- Full expedition journal/lore for discovered creatures and artifacts.
- AI deep insights, mood-correlated plans, and breathing rituals.
- Advanced analytics/full history filters when implemented.
- Cosmetic discovery boosts or exclusive cosmetic entries only if they do not
  block the core focus habit.

Avoid locking core focus behavior, saved session access, restore purchases, or
basic personal data access behind Pro.

## RevenueCat Setup

Configure the active offering with:

- Entitlement: `premium` for all-access Pro via lifetime, annual, or monthly.
- Packages: `lifetime`, `annual`, and `monthly`.
- Optional theme entitlements: `theme_<themeId>` for individual theme packs.
- Public SDK keys through `EXPO_PUBLIC_REVENUECAT_IOS_KEY` and
  `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`, or `expo.extra.revenuecat`.

Production builds must verify purchase, restore, trial, unavailable billing,
and localized price display on both platforms.

## Store QA Checklist

- Run `yarn lint`, `yarn test`, and `yarn check:widget-native`.
- Build production iOS and Android through EAS.
- Verify notification permission, background audio, widget actions, offline AI
  fallback, paywall dismissal, purchase cancellation, and restore purchase.
- Prepare privacy policy, terms, support URL, subscription terms, store
  screenshots, and localized app metadata.
- Re-check paywall copy whenever a Pro gate changes so the app never advertises
  locked zones or exclusive discoveries unless those behaviors exist in code.
