import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
  type ViewStyle
} from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { useTheme } from "../useTheme";

export type ScreenTransitionOverlayProps = {
  visible: boolean;
  style?: ViewStyle;
};

const FADE_MS = 180;

export function ScreenTransitionOverlay({
  visible,
  style
}: ScreenTransitionOverlayProps) {
  const t = useTheme();
  const opacity = useSharedValue(0);
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    let showFrame: number | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    if (visible) {
      showFrame = requestAnimationFrame(() => setMounted(true));
      opacity.value = withTiming(1, {
        duration: FADE_MS,
        easing: Easing.out(Easing.cubic)
      });
    } else {
      opacity.value = withTiming(0, {
        duration: FADE_MS,
        easing: Easing.out(Easing.cubic)
      });
      hideTimer = setTimeout(() => setMounted(false), FADE_MS);
    }

    return () => {
      if (showFrame !== undefined) cancelAnimationFrame(showFrame);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [opacity, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  if (!mounted) return null;

  const fallbackColor =
    Platform.OS === "android" ? t.colors.panelStrong : t.colors.glass;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.root, animatedStyle, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {Platform.OS === "ios" ? (
        <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: fallbackColor, opacity: 0.82 }
          ]}
        />
      )}
      <View
        style={[
          styles.scrim,
          {
            backgroundColor: t.colors.background,
            borderColor: t.colors.glassEdge
          }
        ]}
      >
        <ActivityIndicator color={t.colors.accent} size="small" />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    alignItems: "center",
    justifyContent: "center"
  },
  scrim: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.86
  }
});
