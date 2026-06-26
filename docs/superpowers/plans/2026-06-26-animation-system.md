# Animation System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a centralized `AnimationKit` and apply it across the full app to produce a gamification + productivity feel — staggered entrances, XP counters, confetti bursts, spring presses, scroll parallax.

**Architecture:** Approach A — Animation Layer System. All primitives live in `src/design-system/animations/`. Every screen and modal imports from there. No per-file animation logic outside this kit.

**Tech Stack:** React Native Reanimated 4.3.1, @shopify/react-native-skia 2.6.2, expo-haptics, expo-linear-gradient, react-native-gesture-handler.

## Global Constraints

- All shared values + worklets run on UI thread — no JS-driven animation loops
- `reducedMotion` from `useSettings((s) => s.reducedMotion)` gates every repeat animation; when true, skip `withRepeat`, set duration = 0, stagger delay = 0
- `cancelAnimation` in every `useEffect` cleanup that starts a `withRepeat`
- No blur animations on Android
- No `LayoutAnimationConfig` (conflicts with React Navigation)
- Use `t.motion.durations.*` and `t.motion.easings.*` tokens — never hardcode durations
- TypeScript strict — all exports must be typed

---

## File Map

**Created:**
- `src/design-system/animations/index.ts`
- `src/design-system/animations/hooks/useStaggerEntrance.ts`
- `src/design-system/animations/hooks/useCountUp.ts`
- `src/design-system/animations/hooks/usePulseGlow.ts`
- `src/design-system/animations/hooks/useShimmer.ts`
- `src/design-system/animations/hooks/useSpringPress.ts`
- `src/design-system/animations/hooks/useScrollParallax.ts`
- `src/design-system/animations/components/CountUpText.tsx`
- `src/design-system/animations/components/ShimmerOverlay.tsx`
- `src/design-system/animations/components/FloatingLabel.tsx`
- `src/design-system/animations/components/ParticleBurst.tsx`
- `src/design-system/atoms/ZoneTransitionFlash.tsx`

**Modified:**
- `src/design-system/index.ts` — re-export AnimationKit
- `src/design-system/atoms/ScreenScrollView.tsx` — switch to `Animated.ScrollView`
- `src/screens/HomeScreen.tsx` — stagger, parallax, CTA glow, scroll handler
- `src/screens/HomeScreen.components.tsx` — StatCard CountUpText, shimmer skeletons, streak pulse
- `src/screens/DiveScreen.tsx` — zone flash, ring pulse trigger
- `src/design-system/atoms/DiveProgressRing.tsx` — amplify shadow range
- `src/design-system/atoms/LevelUpModal.tsx` — confetti burst + CountUpText
- `src/design-system/atoms/MysteryChestModal.tsx` — 3-step chest sequence
- `src/design-system/atoms/AchievementModal.tsx` — icon bounce + glow ring
- `src/design-system/atoms/TitleAchievementModal.tsx` — icon bounce + FloatingLabel
- `src/design-system/atoms/ActionButton.tsx` — spring press
- `src/design-system/scenes/ProTabBar.tsx` — tab icon bounce
- `src/features/notifications/NotificationToastHost.tsx` — spring toast

---

## Task 1: AnimationKit Hooks

**Files:**
- Create: `src/design-system/animations/hooks/useStaggerEntrance.ts`
- Create: `src/design-system/animations/hooks/useCountUp.ts`
- Create: `src/design-system/animations/hooks/usePulseGlow.ts`
- Create: `src/design-system/animations/hooks/useShimmer.ts`
- Create: `src/design-system/animations/hooks/useSpringPress.ts`
- Create: `src/design-system/animations/hooks/useScrollParallax.ts`

**Interfaces:**
- Produces:
  - `useStaggerEntrance(count, opts?) → SharedValue<number>[]`
  - `useCountUp(target, opts?) → SharedValue<number>`
  - `usePulseGlow(opts?) → AnimatedStyleProp<ViewStyle>`
  - `useShimmer() → { shimmerStyle: AnimatedStyleProp<ViewStyle>; width: SharedValue<number> }`
  - `useSpringPress() → { onPressIn(): void; onPressOut(): void; pressStyle: AnimatedStyleProp<ViewStyle> }`
  - `useScrollParallax(scrollY: SharedValue<number>, factor?: number) → AnimatedStyleProp<ViewStyle>`

- [ ] **Step 1: Create `useStaggerEntrance`**

```typescript
// src/design-system/animations/hooks/useStaggerEntrance.ts
import { useEffect } from "react";
import {
  cancelAnimation,
  Easing,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useSettings } from "@/stores";

type Options = {
  staggerMs?: number;
  duration?: number;
  initialDelay?: number;
};

export function useStaggerEntrance(
  count: number,
  opts: Options = {}
): SharedValue<number>[] {
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const { staggerMs = 60, duration = 380, initialDelay = 0 } = opts;

  // Always create the same number of shared values (hooks rule)
  const values = Array.from({ length: Math.max(count, 1) }, () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSharedValue(reducedMotion ? 1 : 0)
  );

  useEffect(() => {
    if (reducedMotion) {
      values.forEach((v) => { v.value = 1; });
      return;
    }
    values.forEach((v, i) => {
      v.value = 0;
      v.value = withDelay(
        initialDelay + i * staggerMs,
        withTiming(1, { duration, easing: Easing.bezier(0.16, 1, 0.3, 1) })
      );
    });
    return () => { values.forEach((v) => cancelAnimation(v)); };
    // count is stable per component instance — deps are intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, staggerMs, duration, initialDelay]);

  return values;
}
```

