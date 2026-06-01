import React, { useEffect, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useTheme } from "../useTheme";
import type { AppTheme } from "../themes";
import { useSettings } from "@/stores";

// ── Icon map ──────────────────────────────────────────────────────────
type IconPair = {
  active: keyof typeof Ionicons.glyphMap;
  inactive: keyof typeof Ionicons.glyphMap;
  size: number;
};

const ICONS: Readonly<Record<string, IconPair>> = {
  index: { active: "water", inactive: "water-outline", size: 24 },
  collection: { active: "fish", inactive: "fish-outline", size: 24 },
  stats: { active: "pulse", inactive: "pulse-outline", size: 24 },
  ai: { active: "sparkles", inactive: "sparkles-outline", size: 22 },
  profile: { active: "person-circle", inactive: "person-circle-outline", size: 26 }
};

// ── Layout constants ──────────────────────────────────────────────────
const BAR_H = 68;
const BUBBLE_DIAM = 60;
const BUBBLE_R = BUBBLE_DIAM / 2; // 30
const NOTCH_SPREAD = 36; // horizontal half-width of notch (slightly wider than bubble)
const NOTCH_DEPTH = 26; // how deep the notch dips into the bar from its top edge
const BAR_CORNER = 26;
const DURATION = 320;
const EASE = Easing.bezier(0.34, 1.56, 0.64, 1); // spring-like overshoot

const AnimatedSvgPath = Animated.createAnimatedComponent(Path);

// ── Worklet: builds the rounded-rect bar shape with a concave notch ───
// Runs on the UI thread so it can access notchX.value every frame.
function buildNotchPath(cx: number, W: number): string {
  "worklet";
  const H = BAR_H;
  const CR = BAR_CORNER;
  const NR = NOTCH_SPREAD;
  const ND = NOTCH_DEPTH;
  // Bezier "smoothing" — how far the curve starts/ends from the notch centre
  const sm = NR * 0.5;

  // Clamp so the notch never bleeds past the rounded corners
  const lEntry = Math.max(CR + 2, cx - NR - sm);
  const lCtrl = Math.max(CR + 1, cx - NR);
  const rCtrl = Math.min(W - CR - 1, cx + NR);
  const rEntry = Math.min(W - CR - 2, cx + NR + sm);

  return (
    // top-left corner
    `M 0 ${CR} Q 0 0 ${CR} 0 ` +
    // top edge → left side of notch
    `L ${lEntry} 0 ` +
    // curved descent into notch
    `C ${lCtrl} 0 ${lCtrl} ${ND} ${cx} ${ND} ` +
    // curved ascent out of notch
    `C ${rCtrl} ${ND} ${rCtrl} 0 ${rEntry} 0 ` +
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
  if (!m || !m[1]) return "#FFFFFF";
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma > 0.65 ? "#0A0A12" : "#FFFFFF";
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

  useEffect(() => {
    notchX.value = withTiming(state.index * tabW + tabW / 2, {
      duration: DURATION,
      easing: EASE
    });
  }, [state.index, tabW, notchX]);

  // ── Animated SVG path ──────────────────────────────────────────────
  const animatedPathProps = useAnimatedProps(() => ({
    d: buildNotchPath(notchX.value, dockW)
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

  const press = (
    route: (typeof state.routes)[number],
    focused: boolean
  ) => {
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
      style={[
        styles.wrapper,
        { paddingHorizontal: hPad, height: wrapperH }
      ]}
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
            shadowColor: "#000",
            shadowOpacity: 0.22,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 6 },
            elevation: 14
          }
        ]}
      >
        {/* ① SVG bar background with animated notch ─────────────────── */}
        <Svg
          width={dockW}
          height={BAR_H}
          style={[styles.svgBar, { top: BUBBLE_R }]}
        >
          <AnimatedSvgPath
            animatedProps={animatedPathProps}
            fill={barFill}
          />
        </Svg>

        {/* ② Flat inactive-tab slots ───────────────────────────────── */}
        <View
          style={[
            styles.tabsRow,
            { top: BUBBLE_R, height: BAR_H }
          ]}
        >
          {state.routes.map((route, index) => {
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
                hitSlop={8}
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
              shadowOpacity: 0.45,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 4 }
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
    bottom: 0,
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
    top: 0,
    left: 0,
    width: BUBBLE_DIAM,
    height: BUBBLE_DIAM,
    borderRadius: BUBBLE_R,
    // No overflow:hidden here — shadow needs to bleed. Gradient handles its own clip.
    elevation: 8
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
