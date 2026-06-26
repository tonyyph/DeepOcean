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
