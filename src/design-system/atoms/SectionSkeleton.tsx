import React from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "../useTheme";
import { Skeleton } from "./Skeleton";

type Props = {
  lines?: number;
  widths?: (number | `${number}%`)[];
  lineHeight?: number;
  gap?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * SectionSkeleton — reusable multi-line text placeholder.
 */
export const SectionSkeleton = React.memo(function SectionSkeleton({
  lines = 3,
  widths,
  lineHeight = 14,
  gap,
  style
}: Props) {
  const t = useTheme();
  const rowGap = gap ?? t.spacing[1.5];

  return (
    <View style={[{ gap: rowGap }, style]}>
      {Array.from({ length: lines }, (_, i) => {
        const width = widths?.[i] ?? (i === lines - 1 ? "60%" : "100%");
        return <Skeleton key={i} style={{ width }} height={lineHeight} />;
      })}
    </View>
  );
});
