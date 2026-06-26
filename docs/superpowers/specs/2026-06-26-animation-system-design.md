# Animation System Design — Deep Ocean
**Date:** 2026-06-26  
**Scope:** Full-app animation overhaul — AnimationKit + HomeScreen + DiveScreen + Modals + Micro-interactions  
**Goal:** Gamification + productivity app feel — stagger entrances, XP counters, confetti bursts, spring press, scroll parallax

---

## 1. Architecture — AnimationKit

New directory: `src/design-system/animations/`

```
animations/
  index.ts
  hooks/
    useStaggerEntrance.ts
    useCountUp.ts
    useFloatingLabel.ts
    useParticleBurst.ts
    useShimmer.ts
    usePulseGlow.ts
    useSpringPress.ts
    useScrollParallax.ts
  components/
    FloatingLabel.tsx
    ParticleBurst.tsx
    ShimmerOverlay.tsx
    CountUpText.tsx
```

### Hooks API

**`useStaggerEntrance(count, options?)`**
- Returns array of `Animated.SharedValue<number>` (one per item, 0→1)
- Delays: `baseDelay + index * staggerMs` (default staggerMs = 60)
- Animation: `withTiming(1, { duration: 380, easing: Easing.bezier(0.16,1,0.3,1) })`
- `reducedMotion`: all values jump to 1 instantly

**`useCountUp(target, options?)`**
- Returns `SharedValue<number>` animating from previous value → target
- Uses `withTiming` with `Easing.out(Easing.cubic)`, duration 600ms
- `reducedMotion`: jump to target instantly

**`useFloatingLabel()`**
- Returns `{ trigger(x, y, label) }` — spawns a `FloatingLabel` at screen coordinates
- Label flies up 48px, fades out over 900ms then unmounts
- Worklet-safe: uses `runOnJS` only for mount/unmount

**`useParticleBurst()`**
- Returns `{ trigger(x, y, color) }` — spawns `ParticleBurst` at screen coordinates
- 18 particles, Skia-based, 800ms duration, native thread
- `reducedMotion`: no-op

**`useShimmer()`**
- Returns `animatedStyle` with translateX sweeping 0 → containerWidth
- `withRepeat(withTiming(...), -1, false)`
- Cleanup: `cancelAnimation` on unmount

**`usePulseGlow(options?)`**
- Returns `animatedStyle` with `shadowOpacity` oscillating 0.2 → 0.7
- `withRepeat(withTiming(...), -1, true)` (reverse = true for breathing)
- `reducedMotion`: static value 0.35

**`useSpringPress()`**
- Returns `{ onPressIn, onPressOut, animatedStyle }`
- `onPressIn`: `withSpring(0.96, { damping: 18, stiffness: 300 })`
- `onPressOut`: `withSpring(1.0, { damping: 14, stiffness: 200 })`

**`useScrollParallax(scrollY, factor?)`**
- Returns `animatedStyle` with `translateY: scrollY * factor` (default factor = 0.35)
- Pure `useDerivedValue` — no side effects

### Components API

**`<FloatingLabel label="+150 XP" x={cx} y={cy} onDone={unmount} />`**
- Absolutely positioned, pointer-events none
- Renders via portal into root layout (avoids clipping)

**`<ParticleBurst x={cx} y={cy} color="#FFD27A" onDone={unmount} />`**
- Skia Canvas absolutely positioned, 120×120 around origin point
- 18 circles exploding outward with varied speed + opacity

**`<ShimmerOverlay width={w} height={h} />`**
- LinearGradient mask sweeping left → right
- Wraps existing skeleton atoms

**`<CountUpText value={n} style={textStyle} format={(n) => String(n)} />`**
- Renders animated number, interpolates display value each frame
- `format` prop for custom display (e.g. `"Lv. 12"`, `"🔥 7"`)

---

## 2. HomeScreen Changes

**File:** `src/screens/HomeScreen.tsx` + `HomeScreen.components.tsx`

### Staggered Card Entrance
- Hook: `useStaggerEntrance(cardCount)`
- Each card wrapped in `<Animated.View style={staggerStyles[i]}>`
- Style: `opacity: progress, translateY: (1 - progress) * 20`
- Trigger: on screen mount (not on re-render)

### Streak Flame
- `usePulseGlow` on flame icon in `StreakMilestoneCard`
- When streak count changes: `withSpring(1.25)` then `withSpring(1.0)` on icon scale

### XP Counter
- `CountUpText` replaces static XP text in profile/header area
- Animates when XP value changes in store

### Card Shimmer
- `ShimmerOverlay` applied inside `LastDiveSkeleton` and `DailyCompanionSkeleton`
- Replaces flat `Skeleton` background with animated shimmer gradient

