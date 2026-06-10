# DeepOcean Widget Work Summary

## Current Goal

Fix the iOS Home Screen widget so:

- The widget UI no longer looks broken on small/medium/large sizes.
- Widget taps open Deep Ocean directly and dispatch the intended action.
- Reinstalling with `yarn ios` keeps the widget target and URL wiring working.

## Main Findings

- The iOS app did not have the dedicated widget URL scheme in the generated native `Info.plist`, so widget URLs could fall into the Expo/dev-client chooser instead of opening Deep Ocean cleanly.
- The widget had too much content in `systemSmall` and `systemMedium`, causing cramped/broken UI.
- `OpenURLIntent` is not available in the current Xcode/AppIntents SDK used by this project, so widget action links must use `Link(destination:)`.
- Building the full app scheme can still fail due to unrelated app target module/bridging-header issues, but the standalone widget target builds successfully.

## Important Files Changed

- `ios/Widgets/DeepOceanFocusWidget.swift`
  - Reworked widget layout by size.
  - Uses compact small layout: brand, status, primary CTA.
  - Uses medium two-column layout: primary CTA plus AI/Stats and status ring.
  - Uses large layout: Resume/Pause/Skip, Ask AI/Progress, stats.
  - All widget URLs now use `deepocean-widget://widget?...`.
  - Includes `sessionRing`, compact typography, and icon-labelled secondary actions.

- `ios/DeepOcean/Info.plist`
  - Added `deepocean-widget` to `CFBundleURLSchemes`.
  - This is critical for widget taps to open the app directly in dev builds.

- `src/features/widget/urlAction.ts`
  - Parser now accepts both `deepocean:` and `deepocean-widget:`.
  - Parser accepts widget host/path forms including `widget` and `action`.

- `src/features/widget/urlAction.test.ts`
  - Added coverage for `deepocean-widget://widget?action=start_focus&minutes=25`.

- `plugins/with-focus-widget.js`
  - Added `withInfoPlist`.
  - Added `withFocusWidgetIosScheme()` so future prebuilds preserve `deepocean-widget`.

- `scripts/check-widget-native.js`
  - Added native check that `ios/DeepOcean/Info.plist` contains `deepocean-widget`.

## Verification Already Run

These passed:

```sh
node ./scripts/check-widget-native.js
yarn test src/features/widget/urlAction.test.ts --runInBand
xcodebuild -target DeepOceanWidgets -project ios/DeepOcean.xcodeproj -configuration Debug -sdk iphonesimulator build
```

The standalone widget target build succeeded.

## Current Git Status Notes

Tracked modified files shown by `git status --short`:

```text
M app.json
M plugins/with-focus-widget.js
M scripts/check-widget-native.js
M src/features/widget/urlAction.test.ts
M src/features/widget/urlAction.ts
```

Important native iOS files changed/observed but not shown by `git status` in this workspace:

```text
ios/DeepOcean/Info.plist
ios/Widgets/DeepOceanFocusWidget.swift
ios/Widgets/DeepOceanWidgetIntents.swift
ios/Widgets/DeepOceanWidgetBundle.swift
ios/DeepOcean.xcodeproj/project.pbxproj
```

Before committing or handing off, check whether `ios/` is ignored or generated in this repo. The current working files are needed for local simulator behavior.

## Next Session Checklist

1. Run `yarn ios` to install a fresh build on the simulator.
2. Remove and re-add the Deep Ocean widget on the Home Screen so iOS reloads the extension.
3. Tap widget actions and confirm no app chooser appears.
4. If chooser still appears, inspect the installed app Info.plist on simulator to confirm `deepocean-widget` is present in the built app.
5. If widget UI still looks cramped on the simulator screenshot, tune only `ios/Widgets/DeepOceanFocusWidget.swift` small/medium layout heights and font sizes.

## Useful Commands

```sh
node ./scripts/check-widget-native.js
yarn test src/features/widget/urlAction.test.ts --runInBand
xcodebuild -target DeepOceanWidgets -project ios/DeepOcean.xcodeproj -configuration Debug -sdk iphonesimulator build
```

