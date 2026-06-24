# Deep Ocean — Project Understanding

> Generated: 2026-06-24. Cross-referenced with README.md, AGENTS.md, summary.md, docs/app-uml.md, and source code.

---

## 1. Product Summary

**Deep Ocean** is a premium iOS/Android focus timer disguised as an underwater exploration game. The core mechanic: the longer you focus, the deeper you dive. Each ocean zone (Surface → Twilight → Midnight → Abyss → Hadal Trench) unlocks at increasing focus-minute thresholds and brings its own light, ambient audio, particle effects, creatures, and artifacts.

**Emotional hook:** calm, cinematic, atmospheric — designed to make focus feel like an adventure rather than a chore.

**Monetisation:** RevenueCat-backed premium (lifetime / annual / monthly subscriptions, per-theme packs). Free tier has limited collection content and no ProTabBar.

**Companion app surfaces:**
- iOS/Android home-screen widgets (3 designs: Ocean Portal, Diving Instrument, Living Ocean)
- iOS Live Activities (lock-screen timer while diving)
- Local push notifications (daily reminders + dive-completion alerts)
- Marketing landing page (`webapp/`)

---

## 2. Architecture Summary

Clean Architecture, feature-first. Strict unidirectional dependency graph:

```
app/  →  src/screens/  →  src/features/ + src/stores/  →  src/data/  →  src/core/  →  OS
                         ↑ src/design-system/ (atoms/scenes/theme)
                         ↑ src/domain/ (pure types — no deps)
```

### Layer responsibilities

| Layer | Path | Rule |
|---|---|---|
| Route layer | `app/` | Expo Router screens only. No business logic. |
| Screen layer | `src/screens/` | UI orchestration. Calls hooks/stores; no direct repo access. |
| Feature layer | `src/features/` | Testable, pure-ish logic: engines, hooks, policies, selectors. |
| Store layer | `src/stores/` | Zustand reactive state. Session engine lives here. |
| Data layer | `src/data/` | Concrete repositories + AI gateways. Wired in `container.ts`. |
| Core layer | `src/core/` | Infrastructure — audio, haptics, storage, query, IAP, notifications, i18n. |
| Design system | `src/design-system/` | Tokens, themes, atoms, scenes. Single source of UI truth. |
| Domain | `src/domain/` | Pure TypeScript types and repository interfaces. Zero dependencies. |

---

## 3. Navigation Map

```
App launch
  └─ RootLayout (app/_layout.tsx)
       └─ /  (app/index.tsx)
            ├─ onboarding.complete = false → /onboarding  (OnboardingScreen)
            │                                    └─ CTA → /(tabs)
            └─ onboarding.complete = true  → /(tabs)
                 ├─ /(tabs)/index       HomeScreen
                 │    └─ tap Begin Dive → /dive (DiveScreen, gestureEnabled: false)
                 ├─ /(tabs)/collection  CollectionScreen
                 │    └─ tap row → CreatureStorySheet (bottom sheet)
                 │    └─ locked Pro → PaywallSheet
                 ├─ /(tabs)/stats       StatsScreen
                 │    └─ tap session → /session/[id] (SessionDetailScreen)
                 ├─ /(tabs)/ai          AIScreen
                 │    └─ ProInsights locked → PaywallSheet
                 └─ /(tabs)/profile     ProfileScreen
                      ├─ ThemePickerSheet
                      ├─ LanguagePickerSheet
                      ├─ ReminderTimePickerSheet
                      └─ PaywallSheet

/widget (transparent modal, animation: none)
  └─ DeepLinkActionRouter → dispatches command → navigates to tab / dive

deepocean://widget?action=... (deep link)
deepocean-widget://widget?action=... (widget URL scheme)
  → same /widget route pipeline
```

**Screen animations:**
- Default: `fade`, 360ms
- `/dive`: `fade_from_bottom`, 720ms
- `/session/[id]`, `/notifications`: `slide_from_right`
- `/widget`: `none`, transparent modal

---

## 4. State Management

### Stores (Zustand, all in `src/stores/`)

