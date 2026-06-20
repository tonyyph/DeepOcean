# DeepOcean Widget System (Action-First)

This implementation introduces a full widget command pipeline in the app layer and native-ready snapshot data for iOS WidgetKit and Android AppWidget.

## Product Goal

Primary action must be instantly reachable from the widget.

For DeepOcean:
- Start focus session
- Resume current session
- Pause session
- Skip break (mapped to resume while break state is not modeled yet)
- Open AI companion
- View daily progress

## Current Delivered Architecture

Status:
- App-layer command pipeline: implemented
- Snapshot sync for widget state: implemented
- Android AppWidget provider with Small/Medium/Large layouts: implemented
- iOS WidgetKit source templates: implemented
- iOS WidgetKit extension target wiring in Xcode project: implemented by the patcher
- Native snapshot publishing bridge for App Group/SharedPreferences: implemented

Native tooling:

- `yarn patch:ios-widget-target` adds or repairs the Widget Extension target by
  patching pbxproj (experimental).
- `yarn check:widget-native` fail-fast checks generated native wiring.

### 1. Command URL Contract

Widget emits:
- deepocean://widget?action=start_focus&minutes=25
- deepocean-widget://widget?action=start_focus&minutes=25
- deepocean://widget?action=resume_current
- deepocean://widget?action=pause_session
- deepocean://widget?action=skip_break
- deepocean://widget?action=open_ai_companion
- deepocean://widget?action=view_daily_progress

Parser:
- src/features/widget/urlAction.ts
- src/features/widget/actionContract.ts

| Action | URL | Target | Params | Invalid-state fallback |
| --- | --- | --- | --- | --- |
| `start_focus` | `deepocean-widget://widget?action=start_focus&minutes=25` | `/dive` | optional `minutes` (clamped to 5–180) | preferred duration, then `/dive` |
| `resume_current` | `deepocean-widget://widget?action=resume_current` | `/dive` | none | Home when no paused/running session exists |
| `pause_session` | `deepocean-widget://widget?action=pause_session` | `/dive` | none | Home when no active/paused session exists |
| `skip_break` | `deepocean-widget://widget?action=skip_break` | `/dive` | none | Home; break state is not modeled yet |
| `open_ai_companion` | `deepocean-widget://widget?action=open_ai_companion` | `/(tabs)/ai` | none | Home |
| `view_daily_progress` | `deepocean-widget://widget?action=view_daily_progress` | `/(tabs)/stats` | none | Home |

The dedicated `deepocean-widget` scheme is injected into the generated iOS
Info.plist by `plugins/with-focus-widget.js`. It avoids dev-client URL chooser
behavior when a widget opens the app.

### 2. Command Dispatcher

Dispatcher executes commands against existing session store:
- src/features/widget/dispatch.ts

Routing actions:
- open_ai_companion -> /(tabs)/ai
- view_daily_progress -> /(tabs)/stats

Session actions:
- start_focus -> start(preferred or explicit minutes)
- resume_current -> resume()
- pause_session -> pause()
- skip_break -> resume() fallback when paused

### 3. App Bootstrap Integration

Expo Router sends widget and Live Activity URLs to `app/widget.tsx`. That route
is the only command execution entry point:

- stores only the newest pending external action while it is being handled
- waits for active-session hydration/reconciliation
- parses and dispatches the command
- suppresses repeated command execution inside a 1.5 second window
- clears the matching pending action immediately after handling
- delegates navigation to `externalActionNavigation.ts`

Widget, Live Activity, notification responses, and notification-center links
share the same navigation policy. It compares Expo Router's current public
pathname and normalized search params with the target. Exact matches are
skipped; same-route/different-param actions replace the route; other actions
preserve their source's push/replace behavior. A short-lived action-id registry
prevents concurrent listeners from navigating twice.

`app/_layout.tsx` initializes session lifecycle before hiding the splash screen
and discards malformed pending actions, records from an older app process, or
abandoned in-process records older than 30 seconds.
It reconciles timestamps, notifications, widget data, and Live Activity state
when `AppState` returns to `active`. Notification cold starts consume and clear
Expo's last response before routing it.

