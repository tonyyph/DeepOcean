# Deep Ocean — App Audit & Optimization Plan

Generated: 2026-06-24

---

## Summary

This document captures every issue found in the full-codebase audit along with fix strategy, risk level, and test checklist. Issues are sorted by priority: P1 (critical / ship-blocker), P2 (high impact / fix this sprint), P3 (improvement / schedule next sprint).

---

## P1 — Critical

### 1. `console.log` in production code

**Files:** `app/_layout.tsx` (L77, L110), `app/widget.tsx` (L39), `src/core/live-activity/DeepOceanLiveActivity.ts` (L65, L88, L108, L117), `src/data/repositories/AICompanionRepository.ts` (L165, L171)

**Cause:** Debug logging left in place after development. All log sites are inside try/catch or error-handling branches — they were meant for local debugging.

**Impact:** Leaks internal error details and class names to the console in production builds. Minor performance overhead on every native bridge call.

**Fix:** Remove all `console.log` calls. Swallow errors silently in catch blocks that are already soft-failure by design.

**Risk:** Low — all sites are error/fallback paths. The app already continues on failure.

**Fix now:** ✅ Yes

**Test checklist:**
- [ ] LiveActivity start/update/end still works silently when bridged module absent
- [ ] AI companion still falls back to offline mode when provider fails
- [ ] Widget command dispatch still routes correctly
- [ ] `yarn lint` passes

---

### 2. Duplicate `zoneForMinutes` in HomeScreen

**File:** `src/screens/HomeScreen.tsx` (L362–368)

**Cause:** A private `zoneForMinutes()` helper was written locally, but `minutesToZone()` already exists in `src/features/ocean/zones.ts` and is exported.

**Impact:** Logic drift risk — if zone thresholds change in `zones.ts`, the HomeScreen helper silently diverges. Also bloats the screen file.

**Fix:** Delete the local function and import `minutesToZone` from `@/features/ocean/zones`.

**Risk:** None — `minutesToZone()` is identical logic.

**Fix now:** ✅ Yes

**Test checklist:**
- [ ] Hero CTA zone label shows correct zone for preferred minutes
- [ ] FreeDiveModal zone label updates correctly as minutes change
- [ ] `yarn lint` passes (no unused import)

---

## P2 — High Impact

### 3. FlashList missing `estimatedItemSize` in CollectionScreen

**File:** `src/screens/CollectionScreen.tsx`

**Cause:** `@shopify/flash-list` requires `estimatedItemSize` for optimal layout. Without it the list pre-layout is wrong and causes a layout shift warning, and initial render performance degrades.

**Impact:** Jank on Collection screen first render. FlashList shows a warning in dev.

**Fix:** Add `estimatedItemSize={96}` (measured row height including glass card padding + separator).

**Risk:** None.

**Fix now:** ✅ Yes

**Test checklist:**
- [ ] Collection list renders without FlashList layout warning
- [ ] Scroll is smooth on first open with 50+ entries

---

### 4. ProfileScreen reads entire Zustand settings object

**File:** `src/screens/ProfileScreen.tsx` (L29: `const settings = useSettings()`)

**Cause:** `useSettings()` without a selector subscribes to the entire store. Any setting change (volume, haptics, language, etc.) re-renders the entire ProfileScreen tree.

**Impact:** Unnecessary full-screen re-renders when any setting changes while Profile is mounted.

**Fix:** Read only the fields actually used via slice selectors. Actions (`update`, `reset`) can be extracted separately with `useSettings.getState()` or passed as stable callbacks.

**Risk:** Low — purely a subscription optimization.

**Fix now:** ✅ Yes

**Test checklist:**
- [ ] All setting controls still function (haptics, volume, discovery alerts, preferred length, reduced motion, language, reminders)
- [ ] Changing one setting does not cause visible re-render of unrelated profile sections
- [ ] `yarn lint` passes

---

### 5. StatsScreen hardcoded "meters" unit string

**File:** `src/screens/StatsScreen.tsx` (L~68)

**Cause:** `${Math.round(s.depthMeters)} meters` is hardcoded English inside JSX. No i18n key exists for the depth unit label.

**Impact:** Depth label stays English when user switches to Vietnamese.