| Store | File | Persistence | Purpose |
|---|---|---|---|
| `useDiveSession` | `diveSessionStore.ts` | MMKV `dive.active_session` (compact runtime snapshot) | Live dive engine — tick, audio, haptics, discoveries, rewards |
| `useSettings` | `settingsStore.ts` | MMKV `app.settings` | All user preferences (haptics, volume, language, reminders, preferred duration) |
| `usePremium` | `premiumStore.ts` | MMKV `app.premium.snapshot` | Entitlement mirror over RevenueCat |
| `useThemeStore` | `themeStore.ts` | MMKV `app.theme` | Active theme id |
| `useAchievements` | `achievementStore.ts` | MMKV `app.achievements` | Unlocked zones, title achievements, XP milestones |
| `usePersonalization` | `personalizationStore.ts` | MMKV (onboarding personalization) | Goal selection, workflow, onboarding state |

### React Query

Used for async data fetching over MMKV repositories — profile, sessions, collection, mood, AI companion. Query client is in `src/core/query/client.ts` (offline-first tuning).

### MMKV Keys

```
onboarding.complete
diver.profile
discovery.collection
sessions.history
app.settings
app.theme
app.achievements
app.notifications.schedule
app.mood
app.ai.cache
app.premium.snapshot
app.premium.trial
app.premium.promo_codes
app.widget.snapshot
dive.active_session     ← runtime session restore (v3 schema)
```

---

## 5. API / Data Architecture

### AI Companion (multi-provider with offline fallback)

Priority chain: `Gemini Flash → Groq (Llama/Qwen) → OpenRouter free model → offline composer`

| File | Role |
|---|---|
| `src/data/gateways/aiProviderFactory.ts` | Builds provider chain from env vars |
| `src/data/repositories/AICompanionRepository.ts` | Cache-first, MMKV-backed, stale-while-revalidate |
| `src/data/repositories/offlineCompanion.ts` | Deterministic fallback when no provider |
| `src/features/ai/context.ts` | Builds `AIContext` from profile + mood + sessions + achievements |
| `src/features/ai/prompts.ts` | Prompt templates for recommendation / motivation / reflection |

### Repositories (all in `src/data/repositories/`)

| Repository | Backing store | Manages |
|---|---|---|
| `SessionRepository` | MMKV `sessions.history` | Dive session CRUD |
| `DiverRepository` | MMKV `diver.profile` | Profile read/update |
| `CollectionRepository` | MMKV `discovery.collection` | Creature/artifact sighting records |
| `MoodRepository` | MMKV `app.mood` | Current mood record |
| `NotificationRepository` | MMKV `app.notifications.schedule` | Persisted OS notification schedule |
| `AICompanionRepository` | MMKV `app.ai.cache` + AI providers | AI response cache + generation |
| `PremiumRepository` | MMKV `app.premium.*` + RevenueCat | Entitlements, trial, promo codes |

### Composition root

`src/data/container.ts` — single place to wire all repository instances. Import `container` anywhere in `src/` to get typed repository access.

---

## 6. Design System

### Tokens (`src/design-system/tokens.ts`)

```
palette:
  abyss   50–700  (deep navy-to-black)
  surface 50–500  (sky blue range)
  bio     cyan / aqua / jade / violet / coral / amber
  text    primary / secondary / muted / faint (opacity-based)
  semantic success / error / warning / info

radii:   xs(4) s(8) sm(12) md(18) lg(24) xl(32) 2xl(44) pill(999)
spacing: 1(4) 2(8) 3(12) 4(16) 5(20) 6(24) 8(32) 10(40) 12(48) 16(64) 20(80) 24(96)
typography:
  display  Sora_700Bold  — hero(44) h1(32) h2(26) h3(20)
  body     Inter_400Regular — lg(17) md(15) sm(13) xs(11)
  label    Sora_400Regular — lg(14) md(12) sm(10), letterSpacing: 1
  mono     JetBrainsMono_400Regular — lg(28) md(18) sm(13)
motion:
  durations: instant(120) quick(220) base(360) slow(720) cinematic(1400) breath(4800)
  easings:   standard / enter / exit / organic (Bezier tuples)
```

**Rule:** Never hardcode colors or spacing. Always import from `theme` (not tokens directly).

### Theme System (`src/design-system/themes/`)

10 named themes, all typed as `AppTheme`:

