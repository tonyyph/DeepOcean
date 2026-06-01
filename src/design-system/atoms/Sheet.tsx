import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef
} from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps
} from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";
import type { AppTheme } from "../themes";

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
    children
  },
  ref
) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const modalRef = useRef<BottomSheetModal>(null);
  const { height: screenHeight } = useWindowDimensions();

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
      <BottomSheetBackdrop
        {...p}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.65}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={points}
      enableDynamicSizing={!points}
      maxDynamicContentSize={screenHeight * 0.92}
      enablePanDownToClose
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
        <View style={[style, styles.bg]}>
          <BlurView
            intensity={70}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={[t.colors.surfaceElevated, t.colors.surface]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.bgEdge} pointerEvents="none" />
        </View>
      )}
    >
      <BottomSheetView style={noPadding ? undefined : styles.content}>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    bg: {
      borderTopLeftRadius: t.radii["lg"],
      borderTopRightRadius: t.radii["lg"],
      overflow: "hidden"
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
      paddingTop: t.spacing[3]
    },
    handle: {
      width: 42,
      height: 4,
      borderRadius: 2,
      backgroundColor: "rgba(255, 255, 255, 0.139)"
    },
    content: {
      paddingHorizontal: t.spacing[6],
      paddingTop: t.spacing[4],
      paddingBottom: t.spacing[8]
    }
  });