**Fix:** Use abbreviated `m` (universally understood metric abbreviation, same in both languages) OR add `tr.stats.metersUnit` i18n key.

**Risk:** None — using `m` is the safest and most space-efficient approach.

**Fix now:** ✅ Yes (use `m` abbreviation which is language-neutral)

**Test checklist:**
- [ ] Session row shows depth as "123 m" not "123 meters"
- [ ] Works in both EN and VI language modes

---

### 6. PressableCard calls `expo-haptics` directly instead of semantic vocabulary

**File:** `src/design-system/atoms/PressableCard.tsx` (L5: `import * as Haptics from "expo-haptics"`)

**Cause:** At some point the haptic call was written directly here, bypassing the `src/core/haptics/index.ts` semantic vocabulary that allows global retuning.

**Impact:** Haptic intensity for press interactions can't be globally adjusted from `core/haptics`. Doesn't honor the same tuning as dive-start/zone-change haptics.

**Fix:** Replace with `hapticLight()` / `hapticMedium()` / `hapticHeavy()` from `@/core/haptics` (which wraps the same expo-haptics calls with the correct impact styles already mapped).

**Risk:** Low — functionally identical. Enables global haptic retuning later.

**Fix now:** ✅ Yes

**Test checklist:**
- [ ] PressableCard still vibrates on press (light/medium/heavy as configured)
- [ ] `yarn lint` passes (no unused `expo-haptics` import remains)

---

### 7. DiveScreen: multiple overlapping `useEffect`s for navigation after reward queue

**File:** `src/screens/DiveScreen.tsx` (L~130–200)

**Cause:** Three separate `useEffect` hooks all watch `rewardQueue.length` + `completionSoundFinished` + `naturalCompletion` to decide when to navigate. Logic is split across refs (`navigateAfterQueueRef`, `rewardQueuePresentedRef`, `queueBuiltRef`). Adding another reward type risks introducing a navigation race.

**Impact:** Hard to maintain. A future change (e.g., adding the mystery chest reward) must correctly update all three effects and refs.

**Fix:** Consolidate into a single `useEffect` that derives navigation intent from one truth table. Extract to a `useDiveNavigation()` hook for testability.

**Risk:** Medium — this is working logic. Fix needed before adding new reward types.

**Fix now:** Deferred — the current implementation is correct and stable. Fix when adding new reward types (Phase 2 prep).

---

### 8. GlassCard renders 4 LinearGradients per instance

**File:** `src/design-system/atoms/GlassCard.tsx`

**Cause:** The glass effect stacks 4 `LinearGradient` layers + 2 highlight Views + 1 border View to achieve the glassmorphism look.

**Impact:** On screens with many cards (Collection = 40+ rows, Profile = 6 cards), GPU compositing load is measurable. Can cause frame drops on mid-tier Android with BlurView.

**Fix:** Reduce to 2 LinearGradients (body fill + specular streak), remove the `absorption` gradient, and keep the border View. On Android, skip BlurView entirely (already handled) and consolidate.

**Risk:** Medium — any visual change to the core card surface is high-visibility. Requires thorough visual QA across all screens and themes.

**Fix now:** Deferred — document for theme/design sprint.

---

### 9. HomeScreen has a mounted but never-opened PaywallSheet

**File:** `src/screens/HomeScreen.tsx` (L~46: `const [paywallOpen, setPaywallOpen] = useState(false)`)

**Cause:** `paywallOpen` state and the `PaywallSheet` component at the bottom are present but `setPaywallOpen(true)` is never called in the current HomeScreen code.

**Impact:** Dead state + a mounted but invisible sheet component. Minor memory overhead.

**Fix:** Remove the `paywallOpen` state and the `PaywallSheet` render from HomeScreen until an entry point exists (e.g., a paywall CTA on the zone progress strip).

**Risk:** Low — it's currently invisible. Removing can't break anything visible.

**Fix now:** ✅ Yes (simple cleanup)

---

## P3 — Improvements

### 10. `nativewind` dependency unused in source code

**Package:** `nativewind@4.2.5` in `dependencies`; also `nativewind-env.d.ts` and `global.css`