| ID | Name | Premium? |
|---|---|---|
| `prismLight` | Light | No (default free) |
| `prismFire` | Fire | Yes |
| `prismWater` | Water | Yes |
| `prismAir` | Air | Yes |
| `prismNature` | Nature | Yes |
| `prismIce` | Ice | Yes |
| `prismStorm` | Storm | Yes |
| `prismMagma` | Magma | Yes |
| `prismMystic` | Mystic | Yes |
| `prismDark` | Dark | Yes |

Each theme carries: `colors`, `gradients`, `fonts`, `particles` (style + effect + hues + vignette), `typography`, `radii`, `spacing`, `surfaces`, `shadows`, `motion`.

`useTheme()` → reactive hook. `getCurrentTheme()` → outside React (snapshot).

### Particle styles
`dust | bubbles | snow | embers | petals | plankton | silt | shards | rays`

### UI Atoms (`src/design-system/atoms/`)

| Component | Purpose |
|---|---|
| `GlassCard` | Frosted glass panel — primary card surface |
| `GlowText` | Text with a bio-luminescent glow effect |
| `PressableCard` | Tappable card with haptic/opacity feedback |
| `ZoneBackground` | Full-screen gradient for a given `OceanZone` |
| `DiveProgressRing` | Circular elapsed-time / depth ring |
| `DepthIndicator` | Meters depth text display |
| `ActionButton` | Primary / secondary CTA button |
| `AppHeader` | Reusable screen header with back / title |
| `KpiCard` | Stat metric card (streak, dives, level, etc.) |
| `GuidanceCard` | Dismissible hint/tip panel |
| `OptionPill` | Selectable pill chip (quick duration selector, filter) |
| `PremiumBadge` | "Pro" badge overlay |
| `ModalFrame` | Centered modal shell |
| `ConfirmModal` | Danger/confirm dialog (abort dive, etc.) |
| `AchievementModal` | Zone-unlock celebration modal |
| `LevelUpModal` | Post-dive level up reward modal |
| `TitleAchievementModal` | Post-dive title unlock modal |
| `FreeDiveModal` | Custom-minutes input modal |
| `Sheet` | `@gorhom/bottom-sheet` wrapper |
| `SettingRow` | Profile settings row with label + control |
| `SectionLabel` | Section header label |
| `Skeleton` / `SectionSkeleton` | Loading shimmer |
| `MoodMapChart` | Mood selection grid |
| `ThemeSwatch` | Theme preview tile |
| `ScreenSafeAreaView` | SafeArea-aware screen root |
| `ScreenScrollView` | Scrollable screen body |
| `ScreenTransitionOverlay` | Fade overlay during screen transitions |

### UI Scenes (`src/design-system/scenes/`)

| Component | Purpose |
|---|---|
| `UnderwaterCanvas` | Skia particle field — ambient particles, runs on UI thread |
| `PaywallSheet` | Full premium purchase / trial / promo-code sheet |
| `ProTabBar` | Premium animated tab bar (replaces default) |
| `CreatureStorySheet` | Bottom sheet with creature lore/story |
| `DiscoveryOverlay` | In-dive creature/artifact discovery pop-up |
| `DiscoveryTimeline` | Session detail discovery list |
| `SessionTimeline` | Zone journey visualization in session detail |
| `ThemePickerSheet` | Theme selection gallery sheet |
| `LanguagePickerSheet` | Language selector sheet |
| `ReminderTimePickerSheet` | Notification time picker sheet |

---

## 7. Feature Inventory

### Ocean Progression Engine (`src/features/ocean/`)

- **`zones.ts`** — `OceanZone` type, `ZONE_TABLE`, `minutesToDepth()`, `depthToZone()`, `minutesToZone()`, `QUICK_DURATIONS`
- **`discoveryEngine.ts`** — LCG-seeded deterministic discovery rolls per zone + minute window
- **`bestiary.ts`** + `bestiary/` — creatures and artifacts per zone (surface/twilight/midnight/abyss/trench + artifacts)
- **`rarity.ts`** — rarity system (common / uncommon / rare / legendary)
- **`lore.ts`** — story copy for zones and creatures

**Zone unlocks (focus minutes):**

| Zone | Unlock |
|---|---|
| Surface (Sunlight) | 0 min |
| Twilight | 15 min |
| Midnight | 30 min |
| Abyss | 50 min |
| Hadal Trench | 75 min |

### Diver Progression (`src/features/diver/`)