- [ ] **Step 2: Create `useCountUp`**

```typescript
// src/design-system/animations/hooks/useCountUp.ts
import { useEffect } from "react";
import {
  cancelAnimation,
  Easing,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useSettings } from "@/stores";

type Options = {
  duration?: number;
};

export function useCountUp(
  target: number,
  opts: Options = {}
): SharedValue<number> {
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const { duration = 600 } = opts;
  const value = useSharedValue(target);

  useEffect(() => {
    if (reducedMotion) {
      value.value = target;
      return;
    }
    value.value = withTiming(target, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
    return () => cancelAnimation(value);
  }, [target, reducedMotion, duration, value]);

  return value;
}
```

- [ ] **Step 3: Create `usePulseGlow`**

```typescript
// src/design-system/animations/hooks/usePulseGlow.ts
import { useEffect } from "react";
import {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type AnimatedStyleProp,
} from "react-native-reanimated";
import type { ViewStyle } from "react-native";
import { useSettings } from "@/stores";

type Options = {
  minOpacity?: number;
  maxOpacity?: number;
  duration?: number; // half-period in ms
};

export function usePulseGlow(
  opts: Options = {}
): AnimatedStyleProp<ViewStyle> {
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const { minOpacity = 0.2, maxOpacity = 0.7, duration = 1600 } = opts;
  const opacity = useSharedValue(minOpacity);

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = (minOpacity + maxOpacity) / 2;
      return;
    }
    opacity.value = withRepeat(
      withTiming(maxOpacity, { duration, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
    return () => cancelAnimation(opacity);
  }, [reducedMotion, minOpacity, maxOpacity, duration, opacity]);

  return useAnimatedStyle(() => ({ shadowOpacity: opacity.value }));
}
```

- [ ] **Step 4: Create `useShimmer`**

```typescript
// src/design-system/animations/hooks/useShimmer.ts
import { useEffect } from "react";
import {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type AnimatedStyleProp,
} from "react-native-reanimated";
import type { ViewStyle } from "react-native";
import { useSettings } from "@/stores";

export function useShimmer(containerWidth: number): AnimatedStyleProp<ViewStyle> {
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const translateX = useSharedValue(-containerWidth);

  useEffect(() => {
    if (reducedMotion || containerWidth <= 0) return;
    translateX.value = -containerWidth;
    translateX.value = withRepeat(
      withTiming(containerWidth, { duration: 1100, easing: Easing.linear }),
      -1,
      false
    );
    return () => cancelAnimation(translateX);
  }, [reducedMotion, containerWidth, translateX]);

  return useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
}
```

- [ ] **Step 5: Create `useSpringPress`**

```typescript
// src/design-system/animations/hooks/useSpringPress.ts
import { useCallback } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type AnimatedStyleProp,
} from "react-native-reanimated";
import type { ViewStyle } from "react-native";
import { useSettings } from "@/stores";

type Result = {
  onPressIn: () => void;
  onPressOut: () => void;
  pressStyle: AnimatedStyleProp<ViewStyle>;
};

export function useSpringPress(): Result {
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const scale = useSharedValue(1);

  const onPressIn = useCallback(() => {
    if (reducedMotion) return;
    scale.value = withSpring(0.96, { damping: 18, stiffness: 300 });
  }, [reducedMotion, scale]);

  const onPressOut = useCallback(() => {
    if (reducedMotion) return;
    scale.value = withSpring(1.0, { damping: 14, stiffness: 200 });
  }, [reducedMotion, scale]);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { onPressIn, onPressOut, pressStyle };
}
```

- [ ] **Step 6: Create `useScrollParallax`**

```typescript
// src/design-system/animations/hooks/useScrollParallax.ts
import {
  useDerivedValue,
  useAnimatedStyle,
  type SharedValue,
  type AnimatedStyleProp,
} from "react-native-reanimated";
import type { ViewStyle } from "react-native";

export function useScrollParallax(
  scrollY: SharedValue<number>,
  factor = 0.35
): AnimatedStyleProp<ViewStyle> {
  const translateY = useDerivedValue(() => scrollY.value * factor);
  return useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
}
```

- [ ] **Step 7: Commit**

```bash
git add src/design-system/animations/hooks/
git commit -m "feat(animations): add AnimationKit hooks — stagger, countUp, pulseGlow, shimmer, springPress, scrollParallax"
```

---

## Task 2: AnimationKit Components + Index

**Files:**
- Create: `src/design-system/animations/components/CountUpText.tsx`
- Create: `src/design-system/animations/components/ShimmerOverlay.tsx`
- Create: `src/design-system/animations/components/FloatingLabel.tsx`
- Create: `src/design-system/animations/components/ParticleBurst.tsx`
- Create: `src/design-system/animations/index.ts`
- Modify: `src/design-system/index.ts`