**Cause:** nativewind was added to the project but the codebase uses `StyleSheet.create` + `useThemedStyles` exclusively. Zero `className=` props exist in any `.tsx` file.

**Impact:** Adds ~200KB to bundle, requires Babel transform on every file, slows Metro bundling.

**Fix:** Remove from `package.json`, delete `nativewind-env.d.ts`, remove from `babel.config.js` and `metro.config.js`. Keep `global.css` only if it contains non-nativewind styles (check first).

**Risk:** Medium — nativewind hooks into Babel and Metro configs. Removal requires `yarn install` + `expo prebuild` to verify clean build. Do after verifying `global.css` is empty of real styles.

**Fix now:** Deferred — needs native build verification before removing.

---

### 11. StatsScreen session list not virtualized

**File:** `src/screens/StatsScreen.tsx`

**Cause:** Sessions are rendered with `sessions.map()` inside a ScrollView, not a FlashList. For heavy users (200+ sessions), this renders all rows at once.

**Impact:** Long sessions list causes slow initial render and high memory use.

**Fix:** Move the session list to a `FlashList` with `estimatedItemSize={44}`.

**Risk:** Low — FlashList is already in the project (used in CollectionScreen).

**Fix now:** Deferred — impact is only felt by power users with 50+ sessions. Prioritize after gamification features.

---

### 12. `GlowText` starts animation before mount is settled

**File:** `src/design-system/atoms/GlowText.tsx`

**Cause:** The `withRepeat` breath animation starts immediately on mount in `useEffect`. On screens that animate in (fade/slide transitions), this means the breath animation begins while the screen is still appearing, which can cause a visual stutter on lower-end devices.

**Fix:** Delay the animation start by one frame using `requestAnimationFrame`.

**Risk:** Very low.

**Fix now:** Deferred — minor visual polish item.

---

### 13. HomeScreen fallback session read pattern with `setTimeout(0)`

**File:** `src/screens/HomeScreen.tsx` (L~78)

**Cause:** `setTimeout(() => setFallbackLastSession(liveLastSession), 0)` is used to defer a state update. This is a code smell that usually indicates a derived state that should not be in state at all, or an effect with incorrect dependencies.

**Impact:** Can cause an extra render cycle. If the effect fires multiple times quickly, the timeout might fire after unmount.

**Fix:** The cancel handle (`clearTimeout`) is present, so it's safe. But the pattern should be cleaned up: `resolveLastDiveSession` should be the sole logic and `fallbackLastSession` state removed in favor of a ref that doesn't cause re-renders.

**Risk:** Medium — this resolver logic has its own tests. Refactor carefully.

**Fix now:** Deferred.

---

## Performance: No Issues Found

- Zustand stores: all use correct slice selectors in most locations (ProfileScreen exception fixed above)
- FlashList in CollectionScreen: `keyExtractor`, `getItemType`, `renderItem` are all memoized ✅
- `UnderwaterCanvas` (Skia): runs on UI thread via `useDerivedValue` ✅
- `DiveProgressRing`: uses Reanimated `useAnimatedProps` for SVG stroke ✅
- `useDiveSession` tick: 1-second interval, no render-blocking logic ✅
- React.memo: `CollectionRow`, `GlassCard`, `PressableCard`, `ActionButton`, `GlowText`, `DiveProgressRing` all wrapped ✅
- Audio/haptics: fire-and-forget throughout ✅

---

## Test Checklist (After All P1/P2 Fixes)

```
yarn lint          # TypeScript + ESLint
yarn test          # Jest unit suite (49 tests in 10 suites)
```

Manual:
- [ ] Full dive session: start → zone change → pause → resume → surface → reward queue
- [ ] Abort dive: confirm modal appears, cancel returns to tabs, no new session starts
- [ ] Collection screen: list loads, filter works, story sheet opens, paywall opens for non-premium
- [ ] Profile: all settings save and persist across app restart
- [ ] Stats: session list renders, weekly heatmap correct
- [ ] AI companion: recommendation loads, Ask Again works, mood selection persists
- [ ] Notifications: reminder toggle + time picker saves correctly
- [ ] Theme switch: all screens reflect new theme without restart
- [ ] Deep link / widget: `deepocean://widget?action=start_focus` opens dive
