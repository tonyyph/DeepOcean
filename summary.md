# Deep Ocean Agent Handoff

Last refreshed: 2026-06-19

## Current State

The repository is an Expo/React Native focus app with a generated native widget
system. The durable widget implementation lives in `plugins/` and `assets/`;
`ios/` and `android/` are ignored generated projects.

Recent work stabilized three areas:

1. Dive abort/surface lifecycle.
2. Dive completion audio ownership.
3. Multi-concept native widgets and their project archive footprint.

## Recent Fixes

### Dive abort no longer starts another session

Root cause: `DiveScreen` watched `session` and called `start()` whenever it
became `null` or terminal. `cancel()` correctly cleared the timer and session,
but that effect immediately created a replacement dive.

Current design:

- `HomeScreen` starts a normal session before navigating to `/dive`.
- Direct navigation fallback is isolated in
  `src/screens/diveLaunchPolicy.ts`.
- The fallback is evaluated once per `DiveScreen` mount.
- Abort (`session: null`) and surface (`status: surfaced`) cannot trigger a
  restart.

Regression coverage:

```sh
yarn test src/screens/diveLaunchPolicy.test.ts --runInBand
```

### Dive audio is screen-owned and idempotent

Relevant files:

- `src/features/audio/useDiveAudio.ts`
- `src/features/audio/diveAudioPolicy.ts`
- `src/features/audio/diveAudioPolicy.test.ts`
- `src/screens/DiveScreen.tsx`

Natural completion sound is distinguished from manual surface/abort, and
completion presentation waits for the owned completion sequence when required.
Avoid adding a second completion player in the store or notification layer.

### Widget concepts are generated from tracked plugin sources

Widget source-of-truth:

- `plugins/focus-widget/native/ios-widget/DeepOceanFocusWidget.swift`
- `plugins/focus-widget/native/android-widget/`
- `plugins/with-focus-widget.js`
- `scripts/patch-ios-widget-target.rb`
- `scripts/check-widget-native.js`

Shared app pipeline:

- `src/features/widget/urlAction.ts`
- `src/features/widget/dispatch.ts`
- `src/features/widget/snapshot.ts`
- `src/features/widget/policy.ts`

The widget gallery includes Ocean Portal, Diving Instrument, and Living Ocean.
The dedicated `deepocean-widget://` URL scheme is supported in addition to
`deepocean://`.

Required raster assets:

- `assets/widget-concepts/ocean-portal-square.png`
- `assets/widget-concepts/ocean-portal-wide.png`
- `assets/widget-concepts/living-jellyfish-square.png`
- `assets/widget-concepts/living-whale-wide.png`

Nine unused exported widget size variants were removed in commit `5b9ec62`.
Do not restore them unless code references them.

## Project Archive Size Lesson

The EAS “Compressed project files” size rose because several already-compressed
PNG widget assets were added. PNGs gain little from another compression pass,
and EAS archive inspection includes a Git pack, so recent binary history can
make the upload larger than the current working files alone suggest.

Useful checks:

```sh
du -sh assets/*
git ls-files -z | xargs -0 du -ch | tail -n 1
npx eas-cli build:inspect --platform ios --stage archive \
  --output /tmp/deepocean-eas-archive --force
```

Keep only canonical widget assets in Git. Generated copies in `ios/` and
`android/` should remain ignored.

## Verification Baseline

Run proportionally to the change:

```sh
yarn lint
yarn test
yarn check:widget-native
yarn check:audio-assets
```

For native widget changes, also prebuild/regenerate and inspect the actual
widget in a development build. Expo Go cannot validate this project.

## Handoff Rules

- Read `AGENTS.md` first and `webapp/AGENTS.md` before web changes.
- Preserve user changes; inspect `git status` before editing.
- Never copy `.env.local` values into docs, logs, or handoff notes.
- Update this file when a substantial fix changes architecture, known risks,
  verification status, or the next agent’s likely starting point.