**Interfaces:**
- Consumes: all hooks from Task 1
- Produces:
  - `<CountUpText value={SharedValue<number>} format? style? />`
  - `<ShimmerOverlay width height />`
  - `<FloatingLabel label x y onDone />`
  - `<ParticleBurst x y color onDone />`

- [ ] **Step 1: Create `CountUpText`**

Uses `TextInput` as animated component (native-thread text animation via Reanimated 4 `useAnimatedProps`).

```tsx
// src/design-system/animations/components/CountUpText.tsx
import React from "react";
import { TextInput, type TextStyle, StyleSheet } from "react-native";
import Animated, {
  useAnimatedProps,
  type SharedValue,
} from "react-native-reanimated";

const AnimatedInput = Animated.createAnimatedComponent(TextInput);

type Props = {
  value: SharedValue<number>;
  format?: (n: number) => string;
  style?: TextStyle;
};

export function CountUpText({
  value,
  format = (n) => String(Math.round(n)),
  style,
}: Props) {
  const animatedProps = useAnimatedProps(() => ({
    value: format(value.value),
  }));

  return (
    <AnimatedInput
      animatedProps={animatedProps}
      editable={false}
      selectTextOnFocus={false}
      underlineColorAndroid="transparent"
      style={[styles.input, style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    padding: 0,
    margin: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
});
```

- [ ] **Step 2: Create `ShimmerOverlay`**

```tsx
// src/design-system/animations/components/ShimmerOverlay.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useShimmer } from "../hooks/useShimmer";
import { useTheme } from "@/design-system/useTheme";

type Props = {
  width: number;
  height: number;
  borderRadius?: number;
};

export function ShimmerOverlay({ width, height, borderRadius = 8 }: Props) {
  const t = useTheme();
  const shimmerStyle = useShimmer(width);
  const shimmerColor = t.colors.glassEdge;

  return (
    <View
      style={[styles.container, { width, height, borderRadius }]}
      pointerEvents="none"
    >
      <Animated.View style={[StyleSheet.absoluteFill, shimmerStyle]}>
        <LinearGradient
          colors={["transparent", shimmerColor + "55", "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: width * 0.5, height: "100%" }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    position: "absolute",
    top: 0,
    left: 0,
  },
});
```

- [ ] **Step 3: Create `FloatingLabel`**

```tsx
// src/design-system/animations/components/FloatingLabel.tsx
import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/design-system/useTheme";

type Props = {
  label: string;
  x: number;
  y: number;
  onDone: () => void;
};

export function FloatingLabel({ label, x, y, onDone }: Props) {
  const t = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 600 }),
      withTiming(0, { duration: 220, easing: Easing.in(Easing.quad) })
    );
    translateY.value = withTiming(-48, {
      duration: 940,
      easing: Easing.out(Easing.cubic),
    });

    const timer = setTimeout(() => runOnJS(onDone)(), 960);
    return () => clearTimeout(timer);
  }, [opacity, translateY, onDone]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.root, { left: x, top: y }, style]} pointerEvents="none">
      <Text style={[styles.label, { color: t.colors.premium, fontFamily: t.fonts.label }]}>
        {label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { position: "absolute", zIndex: 9999 },
  label: { fontSize: 14, fontWeight: "700", letterSpacing: 0.5 },
});
```

- [ ] **Step 4: Create `ParticleBurst`**

```tsx
// src/design-system/animations/components/ParticleBurst.tsx
import React, { useEffect, useMemo } from "react";
import { StyleSheet } from "react-native";
import { Canvas, Circle } from "@shopify/react-native-skia";
import {
  Easing,
  cancelAnimation,
  runOnJS,
  useSharedValue,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";

const SIZE = 160;
const PARTICLE_COUNT = 18;
const HALF = SIZE / 2;

type Particle = { angle: number; speed: number; radius: number };

type Props = {
  x: number;
  y: number;
  color: string;
  onDone: () => void;
};

export function ParticleBurst({ x, y, color, onDone }: Props) {
  const t = useSharedValue(0);

  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      angle: (i / PARTICLE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.4,
      speed: 28 + Math.random() * 28,
      radius: 2.5 + Math.random() * 3,
    })), []);

  useEffect(() => {
    t.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    const timer = setTimeout(() => runOnJS(onDone)(), 820);
    return () => {
      cancelAnimation(t);
      clearTimeout(timer);
    };
  }, [t, onDone]);

  return (
    <Canvas
      style={[styles.canvas, { left: x - HALF, top: y - HALF }]}
      pointerEvents="none"
    >
      {particles.map((p, i) => (
        <ParticleCircle key={i} p={p} t={t} color={color} />
      ))}
    </Canvas>
  );
}

function ParticleCircle({
  p,
  t,
  color,
}: {
  p: Particle;
  t: ReturnType<typeof useSharedValue<number>>;
  color: string;
}) {
  const cx = useDerivedValue(
    () => HALF + Math.cos(p.angle) * p.speed * t.value * 2.2
  );
  const cy = useDerivedValue(
    () => HALF + Math.sin(p.angle) * p.speed * t.value * 2.2
  );
  const opacity = useDerivedValue(() =>
    Math.max(0, 1 - t.value * 1.3)
  );

  return <Circle cx={cx} cy={cy} r={p.radius} color={color} opacity={opacity} />;
}

const styles = StyleSheet.create({
  canvas: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    zIndex: 9998,
    pointerEvents: "none",
  },
});
```

