# DeepOcean Onboarding

This document describes the first-run onboarding flow in the Expo app.

## Product Goal

Onboarding should quickly explain the core metaphor of Deep Ocean:

- A focus session is an underwater dive.
- Staying focused moves the diver through ocean zones.
- Completed sessions can reward discoveries, XP, streak progress, and history.
- The app should feel calm, premium, and useful before the user reaches Home.

The current flow is intentionally short: four swipeable chapters with richer body copy and a deliberate final action.

## Entry Point

Routing:

- `app/index.tsx` checks `StorageKeys.onboardingComplete`.
- First launch routes to `/onboarding`.
- Completed onboarding routes to `/(tabs)`.
- `app/onboarding.tsx` exports `src/screens/OnboardingScreen.tsx`.

Replay:

- `src/screens/ProfileScreen.tsx` clears `StorageKeys.onboardingComplete`.
- The router then returns the user to `/onboarding`.

## Screen Implementation

Main file:

- `src/screens/OnboardingScreen.tsx`

The screen uses:

- `ZoneBackground` for per-chapter ocean gradients.
- `UnderwaterCanvas` for ambient particles.
- `GlowText` for the chapter title.
- `FlatList` with `horizontal` and `pagingEnabled` for swipe navigation.
- Dots and `BACK` / `NEXT` buttons for explicit navigation.
- `PressableCard` with `onLongPress` on the final chapter to complete onboarding.

The final long press is deliberate. It prevents a casual swipe or tap from dropping a new user into the main app before they have chosen to begin.

## Chapter Data

Chapter content lives in i18n files:

- `src/core/i18n/translations/vi.ts`
- `src/core/i18n/translations/en.ts`

Each chapter currently provides:

- `title`: short cinematic heading.
- `depth`: small label shown above the heading.
- `body`: primary explanation line.
- `detail`: longer app-specific explanation.

The screen pairs these chapters with the `ZONES` array:

```ts
const ZONES: readonly OceanZone[] = [
  "abyss",
  "midnight",
  "twilight",
  "surface"
];
```

When adding, removing, or reordering chapters, keep the translation arrays and `ZONES` in sync. Each chapter needs a matching ocean zone so the background and particle field can update with the active slide.

## Interaction Rules

Users can move through onboarding in three ways:

- Swipe left or right across the chapter area.
- Tap a pagination dot.
- Use `BACK` and `NEXT`.

Completion only happens from the final chapter:

1. The user long-presses the final CTA.
2. The app sets `StorageKeys.onboardingComplete` to `true`.
3. The router replaces the current route with `/(tabs)`.

## Design Notes

Keep the screen atmospheric but readable:

- Use theme values through `useTheme` and `useThemedStyles`.
- Do not hardcode new colors, spacing, or fonts unless matching an established local exception.
- Keep route files free of business logic.
- Keep copy in i18n, not inline in the screen.
- Avoid tap-to-continue gestures that compete with horizontal swiping.

The onboarding should remain useful on small screens. If adding longer copy, verify that the title, detail text, dots, and CTA fit without overlap.

## Validation

For copy or layout-only changes:

```sh
npx tsc --noEmit
yarn lint
```

For visual changes, validate in a development build or simulator because the app depends on native modules such as MMKV, Skia, Reanimated, and the Expo dev client.
