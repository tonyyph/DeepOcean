import React from "react";
import { View, StyleSheet, type ViewStyle, type StyleProp } from "react-native";
import { useTheme } from "../useTheme";
import { Colors } from "@/theme";

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
          borderColor: `${Colors.base.white}1F`
        },
        style
      ]}
    />
  );
});

const styles = StyleSheet.create({
  base: {
    backgroundColor: `${Colors.base.white}1A`,
    borderWidth: StyleSheet.hairlineWidth
  }
});