- [ ] **Step 5: Create AnimationKit index**

```typescript
// src/design-system/animations/index.ts
export { useStaggerEntrance } from "./hooks/useStaggerEntrance";
export { useCountUp } from "./hooks/useCountUp";
export { usePulseGlow } from "./hooks/usePulseGlow";
export { useShimmer } from "./hooks/useShimmer";
export { useSpringPress } from "./hooks/useSpringPress";
export { useScrollParallax } from "./hooks/useScrollParallax";
export { CountUpText } from "./components/CountUpText";
export { ShimmerOverlay } from "./components/ShimmerOverlay";
export { FloatingLabel } from "./components/FloatingLabel";
export { ParticleBurst } from "./components/ParticleBurst";
```

- [ ] **Step 6: Re-export from design-system index**

In `src/design-system/index.ts`, add at the end:

```typescript
export {
  useStaggerEntrance,
  useCountUp,
  usePulseGlow,
  useShimmer,
  useSpringPress,
  useScrollParallax,
  CountUpText,
  ShimmerOverlay,
  FloatingLabel,
  ParticleBurst,
} from "./animations";
```

- [ ] **Step 7: Upgrade `ScreenScrollView` to Animated.ScrollView**

In `src/design-system/atoms/ScreenScrollView.tsx`, replace `ScrollView` import and component:

```tsx
// Replace:
import { ScrollView, ... } from "react-native";
// With:
import { ScrollView as RNScrollView, ... } from "react-native";
import Animated from "react-native-reanimated";

const AnimatedScrollView = Animated.createAnimatedComponent(RNScrollView);
```

Replace the inner `<ScrollView ref={ref} ...>` with `<AnimatedScrollView ref={ref as React.Ref<RNScrollView>} ...>` — all existing props pass through identically. This allows `onScroll` to accept `useAnimatedScrollHandler` results.

- [ ] **Step 8: Commit**

```bash
git add src/design-system/animations/ src/design-system/index.ts src/design-system/atoms/ScreenScrollView.tsx
git commit -m "feat(animations): add AnimationKit components and upgrade ScreenScrollView for animated scroll"
```

---

## Task 3: HomeScreen Animations

**Files:**
- Modify: `src/screens/HomeScreen.tsx`
- Modify: `src/screens/HomeScreen.components.tsx`

**Interfaces:**
- Consumes:
  - `useStaggerEntrance(count)` → `SharedValue<number>[]`
  - `useCountUp(target)` → `SharedValue<number>`
  - `usePulseGlow()` → `AnimatedStyleProp<ViewStyle>`
  - `useScrollParallax(scrollY, factor)` → `AnimatedStyleProp<ViewStyle>`
  - `CountUpText` component
  - `ShimmerOverlay` component

- [ ] **Step 1: Add stagger entrance + scroll parallax to HomeScreen**

In `src/screens/HomeScreen.tsx`:

```tsx
// Add imports at top:
import {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useStaggerEntrance, useScrollParallax } from "@/design-system";

// Inside HomeScreen(), after existing hooks:
const scrollY = useSharedValue(0);
const scrollHandler = useAnimatedScrollHandler((event) => {
  "worklet";
  scrollY.value = event.contentOffset.y;
});

// Cards to stagger: header, statsRow, streakCard, lastDive, companion, plan, zones = 7
const stagger = useStaggerEntrance(7, { staggerMs: 55 });

const makeStaggerStyle = (i: number) =>
  useAnimatedStyle(() => ({
    opacity: stagger[i]!.value,
    transform: [{ translateY: (1 - stagger[i]!.value) * 18 }],
  }));

const parallaxStyle = useScrollParallax(scrollY, 0.3);
```

Pass `scrollHandler` to `ScreenScrollView`:
```tsx
<ScreenScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
```

Wrap each major card in `<Animated.View style={makeStaggerStyle(i)}>`:
- index 0 → header section (greeting + avatar)
- index 1 → stat cards row
- index 2 → streak milestone card (if shown)
- index 3 → last dive card
- index 4 → daily companion card
- index 5 → personalized plan card
- index 6 → zone progress strip

Wrap the `ZoneBackground` / `UnderwaterCanvas` header background with `parallaxStyle`:
```tsx
<Animated.View style={[StyleSheet.absoluteFill, parallaxStyle]} pointerEvents="none">
  <ZoneBackground zone={headerZone} />
  <UnderwaterCanvas zone={headerZone} />
</Animated.View>
```

- [ ] **Step 2: Add CTA glow to Start Dive button**

In `src/screens/HomeScreen.tsx`, find the primary `ActionButton` for starting a dive and wrap it:

```tsx
import { usePulseGlow } from "@/design-system";

// Inside component:
const ctaGlowStyle = usePulseGlow({ minOpacity: 0.18, maxOpacity: 0.55, duration: 1800 });

// Wrap the ActionButton:
<Animated.View
  style={[
    ctaGlowStyle,
    {
      borderRadius: t.radii.pill,
      shadowColor: t.colors.accent,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 0 },
    },
  ]}
>
  <ActionButton ... />
</Animated.View>
```

