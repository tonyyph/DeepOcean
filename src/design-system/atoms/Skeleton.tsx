import React from "react";
import { View, StyleSheet, type ViewStyle, type StyleProp } from "react-native";
import { useTheme } from "../useTheme";

type Props = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Skeleton block used as a lightweight placeholder while data is loading.
 */
export const Skeleton = React.memo(function Skeleton({
  width,
  height = 12,
  radius,
  style
}: Props) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius: radius ?? t.radii.xs,
          borderColor: "rgba(255,255,255,0.12)"
        },
        style
      ]}
    />
  );
});

const styles = StyleSheet.create({
  base: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: StyleSheet.hairlineWidth
  }
});