### CTA Glow (Start Dive button)
- `usePulseGlow` on primary `ActionButton` with `icon="water"`
- Shadow color from `t.colors.accent`, opacity 0.2 → 0.55

### Scroll Parallax
- `useScrollParallax(scrollY, 0.35)` on zone background header image/gradient
- Attach `onScroll` to main `ScrollView` with `useAnimatedScrollHandler`

---

## 3. DiveScreen Changes

**File:** `src/screens/DiveScreen.tsx`

### Depth Pulse on Zone Cross
- When zone changes: trigger `withSequence(withTiming(1, 80ms), withTiming(0, 600ms))` on overlay opacity
- Overlay color = zone accent from `Colors.zoneAccent[zone]`
- New atom: `ZoneTransitionFlash` — `<Animated.View pointerEvents="none" absoluteFill />`

### DiveProgressRing Enhancement
- Ring shadow pulse scales with `p.value` (already partial) — amplify range: 0.2 → 1.0 instead of current 0.45 → 0.95
- When ring completes (p reaches 1.0): trigger `ParticleBurst` at ring center

### Timer Digit
- Wrap elapsed time display in `CountUpText` with mono font — subtle spring on each second tick

---

## 4. Modal Reward Changes

### LevelUpModal (`src/design-system/atoms/LevelUpModal.tsx`)
- **Confetti burst:** `ParticleBurst` triggered at level circle center on appear, color = `t.colors.premium`
- **Level number:** `CountUpText` counting prevLevel → newLevel
- **XP floating label:** `FloatingLabel "+XP"` flies up from modal center on appear

### MysteryChestModal (`src/design-system/atoms/MysteryChestModal.tsx`)
- **3-step sequence on tap:**
  1. Chest icon shake: `withSequence(withTiming(-8°), withTiming(8°), withTiming(-5°), withTiming(0°))` on rotation
  2. Chest expand: `withSpring(1.3)` then `withSpring(1.0)` on scale
  3. Reward reveal: fade in reward content with `withTiming(1, 300ms)`
- **Particle burst** at chest center during step 2, color = `CHEST_GLOW[rarity]`

### AchievementModal (`src/design-system/atoms/AchievementModal.tsx`)
- **Icon bounce** on appear: `withSpring(1.15)` → `withSpring(1.0)` on `iconWrap` scale
- **Glow ring expand:** `borderWidth` animated 0 → 1 + `shadowRadius` 0 → 16 with `withTiming`

### TitleAchievementModal
- Same icon bounce + `FloatingLabel` with achievement name

---

## 5. Navigation & Micro-interactions

### Tab Bar (`src/design-system/scenes/ProTabBar.tsx`)
- Active tab icon: `useSpringPress`-style bounce on tab switch (scale 1.0 → 1.25 → 1.0)

### PressableCard (`src/design-system/atoms/PressableCard.tsx`)
- Add `useSpringPress` — replaces current static press style
- Scale 1.0 → 0.96 on press, spring back on release

### ActionButton (wherever it exists)
- `useSpringPress` on all variants

### NotificationToast (`src/features/notifications/NotificationToastHost.tsx`)
- Add spring to `FadeInDown`: `FadeInDown.springify().damping(18).stiffness(180)`
- `FadeOutUp.duration(200)` — quick dismiss

---

## 6. Performance & Safety

- All animation values on UI thread (Reanimated shared values + worklets only)
- No JS-driven loops anywhere
- `reducedMotion` from `useSettings` gates all repeat animations
- `cancelAnimation` in every `useEffect` cleanup for repeat loops
- `FloatingLabel` and `ParticleBurst` self-unmount via `onDone` callback after animation
- No blur animations on Android
- No `LayoutAnimationConfig` (conflicts with React Navigation)

---

## 7. Implementation Phases

| Phase | Scope | Files |
|-------|-------|-------|
| 1 | AnimationKit primitives | `src/design-system/animations/**` |
| 2 | HomeScreen entrance + shimmer + XP + streak | `HomeScreen.tsx`, `HomeScreen.components.tsx` |
| 3 | HomeScreen scroll parallax + CTA glow | `HomeScreen.tsx` |
| 4 | DiveScreen zone flash + ring pulse | `DiveScreen.tsx`, new `ZoneTransitionFlash.tsx` |
| 5 | Modal rewards (confetti, chest sequence, glow) | `LevelUpModal`, `MysteryChestModal`, `AchievementModal`, `TitleAchievementModal` |
| 6 | Micro-interactions (tab bar, press states, toast) | `ProTabBar`, `PressableCard`, `ActionButton`, `NotificationToastHost` |
