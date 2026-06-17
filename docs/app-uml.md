# Deep Ocean UML va UI Flow

Tai lieu nay mo ta cach app Deep Ocean khoi dong, luu du lieu, dieu khien mot
phien focus/dive, va hien thi UI theo tung buoc. Cac diagram dung Mermaid nen co
the render truc tiep trong GitHub hoac VS Code Mermaid Preview.

## 1. Tong Quan Kien Truc

```mermaid
flowchart TB
  User["Nguoi dung"]
  OS["OS / Native services<br/>Linking, Notifications, Live Activity, RevenueCat"]

  subgraph AppLayer["app/ - Expo Router route layer"]
    Root["app/_layout.tsx<br/>RootLayout + Providers"]
    Gate["app/index.tsx<br/>Onboarding gate"]
    Tabs["app/(tabs)/_layout.tsx<br/>Bottom Tabs / ProTabBar"]
    RouteFiles["Route files<br/>export screen components"]
  end

  subgraph Screens["src/screens/ - UI orchestration"]
    Home["HomeScreen"]
    Dive["DiveScreen"]
    Collection["CollectionScreen"]
    Stats["StatsScreen"]
    AI["AIScreen"]
    Profile["ProfileScreen"]
    Onboarding["OnboardingScreen"]
    SessionDetail["SessionDetailScreen"]
  end

  subgraph Design["src/design-system/ - UI atoms/scenes/theme"]
    Atoms["Atoms<br/>GlassCard, ActionButton, KpiCard, ..."]
    Scenes["Scenes<br/>PaywallSheet, ProTabBar, UnderwaterCanvas, ..."]
    Theme["Theme tokens + useTheme"]
  end

  subgraph FeatureLayer["src/features/ - deterministic app logic"]
    Ocean["ocean<br/>zones, discoveryEngine, bestiary"]
    Diver["diver<br/>hooks, XP, streak, title achievements"]
    Notifications["notifications<br/>reminder policy"]
    Widget["widget<br/>URL parser, dispatch, snapshot"]
    Mood["mood<br/>selection hooks"]
    AIContext["ai<br/>context + prompts"]
  end

  subgraph Stores["src/stores/ - reactive state"]
    DiveStore["diveSessionStore<br/>live session engine"]
    PremiumStore["premiumStore"]
    SettingsStore["settingsStore"]
    ThemeStore["themeStore"]
    AchievementStore["achievementStore"]
  end

  subgraph Data["src/data/ - concrete gateways"]
    Container["container.ts<br/>composition root"]
    Repos["Repositories<br/>Session, Diver, Collection, Mood, Notification, Premium, AI"]
    Providers["AI providers<br/>Gemini/OpenAI-compatible, Groq, OpenRouter"]
  end

  subgraph Core["src/core/ - infrastructure"]
    MMKV["MMKV storage"]
    Audio["AmbientAudio"]
    Haptics["Haptics"]
    Query["React Query client"]
    IAP["RevenueCatService"]
    NotificationService["NotificationService"]
    I18n["i18n"]
  end

  User --> AppLayer
  OS --> Root
  Root --> Gate
  Root --> Tabs
  RouteFiles --> Screens
  Screens --> Design
  Screens --> FeatureLayer
  Screens --> Stores
  FeatureLayer --> Stores
  FeatureLayer --> Data
  Stores --> Data
  Data --> Core
  Core --> OS
```

### Nguyen tac phu thuoc

- `app/` chi la route layer, export hoac redirect sang screen.
- `src/screens/` dieu phoi UI, hooks, store actions; khong nen chua business logic nang.
- `src/features/` chua logic testable: depth, zone, discovery, streak, widget policy, AI context.
- `src/stores/` chua state reactive; `diveSessionStore` la live engine quan trong nhat.
- `src/data/container.ts` tap trung wiring repository/gateway.
- `src/domain/` chi co type/interface thuan, khong React, khong IO.

## 2. Router Va Screen Map