- **`levelSystem.ts`** — XP per session, level thresholds, `computeLevelUp()`
- **`streakEngine.ts`** — daily streak computation (calendar-day aware)
- **`titleAchievements.ts`** — title unlock system (checked at end of dive)
- **`hooks.ts`** — React Query hooks: `useDiverProfile`, `useUpdateDiver`

### Audio (`src/features/audio/`)

- **`diveAudioPolicy.ts`** — pure policy: when to start/stop/crossfade per session state
- **`useDiveAudio.ts`** — React hook wiring audio policy to `DiveScreen` lifecycle
- `AmbientAudioManager` (in `core/audio/`) — singleton adaptive layer engine

### Discovery Presentation (`src/features/discovery/`)

- **`DiscoveryQueueManager.ts`** — buffers discoveries, dequeues one at a time for `DiscoveryOverlay`
- **`useDiveEventEngine.ts`** — connects store discoveries → queue manager → overlay

### Widget System (`src/features/widget/`)

- **`urlAction.ts`** — parse `deepocean://widget?action=...` → typed `WidgetCommand`
- **`dispatch.ts`** — execute `WidgetCommand` (start/pause/resume/navigate)
- **`snapshot.ts`** — write MMKV widget snapshot (v3 schema, debounced)
- **`policy.ts`** — primary action policy (idle → start, paused → resume, diving → pause)
- **`DeepLinkActionRouter.ts`** — waits for session hydration, deduplicates, dispatches, returns nav target
- **`externalActionNavigation.ts`** — shared nav policy (widget, Live Activity, notifications, deep links)
- **`actionContract.ts`** — typed action/target/params/fallback contract
- **`SessionActionRouter.ts`** — routes session-specific actions
- **`metrics.ts`** — widget event tracking helpers

### Notifications (`src/features/notifications/`)

- **`reminderScheduler.ts`** — idempotent daily reminder schedule/cancel
- **`reminderTimePicker.ts`** — time picker logic
- **`useDiveReminders.ts`** — hook for profile reminder UI
- **`useNotificationPermission.ts`** — permission request flow
- **`notificationCenter.ts`** — in-app notification center
- **`NotificationToastHost.tsx`** — toast display component

### AI Companion (`src/features/ai/`)

- **`context.ts`** — `buildAIContext()` assembles context from profile + mood + sessions + achievements
- **`prompts.ts`** — prompt templates per AI kind (recommendation / motivation / reflection / session summary)
- **`useAskAgainLimit.ts`** — cooldown enforcement for "Ask Again" button
- **`AIProvider.ts`** — provider interface
- **`index.ts`** — exports

### Session Lifecycle (`src/features/session/`)

- **`sessionLifecyclePolicy.ts`** — cold-start restore decisions (restore running, restore paused, clear stale)
- Schema: v3 `PersistedActiveDive`

### Onboarding / Personalization (`src/features/onboarding/`)

- **`recommendationEngine.ts`** — AI-assisted onboarding personalization
- **`usePersonalizedRecommendation.ts`** — hook for onboarding recommendation flow

### Mood (`src/features/mood/`)

14 moods: `focused | tired | burned_out | motivated | curious | happy | calm | excited | anxious | stressed | distracted | sluggish | bored | overwhelmed`

---

## 8. Native Integration Inventory

### iOS

| Integration | Files | Notes |
|---|---|---|
| App Groups | `app.json` + plugin | Shared MMKV container for widget ↔ app data |
| Home Screen Widgets | `plugins/focus-widget/native/ios-widget/DeepOceanFocusWidget.swift` | 3 widget designs in SwiftUI |
| Live Activities | `src/core/live-activity/DeepOceanLiveActivity.ts` | Dynamic Island + lock screen. Upserted per session id. |
| Local Notifications | `src/core/notifications/NotificationService.ts` + `expo-notifications` | Daily reminder + dive completion + active dive |
| Background Audio | `expo-audio` + `app.json` audio mode | Ambient audio continues when app is backgrounded |
| Deep Links | `app/_layout.tsx` Linking listener | `deepocean://` and `deepocean-widget://` schemes |

### Android

| Integration | Files | Notes |
|---|---|---|
| Home Screen Widget | `plugins/focus-widget/native/android-widget/` | Generated from plugin; edit plugin source, not generated files |
| Local Notifications | Same as iOS via `expo-notifications` | Push channels configured |
| Deep Links | Same as iOS | `deepocean://` intent filter |