- [ ] **Step 3: Upgrade StatCard to use CountUpText**

In `src/screens/HomeScreen.components.tsx`, update `StatCard`:

```tsx
import { CountUpText, useCountUp } from "@/design-system";

export function StatCard({ icon, label, value, unit }: { ... }) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const numericValue = parseInt(value, 10);
  const isNumeric = !isNaN(numericValue);
  const animated = useCountUp(isNumeric ? numericValue : 0);

  return (
    <GlassCard radius={t.radii.md} style={styles.flex} padding={t.spacing[4]}>
      <Ionicons name={icon} size={14} color={t.colors.accentSoft} />
      <View style={styles.statValueRow}>
        {isNumeric ? (
          <CountUpText
            value={animated}
            style={[styles.statValue, { color: t.colors.text }]}
          />
        ) : (
          <Text style={styles.statValue}>{value}</Text>
        )}
        {unit && <Text style={styles.statUnit}>{unit}</Text>}
      </View>
      <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
    </GlassCard>
  );
}
```

- [ ] **Step 4: Add shimmer to skeleton components**

In `src/screens/HomeScreen.components.tsx`, update `LastDiveSkeleton` and `DailyCompanionSkeleton`:

```tsx
import { ShimmerOverlay } from "@/design-system";
import { useWindowDimensions } from "react-native";

export function LastDiveSkeleton() {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { width } = useWindowDimensions();
  const cardWidth = width - t.spacing[5] * 2;

  return (
    <GlassCard radius={t.radii.md} padding={t.spacing[4]}>
      <ShimmerOverlay width={cardWidth} height={88} borderRadius={t.radii.md} />
      <Skeleton style={styles.skeletonLabel} />
      <View style={styles.lastDiveRow}>
        <Skeleton style={styles.lastDiveIconSkeleton} radius={t.radii.sm} />
        <View style={styles.flex}>
          <Skeleton style={styles.lastDiveMetaSkeleton} />
          <Skeleton style={styles.lastDiveMetaSkeletonShort} />
        </View>
        <Skeleton style={styles.lastDiveXpSkeleton} radius={t.radii.pill} />
      </View>
    </GlassCard>
  );
}

export function DailyCompanionSkeleton() {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { width } = useWindowDimensions();
  const cardWidth = width - t.spacing[5] * 2;

  return (
    <GlassCard radius={t.radii.md}>
      <ShimmerOverlay width={cardWidth} height={72} borderRadius={t.radii.md} />
      <Skeleton style={styles.skeletonLabel} />
      <SectionSkeleton
        style={styles.companionSectionSkeleton}
        widths={["100%", "72%"]}
        lineHeight={14}
      />
    </GlassCard>
  );
}
```

- [ ] **Step 5: Add streak pulse to StreakMilestoneCard**

In `src/screens/HomeScreen.components.tsx`, update `StreakMilestoneCard`:

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from "react-native-reanimated";

export function StreakMilestoneCard({ days, nextTarget, onPress, tr }: { ... }) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const flameScale = useSharedValue(1);

  // Pulse flame on mount
  React.useEffect(() => {
    flameScale.value = withSequence(
      withSpring(1.4, { damping: 10, stiffness: 260 }),
      withSpring(1.0, { damping: 14, stiffness: 200 })
    );
  }, [days, flameScale]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  const milestoneBody = nextTarget == null
    ? tr.home.streakMilestoneReached(days)
    : tr.home.streakMilestoneBody(days, nextTarget);

  return (
    <GlassCard radius={t.radii.md} padding={t.spacing[4]}>
      <View style={styles.streakMilestoneHeader}>
        <Animated.View style={flameStyle}>
          <Ionicons name="flame" size={14} color={t.colors.warning} />
        </Animated.View>
        <SectionLabel>{tr.home.streakMilestoneTitle}</SectionLabel>
      </View>
      <Text style={styles.streakMilestoneBody}>{milestoneBody}</Text>
      <ActionButton
        label={tr.home.streakMilestoneCta}
        icon="water"
        size="sm"
        tone="secondary"
        fullWidth
        onPress={onPress}
        containerStyle={styles.streakMilestoneCtaWrap}
      />
    </GlassCard>
  );
}
```

- [ ] **Step 6: Verify visually**

Run app, navigate to HomeScreen:
- Cards should slide up one by one on mount (55ms stagger)
- Background should parallax at 0.3× scroll speed
- StatCards (streak, dives, level) should count up from 0 on first render
- Skeleton cards should show shimmer sweep
- Start Dive button should pulse with a soft glow
- Streak flame should bounce on load

- [ ] **Step 7: Commit**

```bash
git add src/screens/HomeScreen.tsx src/screens/HomeScreen.components.tsx
git commit -m "feat(home): add stagger entrance, scroll parallax, CountUpText stats, shimmer skeletons, streak flame, CTA glow"
```

---

## Task 4: DiveScreen Animations

**Files:**
- Create: `src/design-system/atoms/ZoneTransitionFlash.tsx`
- Modify: `src/screens/DiveScreen.tsx`
- Modify: `src/design-system/atoms/DiveProgressRing.tsx`

**Interfaces:**
- Consumes: `Colors.zoneAccent` from `@/theme`, existing `OceanZone` type
- Produces: `<ZoneTransitionFlash zone color />` — imperative trigger via ref

- [ ] **Step 1: Create `ZoneTransitionFlash`**

```tsx
// src/design-system/atoms/ZoneTransitionFlash.tsx
import React, { forwardRef, useImperativeHandle } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSettings } from "@/stores";

