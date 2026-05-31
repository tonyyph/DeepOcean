import React from "react";
import { View, ViewProps, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../useTheme";

export type GlassCardProps = ViewProps & {
  intensity?: number;
  tint?: "dark" | "light";
  glow?: boolean;
  radius?: number;
  /** Inner padding override (defaults to spacing[5]). */
  padding?: number;
};

/**
 * GlassCard — translucent glassmorphism card with theme-aware accent edge.
 * Reads `useTheme()` so it auto-restyles on theme switch.
 */
export const GlassCard = React.memo(function GlassCard({
  intensity = 22,
  tint = "dark",
  glow = false,
  radius,
  padding,
  style,
  children,
  ...rest
}: GlassCardProps) {
  const t = useTheme();
  const r = radius ?? t.radii.xl;
  const p = padding ?? t.spacing[3.5];

  const content = (
    <>
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0.02)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: r,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: t.colors.glassEdge
          }
        ]}
      />
    </>
  );

  return (
    <View
      style={[
        containerStyle,
        {
          borderRadius: r,
          shadowColor: glow ? t.colors.accent : "#000",
          shadowOpacity: glow ? 0.35 : 0.22,
          shadowRadius: glow ? 10 : 8,
          shadowOffset: { width: 0, height: glow ? 0 : 6 }
        },
        style
      ]}
      {...rest}
    >
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={intensity}
          tint={tint}
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: r, overflow: "hidden" }
          ]}
        >
          {content}
        </BlurView>
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: r,
              overflow: "hidden",
              backgroundColor: t.colors.surface
            }
          ]}
        >
          {content}
        </View>
      )}
      <View style={{ padding: p }}>{children}</View>
    </View>
  );
});

const containerStyle = {
  overflow: "visible" as const,
  backgroundColor: "transparent" as const
};