```mermaid
flowchart TD
  Launch["App launch"] --> Root["RootLayout"]
  Root --> Index["/"]
  Index -->|onboarding.complete = false| Onboarding["/onboarding"]
  Index -->|onboarding.complete = true| Tabs["/(tabs)"]
  Onboarding -->|completeOnboarding| Tabs

  Tabs --> HomeTab["/(tabs)/index<br/>Home"]
  Tabs --> CollectionTab["/(tabs)/collection<br/>Collection"]
  Tabs --> StatsTab["/(tabs)/stats<br/>Stats"]
  Tabs --> AITab["/(tabs)/ai<br/>AI Companion"]
  Tabs --> ProfileTab["/(tabs)/profile<br/>Profile"]

  HomeTab -->|Start preferred / quick / free dive| DiveRoute["/dive"]
  StatsTab -->|Tap recent expedition| SessionRoute["/session/[id]"]
  SessionRoute -->|Back| StatsTab

  CollectionTab -->|Tap row| StorySheet["CreatureStorySheet"]
  CollectionTab -->|Pro locked content| Paywall1["PaywallSheet"]
  AITab -->|Unlock ProInsights| Paywall2["PaywallSheet"]
  ProfileTab -->|Theme / Premium| Paywall3["PaywallSheet"]
  ProfileTab -->|Replay onboarding| Onboarding

  WidgetRoute["/widget?action=..."] --> WidgetDispatch["dispatchWidgetCommand"]
  DeepLink["deepocean://widget?action=..."] --> WidgetDispatch
  WidgetDispatch -->|open_ai_companion| AITab
  WidgetDispatch -->|view_daily_progress| StatsTab
  WidgetDispatch -->|start/pause/resume| HomeTab
```

## 3. App Boot Sequence

```mermaid
sequenceDiagram
  autonumber
  participant Native as Native shell
  participant Root as RootLayout
  participant Fonts as expo-font
  participant Splash as SplashScreen
  participant Audio as AmbientAudio
  participant Updates as expo-updates
  participant Notif as NotificationService
  participant Settings as useSettings
  participant Premium as usePremium
  participant Widget as Widget snapshot/deeplink
  participant Router as Expo Router

  Native->>Root: mount app/_layout.tsx
  Root->>Splash: preventAutoHideAsync()
  Root->>Fonts: load Sora, Inter, Manrope, SpaceGrotesk, JetBrainsMono
  Fonts-->>Root: fontsLoaded
  Root->>Audio: init()
  Root->>Splash: hideAsync()
  Root->>Updates: check/fetch/reload if production update exists
  Root->>Notif: configure()
  Root->>Settings: read reminder intent + language
  Root->>Notif: reconcileDiveReminder(...)
  Root->>Premium: hydrate()
  Premium->>Premium: cached snapshot first
  Premium->>Premium: configure + refresh RevenueCat when available
  Root->>Widget: writeWidgetSnapshot()
  Root->>Widget: installWidgetSnapshotSync()
  Root->>Native: listen Linking initial URL + URL events
  Root->>Router: render Stack
```

Root providers render around every screen:

```mermaid
flowchart LR
  Root["RootLayout"] --> Gesture["GestureHandlerRootView"]
  Gesture --> SafeArea["SafeAreaProvider"]
  SafeArea --> Query["QueryClientProvider"]
  Query --> Network["NetworkProvider"]
  Network --> BottomSheet["BottomSheetModalProvider"]
  BottomSheet --> Transition["ScreenTransitionLoadingProvider"]
  Transition --> Stack["Expo Router Stack"]
```

## 4. Domain Va Repository UML

