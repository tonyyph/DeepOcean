// src/design-system/animations/components/ShimmerOverlay.tsx
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
