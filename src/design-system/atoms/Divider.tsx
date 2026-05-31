import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../useTheme";

type Props = {
  /** Visual weight — hairline by default. */
  weight?: "hairline" | "regular";
  /** Inset offset (horizontal padding). */
  inset?: number;
};

/**
 * Divider — single source of truth for in-card horizontal separators.
 */
export const Divider = React.memo(function Divider({
  weight = "hairline",
  inset = 0
}: Props) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          height: weight === "hairline" ? StyleSheet.hairlineWidth : 1,
          backgroundColor: t.colors.border,
          marginHorizontal: -inset
        }
      ]}
    />
  );
});
