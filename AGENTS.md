# Deep Ocean Agent Brief

Use this file as the first-stop context when working in this repository.

## Project Shape

Deep Ocean is a premium focus app where a focus session is represented as an underwater dive. The root project is an Expo/React Native app with TypeScript, Expo Router, Zustand, React Query, MMKV, Skia, Reanimated, RevenueCat, notifications, and native widget scaffolding. There is also a separate Next.js marketing/landing web app in `webapp/`; follow `webapp/AGENTS.md` before changing that app.

Important paths:

- `app/`: Expo Router route layer only. Keep business logic out of route files.
- `src/domain/`: pure entities and repository interfaces. No React, I/O, storage, or native APIs.
- `src/data/`: concrete repositories and AI gateways. `src/data/container.ts` wires implementations.
- `src/features/`: feature logic, hooks, selectors, policies, deterministic engines.
- `src/stores/`: Zustand stores. `diveSessionStore.ts` is the live session engine.
- `src/core/`: infrastructure such as storage, audio, haptics, IAP, notifications, i18n, query client, network.
- `src/design-system/`: themes, tokens, atoms, scenes. Prefer this over ad hoc styling.
- `docs/widget-system.md`: widget architecture and QA notes.
- `plugins/with-focus-widget.js` and `scripts/*widget*`: native widget config and verification.
- `ios/` and `android/`: generated/native project files. Be careful with unrelated native churn.

## Runbook

Common commands:

- `yarn start` or `npm run start`: Expo dev server with cache clear.
- `yarn ios` / `yarn android`: run native dev build.
- `yarn test`: Jest tests.
- `yarn lint`: Expo lint plus `tsc --noEmit`.
- `yarn widget`: patch and verify iOS widget target markers.
- `yarn check:widget-native`: verify native widget wiring.

Native modules such as MMKV, Skia, Reanimated, RevenueCat, and dev client mean Expo Go is not enough for full app behavior. Use a development build for native validation.

## Architecture Rules

- `app/` may import from `src/*`, but `src/*` must not import from `app/`.
- Screens should orchestrate UI and call feature hooks or stores. Do not call repositories directly from screens.
- `domain/` must stay pure.
- `data/` may depend on `domain/` and `core/`, but not `features/` or `app/`.
- Keep repository instances centralized in `src/data/container.ts`.
- Prefer deterministic, testable functions in `features/` for business rules.
- Use path aliases from `tsconfig.json`: `@/*`, `@app/*`, `@assets/*`.

## Core Product Systems

Dive engine:

- Main store: `src/stores/diveSessionStore.ts`.
- Starts, pauses, resumes, cancels, ticks, ends sessions.
- Computes depth and zone through `src/features/ocean/zones.ts`.
- Rolls deterministic discoveries through `src/features/ocean/discoveryEngine.ts`.
- On end, persists the session, records collection sightings, updates XP/level/streak/title achievements, and queues reward UI.
- Side effects include haptics and `AmbientAudio`.

Ocean content:

- `src/features/ocean/zones.ts`: zone table and depth math.
- `src/features/ocean/bestiary.ts`: creatures and artifacts.
- `src/features/ocean/lore.ts`: story/copy.
- Adding a new zone usually requires updating visual, audio, discovery, and theme assumptions too.

Widget system:

- URL parser: `src/features/widget/urlAction.ts`.
- Dispatcher: `src/features/widget/dispatch.ts`.
- Snapshot writer: `src/features/widget/snapshot.ts`.
- Primary action policy: `src/features/widget/policy.ts`.
- Root bootstrap integration is in `app/_layout.tsx`.
- Native source-of-truth lives under `plugins/focus-widget/native/`; `ios/` and
  `android/` are generated copies and are ignored by Git.
- The four required raster backgrounds live in `assets/widget-concepts/`.
  Avoid adding exported size variants unless code or the config plugin uses
  them; binary assets noticeably increase the EAS project archive.
- Keep widget action handling idempotent and deterministic. Do not duplicate the dive session engine in native widget code.

Dive screen lifecycle:

