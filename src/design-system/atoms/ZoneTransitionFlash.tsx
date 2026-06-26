import React, { forwardRef, useImperativeHandle, useState } from "react";
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
    const [bgColor, setBgColor] = useState("rgba(255,255,255,0.12)");

    useImperativeHandle(ref, () => ({
      flash(color: string) {
        if (reducedMotion) return;
        setBgColor(color + "22");
        opacity.value = withSequence(
          withTiming(1, { duration: 80, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 540, easing: Easing.in(Easing.cubic) })
        );
      },
    }));

    const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

    return (
      <Animated.View
        style={[styles.root, { backgroundColor: bgColor }, style]}
        pointerEvents="none"
      />
    );
  }
);

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill, zIndex: 50 },
});