### Premium / IAP

- RevenueCat SDK via `react-native-purchases` (`src/core/iap/RevenueCatService.ts`)
- Store: `src/stores/premiumStore.ts`
- Config: `src/core/config/iapConfig.ts`

### Fonts

Sora, Inter, Manrope, SpaceGrotesk, JetBrainsMono — loaded in `RootLayout` before splash hide.

---

## 9. Technical Debt

| Area | Issue |
|---|---|
| AI binary assets | Audio files (`assets/audio/`) are placeholder null bindings; no real MP3s yet |
| Stats charts | `StatsScreen` hand-rolls the weekly heatmap; no Victory Native charts installed |
| E2E tests | Zero Detox tests; only Jest unit tests for pure logic |
| Web visual QA | Marketing `webapp/` hasn't had final device/browser pass before publishing |
| `ios/` / `android/` | Generated projects in `.gitignore`; widget native changes require `prebuild` + `yarn widget` to validate |
| `any` usage | TypeScript strict + `noUncheckedIndexedAccess` enforced, but check `src/data/gateways/` for provider response casting |
| Legacy theme IDs | `premiumStore.ts` maps 15 old theme names to new `prismX` IDs via `LEGACY_THEME_IDS` — eventual migration debt |

---

## 10. Risks

| Risk | Mitigation |
|---|---|
| RevenueCat not configured | `PremiumRepository` returns unavailable/locked states, not fake unlocks |
| AI keys missing | Falls back to offline composer — never breaks app |
| Native widget changes | Only modify plugin sources (`plugins/`), not generated `ios/android/` files. Run `yarn check:widget-native` |
| Session restore race (cold start) | `DiveScreen` waits for `isReady` before applying fallback; `DeepLinkActionRouter` waits for hydration |
| Widget archive size | PNGs in `assets/widget-concepts/` increase EAS archive significantly — avoid redundant size variants |
| Audio assets | No real audio; Ambient audio gracefully no-ops with null sources |

---

## 11. Quick Wins

- Drop real MP3s into `assets/audio/{surface,twilight,midnight,abyss,trench}.mp3` and update `ZONE_SOURCES` in `AmbientAudioManager.ts` to enable full audio
- Set `EXPO_PUBLIC_GEMINI_API_KEY` (+ others) to enable live AI companion
- Configure RevenueCat key in `src/core/config/iapConfig.ts` to enable real IAP
- Add Victory Native for richer stats charts
- Add Detox E2E test coverage for the dive session flow

---

## 12. Suggested Improvements

- **Streak calendar view:** visualize streak history (like GitHub contribution graph)
- **Share card:** session-share image uses native share sheet — could add Skia-rendered card
- **Offline AI quality:** offline composer is deterministic but generic; improve with context-aware templates
- **Accessibility:** focus on `accessibilityLabel` coverage in `UnderwaterCanvas` and `DiveProgressRing`
- **Android Live Activities:** currently iOS-only; Android equivalent via persistent notification
- **Haptic customization:** per-event haptic intensity in settings

---

## 13. Coding Conventions

1. **TypeScript strict** with `noUncheckedIndexedAccess`. No `any`, no `null` misuse.
2. **No hardcoded colors/spacing** — always import from `useTheme()` or design-system tokens.
3. **No business logic in `app/`** — route files import screens from `src/screens/`.
4. **Never import repositories directly in screens** — go through stores (`src/stores/`) or feature hooks.
5. **Fire-and-forget audio/haptics** — never block render on `async` audio/haptic calls.
6. **Remove unused imports** before committing.
7. **No dead code** — don't leave commented-out blocks.
8. **i18n everything** — any user-visible text must have entries in `src/core/i18n/translations/en.ts` and `vi.ts`.
9. **Zustand selectors** — subscribe to slices (e.g., `useSettings(s => s.language)`) never whole state objects.
10. **Path aliases:** `@/*` → `src/*`, `@app/*` → `app/*`, `@assets/*` → `assets/*`.

---

## 14. UI/UX Guidelines

