import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, View, ViewProps } from "react-native";
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
  intensity = 10,
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
      {/* Dense tinted glass body: keeps text readable over vivid zone gradients. */}
      <LinearGradient
        pointerEvents="none"
        colors={[t.colors.panelStrong, t.colors.panel]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Soft color bloom from the active theme, like light caught inside glass. */}
      <LinearGradient
        pointerEvents="none"
        colors={[t.colors.panelTint, "rgba(255,255,255,0.015)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Diagonal specular streak so the surface reads as glass, not a flat card. */}
      <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(255,255,255,0.015)",
          "rgba(255,255,255,0.055)",
          "rgba(255,255,255,0.075)"
        ]}
        locations={[0, 0.38, 0.72]}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Subtle lower absorption gives the material thickness and depth. */}
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.18)"]}
        locations={[0.58, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, styles.absorption]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.topHighlight,
          {
            borderTopLeftRadius: r,
            borderTopRightRadius: r,
            backgroundColor: "rgba(255,255,255,0.11)"
          }
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.leftHighlight,
          {
            borderTopLeftRadius: r,
            borderBottomLeftRadius: r,
            backgroundColor: "rgba(255,255,255,0.055)"
          }
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: r,
            borderWidth: 1,
            borderColor: t.colors.panelEdge
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
          shadowOpacity: glow ? 0.24 : 0.15,
          shadowRadius: glow ? 10 : 10,
          shadowOffset: { width: 0, height: glow ? 0 : 8 }
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
              backgroundColor: t.colors.panelStrong
            }
          ]}
        >
          {content}
        </View>
      )}
      <View style={[styles.content, { padding: p }]}>{children}</View>
    </View>
  );
});

const containerStyle = {
  overflow: "visible" as const,
  backgroundColor: "transparent" as const
};

const styles = StyleSheet.create({
  topHighlight: {
    position: "absolute",
    top: 0,
    left: 1,
    right: 1,
    height: StyleSheet.hairlineWidth
  },
  leftHighlight: {
    position: "absolute",
    top: 1,
    bottom: 1,
    left: 0,
    width: StyleSheet.hairlineWidth
  },
  absorption: {
    opacity: 0.42
  },
  content: {
    position: "relative",
    zIndex: 1
  }
});