```mermaid
classDiagram
  direction TB

  class DiveSession {
    +id: string
    +startedAt: number
    +endedAt: number?
    +targetSeconds: number?
    +elapsedSeconds: number
    +status: DiveSessionStatus
    +zone: OceanZone
    +depthMeters: number
    +oxygenPct: number
    +discoveries: Discovery[]
    +summary?: DiveSessionSummary
  }

  class DiverProfile {
    +id: string
    +name: string
    +level: number
    +xp: number
    +totalDives: number
    +totalFocusMinutes: number
    +currentStreakDays: number
    +longestStreakDays: number
    +preferredZone: OceanZone?
  }

  class CollectionEntry {
    +id: string
    +firstSeenAt: number
    +count: number
  }

  class AIContext {
    +language: Language
    +level: number
    +xp: number
    +streakDays: number
    +mood: Mood?
    +unlockedZones: OceanZone[]
    +achievements: string[]
    +recentSessions: AIRecentSession[]
  }

  class EntitlementSnapshot {
    +isPremium: boolean
    +unlockedThemes: string[]
    +activePlan: PlanId?
    +resolvedAt: number
  }

  class ISessionRepository {
    <<interface>>
    +list()
    +save(session)
    +byId(id)
    +clearAll()
  }

  class IDiverRepository {
    <<interface>>
    +get()
    +update(patch)
  }

  class ICollectionRepository {
    <<interface>>
    +all()
    +recordSighting(entryId)
  }

  class IAICompanionGateway {
    <<interface>>
    +dailyRecommendation(context)
    +motivation(context)
    +sessionSummary(session)
  }

  class IEntitlementGateway {
    <<interface>>
    +cached()
    +refresh()
    +offerings()
    +purchaseLifetime()
    +purchaseAnnual()
    +purchaseMonthly()
    +restore()
  }

  DiveSession "1" --> "*" CollectionEntry : discoveries become sightings
  DiverProfile --> DiveSession : updated when surfaced
  AIContext --> DiverProfile : derived from
  AIContext --> DiveSession : recent sessions
  EntitlementSnapshot --> IEntitlementGateway : resolved by
  ISessionRepository <|.. SessionRepository
  IDiverRepository <|.. DiverRepository
  ICollectionRepository <|.. CollectionRepository
  IAICompanionGateway <|.. AICompanionRepository
  IEntitlementGateway <|.. PremiumRepository
```

## 5. Persistence Map

```mermaid
flowchart TB
  subgraph MMKV["react-native-mmkv: deep-ocean.v1"]
    K1["onboarding.complete"]
    K2["diver.profile"]
    K3["discovery.collection"]
    K4["sessions.history"]
    K5["app.settings"]
    K6["app.theme"]
    K7["app.achievements"]
    K8["app.notifications.schedule"]
    K9["app.mood"]
    K10["app.ai.cache"]
    K11["app.premium.snapshot"]
    K12["app.premium.trial"]
    K13["app.premium.promo_codes"]
    K14["app.widget.snapshot"]
  end

  OnboardingScreen --> K1
  DiverRepository --> K2
  CollectionRepository --> K3
  SessionRepository --> K4
  settingsStore --> K5
  themeStore --> K6
  achievementStore --> K7
  NotificationRepository --> K8
  MoodRepository --> K9
  AICompanionRepository --> K10
  PremiumRepository --> K11
  PremiumRepository --> K12
  PremiumRepository --> K13
  WidgetSnapshot --> K14
```

## 6. Dive Session State Machine

```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Diving: start(targetMinutes | null)
  Diving --> Paused: pause()
  Paused --> Diving: resume()
  Diving --> Surfaced: end()
  Paused --> Surfaced: end()
  Diving --> Surfaced: tick reaches target
  Diving --> Idle: cancel()
  Paused --> Idle: cancel()
  Surfaced --> Diving: start(new target)
  Surfaced --> Tabs: DiveScreen drains reward queue
  Tabs --> [*]
```

Important details:

- `start()` creates a seeded `DiveSession`, starts a 1 second interval, haptics,
  ambient audio, Live Activity, active/completion notifications.
- `tick()` advances elapsed focus seconds, maps minutes to depth, maps depth to
  zone, rolls deterministic discoveries, updates Live Activity.
- `pause()` freezes elapsed time, clears interval, clears active notifications,
  updates Live Activity.