### 4. Active Session Lifecycle

`diveSessionStore` remains the single source of truth. A compact runtime
snapshot is persisted under `dive.active_session`; it is not a second engine.
It contains the active entity plus pause offsets, discovery roll cursor, and
notification identifiers needed to restore or clean up safely.

Cold-start rules:

- future-ending timed dive: restore, catch up from wall clock, restart one timer
- recent paused dive: restore paused state
- expired timed dive: clear local active state, widget, notifications, and Live Activity
- open-ended running dive after process death: clear because it has no trustworthy expected end
- paused snapshot older than 24 hours, malformed data, clock skew, or terminal status: clear

### 5. Widget Snapshot Sync

Snapshot persistence for native widget rendering:
- src/features/widget/snapshot.ts
- Storage key: app.widget.snapshot

Snapshot schema v3 contains:
- premium status and locale
- preferred duration and active session id/status/start/elapsed/target/expected end
- streak, today/weekly focus, and deterministic targets
- current/last zone and depth
- discovery and dive counts
- computed primary action and capture timestamp

React Native publishes the serialized snapshot to MMKV and a small native
bridge. The bridge writes to iOS App Group `UserDefaults` or Android
`SharedPreferences`, then requests a widget refresh. Native widgets render
without duplicating session or progression rules.

## Size-by-Size Widget UX Spec

## Small

Purpose: one-tap conversion to focus start/resume.

Layout:
- Main CTA (dominant)
- Tiny session context line
- Optional progress chip

ASCII:

```text
+----------------------+
|   [ Start Focus ]    |
|                      |
| Next: 25m      3/6   |
+----------------------+
```

Rules:
- Only 1 primary action
- Max 1-2 support info items
- Tap target >= 44pt iOS / 48dp Android

## Medium

Purpose: primary action + two secondary actions.

Layout:
- Left large CTA block
- Right stack: AI + Progress (or Skip Break when active)
- Bottom context strip

ASCII:

```text
+--------------------------------------+
| [ Start Focus Session ] | [ AI ]     |
|                         | [ Progress]|
|--------------------------------------|
| Today: 2h10m   Sessions: 4   Streak7 |
+--------------------------------------+
```

## Large

Purpose: command center for premium/power users.

Layout:
- Top: CTA + timer/progress summary
- Middle: quick-action grid
- Bottom: richer progress + personalized AI hint

ASCII:

```text
+--------------------------------------------------+
| [ Pause Session ]      18:42 left    Goal 62%    |
|--------------------------------------------------|
| [Resume] [Skip] [Ask AI] [Stats] [Ambient]       |
|--------------------------------------------------|
| Focus Ring 72%   Sessions:5   Streak:12          |
| Tip: Start a 12m cooldown break now              |
+--------------------------------------------------+
```

## Widget States (All Sizes)

- Default: Start focus as primary CTA
- Active: Resume/Pause based on session state
- Loading: CTA disabled + inline progress indicator
- Error: keep CTA visible with retry path
- Premium: richer visual polish + extra quick actions + deeper insight

## Visual Hierarchy

1. Primary action button
2. Timer or current session state
3. Secondary actions
4. Context metrics

Hide first when constrained:
- tertiary metrics
- descriptive labels that duplicate icon meaning

## Premium Differentiation

Premium users get immediately visible superiority:
- better visual treatment (gradient accents, progress ring animation)
- additional quick actions (ambient sound, smart 50m preset)
- richer context (focus quality, prediction)
- higher feedback fidelity (action confirmation animation)

## Platform Implementation Notes

## iOS WidgetKit

Recommended:
- AppIntents for direct actions
- Timeline reload with conservative frequency
- App Group storage to read app.widget.snapshot
- Optional Live Activities for active timer

Minimal app group payload should mirror WidgetSnapshot.

Tracked source-of-truth:

