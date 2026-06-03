# Deep Ocean

> A premium underwater exploration experience that secretly helps you focus deeply and feel emotionally calm.

Built with React Native + Expo + TypeScript. The longer you focus, the deeper you dive — each ocean zone has its own light, creatures, sounds, and discoveries.

---

## Getting started

```bash
cd ~/DeepOcean
npm install
npx expo start
```

Press `i` for iOS, `a` for Android, `w` for web (web has limited Skia features).

> **Native modules (MMKV, Skia, Reanimated):** require a development build, not Expo Go. Run `npx expo prebuild` then `npx expo run:ios` / `run:android`.

---

## Architecture

Clean Architecture, feature-first.

```
app/                          # expo-router screens (routing layer ONLY — no business logic)
  _layout.tsx                 # Providers, Stack root
  index.tsx                   # Onboarding gate
  onboarding.tsx              # Cinematic 4-chapter intro
  dive.tsx                    # Immersive fullscreen dive
  (tabs)/                     # Tab navigator: home, collection, stats, ai, profile
src/
  design-system/              # Tokens, theme, atoms, scenes — single source of UI truth
    tokens.ts                 # Raw values
    theme.ts                  # Semantic wrapper (consume this, never tokens directly)
    atoms/                    # GlassCard, GlowText, PressableCard, ZoneBackground, DiveProgressRing, DepthIndicator
    scenes/                   # Skia composites (UnderwaterCanvas)
  core/                       # Infrastructure (audio, haptics, storage, motion, query, network)
    audio/AmbientAudioManager.ts   # Adaptive layered audio engine
    haptics/                  # Semantic haptic vocabulary (diveStart, discovery, zoneChange…)
    motion/presets.ts         # Cinematic Reanimated presets
    storage/mmkv.ts           # Typed MMKV wrapper
    query/client.ts           # React Query client tuned for offline-first
  domain/                     # Pure types & interfaces — no React, no I/O
    entities.ts
    repositories.ts
  data/                       # Concrete implementations (MMKV-backed + mock gateways)
    container.ts              # Composition root — wire interfaces ↔ implementations here
    repositories/
    gateways/
  features/                   # Feature modules (domain logic + hooks)
    ocean/                    # The progression engine
      zones.ts                # Zone table, depth math (pure)
      bestiary.ts             # Creatures + artifacts catalog
      discoveryEngine.ts      # Deterministic LCG-seeded discovery rolls
    diver/hooks.ts            # React Query bindings
  stores/                     # Zustand stores
    diveSessionStore.ts       # Live dive engine (tick, audio + haptics + discoveries)
    settingsStore.ts          # MMKV-persisted user settings
```

### Layer rules
- `app/` may import from `src/*` but not vice versa.
- `domain/` knows about nothing else.
- `data/` may depend on `domain/` and `core/` but not on `features/` or `app/`.
- Screens consume `features/*/hooks` or `stores/*` — never repositories directly.

### Design tokens
Tweak `src/design-system/tokens.ts` (palette, motion, typography) to retune the entire app's look and feel.

---

## The ocean progression engine

`src/features/ocean/zones.ts` is the spine of the experience:
- 5 zones: Surface → Twilight → Midnight → Abyss → Hadal Trench
- `minutesToDepth(minutes)` — pure curve mapping focus time to meters
- `depthToZone(depth)` — zone lookup

Every subsystem (audio, haptics, visuals, discoveries) keys off `OceanZone`. Adding a sixth zone is a single-table edit.

The discovery engine (`discoveryEngine.ts`) uses a seeded LCG so a dive is reproducible — useful for analytics and replay.

---

## Audio

`AmbientAudioManager` is a singleton outside React lifecycle. It manages crossfading layered tracks per zone. The scaffold ships with `null` source bindings so it runs *without* binary audio assets; drop MP3s into `assets/audio/{surface,twilight,midnight,abyss,trench}.mp3` and update `ZONE_SOURCES` to enable real playback.

---

## Haptics

Semantic — components call `hapticDiveStart()`, never `Haptics.impactAsync(...)` directly. Retune globally in `src/core/haptics/index.ts`.

---

## Performance notes

- **Skia particles** (`UnderwaterCanvas`) run entirely on the UI thread via `useDerivedValue`. Default 28 particles tested on mid-tier Android.
- **FlashList** in collection screen; estimated item size set.
- **Zustand selectors** keep re-renders surgical. Subscribe to slices, not whole state.
- Reanimated `breathe()` in `motion/presets.ts` uses a single shared value — avoid per-instance loops.

---

## What's intentionally NOT included

To keep the scaffold focused and runnable:
- Binary assets (audio, Lottie JSON, splash image) — drop your own in.
- Hosted AI keys — `AICompanionRepository` calls OpenAI/Anthropic when `EXPO_PUBLIC_*` keys are present, and falls back to a deterministic offline companion otherwise.
- Victory Native chart instance — `app/(tabs)/stats.tsx` hand-rolls the weekly heatmap; install Victory and swap when you need richer charts.
- E2E and unit tests — add Jest + Detox when ready.

---

## Conventions

- TypeScript strict + `noUncheckedIndexedAccess`.
- No business logic in `app/`. Screens orchestrate; logic lives in `features/` or stores.
- Never hardcode color/spacing — always import from `theme`.
- Never call MMKV / Audio APIs from a component — go through stores or hooks.
- Wrap async UI calls (audio, haptics) in fire-and-forget; never block render.
