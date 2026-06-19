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

Root integration in app/_layout.tsx:
- Handles initial URL on cold start
- Subscribes to runtime URL events
- Dispatches widget commands
- Logs result for telemetry debugging

### 4. Widget Snapshot Sync

Snapshot persistence for native widget rendering:
- src/features/widget/snapshot.ts
- Storage key: app.widget.snapshot

Snapshot schema v2 contains:
- premium status and locale
- preferred duration and live session status/elapsed/target
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

1. Cold start from widget URL dispatches correct action.
2. Runtime URL dispatch works while app already open.
3. Snapshot updates on session state changes.
4. Premium flag reflects in snapshot.
5. Preferred session minutes reflect in snapshot.
6. Primary action mapping remains correct for idle/diving/paused.
7. `yarn check:widget-native` passes after prebuild/plugin changes.
8. Generated iOS widgets render without redacted placeholders; bundled raster
   images must stay within WidgetKit-safe dimensions.

## Future Native Steps (For true no-app-open execution)

1. iOS: extend the generated Widget Extension with AppIntent actions bound to
   app group state.
2. Introduce native-side short command executor only for operations that can be safely done outside JS runtime.
3. Keep command schema compatible with current deep link contract.