- `resume()` accounts for paused duration, restarts interval, rearms notifications.
- `end()` persists the session, collection sightings, XP/level, streak, title
  achievements, then sets `pendingLevelUp` / `pendingAchievements`.
- `cancel()` discards the active session and returns to tabs without rewards.

## 7. Dive Session Sequence

```mermaid
sequenceDiagram
  autonumber
  participant User
  participant Home as HomeScreen
  participant Router
  participant DiveUI as DiveScreen
  participant Store as diveSessionStore
  participant Ocean as zones + discoveryEngine
  participant Audio
  participant Notif as NotificationService
  participant Live as DeepOceanLiveActivity
  participant Data as container repositories
  participant Rewards as Reward modals

  User->>Home: tap Begin Dive / quick duration / free dive
  Home->>Router: push /dive?minutes=N
  Router->>DiveUI: mount DiveScreen
  DiveUI->>Store: start(N or null) when no active session
  Store->>Store: create DiveSession with seed
  Store->>Audio: init + setZone(surface)
  Store->>Notif: requestPermission + schedule completion/active dive
  Store->>Live: start(session)
  Store->>Store: setInterval(tick, 1000)

  loop every second while diving
    Store->>Ocean: minutesToDepth + depthToZone
    Store->>Ocean: rollDiscoveries(seed, zone, fromMinute, toMinute)
    Ocean-->>Store: depth, zone, discoveries
    Store->>Audio: setZone(newZone) on zone change
    Store->>Live: update(session)
    Store-->>DiveUI: reactive session state
    DiveUI->>DiveUI: update DepthIndicator, DiveProgressRing, DiscoveryOverlay
  end

  alt user pauses
    User->>DiveUI: tap Pause
    DiveUI->>Store: pause()
    Store->>Notif: clear dive notifications
    Store->>Live: update(paused)
    Store-->>DiveUI: show Resume button
  else user surfaces or target reached
    DiveUI->>Store: end()
    Store->>Notif: clear notifications / optional complete now
    Store->>Live: end(session.id)
    Store->>Audio: stopAll()
    Store->>Data: save session
    Store->>Data: record sightings
    Store->>Data: update diver profile XP, level, streak
    Store->>Store: set session.status = surfaced + pending rewards
    Store-->>DiveUI: surfaced
    DiveUI->>Rewards: show LevelUpModal then TitleAchievementModal
    Rewards-->>DiveUI: queue drained
    DiveUI->>Router: replace /(tabs)
  else user aborts
    User->>DiveUI: tap Abort + confirm
    DiveUI->>Store: cancel()
    Store->>Audio: stopAll()
    Store->>Notif: clear notifications
    Store->>Live: end(session.id)
    DiveUI->>Router: replace /(tabs)
  end
```

## 8. Discovery Presentation Flow

```mermaid
flowchart LR
  Tick["diveSessionStore.tick()"] --> Roll["rollDiscoveries(seed, zone, minute window)"]
  Roll --> Append["Append discoveries to session.discoveries"]
  Append --> Hook["useDiveEventEngine()"]
  Hook --> Manager["DiscoveryQueueManager<br/>tracks ingestedCount"]
  Manager --> Current["current discovery"]
  Current --> Overlay["DiscoveryOverlay"]
  Overlay -->|auto timeout or dismiss| Manager
```

`DiscoveryQueueManager` is pure presentation buffering. The source of truth is
still `session.discoveries`, so no discovery is lost if several arrive in one
tick.

## 9. AI Companion Sequence

