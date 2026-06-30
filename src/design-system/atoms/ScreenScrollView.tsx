import React from "react";
import {
  Platform,
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle
} from "react-native";
import Animated from "react-native-reanimated";
import { useTheme } from "../useTheme";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

type Props = ScrollViewProps & {
  bottomInset?: number;
  gap?: number;
  horizontalInset?: number;
  topInset?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export const ScreenScrollView = React.forwardRef<ScrollView, Props>(
  function ScreenScrollView(
    {
      bottomInset,
      children,
      contentContainerStyle,
      gap,
      horizontalInset = 0,
      keyboardDismissMode,
      keyboardShouldPersistTaps,
      showsVerticalScrollIndicator,
      topInset,
      ...rest
    },
    ref
  ) {
    const t = useTheme();

    return (
      <AnimatedScrollView
        ref={ref as React.Ref<ScrollView>}
        contentInsetAdjustmentBehavior="never"
        decelerationRate={Platform.OS === "ios" ? "normal" : undefined}
        keyboardDismissMode={keyboardDismissMode ?? "interactive"}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps ?? "handled"}
        overScrollMode="never"
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator ?? false}
        contentContainerStyle={[
          {
            paddingTop: topInset ?? t.spacing[5],
            paddingHorizontal: t.spacing[5],
            paddingBottom: bottomInset ?? t.spacing[24],
            gap: gap ?? t.spacing[4]
          },
          contentContainerStyle
        ]}
        {...rest}
      >
        {children}
      </AnimatedScrollView>
    );
  }
);