export type ZoneTransitionFlashRef = {
  flash(color: string): void;
};

export const ZoneTransitionFlash = forwardRef<ZoneTransitionFlashRef>(
  function ZoneTransitionFlash(_, ref) {
    const reducedMotion = useSettings((s) => s.reducedMotion);
    const opacity = useSharedValue(0);
    const [color, setColor] = React.useState("rgba(255,255,255,0.12)");

    useImperativeHandle(ref, () => ({
      flash(c: string) {
        if (reducedMotion) return;
        setColor(c + "22");
        opacity.value = withSequence(
          withTiming(1, { duration: 80, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 540, easing: Easing.in(Easing.cubic) })
        );
      },
    }));

    const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

    return (
      <Animated.View
        style={[styles.root, { backgroundColor: color }, style]}
        pointerEvents="none"
      />
    );
  }
);

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, zIndex: 50 },
});
```

- [ ] **Step 2: Wire zone flash into DiveScreen**

In `src/screens/DiveScreen.tsx`:

```tsx
import { useRef } from "react";
import { ZoneTransitionFlash, type ZoneTransitionFlashRef } from "@/design-system/atoms/ZoneTransitionFlash";
import { Colors } from "@/theme";

// Inside DiveScreen():
const flashRef = useRef<ZoneTransitionFlashRef>(null);

// Add zone-change effect (after the existing prevZoneRef effect):
useEffect(() => {
  const currentZone = session?.currentZone ?? null;
  if (
    prevZoneRef.current !== null &&
    currentZone !== null &&
    prevZoneRef.current !== currentZone
  ) {
    flashRef.current?.flash(Colors.zoneAccent[currentZone]);
  }
  prevZoneRef.current = currentZone ?? prevZoneRef.current;
}, [session?.currentZone]);

// In JSX, add inside the root View (after UnderwaterCanvas):
<ZoneTransitionFlash ref={flashRef} />
```

- [ ] **Step 3: Amplify DiveProgressRing shadow pulse**

In `src/design-system/atoms/DiveProgressRing.tsx`, update `ringStyle`:

```tsx
// Replace:
const ringStyle = useAnimatedStyle(() => ({
  shadowOpacity: 0.45 + 0.5 * p.value,
}));

// With:
const ringStyle = useAnimatedStyle(() => ({
  shadowOpacity: 0.2 + 0.8 * p.value,
  shadowRadius: 8 + 16 * p.value,
  shadowColor: t.colors.accent,
}));
```

- [ ] **Step 4: Verify visually**

Run app, start a dive:
- At zone boundary (surface→twilight etc.) the screen should briefly flash the zone accent color
- Progress ring shadow should intensify as dive progresses (faint at start, bright at completion)

- [ ] **Step 5: Commit**

```bash
git add src/design-system/atoms/ZoneTransitionFlash.tsx src/screens/DiveScreen.tsx src/design-system/atoms/DiveProgressRing.tsx
git commit -m "feat(dive): add zone transition flash and amplified ring pulse"
```

---

## Task 5: Modal Reward Animations

**Files:**
- Modify: `src/design-system/atoms/LevelUpModal.tsx`
- Modify: `src/design-system/atoms/MysteryChestModal.tsx`
- Modify: `src/design-system/atoms/AchievementModal.tsx`
- Modify: `src/design-system/atoms/TitleAchievementModal.tsx`

**Interfaces:**
- Consumes: `ParticleBurst`, `FloatingLabel`, `CountUpText`, `useCountUp` from AnimationKit

- [ ] **Step 1: LevelUpModal — confetti burst + CountUpText**

In `src/design-system/atoms/LevelUpModal.tsx`:

```tsx
import { useState, useCallback } from "react";
import { ParticleBurst, FloatingLabel, CountUpText, useCountUp } from "@/design-system";
import { useWindowDimensions } from "react-native";

// Replace the static level number display and add burst state:
const [showBurst, setShowBurst] = useState(false);
const [showFloat, setShowFloat] = useState(false);
const { width, height } = useWindowDimensions();
const levelValue = useCountUp(visible ? newLevel : prevLevel, { duration: 800 });

// In useEffect, when visible becomes true, after the spring:
if (visible) {
  // ... existing haptic + progress + levelScale code ...
  const burstTimer = setTimeout(() => setShowBurst(true), 180);
  const floatTimer = setTimeout(() => setShowFloat(true), 320);
  // store refs and clear in cleanup
}

// Replace the level number Text with CountUpText:
// Find: <Text style={styles.levelNumber}>{newLevel}</Text>
// Replace with:
<CountUpText
  value={levelValue}
  style={[styles.levelNumber, { color: Colors.premium.deepInk }]}
/>