```mermaid
sequenceDiagram
  autonumber
  participant UI as AIScreen / HomeScreen
  participant Hook as useDailyRecommendation/useDailyMotivation
  participant Context as buildAIContext()
  participant Data as Repositories
  participant AIRepo as AICompanionRepository
  participant Provider as AI Provider
  participant Cache as MMKV AI cache
  participant Offline as Offline composer

  UI->>Hook: render query
  Hook->>Context: buildAIContext(language)
  Context->>Data: profile + mood + sessions
  Context->>Context: add achievements from achievementStore
  Hook->>AIRepo: dailyRecommendation(context)
  AIRepo->>Cache: read cached text
  alt cached still fresh and not forced
    Cache-->>AIRepo: cached response
  else provider available
    AIRepo->>Provider: generate recommendation/motivation/reflection
    alt provider success
      Provider-->>AIRepo: text
      AIRepo->>Cache: write text
    else provider fails
      AIRepo->>Cache: use stale cache if present
      AIRepo->>Offline: compose fallback if no cache
    end
  else no provider configured
    AIRepo->>Offline: compose context-derived fallback
  end
  AIRepo-->>Hook: polished text
  Hook-->>UI: card content
```

Manual refresh in `AIScreen` bypasses the daily query cadence with
`forceRefresh: true`, then writes the result back into React Query cache.

## 10. Premium / Paywall Sequence

```mermaid
sequenceDiagram
  autonumber
  participant UI as PaywallSheet
  participant Store as premiumStore
  participant Repo as PremiumRepository
  participant RC as RevenueCatService
  participant MMKV as MMKV

  UI->>Repo: offerings() when sheet opens and billing configured
  Repo->>RC: getOfferings()
  RC-->>Repo: current offering
  Repo-->>UI: lifetime / annual / monthly / theme packs

  alt purchase selected plan
    UI->>Store: purchaseLifetime/Annual/Monthly()
    Store->>Repo: purchase...
    Repo->>RC: purchasePackage()
    RC-->>Repo: CustomerInfo
    Repo->>Repo: toSnapshot(CustomerInfo)
    Repo->>MMKV: persist premium snapshot
    Repo-->>Store: EntitlementSnapshot
    Store-->>UI: isPremium true
    UI->>UI: dismiss automatically
  else restore
    UI->>Store: restore()
    Store->>Repo: restore()
    Repo->>RC: restore()
  else trial or promo
    UI->>Store: startTrial() / applyPromoCode()
    Store->>Repo: persist TrialState
    Repo->>MMKV: app.premium.trial / promo_codes
  end
```

Premium state affects UI in three visible places:

- Tabs: free users see translucent default tab bar; premium users see `ProTabBar`.
- Collection and AI: locked story/insight surfaces open `PaywallSheet`.
- Profile: premium section, theme picker, debug premium switch in enabled dev mode.

## 11. Widget / Deep Link Sequence

```mermaid
sequenceDiagram
  autonumber
  participant Widget as Native widget / deep link
  participant Root as RootLayout or /widget route
  participant Parser as parseWidgetActionUrl()
  participant Dispatch as dispatchWidgetCommand()
  participant Dive as diveSessionStore
  participant Settings as settingsStore
  participant Router
  participant Snapshot as writeWidgetSnapshot()

  Widget->>Root: deepocean://widget?action=...
  Root->>Parser: parse URL
  Parser-->>Root: WidgetCommand or null
  Root->>Dispatch: command + navigate callback
  alt start_focus
    Dispatch->>Settings: preferredSessionMinutes if minutes absent
    Dispatch->>Dive: start(minutes) or resume if paused
  else pause_session
    Dispatch->>Dive: pause() if diving
  else resume_current
    Dispatch->>Dive: resume() if paused
  else open_ai_companion
    Dispatch->>Router: replace /(tabs)/ai
  else view_daily_progress
    Dispatch->>Router: replace /(tabs)/stats
  end
  Root->>Snapshot: write current widget JSON to MMKV
```

Primary widget action policy:

```mermaid
flowchart TD
  Session["Current session?"] -->|none| Start["start_focus"]
  Session -->|status = paused| Resume["resume_current"]
  Session -->|status = diving| Pause["pause_session"]
  Session -->|other status| Start
```

## 12. Notification Flow

