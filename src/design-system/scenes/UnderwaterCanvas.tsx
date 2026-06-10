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
  seed: number;
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
    const salt = cfg.randomize ? Math.random() * 10000 : themeSeed(t.id, zone);
    for (let i = 0; i < count; i++) {
      const rx = rand(i, salt, 1);
      const ry = rand(i, salt, 2);
      const rr = rand(i, salt, 3);
      const rs = rand(i, salt, 4);
      const rp = rand(i, salt, 5);
      const clusteredX =
        width * 0.5 + (rx - 0.5) * width * (cfg.scatter === "clustered" ? 0.62 : 1);
      const bandY =
        Math.floor(ry * 4) * (height / 4) + rand(i, salt, 6) * (height / 8);
      out.push({
        x:
          cfg.scatter === "clustered"
            ? Math.max(0, Math.min(width, clusteredX))
            : rx * width,
        baseY: cfg.scatter === "bands" ? bandY % height : ry * height,
        r: cfg.size[0] + rr * (cfg.size[1] - cfg.size[0]),
        speed: cfg.speed * (0.6 + rs * 0.9),
        phase: rp * Math.PI * 2,
        hue: cfg.hues[i % cfg.hues.length] ?? cfg.hues[0]!,
        seed: rand(i, salt, 7)
      });
    }
    return out;
  }, [
    count,
    width,
    height,
    cfg.size,
    cfg.speed,
    cfg.hues,
    cfg.randomize,
    cfg.scatter,
    t.id,
    zone
  ]);

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
        : style === "plankton"
          ? (Math.sin(t.value * Math.PI * 2 + p.phase) +
              Math.cos(t.value * Math.PI * 5 + p.seed * 8)) *
            drift *
            0.55
          : style === "shards"
            ? Math.sin(t.value * Math.PI * 6 + p.phase) * drift * 0.45
            : style === "rays"
              ? Math.sin(t.value * Math.PI + p.phase) * drift * 0.35
        : Math.sin(t.value * Math.PI * 2 + p.phase) * drift;
    return (p.x + sway + width) % width;
  });

  const cy = useDerivedValue(() => {
    "worklet";
    const dir = style === "snow" || style === "silt" ? 1 : -1;
    const speedScalar =
      style === "bubbles" || style === "embers"
        ? 1.6
        : style === "rays"
          ? 0.35
          : style === "plankton"
            ? 0.55 + p.seed * 0.5
            : style === "shards"
              ? 1.9
              : 1.0;
    const y =
      p.baseY + (dir * t.value * 14000 * (p.speed * speedScalar)) / 1000;
    return ((y % height) + height) % height;
  });

  const opacity = useDerivedValue(() => {
    "worklet";
    const base =
      style === "embers" || style === "shards"
        ? 0.55
        : style === "rays"
          ? 0.28
          : style === "silt"
            ? 0.34
            : 0.45;
    const pulseSpeed = style === "plankton" ? 5 : style === "shards" ? 4 : 2;
    return base + 0.35 * Math.sin(t.value * Math.PI * pulseSpeed + p.phase);
  });

  return <Circle cx={cx} cy={cy} r={p.r} color={p.hue} opacity={opacity} />;
}

function themeSeed(id: string, zone: OceanZone): number {
  let out = 0;
  const source = `${id}:${zone}`;
  for (let i = 0; i < source.length; i++) {
    out = (Math.imul(out, 31) + source.charCodeAt(i)) >>> 0;
  }
  return out / 1000;
}

function rand(index: number, salt: number, channel: number): number {
  const x = Math.sin(index * 127.1 + salt * 311.7 + channel * 74.7) * 43758.5453;
  return x - Math.floor(x);
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
