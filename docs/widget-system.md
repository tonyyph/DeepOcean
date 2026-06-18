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
- iOS WidgetKit scaffold files: implemented
- iOS WidgetKit extension target wiring in Xcode project: implemented by the patcher
- Native snapshot publishing bridge for App Group/SharedPreferences: implemented

Phase 3 (CLI-only):
- `yarn patch:ios-widget-target` adds a Widget Extension target by patching pbxproj (experimental).
- `yarn check:widget-native` now fail-fast checks for widget target markers in pbxproj.

### 1. Command URL Contract

Widget emits:
- deepocean://widget?action=start_focus&minutes=25
- deepocean://widget?action=resume_current
- deepocean://widget?action=pause_session
- deepocean://widget?action=skip_break
- deepocean://widget?action=open_ai_companion
- deepocean://widget?action=view_daily_progress

Parser:
- src/features/widget/urlAction.ts

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

Scaffold added in repo:
- ios/Widgets/DeepOceanFocusWidget.swift
- ios/Widgets/DeepOceanWidgetIntents.swift
- ios/DeepOcean/DeepOcean.entitlements app-group entry

Important:
- The widget extension target is not auto-wired by these files alone.
- Add a real Widget Extension target in Xcode, include the scaffold files, and attach the same app group.

CLI-only alternative (experimental):
- Run `yarn patch:ios-widget-target` to inject the extension target and embed phase into `project.pbxproj`.
- Then run `yarn check:widget-native` to verify target markers.

## Android AppWidget

Recommended:
- AppWidgetProvider + RemoteViews
- PendingIntent for action taps
- BroadcastReceiver/Activity handoff to deepocean://widget URLs
- Read snapshot from shared storage equivalent

Implemented in this repo:
- android/app/src/main/java/com/cuongphan2/OtherSide/widget/FocusWidgetProvider.kt
- android/app/src/main/res/layout/widget_focus_small.xml
- android/app/src/main/res/layout/widget_focus_medium.xml
- android/app/src/main/res/layout/widget_focus_large.xml
- android/app/src/main/res/xml/focus_widget_info.xml
- android/app/src/main/AndroidManifest.xml receiver registration

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

## Next Native Steps (Required for true on-widget no-app-open execution)

1. iOS: add Widget Extension target + AppIntent actions bound to app group state.
2. Introduce native-side short command executor only for operations that can be safely done outside JS runtime.
3. Keep command schema compatible with current deep link contract.
