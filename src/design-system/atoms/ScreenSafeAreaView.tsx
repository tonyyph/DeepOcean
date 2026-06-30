import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Edge = "top" | "right" | "bottom" | "left";

type Props = ViewProps & {
  edges?: readonly Edge[];
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_EDGES: readonly Edge[] = ["top", "bottom"];

export function ScreenSafeAreaView({
  edges = DEFAULT_EDGES,
  style,
  children,
  ...props
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      {...props}
      style={[
        styles.base,
        style,
        {
          paddingTop: edges.includes("top") ? insets.top : 0,
          paddingBottom: edges.includes("bottom") ? insets.bottom : 0
        }
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1
  }
});
