import { BlurView } from "expo-blur";
import type { PropsWithChildren } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle
} from "react-native";
import Animated, {
  type AnimatedStyle,
  type SharedValue,
  useAnimatedStyle
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AppTheme } from "../themes";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";

type Props = PropsWithChildren<{
  visible: boolean;
  onDismiss: () => void;
  progress: SharedValue<number>;
  cardAnimatedStyle?: AnimatedStyle<ViewStyle>;
  cardStyle?: StyleProp<ViewStyle>;
  accentColor?: string;
  dismissOnBackdropPress?: boolean;
}>;

/**
 * Shared centered-modal chrome: strong blurred scrim, safe-area aware scrolling,
 * and a raised ocean-glass card that remains usable on short screens/large text.
 */
export function ModalFrame({
  visible,
  onDismiss,
  progress,
  cardAnimatedStyle,
  cardStyle,
  accentColor,
  dismissOnBackdropPress = true,
  children
}: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value
  }));

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          {Platform.OS === "ios" && (
            <BlurView
              intensity={38}
              tint="dark"
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
          )}
          <View style={[StyleSheet.absoluteFill, styles.backdrop]} />
        </Animated.View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          overScrollMode="never"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            style={[
              styles.center,
              {
                paddingTop: Math.max(insets.top, t.spacing[6]),
                paddingBottom: Math.max(insets.bottom, t.spacing[6])
              },
            ]}
            onPress={dismissOnBackdropPress ? onDismiss : undefined}
            accessible={false}
          >
            <Pressable
              style={styles.cardPressTarget}
              onPress={() => {}}
              accessible={false}
            >
              <Animated.View
                style={[
                  styles.card,
                  accentColor && {
                    borderColor: accentColor,
                    shadowColor: accentColor
                  },
                  cardStyle,
                  cardAnimatedStyle
                ]}
              >
                {children}
              </Animated.View>
            </Pressable>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    backdrop: {
      backgroundColor: t.surfaces.scrim
    },
    scroll: {
      flex: 1
    },
    scrollContent: {
      flexGrow: 1
    },
    center: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: t.spacing[5]
    },
    cardPressTarget: {
      width: "100%",
      maxWidth: 380,
      alignItems: "center"
    },
    card: {
      width: "100%",
      maxWidth: 380,
      borderRadius: t.radii.xl,
      backgroundColor: t.colors.surfaceElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.borderStrong,
      shadowColor: t.colors.accent,
      shadowOpacity: 0.22,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 24,
      overflow: "hidden"
    }
  });
