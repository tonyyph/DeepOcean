// src/design-system/animations/components/CountUpText.tsx
import React from "react";
import { TextInput, type TextStyle, StyleSheet } from "react-native";
import Animated, {
  useAnimatedProps,
  type SharedValue,
} from "react-native-reanimated";

const AnimatedInput = Animated.createAnimatedComponent(TextInput);

type Props = {
  value: SharedValue<number>;
  format?: (n: number) => string;
  style?: TextStyle;
};

export function CountUpText({
  value,
  format = (n) => String(Math.round(n)),
  style,
}: Props) {
  const animatedProps = useAnimatedProps(() => ({
    value: format(value.value),
  }));

  return (
    <AnimatedInput
      animatedProps={animatedProps}
      editable={false}
      selectTextOnFocus={false}
      underlineColorAndroid="transparent"
      style={[styles.input, style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    padding: 0,
    margin: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
});
