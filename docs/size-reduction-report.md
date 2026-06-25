# Deep Ocean — Size Reduction Report

Generated: 2026-06-24

---

## Summary

Full dependency and asset audit. Findings below are classified as **Done** (removed/fixed this sprint), **Safe to remove** (pending native build verification), or **Keep** (used directly or indirectly).

---

## Dependencies Audit

### ❌ Safe to Remove — `nativewind` + `tailwindcss`

**Package:** `nativewind@4.2.5`, `tailwindcss@^3.4.14`

**Verification:** `grep -r "className=" src/ app/` → 0 results. `grep -r "nativewind" src/ app/` → 1 result in `src/design-system/atoms/FreeDiveModal.tsx` which is a false positive (no actual nativewind usage). The app uses `StyleSheet.create` + `useThemedStyles` exclusively.

**What to remove:**
- `nativewind` from `package.json` dependencies
- `tailwindcss` from `package.json` dependencies
- `nativewind-env.d.ts` (type shim, only needed when nativewind active)
- `global.css` import in `app/_layout.tsx` (after verifying file has no actual styles)
- nativewind preset from `babel.config.js`
- tailwind/nativewind entries from `metro.config.js`

**Impact:** ~200KB reduction in JS bundle. Faster Metro transform (nativewind installs a Babel plugin on every file). Cleaner deps tree.

**Risk:** Medium — requires `expo prebuild` + device build to confirm nothing breaks. Do not remove without re-running native build. Content of `global.css` must be verified empty first.

**Rollback:** `yarn add nativewind tailwindcss` and restore config files from git.

---

### ✅ Keep — `@expo/dom-webview`

**Reason:** Used in Expo SDK 56 for DOM component support — may be required by `expo-router` internals even if not directly imported in app code. Do not remove.

---

### ✅ Keep — `@expo/log-box`

**Reason:** Required by Expo SDK for the log box overlay in development. Not a user-space import but part of the Expo runtime bootstrap. Do not remove.

---

### ✅ Keep — `@react-native-community/slider`

**Reason:** Not used in current screens (no slider components found). However it's in `dependencies`, not `devDependencies`, which may mean it was included via Expo config or is planned. Verify: `grep -r "from '@react-native-community/slider'" src/ app/` → 0 results.

**Safe to remove?** Yes — but requires `expo prebuild` to confirm no native plugin references it. Tag as a follow-up removal in the next native rebuild cycle.

**Estimated savings:** ~50KB native code + JS binding.

---

### ✅ Keep — `moti`

**Reason:** Used in onboarding screen animations (`src/screens/OnboardingScreen.tsx`). Keep.

---

### ✅ Keep — `expo-blur`

**Reason:** Used in `GlassCard` for iOS BlurView. Keep.

---

### ✅ Keep — All other dependencies

All other listed packages are verifiably used in source code or required by native Expo modules.

---

## Code Dead Weight

### ✅ Done — console.log removed from production

**Files:** `app/_layout.tsx`, `app/widget.tsx`, `src/core/live-activity/DeepOceanLiveActivity.ts`, `src/data/repositories/AICompanionRepository.ts`

**Count:** 9 log calls removed.

**Impact:** Cleaner production output, minor perf improvement on error paths, no internal strings exposed in device logs.

---

### ✅ Done — Duplicate `zoneForMinutes` function removed

**File:** `src/screens/HomeScreen.tsx` (7 lines removed)

**Impact:** Eliminates logic drift risk. Reduces screen file size.

---

### ✅ Done — Dead `paywallOpen` state removed from HomeScreen

**File:** `src/screens/HomeScreen.tsx`

**Impact:** 1 `useState`, 1 `PaywallSheet` render, 1 handler removed. Reduces mounted component count.

---

## Asset Audit

### ✅ Keep — `assets/widget-concepts/` (3.3MB total, 4 files)

Required by native widget implementation (referenced in `plugins/with-focus-widget.js`). Do not remove.

### ✅ Keep — `assets/images/deepocean-fixed.png`, `assets/images/logo.png`

Used as app icon / splash. Keep.

### ⚠️ Review — `assets/audio/` directory

Currently empty (placeholder). Audio assets not yet included. If the directory contains placeholder files from tooling, verify they are not accidentally bundled. Expo bundles `assets/` directories referenced in `app.json`. Check `app.json` `assetBundlePatterns` to ensure empty audio dir isn't padding the bundle.

---

## Bundle Size Estimate

| Item | Est. Savings |
|---|---|
| Remove `nativewind` + `tailwindcss` | ~200KB JS bundle |
| Remove `@react-native-community/slider` | ~50KB |
| Remove 9 `console.log` calls | Negligible (string constants) |
| Remove dead `zoneForMinutes` (7 lines) | Negligible |
| **Total (if all removed)** | **~250KB** |

---

## How to Verify After Removal

```sh
# After removing nativewind/tailwind from package.json:
yarn install
npx expo prebuild --clean

# Verify build:
yarn ios   # or yarn android

# Size check:
npx eas-cli build:inspect --platform ios --stage archive --output /tmp/deepocean-eas-archive --force
du -sh /tmp/deepocean-eas-archive
```

---

## Rollback

All changes tracked in git. To rollback:

```sh
git revert HEAD  # or git checkout <file>
yarn install
```