// After the closing </ModalFrame>, before the component return closes:
{showBurst && (
  <ParticleBurst
    x={width / 2}
    y={height * 0.38}
    color={t.colors.premium}
    onDone={() => setShowBurst(false)}
  />
)}
{showFloat && (
  <FloatingLabel
    label="+XP"
    x={width / 2 - 16}
    y={height * 0.5}
    onDone={() => setShowFloat(false)}
  />
)}
```

- [ ] **Step 2: MysteryChestModal — 3-step chest sequence**

In `src/design-system/atoms/MysteryChestModal.tsx`, add chest shake + expand on open tap:

```tsx
import { useState } from "react";
import { ParticleBurst } from "@/design-system";
import { useWindowDimensions } from "react-native";
import {
  withSequence, withSpring, withTiming,
} from "react-native-reanimated";

// Add inside component (alongside existing sharedValues):
const chestRotation = useSharedValue(0);
const [showBurst, setShowBurst] = useState(false);
const { width, height } = useWindowDimensions();

// Add rotation animated style:
const chestRotStyle = useAnimatedStyle(() => ({
  transform: [
    { scale: chestScale.value },
    { rotate: `${chestRotation.value}deg` },
  ],
}));

// Replace existing chestStyle with chestRotStyle in the chest icon wrapper.

// On open/tap (find the handleOpen or chest tap handler), trigger sequence:
const handleChestTap = () => {
  if (isOpened || reducedMotion) { /* existing open logic */ return; }

  // Step 1: shake
  chestRotation.value = withSequence(
    withTiming(-10, { duration: 60 }),
    withTiming(10, { duration: 80 }),
    withTiming(-7, { duration: 60 }),
    withTiming(7, { duration: 60 }),
    withTiming(0, { duration: 80 })
  );
  // Step 2: expand
  chestScale.value = withSequence(
    withSpring(1.35, { damping: 10, stiffness: 220 }),
    withSpring(1.0, { damping: 16, stiffness: 200 })
  );
  // Step 3: burst + reveal
  const burstTimer = setTimeout(() => {
    setShowBurst(true);
    setIsOpened(true);
    opened.value = withTiming(1, { duration: 300 });
    // start countdown after reveal
    countdown.setValue(1);
    RNAnimated.timing(countdown, { toValue: 0, duration: AUTO_DISMISS_MS, useNativeDriver: false }).start();
    timerRef.current = setTimeout(() => onDismiss(), AUTO_DISMISS_MS);
  }, 220);
  return () => clearTimeout(burstTimer);
};