- `plugins/focus-widget/native/ios-widget/DeepOceanFocusWidget.swift`
- `plugins/with-focus-widget.js`
- `scripts/patch-ios-widget-target.rb`

Generated local output:

- `ios/Widgets/*`
- `ios/DeepOcean/DeepOcean.entitlements`
- `ios/DeepOcean.xcodeproj/project.pbxproj`

Run `yarn widget` after prebuild or native regeneration. It patches the Widget
Extension target and verifies expected markers, assets, URL scheme, and target
membership.

## Android AppWidget

Recommended:
- AppWidgetProvider + RemoteViews
- PendingIntent for action taps
- BroadcastReceiver/Activity handoff to deepocean://widget URLs
- Read snapshot from shared storage equivalent

Tracked source-of-truth:

- `plugins/focus-widget/native/android-widget/java/FocusWidgetProvider.kt`
- `plugins/focus-widget/native/android-widget/layout/`
- `plugins/focus-widget/native/android-widget/drawable/`
- `plugins/with-focus-widget.js`

The config plugin copies and registers these files during prebuild. Generated
files under `android/` are local build output, not the durable implementation.

## Widget Concepts And Binary Assets

The gallery exposes Ocean Portal, Diving Instrument, and Living Ocean. The
instrument concept is code-native. Only four raster concept assets are required:

- `assets/widget-concepts/ocean-portal-square.png`
- `assets/widget-concepts/ocean-portal-wide.png`
- `assets/widget-concepts/living-jellyfish-square.png`
- `assets/widget-concepts/living-whale-wide.png`

The config plugin copies these into each generated native project. Do not commit
duplicate small/medium/large exports unless they are actually referenced.
Compressed PNGs contribute almost their full byte size to the EAS archive and
again to Git pack history. Use this command to inspect the exact upload tree:

```sh
npx eas-cli build:inspect --platform ios --stage archive \
  --output /tmp/deepocean-eas-archive --force
```

## React Native Considerations

- Keep business logic in existing Zustand store (single source of truth)
- Widget action layer only translates intent -> store actions
- Keep parser/dispatcher deterministic and testable
- Avoid adding new session engine duplication in native

## Accessibility

- Dynamic type with priority-preserving truncation
- Screen reader labels include action + context
- High contrast tokens for CTA and text
- Large hit targets for all actionable elements
- Do not encode state only by color

## Edge Cases

- App receives malformed widget URL -> ignore safely
- Start pressed while already diving -> ignore as idempotent
- Resume pressed while not paused -> ignore safely
- Skip break before break model exists -> fallback/unsupported message
- Offline state -> local actions still allowed for session controls

## QA Checklist

1. Start session -> Widget and Live Activity show running state.
2. Widget main action in foreground/background/cold start opens `/dive`.
3. Live Activity main action in foreground/background/cold start opens `/dive`.
4. Cold-start expired/open-ended session clears local state, notifications,
   widget running state, and Live Activity.
5. Cold-start valid timed or recent paused session restores accurate progress.
6. Pause/resume updates Widget and Live Activity from the same store state.
7. Complete/cancel removes the active widget state and ends Live Activity.
8. Missing/invalid action params fall back safely without crashing.
9. Repeated taps inside 1.5 seconds execute the command only once.
10. Slow hydration queues action dispatch until session reconciliation finishes.
11. Notification response cold start opens its stored deep link once.
12. Same route and params skip navigation; changed params replace without
    stacking another copy.
13. Successful or invalid handling leaves no pending external action in MMKV.
14. Premium flag and preferred duration reflect in snapshot.
15. `yarn check:widget-native` passes after prebuild/plugin changes.
16. Generated iOS widgets render without redacted placeholders; bundled raster
   images must stay within WidgetKit-safe dimensions.

## Future Native Steps (For true no-app-open execution)

1. iOS: extend the generated Widget Extension with AppIntent actions bound to
   app group state.
2. Introduce native-side short command executor only for operations that can be safely done outside JS runtime.
3. Keep command schema compatible with current deep link contract.
