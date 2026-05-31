import React, { useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Circle,
  Group,
  Blur,
  RadialGradient,
  vec,
  Fill
} from "@shopify/react-native-skia";
import {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  useDerivedValue
} from "react-native-reanimated";
import { useTheme } from "@/design-system/useTheme";
import { useSettings } from "@/stores";
import type { OceanZone } from "@/features/ocean/zones";
import { ZONE_TABLE } from "@/features/ocean/zones";
import type { ParticleStyle, ThemeParticles } from "@/design-system/themes";

type Props = {
  zone: OceanZone;
  /** Override particle count (defaults to theme.particles.count). */
  particleCount?: number;
};

type Particle = {
  x: number;
  baseY: number;
  r: number;
  speed: number;
  phase: number;
  hue: string;
};

/**
 * UnderwaterCanvas — ambient Skia particle field. Every visual property
 * (count, hue, style, blur, speed) is pulled from `theme.particles`,
 * so swapping theme produces a visibly different atmosphere automatically.
 *
 * Performance:
 *  - One shared time value drives all particles via useDerivedValue (UI thread).
 *  - Defaults are tuned per-theme for mid-tier Android headroom.
 *  - Honors `settings.reducedMotion` — when enabled, particles are static.
 */
export const UnderwaterCanvas = React.memo(function UnderwaterCanvas({
  zone,
  particleCount
}: Props) {
  const t = useTheme();
  const reducedMotion = useSettings((s) => s.reducedMotion);
  const { width, height } = useWindowDimensions();
  const time = useSharedValue(0);
  const light = ZONE_TABLE[zone].light;
  const cfg = t.particles;
  const count = particleCount ?? cfg.count;

  useEffect(() => {
    if (reducedMotion) {
      time.value = 0.5;
      return;
    }
    time.value = 0;
    time.value = withRepeat(
      withTiming(1, { duration: cfg.loopMs, easing: Easing.linear }),
      -1,
      false
    );
  }, [time, cfg.loopMs, reducedMotion]);

  const particles = useMemo<Particle[]>(() => {
    const out: Particle[] = [];
    for (let i = 0; i < count; i++) {
      out.push({
        x: Math.random() * width,
        baseY: Math.random() * height,
        r: cfg.size[0] + Math.random() * (cfg.size[1] - cfg.size[0]),
        speed: cfg.speed * (0.6 + Math.random() * 0.9),
        phase: Math.random() * Math.PI * 2,
        hue: cfg.hues[i % cfg.hues.length] ?? cfg.hues[0]!
      });
    }
    return out;
  }, [count, width, height, cfg.size, cfg.speed, cfg.hues]);

  // Vignette intensity scales softly with zone light level.
  const lightAdjustedVignette = useMemo(() => {
    const [c0, c1, c2] = cfg.vignette;
    return [c0, c1, c2, "rgba(0,0,0,0.96)"] as const;
  }, [cfg.vignette]);
  void lightAdjustedVignette; // future use; keep linter calm

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Fill>
        <RadialGradient
          c={vec(width / 2, height * 0.35)}
          r={Math.max(width, height) * 0.95}
          colors={[
            applyAlphaScale(cfg.vignette[0], light),
            cfg.vignette[1],
            cfg.vignette[2]
          ]}
        />
      </Fill>

      <Group opacity={cfg.opacity}>
        <Blur blur={cfg.blur} />
        {particles.map((p, i) => (
          <ParticleDot
            key={i}
            p={p}
            t={time}
            height={height}
            width={width}
            style={cfg.style}
            drift={cfg.drift}
          />
        ))}
      </Group>
    </Canvas>
  );
});

function ParticleDot({
  p,
  t,
  height,
  width,
  style,
  drift
}: {
  p: Particle;
  t: ReturnType<typeof useSharedValue<number>>;
  height: number;
  width: number;
  style: ParticleStyle;
  drift: number;
}) {
  const cx = useDerivedValue(() => {
    "worklet";
    const sway =
      style === "petals"
        ? Math.sin(t.value * Math.PI * 4 + p.phase) * drift
        : Math.sin(t.value * Math.PI * 2 + p.phase) * drift;
    return (p.x + sway + width) % width;
  });

  const cy = useDerivedValue(() => {
    "worklet";
    const dir = style === "snow" ? 1 : -1; // snow falls down; everything else rises
    const speedScalar = style === "bubbles" || style === "embers" ? 1.6 : 1.0;
    const y =
      p.baseY + (dir * t.value * 14000 * (p.speed * speedScalar)) / 1000;
    return ((y % height) + height) % height;
  });

  const opacity = useDerivedValue(() => {
    "worklet";
    const base = style === "embers" ? 0.55 : 0.45;
    return base + 0.35 * Math.sin(t.value * Math.PI * 2 + p.phase);
  });

  return <Circle cx={cx} cy={cy} r={p.r} color={p.hue} opacity={opacity} />;
}

/** Scale the alpha channel of an rgba(...) string by `factor` (clamped). */
function applyAlphaScale(rgba: string, factor: number): string {
  const m = rgba.match(/rgba?\(([^)]+)\)/i);
  if (!m) return rgba;
  const parts = m[1]!.split(",").map((s) => s.trim());
  const [r, g, b] = parts;
  const aRaw = parts[3] ?? "1";
  const a = Math.max(0, Math.min(1, parseFloat(aRaw) * (0.4 + 0.6 * factor)));
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

// Re-export for convenience (keeps existing imports working).
export type { ThemeParticles };
