import React, { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import type {
  ParamListBase,
  Route
} from "expo-router/build/react-navigation/native";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { useTheme } from "../useTheme";
import type { AppTheme } from "../themes";
import { useSettings } from "@/stores";
import { Colors } from "@/theme";

// ── Icon map ──────────────────────────────────────────────────────────
type IconPair = {
  active: keyof typeof Ionicons.glyphMap;
  inactive: keyof typeof Ionicons.glyphMap;
  size: number;
};

type TabRoute = Route<string, ParamListBase[string]>;

const ICONS: Readonly<Record<string, IconPair>> = {
  index: { active: "water", inactive: "water-outline", size: 24 },
  collection: { active: "fish", inactive: "fish-outline", size: 24 },
  stats: { active: "pulse", inactive: "pulse-outline", size: 24 },
  ai: { active: "sparkles", inactive: "sparkles-outline", size: 22 },
  profile: {
    active: "person-circle",
    inactive: "person-circle-outline",
    size: 26
  }
};

// ── Layout constants ──────────────────────────────────────────────────
const BAR_H = 72;
const BUBBLE_DIAM = 60;
const BUBBLE_R = BUBBLE_DIAM / 2; // 30
const NOTCH_SPREAD = 32; // horizontal half-width of notch (tight hug around bubble)
const NOTCH_DEPTH_INNER = 46; // items 2-4 (centre tabs)
const NOTCH_DEPTH_OUTER = 0; // items 1 & 5 (edge tabs)
const BAR_CORNER = 24;
const DURATION = 320;
const EASE = Easing.bezier(0.34, 1.56, 0.64, 1); // spring-like overshoot
const TAB_HIT_SLOP = 8;
const WRAPPER_BOTTOM_OFFSET = 24;
const BUBBLE_TOP_OFFSET = 12;
const BAR_SHADOW = {
  color: Colors.base.black,
  opacity: 0.22,
  radius: 18,
  offsetY: 6,
  elevation: 14
} as const;
const BUBBLE_SHADOW = {
  opacity: 0.45,
  radius: 14,
  offsetY: 4,
  elevation: 8
} as const;

const AnimatedSvgPath = Animated.createAnimatedComponent(Path);

// ── Worklet: builds the rounded-rect bar shape with a concave notch ───
// Runs on the UI thread so it can access notchX.value every frame.
function buildNotchPath(cx: number, W: number, nd: number): string {
  "worklet";
  const H = BAR_H;
  const CR = BAR_CORNER;
  const NR = NOTCH_SPREAD;
  const ND = nd;
  // Bezier "smoothing" — how far the curve starts/ends from the notch centre
  const sm = NR * 0.5;

  // Clamp so the notch never bleeds past the rounded corners
  const lEntry = Math.max(CR + 2, cx - NR - sm);
  const lCtrl = Math.max(CR + 1, cx - NR);
  const rCtrl = Math.min(W - CR - 1, cx + NR);
  const rEntry = Math.min(W - CR - 2, cx + NR + sm);

  // steep: first control point dips immediately so the curve tightly hugs the bubble
  const stepY = ND * 0.22;

  return (
    // top-left corner
    `M 0 ${CR} Q 0 0 ${CR} 0 ` +
    // top edge → left side of notch
    `L ${lEntry} 0 ` +
    // curved descent into notch (steep start)
    `C ${lCtrl} ${stepY} ${lCtrl} ${ND} ${cx} ${ND} ` +
    // curved ascent out of notch (steep finish)
    `C ${rCtrl} ${ND} ${rCtrl} ${stepY} ${rEntry} 0 ` +
    // top edge → top-right corner
    `L ${W - CR} 0 Q ${W} 0 ${W} ${CR} ` +
    // right side + bottom-right corner
    `L ${W} ${H - CR} Q ${W} ${H} ${W - CR} ${H} ` +
    // bottom edge + bottom-left corner
    `L ${CR} ${H} Q 0 ${H} 0 ${H - CR} Z`
  );
}

// ── Luminance-based contrast (unchanged from original) ────────────────
function contrastOn(t: AppTheme): string {
  const [g0] = t.gradients.bioGlow;
  const m = /^#?([0-9a-f]{6})$/i.exec(g0);
  if (!m || !m[1]) return Colors.base.white;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma > 0.65 ? "#0A0A12" : Colors.base.white;
}

// ── ProTabBar ─────────────────────────────────────────────────────────
/**
 * Notch-bubble Pro tab bar.
 *
 * The active tab's icon floats in a gradient circle that protrudes above
 * the bar. The bar's top edge has a smooth concave cutout (notch) beneath
 * the bubble so the two shapes read as one continuous form.
 *
 * Visual layers (bottom → top):
 *  1. Shadow View (elevation / iOS shadow)
 *  2. SVG Path — bar background with animated notch
 *  3. Flat Pressable slots row (inactive icons only)
 *  4. Animated bubble — active tab icon, slides on tab change
 */
export function ProTabBar(props: BottomTabBarProps) {
  const { state, descriptors, navigation } = props;
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const hapticsEnabled = useSettings((s) => s.hapticsEnabled);
  const { width } = useWindowDimensions();

  const hPad = t.spacing[4];
  const dockW = width - hPad * 2;
  const tabW = dockW / state.routes.length;

  // Shared value: horizontal centre of the active notch + bubble
  const notchX = useSharedValue(state.index * tabW + tabW / 2);
  const isEdge = (i: number) => i === 0 || i === state.routes.length - 1;
  const notchDepth = useSharedValue(
    isEdge(state.index) ? NOTCH_DEPTH_OUTER : NOTCH_DEPTH_INNER
  );

  useEffect(() => {
    notchX.value = withTiming(state.index * tabW + tabW / 2, {
      duration: DURATION,
      easing: EASE
    });
    notchDepth.value = withTiming(
      isEdge(state.index) ? NOTCH_DEPTH_OUTER : NOTCH_DEPTH_INNER,
      { duration: DURATION, easing: EASE }
    );
  }, [state.index, tabW, notchX, notchDepth]);

  // ── Animated SVG path ──────────────────────────────────────────────
  const animatedPathProps = useAnimatedProps(() => ({
    d: buildNotchPath(notchX.value, dockW, notchDepth.value)
  }));

  // ── Animated bubble position ───────────────────────────────────────
  // Bubble sits at top:0 of barContainer; its centre aligns with the notch.
  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: notchX.value - BUBBLE_R }]
  }));

  const activeRoute = state.routes[state.index]!;
  const activeIcons = ICONS[activeRoute.name] ?? ICONS.index!;
  const iconTint = useMemo(() => contrastOn(t), [t]);
  const barFill = t.colors.surfaceElevated;
  const bottomPad = Math.max(insets.bottom, t.spacing[2]);

  const press = (route: (typeof state.routes)[number], focused: boolean) => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true
    });
    if (!focused && !event.defaultPrevented) {
      if (hapticsEnabled) void Haptics.selectionAsync().catch(() => {});
      navigation.navigate(route.name as never);
    }
  };

  // Total wrapper height: safe-area gap + bar + bubble protrusion above bar
  const wrapperH = bottomPad + BAR_H + BUBBLE_R;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingHorizontal: hPad, height: wrapperH }]}
    >
      {/*
       * barContainer: BUBBLE_R + BAR_H tall so the bubble (top:0, h:BUBBLE_DIAM)
       * and the SVG bar (top:BUBBLE_R, h:BAR_H) both fit without overflow.
       */}
      <View
        style={[
          styles.barContainer,
          {
            width: dockW,
            height: BUBBLE_R + BAR_H,
            // Bar shadow — approximated by container bounds
            shadowColor: BAR_SHADOW.color,
            shadowOpacity: BAR_SHADOW.opacity,
            shadowRadius: BAR_SHADOW.radius,
            shadowOffset: { width: 0, height: BAR_SHADOW.offsetY },
            elevation: BAR_SHADOW.elevation
          }
        ]}
      >
        {/* ① SVG bar background with animated notch ─────────────────── */}
        <Svg
          width={dockW}
          height={BAR_H}
          style={[styles.svgBar, { top: BUBBLE_R }]}
        >
          <AnimatedSvgPath animatedProps={animatedPathProps} fill={barFill} />
        </Svg>

        {/* ② Flat inactive-tab slots ───────────────────────────────── */}
        <View style={[styles.tabsRow, { top: BUBBLE_R, height: BAR_H }]}>
          {state.routes.map((route: TabRoute, index: number) => {
            const focused = state.index === index;
            const icons = ICONS[route.name] ?? ICONS.index!;
            const desc = descriptors[route.key];

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityLabel={
                  desc?.options.tabBarAccessibilityLabel ?? route.name
                }
                onPress={() => press(route, focused)}
                style={styles.slot}
                hitSlop={TAB_HIT_SLOP}
              >
                {/* Active icon rendered inside bubble below; hide it here */}
                {!focused && (
                  <Ionicons
                    name={icons.inactive}
                    size={icons.size}
                    color={t.colors.textMuted}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* ③ Floating bubble — active tab ─────────────────────────── */}
        <Animated.View
          style={[
            styles.bubble,
            bubbleStyle,
            {
              shadowColor: t.colors.accent,
              shadowOpacity: BUBBLE_SHADOW.opacity,
              shadowRadius: BUBBLE_SHADOW.radius,
              shadowOffset: { width: 0, height: BUBBLE_SHADOW.offsetY },
              elevation: BUBBLE_SHADOW.elevation
            }
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              descriptors[activeRoute.key]?.options.tabBarAccessibilityLabel ??
              activeRoute.name
            }
            onPress={() => press(activeRoute, true)}
            style={StyleSheet.absoluteFill}
          >
            <LinearGradient
              colors={[t.gradients.bioGlow[0], t.gradients.bioGlow[1]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bubbleGrad}
            >
              <Ionicons
                name={activeIcons.active}
                size={activeIcons.size + 2}
                color={iconTint}
              />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: WRAPPER_BOTTOM_OFFSET,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "flex-end"
  },
  barContainer: {
    // overflow visible so the bubble (at top:0) doesn't clip on Android
    overflow: "visible"
  },
  svgBar: {
    position: "absolute",
    left: 0
  },
  tabsRow: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row"
  },
  slot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  bubble: {
    position: "absolute",
    top: BUBBLE_TOP_OFFSET,
    left: 0,
    width: BUBBLE_DIAM,
    height: BUBBLE_DIAM,
    borderRadius: BUBBLE_R,
    // No overflow:hidden here — shadow needs to bleed. Gradient handles its own clip.
    elevation: BUBBLE_SHADOW.elevation
  },
  bubbleGrad: {
    flex: 1,
    borderRadius: BUBBLE_R,
    alignItems: "center",
    justifyContent: "center",
    // Clip gradient to circle on both platforms
    overflow: "hidden"
  }
});