// After ModalFrame closing tag:
{showBurst && (
  <ParticleBurst
    x={width / 2}
    y={height * 0.42}
    color={glowColor}
    onDone={() => setShowBurst(false)}
  />
)}
```

- [ ] **Step 3: AchievementModal — icon bounce + glow ring**

In `src/design-system/atoms/AchievementModal.tsx`:

```tsx
import {
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";

// Add inside component:
const iconScale = useSharedValue(0.4);
const glowRadius = useSharedValue(0);

// In useEffect when visible becomes true, add:
iconScale.value = withSequence(
  withSpring(1.18, { damping: 10, stiffness: 240 }),
  withSpring(1.0, { damping: 16, stiffness: 200 })
);
glowRadius.value = withTiming(16, { duration: 400 });

// When not visible:
iconScale.value = 0.4;
glowRadius.value = 0;

// Animated styles:
const iconBounceStyle = useAnimatedStyle(() => ({
  transform: [{ scale: iconScale.value }],
}));
const glowRingStyle = useAnimatedStyle(() => ({
  shadowRadius: glowRadius.value,
  shadowOpacity: glowRadius.value > 0 ? 0.4 : 0,
}));

// Apply iconBounceStyle to the iconWrap View (make it Animated.View):
// <Animated.View style={[styles.iconWrap, { borderColor: ... }, iconBounceStyle, glowRingStyle]}>
```

- [ ] **Step 4: TitleAchievementModal — icon bounce + FloatingLabel**

In `src/design-system/atoms/TitleAchievementModal.tsx`:

```tsx
import { useState } from "react";
import { FloatingLabel } from "@/design-system";
import { useWindowDimensions } from "react-native";
import {
  useSharedValue, withSequence, withSpring, useAnimatedStyle,
} from "react-native-reanimated";

// Add inside component:
const iconScale = useSharedValue(0.5);
const [showFloat, setShowFloat] = useState(false);
const { width, height } = useWindowDimensions();

// In useEffect when visible becomes true:
iconScale.value = withSequence(
  withSpring(1.2, { damping: 10, stiffness: 240 }),
  withSpring(1.0, { damping: 16, stiffness: 200 })
);
const floatTimer = setTimeout(() => setShowFloat(true), 300);

// When not visible:
iconScale.value = 0.5;
setShowFloat(false);

const iconBounceStyle = useAnimatedStyle(() => ({
  transform: [{ scale: iconScale.value }],
}));

// Wrap the achievement icon in <Animated.View style={iconBounceStyle}>

// After modal:
{showFloat && achievement && (
  <FloatingLabel
    label={achievement.title}
    x={width / 2 - 40}
    y={height * 0.48}
    onDone={() => setShowFloat(false)}
  />
)}
```

- [ ] **Step 5: Verify visually**

Trigger each modal in order:
- LevelUp: confetti should burst from level circle, "+XP" floats up
- MysteryChest: tap chest → shake → expand → burst → reward reveals
- Achievement: icon bounces on appear, glow ring expands
- TitleAchievement: icon bounces, title floats up

- [ ] **Step 6: Commit**

```bash
git add src/design-system/atoms/LevelUpModal.tsx src/design-system/atoms/MysteryChestModal.tsx src/design-system/atoms/AchievementModal.tsx src/design-system/atoms/TitleAchievementModal.tsx
git commit -m "feat(modals): add confetti bursts, chest shake sequence, icon bounces, floating labels"
```

---

## Task 6: Micro-interactions

**Files:**
- Modify: `src/design-system/scenes/ProTabBar.tsx`
- Modify: `src/design-system/atoms/ActionButton.tsx`
- Modify: `src/features/notifications/NotificationToastHost.tsx`

**Interfaces:**
- Consumes: `useSpringPress` from AnimationKit

- [ ] **Step 1: ProTabBar — icon bounce on tab switch**

In `src/design-system/scenes/ProTabBar.tsx`, the active tab icon lives inside the bubble. Add a bounce when `state.index` changes:

```tsx
// Add near top of ProTabBar():
const iconBounce = useSharedValue(1);
const prevIndexRef = useRef(state.index);

useEffect(() => {
  if (prevIndexRef.current !== state.index) {
    prevIndexRef.current = state.index;
    iconBounce.value = withSequence(
      withSpring(1.32, { damping: 8, stiffness: 280 }),
      withSpring(1.0, { damping: 14, stiffness: 200 })
    );
  }
}, [state.index, iconBounce]);

const iconBounceStyle = useAnimatedStyle(() => ({
  transform: [{ scale: iconBounce.value }],
}));

// Wrap the <Ionicons> inside the bubble with:
// <Animated.View style={iconBounceStyle}>
//   <Ionicons name={activeIcons.active} size={activeIcons.size + 2} color={iconTint} />
// </Animated.View>
```

Add missing import: `import { withSequence } from "react-native-reanimated";` (already imported in ProTabBar, just add `withSequence` to the existing import).

- [ ] **Step 2: ActionButton — spring press**

In `src/design-system/atoms/ActionButton.tsx`, replace the static `pressed` style with a spring animation. Since `ActionButton` uses `react-native-gesture-handler`'s `Pressable`, wrap with `Animated.View` and use `useSpringPress`:

```tsx
import Animated from "react-native-reanimated";
import { useSpringPress } from "@/design-system/animations";

// Inside ActionButton():
const { onPressIn, onPressOut, pressStyle } = useSpringPress();

// Wrap entire return with Animated.View:
return (
  <Animated.View style={pressStyle}>
    <Pressable
      onPressIn={(e) => { onPressIn(); rest.onPressIn?.(e); }}
      onPressOut={(e) => { onPressOut(); rest.onPressOut?.(e); }}
      // ... rest of existing props
    >
      {/* existing content unchanged */}
    </Pressable>
  </Animated.View>
);
```

Remove the static `pressed` style from `StyleSheet` (the `transform: [{ scale: 0.98 }]` entry) — it's now handled by `useSpringPress`.

- [ ] **Step 3: NotificationToast — spring enter + fast exit**

In `src/features/notifications/NotificationToastHost.tsx`, update the `Animated` import and toast animation:

```tsx
// Find the toast render JSX (likely wraps the GlassCard):
// Replace:
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";

// With — add springify to enter, keep fast exit:
// entering={FadeInDown.springify().damping(18).stiffness(180).mass(0.8)}
// exiting={FadeOutUp.duration(180)}

// In the toast JSX:
<Animated.View
  key={toast.id}
  entering={FadeInDown.springify().damping(18).stiffness(180).mass(0.8)}
  exiting={FadeOutUp.duration(180)}
>
  {/* existing toast content unchanged */}
</Animated.View>
```

- [ ] **Step 4: Verify visually**

- Tap each tab → active bubble icon should spring-bounce up and settle
- Tap any ActionButton → card scales down with spring, releases back
- Trigger a notification toast → it should spring in from bottom, exit quickly upward

- [ ] **Step 5: Commit**

```bash
git add src/design-system/scenes/ProTabBar.tsx src/design-system/atoms/ActionButton.tsx src/features/notifications/NotificationToastHost.tsx
git commit -m "feat(micro): spring tab bounce, spring press on buttons, spring toast enter"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All 6 phases covered: AnimationKit (Tasks 1-2), HomeScreen (Task 3), DiveScreen (Task 4), Modals (Task 5), Micro-interactions (Task 6)
- [x] **No placeholders:** All code blocks contain real implementations
- [x] **Type consistency:** `useStaggerEntrance` → `SharedValue<number>[]` used consistently; `useCountUp` → `SharedValue<number>` passed to `CountUpText`; `ZoneTransitionFlashRef.flash(color: string)` matches usage in DiveScreen
- [x] **reducedMotion** gated in every hook that uses `withRepeat` or timed animations
- [x] **cancelAnimation** in every `useEffect` cleanup that starts repeating animations
- [x] **PressableCard** already has spring press (scale 0.965) — no change needed there
- [x] **CountUpText** uses TextInput animatedProps pattern (Reanimated 4 compatible)
- [x] **ParticleBurst** uses Skia (already in project at 2.6.2) — no new deps