```mermaid
flowchart TD
  Launch["App launch"] --> Configure["NotificationService.configure()"]
  Configure --> ReadSettings["Read settings: enabled, hour, minute, language"]
  ReadSettings --> Reconcile["reconcileDiveReminder()"]
  Reconcile -->|disabled| Cancel["cancel persisted OS reminder + clear MMKV"]
  Reconcile -->|enabled, permission revoked| Cancel
  Reconcile -->|enabled, existing schedule matches| Noop["No-op"]
  Reconcile -->|enabled, missing/drifted| Schedule["scheduleDailyReminder + persist identifier"]

  Profile["Profile reminder switch/time"] --> Hook["useDiveReminders()"]
  Hook -->|enable| Permission["request permission"]
  Permission -->|granted| Schedule
  Permission -->|denied| Disable["settings.diveRemindersEnabled = false"]
  Hook -->|disable| Cancel
  Hook -->|change time while enabled| Schedule

  DiveStart["Dive start"] --> DiveNotif["schedule completion + active dive notification"]
  DivePauseEndCancel["Pause / end / cancel"] --> ClearDiveNotif["clear active/completion notifications"]
```

## 13. UI Step-By-Step

### 13.1 First Launch / Onboarding

1. App starts with splash held while fonts and bootstrap work complete.
2. `/` reads `onboarding.complete` from MMKV.
3. If false, app routes to `/onboarding`.
4. `OnboardingScreen` shows full-screen `ZoneBackground` + `UnderwaterCanvas`.
5. User swipes/paginates through zone chapters: surface, twilight, abyss,
   midnight, trench.
6. Dots jump between chapters; Back/Next move the `FlatList`.
7. Final slide shows the primary CTA.
8. CTA sets `onboarding.complete = true` and `router.replace("/(tabs)")`.

### 13.2 Tabs Shell

1. `TabsLayout` reads theme with `useTheme()`.
2. It reads `usePremium().isPremium`.
3. Free user gets the default translucent tab dock.
4. Premium user gets `ProTabBar`.
5. Tabs are lazy and frozen on blur: Home, Collection, Stats, AI, Profile.

### 13.3 Home Tab

1. Background: `ZoneBackground zone="midnight"` + `UnderwaterCanvas`.
2. Header shows time-based greeting, diver name, title/level rank.
3. While profile/session/AI data loads, skeleton components show.
4. Last dive recap appears if a previous session exists.
5. Main hero CTA starts preferred duration from settings.
6. Quick pills start 15, 25, 45, 60 minute dives.
7. Infinity pill starts unlimited dive on press.
8. Long press on infinity opens `FreeDiveModal` for custom minutes.
9. Zone progress strip reads unlocked zones from `achievementStore`.
10. Daily companion card reads AI recommendation.
11. KPI row shows streak, dives, level.
12. Streak milestone card appears when the user has an active streak.

### 13.4 Dive Screen

1. Route `/dive` mounts `DiveScreen`.
2. If no session exists, it calls `start(minutes)` using route params.
3. Full-screen UI renders current zone background and particles.
4. Top block shows `DepthIndicator`, discovery count, and `DiscoveryOverlay`.
5. Center shows `DiveProgressRing`.
6. Bottom controls show Pause/Resume, Surface, Abort.
7. Pause changes button text to Resume and freezes elapsed focus time.
8. Surface opens a confirmation sheet; confirm calls `end()`.
9. Abort opens a danger confirmation modal; confirm calls `cancel()`.
10. First-time zone entry shows `AchievementModal`.
11. After surfacing, reward queue shows `LevelUpModal` first, then
    `TitleAchievementModal`.
12. When reward queue is empty, route returns to `/(tabs)`.

### 13.5 Collection Tab

1. Background uses abyss zone and particles.
2. Header shows collection title and discovered count.
3. If nothing discovered yet, a dismissible guidance card appears.
4. Sticky rarity filters narrow the list.
5. `FlashList` renders creature/artifact rows from bestiary + collection entries.
6. Seen rows show actual item data and count; unseen rows remain locked.
7. Tapping a row opens `CreatureStorySheet`.
8. Free users see a Pro callout; locked Pro story content opens `PaywallSheet`.
9. Empty filter result shows a compact empty state card.