- **Aesthetic:** dark, cinematic, oceanic, premium. Dense-but-atmospheric — tool _and_ experience.
- **Theme:** always use `useTheme()` for colors; never raw token values in components.
- **Typography:** display headings use Sora; body uses Inter; mono uses JetBrainsMono.
- **Glass cards:** `GlassCard` is the primary card surface — frosted translucent panel over zone background.
- **Particles:** `UnderwaterCanvas` runs on the UI thread via Skia `useDerivedValue`. Don't add heavy per-particle JS logic.
- **Animations:** use `motion` preset durations and `Easing.bezier` tuples from `tokens.ts`. Prefer Reanimated worklets.
- **Touch targets:** minimum 44px. Use `PressableCard` / `ActionButton` which already enforce this.
- **Dark mode:** app is dark-first by design — no separate light mode; themes include one light theme (`prismLight`).
- **Reduced motion:** `useSettings(s => s.reducedMotion)` — disable/reduce animations when true.
- **Safe area:** always wrap screens in `ScreenSafeAreaView`; never use inline safe area hacks.

---

## 15. Existing Patterns to Follow

### Starting a dive
```
HomeScreen → useDiveSession.getState().start(minutes) → router.push('/dive')
```
Never call `start()` from `DiveScreen` without checking the `diveLaunchPolicy.ts` fallback.

### Accessing theme
```ts
const theme = useTheme();
// use theme.colors.accent, theme.spacing[4], theme.radii.md, etc.
```

### Zustand slice subscription
```ts
const language = useSettings(s => s.language);  // not useSettings() whole object
```

### Bottom sheets
Use `Sheet` atom (wraps `@gorhom/bottom-sheet`). Always mount `BottomSheetModalProvider` (done in `RootLayout`).

### Storage writes
Always go through `container.{repo}.method()` or a store action. Never call `storage.set()` directly from screens.

### AI context assembly
```
buildAIContext(language) → reads profile, mood, sessions, achievements → AIContext
```
Pass to `container.ai.dailyRecommendation(context)`.

### Adding a new screen
1. Create route file in `app/` that just exports the screen component.
2. Create screen component in `src/screens/`.
3. Keep all logic in feature hooks / stores.
4. Register route in `Stack` config in `app/_layout.tsx` if non-default animation is needed.

### Adding a new setting
1. Add field to `AppSettings` in `src/domain/entities.ts`.
2. Add default value in `src/stores/settingsStore.ts` `DEFAULT` object.
3. Add i18n label in `src/core/i18n/translations/en.ts` and `vi.ts`.
4. Add `SettingRow` in `ProfileScreen`.

### Widget snapshot update
Always call `writeWidgetSnapshot()` after any state change that the widget should reflect. Already wired in `AppState` change listener and after session lifecycle transitions.

---

## Quick-Reference File Map

| Task | File(s) |
|---|---|
| Change zone thresholds / depth math | `src/features/ocean/zones.ts` |
| Add a creature or artifact | `src/features/ocean/bestiary/` |
| Change XP / leveling | `src/features/diver/levelSystem.ts` |
| Change streak logic | `src/features/diver/streakEngine.ts` |
| Change dive store behavior | `src/stores/diveSessionStore.ts` |
| Change audio crossfade | `src/core/audio/AmbientAudioManager.ts` |
| Change haptic vocabulary | `src/core/haptics/index.ts` |
| Change color tokens | `src/design-system/tokens.ts` |
| Add/edit a theme | `src/design-system/themes/` |
| Change paywall UI/logic | `src/design-system/scenes/PaywallSheet.tsx` + `src/stores/premiumStore.ts` |
| Change widget behavior | `src/features/widget/` + `app/widget.tsx` |
| Change notification reminders | `src/features/notifications/` |
| Change AI prompts | `src/features/ai/prompts.ts` |
| Change AI provider chain | `src/data/gateways/aiProviderFactory.ts` |
| Change onboarding flow | `src/screens/OnboardingScreen.tsx` + `src/features/onboarding/` |
| Change root boot sequence | `app/_layout.tsx` |
| Add/change translations | `src/core/i18n/translations/en.ts` + `vi.ts` |
| IAP / RevenueCat config | `src/core/config/iapConfig.ts` + `src/core/iap/RevenueCatService.ts` |
| Widget native source | `plugins/focus-widget/native/` (never edit generated `ios/`/`android/` directly) |