- `HomeScreen` normally starts the session before navigating to `/dive`.
- `DiveScreen` has a direct-route fallback governed by
  `src/screens/diveLaunchPolicy.ts`.
- That fallback must run at most once per screen mount. Never restart a dive in
  reaction to `session` becoming `null`, `surfaced`, or `cancelled`; abort and
  surface intentionally produce terminal state transitions.

AI companion:

- Config: `src/core/config/aiConfig.ts`.
- Provider factory: `src/data/gateways/aiProviderFactory.ts`.
- Providers include Gemini/OpenAI-compatible, Groq, and OpenRouter paths depending on current files.
- Missing public API keys should fall back to offline/cached companion behavior, not break the app.

Premium/IAP:

- Config: `src/core/config/iapConfig.ts`.
- RevenueCat service: `src/core/iap/RevenueCatService.ts`.
- Store: `src/stores/premiumStore.ts`.
- Missing RevenueCat keys should surface unavailable/locked states, not fake unlocks.

Notifications:

- Root startup calls `NotificationService.configure()` and `reconcileDiveReminder(...)`.
- Feature code lives in `src/features/notifications/`.
- Keep scheduling idempotent.

## UI And Design

- Use `src/design-system/theme.ts`, `useTheme`, `useThemedStyles`, and design-system atoms/scenes.
- Do not hardcode colors, spacing, or typography unless matching an existing local exception.
- For any user-visible content, always check and update the corresponding i18n translations for every supported language before finishing. Do not leave new screen copy, button labels, empty states, errors, notification/toast text, or accessibility labels hardcoded in one language unless the surrounding file already has a deliberate local exception.
- The app is dark, cinematic, oceanic, and premium; keep UI dense enough for a tool but still atmospheric.
- Tabs are in `app/(tabs)/_layout.tsx`; premium users get `ProTabBar`.
- Root bootstraps fonts, splash, audio, updates, notifications, premium hydration, and widget sync in `app/_layout.tsx`.

## Testing Guidance

- Use Jest for pure engines, selectors, policies, stores, and resolvers.
- Existing tests include:
  - `src/features/diver/streakEngine.test.ts`
  - `src/features/widget/urlAction.test.ts`
  - `src/features/widget/policy.test.ts`
  - `src/features/audio/diveAudioPolicy.test.ts`
  - `src/screens/diveLaunchPolicy.test.ts`
  - `src/screens/homeLastDiveResolver.test.ts`
  - `src/stores/premiumStore.test.ts`
- For narrow pure logic changes, add or update focused unit tests.
- For app-wide changes, run `yarn lint` when practical.
- For widget/native changes, also run `yarn check:widget-native`.

## Native Cautions

- `app.json` enables the New Architecture, dev client, splash, notifications, background audio, and the custom focus widget plugin.
- `ios/Podfile` has an Xcode 26 `fmt` C++17 workaround and disables bundle code signing in `post_install`; preserve these unless intentionally changing native build behavior.
- iOS widget target wiring may be experimental and script-managed. Read `docs/widget-system.md` before changing widget native files.
- Generated Android widget files land under `android/app/src/main/`; their
  tracked templates live under `plugins/focus-widget/native/android-widget/`.
- Do not hand-edit generated native widget files as the durable fix. Update
  `plugins/focus-widget/native/`, `plugins/with-focus-widget.js`, or the patch
  scripts, then regenerate and run `yarn check:widget-native`.

## Agent Memory And Handoff

- Durable repository rules belong in this file or the relevant `docs/` page.
- Current work state, recent fixes, verification, and next checks belong in
  `summary.md`; refresh it when handing work to another agent.
- Do not put secrets or `.env.local` values in either file.
- Before trusting old handoff notes, compare them with `git status`, recent
  commits, and the current implementation.

## Coding Style

- TypeScript is strict with `noUncheckedIndexedAccess`.
- Prefer small, typed helpers over ad hoc object/string handling.
- Keep side effects out of render paths.
- Fire-and-forget haptics/audio calls are acceptable where the existing code does that.
- Do not introduce business logic directly into route files.
- Keep edits scoped; do not reformat unrelated generated/native files.
- The repo may have user changes. Never revert unrelated work.