### 13.6 Stats Tab

1. Background uses abyss zone and particles.
2. App header introduces progress analytics.
3. KPI cards show max depth, total focus, dive count, level.
4. Weekly heatmap groups sessions by local day.
5. Recent expeditions list the latest sessions.
6. Empty state shows a CTA to start `/dive`.
7. Tapping a recent expedition routes to `/session/[id]`.

### 13.7 Session Detail

1. Header has back button and title.
2. If session is loading or missing, center state appears.
3. Body shows date/time, duration, focus minutes, XP, max depth.
4. Level card shows whether the dive caused a level-up.
5. `SessionTimeline` visualizes zone journey.
6. `DiscoveryTimeline` lists discoveries.
7. Share card calls the native share sheet with a generated summary.

### 13.8 AI Tab

1. Background uses midnight zone or last session zone for particles.
2. Header plus optional first-use guidance card.
3. Today card shows daily recommendation.
4. Ask Again forces fresh AI recommendation/motivation, then starts cooldown.
5. Nudge card shows daily motivation.
6. Last Expedition card summarizes the most recent session.
7. `ProInsights` either shows premium insights or opens paywall.
8. Mood grid persists selected mood and invalidates AI recommendation cache.

### 13.9 Profile Tab

1. Background uses trench zone and particles.
2. Header shows profile name and level.
3. Pencil opens inline name editor; check saves through `useUpdateDiver`.
4. XP card animates progress to next level.
5. Premium section opens paywall when not premium.
6. Appearance card opens theme picker, language picker, reduced motion switch.
7. Settings card controls haptics, ambient volume, discovery alerts, preferred duration.
8. Notifications card toggles dive reminders and opens time picker when enabled.
9. Account card can replay onboarding by deleting `onboarding.complete`.
10. Developer premium override appears only when the env flag is enabled.
11. About card shows app version and tagline.
12. Profile can show delayed level/title reward modals if XP overflow is detected.

## 14. Screen-To-State Cheat Sheet

| UI surface | Reads from | Writes/calls | Next visible effect |
| --- | --- | --- | --- |
| RootLayout | settings, premium cache, widget URL | notifications, premium hydrate, widget snapshot | Stack renders; deeplink may navigate |
| Home | diver profile, sessions, achievements, AI rec, settings | `router.push("/dive")` | Dive screen starts |
| Dive | `useDiveSession`, achievements, settings | start/pause/resume/end/cancel | live ring, discoveries, rewards, return tabs |
| Collection | collection, premium | story sheet, paywall | row details or purchase sheet |
| Stats | sessions, profile | route to session detail | detail page |
| AI | sessions, mood, premium, AI cache | set mood, force refresh, paywall | new guidance / locked insight |
| Profile | profile, settings, theme, premium, reminders | update settings/profile/theme/reminder/premium | sheets, switches, persisted preferences |
| Widget | settings, dive session, premium | dispatch start/pause/resume/navigate | snapshot JSON + navigation/action |

## 15. Where To Change Things

- Add/change a route: `app/`, then keep heavy logic in `src/screens` or `src/features`.
- Change focus/dive behavior: `src/stores/diveSessionStore.ts`.
- Change depth/zone timing: `src/features/ocean/zones.ts`.
- Change discoveries: `src/features/ocean/bestiary*` and `src/features/ocean/discoveryEngine.ts`.
- Change post-dive XP/streak/title logic: `src/features/diver/*` and `diveSessionStore.end()`.
- Change persistent data contracts: `src/domain/entities.ts`, `src/domain/repositories.ts`, concrete repos in `src/data/repositories`.
- Change paywall behavior: `src/design-system/scenes/PaywallSheet.tsx`, `src/stores/premiumStore.ts`, `src/data/repositories/PremiumRepository.ts`.
- Change widget behavior: `src/features/widget/*`, `app/_layout.tsx`, `app/widget.tsx`.
- Change reminder behavior: `src/features/notifications/*`, `src/core/notifications/NotificationService.ts`.
