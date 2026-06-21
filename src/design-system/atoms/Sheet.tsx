import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef
} from "react";
import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps
} from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import type { AppTheme } from "../themes";

const SHEET_BLUR_INTENSITY = 82;
const BACKDROP_BLUR_INTENSITY = 18;
const SHEET_MAX_HEIGHT_RATIO = 0.94;
const HANDLE_WIDTH = 48;
const HANDLE_HEIGHT = 5;

export type SheetHandle = {
  present: () => void;
  dismiss: () => void;
};

type Props = {
  /** Controlled visibility. */
  visible: boolean;
  /** Called when user dismisses (drag down / backdrop tap / back button). */
  onDismiss: () => void;
  /** Snap points as percentages or fixed numbers (default: ["auto"]). */
  snapPoints?: readonly (string | number)[];
  /** Show the top drag handle? Default true. */
  showHandle?: boolean;
  /** Disable internal padding (caller renders own). */
  noPadding?: boolean;
  /** Let the sheet drag gesture start from its content. Disable for nested pickers. */
  enableContentPanningGesture?: boolean;
  /** Whether tapping the backdrop dismisses this sheet. */
  dismissOnBackdropPress?: boolean;
  children: React.ReactNode;
};

/**
 * Sheet — single source of truth for modal bottom sheets across the app.
 * Wraps `@gorhom/bottom-sheet` BottomSheetModal with a themed blurred chrome.
 *
 * Smoother than the previous Modal+spring approach because gorhom drives the
 * gesture + spring on the UI thread end-to-end (no Modal mount lag).
 */
export const Sheet = forwardRef<SheetHandle, Props>(function Sheet(
  {
    visible,
    onDismiss,
    snapPoints,
    showHandle = true,
    noPadding = false,
    enableContentPanningGesture = true,
    dismissOnBackdropPress = true,
    children
  },
  ref
) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const modalRef = useRef<BottomSheetModal>(null);
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Track whether the sheet is currently "mounted/presented" from our side.
  // This lets us skip calling dismiss() when gorhom already dismissed it via
  // a user gesture — that double-dismiss corrupts the internal state machine
  // and prevents subsequent present() calls from working.
  const isPresentedRef = useRef(false);

  const points = useMemo(
    () =>
      snapPoints && snapPoints.length > 0
        ? ([...snapPoints] as (string | number)[])
        : undefined,
    [snapPoints]
  );

  useImperativeHandle(
    ref,
    () => ({
      present: () => modalRef.current?.present(),
      dismiss: () => modalRef.current?.dismiss()
    }),
    []
  );

  useEffect(() => {
    if (visible && !isPresentedRef.current) {
      isPresentedRef.current = true;
      // Small rAF so the modal has had one render cycle to register with the
      // BottomSheetModalProvider portal before we call present().
      requestAnimationFrame(() => {
        modalRef.current?.present();
      });
    } else if (!visible && isPresentedRef.current) {
      isPresentedRef.current = false;
      modalRef.current?.dismiss();
    }
  }, [visible]);

  const handleDismiss = useCallback(() => {
    // User dismissed via gesture/backdrop — mark as not presented BEFORE
    // calling onDismiss so the effect above skips the redundant dismiss().
    isPresentedRef.current = false;
    onDismiss();
  }, [onDismiss]);

  const renderBackdrop = useCallback(
    (p: BottomSheetBackdropProps) => (
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {Platform.OS === "ios" && (
          <BlurView
            intensity={BACKDROP_BLUR_INTENSITY}
            tint="dark"
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        )}
        <BottomSheetBackdrop
          {...p}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.78}
          pressBehavior={dismissOnBackdropPress ? "close" : "none"}
        />
      </View>
    ),
    [dismissOnBackdropPress]
  );

  return (
    <BottomSheetModal
      ref={modalRef}
      style={styles.sheet}
      snapPoints={points}
      enableDynamicSizing={!points}
      maxDynamicContentSize={Math.min(
        screenHeight * SHEET_MAX_HEIGHT_RATIO,
        screenHeight - insets.top - t.spacing[3]
      )}
      topInset={insets.top}
      enablePanDownToClose
      enableContentPanningGesture={enableContentPanningGesture}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      handleComponent={
        showHandle
          ? () => (
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>
            )
          : null
      }
      backgroundComponent={({ style }) => (
        <View style={[style, styles.backgroundFrame]}>
          <View style={styles.bg}>
            <BlurView
              intensity={SHEET_BLUR_INTENSITY}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={[
                t.colors.surfaceElevated,
                t.colors.panelStrong,
                t.colors.surface
              ]}
              locations={[0, 0.42, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.bgTint} pointerEvents="none" />
            <View style={styles.bgEdge} pointerEvents="none" />
          </View>
        </View>
      )}
    >
      <BottomSheetView
        style={
          noPadding
            ? undefined
            : [
                styles.content,
                {
                  paddingBottom: Math.max(insets.bottom, t.spacing[6])
                }
              ]
        }
      >
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    sheet: {
      borderTopLeftRadius: t.radii.xl,
      borderTopRightRadius: t.radii.xl,
      shadowColor: t.colors.accent,
      shadowOpacity: t.shadows.glow.opacity,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: -4 },
      elevation: 24
    },
    backgroundFrame: {
      borderTopLeftRadius: t.radii.xl,
      borderTopRightRadius: t.radii.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: 0,
      borderColor: t.colors.borderStrong,
      backgroundColor: t.colors.surfaceElevated,
      overflow: "hidden"
    },
    bg: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      borderTopLeftRadius: t.radii.xl,
      borderTopRightRadius: t.radii.xl,
      overflow: "hidden"
    },
    bgTint: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: t.colors.panelTint
    },
    bgEdge: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: StyleSheet.hairlineWidth,
      backgroundColor: t.colors.glassEdge
    },
    handleContainer: {
      alignItems: "center",
      paddingTop: t.spacing[3],
      paddingBottom: t.spacing[1]
    },
    handle: {
      width: HANDLE_WIDTH,
      height: HANDLE_HEIGHT,
      borderRadius: HANDLE_HEIGHT / 2,
      backgroundColor: t.colors.textMuted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.glassEdge,
      shadowColor: t.colors.accent,
      shadowOpacity: 0.24,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 0 }
    },
    content: {
      paddingHorizontal: t.spacing[6],
      paddingTop: t.spacing[4],
      paddingBottom: t.spacing[6]
    }
  });
