import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, View, ViewProps } from "react-native";
import { useTheme } from "../useTheme";

export type GlassCardProps = ViewProps & {
  intensity?: number;
  tint?: "dark" | "light";
  blur?: boolean;
  glow?: boolean;
  radius?: number;
  /** Inner padding override (defaults to spacing[4] = 16). */
  padding?: number;
};

/**
 * GlassCard — translucent glassmorphism card with theme-aware accent edge.
 * Reads `useTheme()` so it auto-restyles on theme switch.
 */
export const GlassCard = React.memo(function GlassCard({
  intensity = 6,
  tint = "dark",
  blur = true,
  glow = false,
  radius,
  padding,
  style,
  children,
  ...rest
}: GlassCardProps) {
  const t = useTheme();
  const r = radius ?? t.radii.md;
  const p = padding ?? t.spacing[4];

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
      {/* Soft color bloom from the active theme, kept quiet for night readability. */}
      <LinearGradient
        pointerEvents="none"
        colors={[t.colors.panelTint, t.surfaces.glassSpecularLow]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Diagonal specular streak so the surface reads as glass, not a flat card. */}
      <LinearGradient
        pointerEvents="none"
        colors={[
          t.surfaces.glassSpecularLow,
          t.surfaces.glassSpecularMid,
          t.surfaces.glassSpecularHigh
        ]}
        locations={[0, 0.38, 0.72]}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Subtle lower absorption gives the material thickness and depth. */}
      <LinearGradient
        pointerEvents="none"
        colors={["transparent", t.surfaces.absorption]}
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
            backgroundColor: t.surfaces.glassHighlight
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
            backgroundColor: t.surfaces.glassHighlightSoft
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
          shadowColor: glow ? t.colors.accent : t.shadows.card.color,
          shadowOpacity: glow ? t.shadows.glow.opacity : t.shadows.card.opacity,
          shadowRadius: glow ? t.shadows.glow.radius : t.shadows.card.radius,
          shadowOffset: {
            width: 0,
            height: glow ? t.shadows.glow.offsetY : t.shadows.card.offsetY
          }
        },
        style
      ]}
      {...rest}
    >
      {Platform.OS === "ios" && blur ? (
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
    opacity: 0.58
  },
  content: {
    position: "relative",
    zIndex: 1
  }
});
