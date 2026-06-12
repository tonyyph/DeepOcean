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

type Motif = {
  x: number;
  y: number;
  r: number;
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

  const motifs = useMemo<Motif[]>(() => {
    const out: Motif[] = [];
    const motifCount = motifCountForEffect(cfg.effect);
    const salt = themeSeed(`${t.id}:motif`, zone);
    for (let i = 0; i < motifCount; i++) {
      const rx = rand(i, salt, 11);
      const ry = rand(i, salt, 12);
      const rr = rand(i, salt, 13);
      const rp = rand(i, salt, 14);
      out.push({
        x: rx * width,
        y: ry * height,
        r: motifRadiusForEffect(cfg.effect, rr),
        phase: rp * Math.PI * 2,
        hue: cfg.hues[i % cfg.hues.length] ?? cfg.hues[0]!,
        seed: rand(i, salt, 15)
      });
    }
    return out;
  }, [cfg.effect, cfg.hues, height, t.id, width, zone]);

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

      <ElementAura
        effect={cfg.effect}
        hues={cfg.hues}
        t={time}
        width={width}
        height={height}
        light={light}
      />

      <ElementMotifs
        effect={cfg.effect}
        motifs={motifs}
        t={time}
        width={width}
        height={height}
        light={light}
      />

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
            effect={cfg.effect}
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
  effect,
  drift
}: {
  p: Particle;
  t: ReturnType<typeof useSharedValue<number>>;
  height: number;
  width: number;
  style: ParticleStyle;
  effect: ThemeParticles["effect"];
  drift: number;
}) {
  const cx = useDerivedValue(() => {
    "worklet";
    const elementSway =
      effect === "air"
        ? Math.sin(t.value * Math.PI * 6 + p.phase) * drift * 0.75
        : effect === "storm"
          ? Math.sin(t.value * Math.PI * 10 + p.seed * 12) * drift * 0.5
          : effect === "dark"
            ? Math.cos(t.value * Math.PI * 3 + p.phase) * drift * 0.32
            : 0;
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
    return (p.x + sway + elementSway + width) % width;
  });

  const cy = useDerivedValue(() => {
    "worklet";
    const dir =
      effect === "magma" || effect === "ice" || style === "snow" || style === "silt"
        ? 1
        : -1;
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
    const elementSpeed =
      effect === "fire"
        ? 1.28
        : effect === "water"
          ? 0.82 + 0.25 * Math.sin(t.value * Math.PI * 2 + p.phase)
          : effect === "storm"
            ? 1.45
            : effect === "nature"
              ? 0.72 + p.seed * 0.42
              : effect === "mystic"
                ? 0.68 + 0.35 * Math.cos(t.value * Math.PI * 4 + p.seed)
                : 1;
    const y =
      p.baseY +
      (dir * t.value * 14000 * (p.speed * speedScalar * elementSpeed)) / 1000;
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
    const pulseSpeed =
      effect === "storm"
        ? 8
        : effect === "fire"
          ? 4
          : effect === "mystic"
            ? 3
            : style === "plankton"
              ? 5
              : style === "shards"
                ? 4
                : 2;
    const effectBoost =
      effect === "light"
        ? 0.1
        : effect === "dark"
          ? -0.08
          : effect === "ice"
            ? -0.03
            : 0;
    return Math.max(
      0.08,
      base + effectBoost + 0.35 * Math.sin(t.value * Math.PI * pulseSpeed + p.phase)
    );
  });

  return <Circle cx={cx} cy={cy} r={p.r} color={p.hue} opacity={opacity} />;
}

function ElementAura({
  effect,
  hues,
  t,
  width,
  height,
  light
}: {
  effect: ThemeParticles["effect"];
  hues: readonly string[];
  t: ReturnType<typeof useSharedValue<number>>;
  width: number;
  height: number;
  light: number;
}) {
  const primary = hues[0] ?? "#22E4FF";
  const secondary = hues[1] ?? primary;
  const tertiary = hues[2] ?? secondary;
  const profile = auraProfile(effect, width, height);

  const opacity = useDerivedValue(() => {
    "worklet";
    const pulse =
      effect === "storm"
        ? Math.abs(Math.sin(t.value * Math.PI * 12))
        : effect === "fire" || effect === "magma"
          ? 0.5 + 0.5 * Math.sin(t.value * Math.PI * 4)
          : effect === "dark"
            ? 0.55 + 0.45 * Math.cos(t.value * Math.PI * 2)
            : 0.5 + 0.5 * Math.sin(t.value * Math.PI * 2);
    return profile.opacity * (0.65 + 0.35 * pulse) * (0.45 + 0.55 * light);
  });

  const radius = useDerivedValue(() => {
    "worklet";
    const pulse = 0.92 + 0.08 * Math.sin(t.value * Math.PI * profile.pulse);
    return profile.radius * pulse;
  });

  return (
    <Group opacity={opacity}>
      <Blur blur={profile.blur} />
      <Circle
        cx={profile.cx}
        cy={profile.cy}
        r={radius}
        color={primary}
        opacity={profile.primaryAlpha}
      />
      <Circle
        cx={profile.cx2}
        cy={profile.cy2}
        r={profile.radius * 0.62}
        color={secondary}
        opacity={profile.secondaryAlpha}
      />
      <Circle
        cx={profile.cx3}
        cy={profile.cy3}
        r={profile.radius * 0.38}
        color={tertiary}
        opacity={profile.tertiaryAlpha}
      />
    </Group>
  );
}

function ElementMotifs({
  effect,
  motifs,
  t,
  width,
  height,
  light
}: {
  effect: ThemeParticles["effect"];
  motifs: readonly Motif[];
  t: ReturnType<typeof useSharedValue<number>>;
  width: number;
  height: number;
  light: number;
}) {
  return (
    <Group opacity={0.55 + light * 0.25}>
      <Blur blur={motifBlurForEffect(effect)} />
      {motifs.map((motif, index) => (
        <MotifDot
          key={index}
          effect={effect}
          motif={motif}
          t={t}
          width={width}
          height={height}
          index={index}
        />
      ))}
    </Group>
  );
}

function MotifDot({
  effect,
  motif,
  t,
  width,
  height,
  index
}: {
  effect: ThemeParticles["effect"];
  motif: Motif;
  t: ReturnType<typeof useSharedValue<number>>;
  width: number;
  height: number;
  index: number;
}) {
  const pulseRate = pulseForEffect(effect);

  const cx = useDerivedValue(() => {
    "worklet";
    const u = (t.value + motif.seed) % 1;
    if (effect === "light") {
      return width * (0.18 + 0.64 * motif.seed) + Math.sin(t.value * Math.PI * 2 + motif.phase) * 16;
    }
    if (effect === "fire") {
      return width * 0.5 + Math.sin(u * Math.PI * 5 + motif.phase) * width * 0.22;
    }
    if (effect === "water") {
      return (motif.x + Math.sin(t.value * Math.PI * 2 + motif.phase) * 34 + width) % width;
    }
    if (effect === "air") {
      return (u * width * 1.35 - width * 0.18 + index * 18) % width;
    }
    if (effect === "nature") {
      const orbit = motif.r * 8 + 22;
      return width * 0.5 + Math.cos(t.value * Math.PI * 2 + motif.phase) * orbit + (motif.seed - 0.5) * width * 0.28;
    }
    if (effect === "ice") {
      return motif.x + Math.sin(t.value * Math.PI + motif.phase) * 8;
    }
    if (effect === "storm") {
      const step = Math.floor(((t.value + motif.seed) % 1) * 5);
      return (motif.x + step * width * 0.11 + Math.sin(step + motif.phase) * 22) % width;
    }
    if (effect === "magma") {
      return width * 0.5 + (motif.seed - 0.5) * width * 0.72 + Math.sin(t.value * Math.PI * 2 + motif.phase) * 10;
    }
    if (effect === "mystic") {
      const orbit = width * (0.14 + motif.seed * 0.08);
      return width * 0.5 + Math.cos(t.value * Math.PI * 2.4 + motif.phase) * orbit;
    }
    const orbit = width * (0.18 + motif.seed * 0.06);
    return width * 0.5 + Math.cos(t.value * Math.PI * 1.4 + motif.phase) * orbit;
  });

  const cy = useDerivedValue(() => {
    "worklet";
    const u = (t.value + motif.seed) % 1;
    if (effect === "light") {
      return (height * -0.15 + u * height * 1.25 + index * 28) % height;
    }
    if (effect === "fire") {
      return height * 1.05 - u * height * 0.92;
    }
    if (effect === "water") {
      return (motif.y - u * height * 0.24 + Math.cos(t.value * Math.PI * 3 + motif.phase) * 24 + height) % height;
    }
    if (effect === "air") {
      return motif.y + Math.sin(t.value * Math.PI * 4 + motif.phase) * 46;
    }
    if (effect === "nature") {
      const orbit = motif.r * 6 + 18;
      return height * 0.58 + Math.sin(t.value * Math.PI * 2 + motif.phase) * orbit + (motif.seed - 0.5) * height * 0.34;
    }
    if (effect === "ice") {
      return (motif.y + u * height * 0.32 + index * 20) % height;
    }
    if (effect === "storm") {
      const step = Math.floor(((t.value + motif.seed) % 1) * 6);
      return (motif.y + step * height * 0.12 + Math.cos(step + motif.phase) * 26) % height;
    }
    if (effect === "magma") {
      return height * 0.95 - u * height * 0.38 + Math.sin(t.value * Math.PI * 3 + motif.phase) * 8;
    }
    if (effect === "mystic") {
      const orbit = height * (0.1 + motif.seed * 0.06);
      return height * 0.5 + Math.sin(t.value * Math.PI * 2.4 + motif.phase) * orbit;
    }
    const orbit = height * (0.12 + motif.seed * 0.04);
    return height * 0.48 + Math.sin(t.value * Math.PI * 1.4 + motif.phase) * orbit;
  });

  const radius = useDerivedValue(() => {
    "worklet";
    const pulse = Math.sin(t.value * Math.PI * pulseRate + motif.phase);
    if (effect === "light") return motif.r * (1.1 + Math.max(0, pulse) * 1.2);
    if (effect === "fire") return motif.r * (0.8 + Math.max(0, pulse) * 1.7);
    if (effect === "ice") return motif.r * (0.75 + Math.abs(pulse) * 0.35);
    if (effect === "storm") return motif.r * (0.5 + Math.abs(pulse) * 2.2);
    if (effect === "dark") return motif.r * (1.2 + Math.max(0, -pulse) * 1.3);
    return motif.r * (0.9 + Math.max(0, pulse) * 0.9);
  });

  const opacity = useDerivedValue(() => {
    "worklet";
    const pulse = Math.sin(t.value * Math.PI * pulseRate + motif.phase);
    const base =
      effect === "storm"
        ? 0.18 + Math.abs(pulse) * 0.74
        : effect === "dark"
          ? 0.2 + Math.max(0, -pulse) * 0.45
          : effect === "ice"
            ? 0.24 + Math.abs(pulse) * 0.28
            : 0.22 + Math.max(0, pulse) * 0.48;
    return Math.max(0.08, Math.min(0.92, base));
  });

  return (
    <Circle
      cx={cx}
      cy={cy}
      r={radius}
      color={motif.hue}
      opacity={opacity}
    />
  );
}

function auraProfile(effect: ThemeParticles["effect"], width: number, height: number) {
  const baseRadius = Math.max(width, height);
  switch (effect) {
    case "light":
      return {
        cx: width * 0.5,
        cy: height * 0.08,
        cx2: width * 0.18,
        cy2: height * 0.22,
        cx3: width * 0.82,
        cy3: height * 0.2,
        radius: baseRadius * 0.78,
        blur: 34,
        opacity: 0.42,
        pulse: 2,
        primaryAlpha: 0.28,
        secondaryAlpha: 0.18,
        tertiaryAlpha: 0.14
      };
    case "fire":
      return {
        cx: width * 0.5,
        cy: height * 1.04,
        cx2: width * 0.22,
        cy2: height * 0.84,
        cx3: width * 0.78,
        cy3: height * 0.76,
        radius: baseRadius * 0.72,
        blur: 30,
        opacity: 0.5,
        pulse: 4,
        primaryAlpha: 0.28,
        secondaryAlpha: 0.2,
        tertiaryAlpha: 0.16
      };
    case "water":
      return {
        cx: width * 0.5,
        cy: height * 0.48,
        cx2: width * 0.1,
        cy2: height * 0.42,
        cx3: width * 0.9,
        cy3: height * 0.62,
        radius: baseRadius * 0.7,
        blur: 28,
        opacity: 0.36,
        pulse: 2,
        primaryAlpha: 0.22,
        secondaryAlpha: 0.18,
        tertiaryAlpha: 0.12
      };
    case "air":
      return {
        cx: width * -0.05,
        cy: height * 0.36,
        cx2: width * 1.05,
        cy2: height * 0.58,
        cx3: width * 0.5,
        cy3: height * 0.18,
        radius: baseRadius * 0.66,
        blur: 36,
        opacity: 0.3,
        pulse: 3,
        primaryAlpha: 0.2,
        secondaryAlpha: 0.15,
        tertiaryAlpha: 0.12
      };
    case "nature":
      return {
        cx: width * 0.5,
        cy: height * 0.74,
        cx2: width * 0.25,
        cy2: height * 0.5,
        cx3: width * 0.78,
        cy3: height * 0.42,
        radius: baseRadius * 0.68,
        blur: 30,
        opacity: 0.38,
        pulse: 3,
        primaryAlpha: 0.24,
        secondaryAlpha: 0.18,
        tertiaryAlpha: 0.13
      };
    case "ice":
      return {
        cx: width * 0.5,
        cy: height * 0.14,
        cx2: width * 0.8,
        cy2: height * 0.4,
        cx3: width * 0.2,
        cy3: height * 0.58,
        radius: baseRadius * 0.58,
        blur: 24,
        opacity: 0.32,
        pulse: 2,
        primaryAlpha: 0.18,
        secondaryAlpha: 0.16,
        tertiaryAlpha: 0.12
      };
    case "storm":
      return {
        cx: width * 0.5,
        cy: height * 0.1,
        cx2: width * 0.22,
        cy2: height * 0.34,
        cx3: width * 0.78,
        cy3: height * 0.54,
        radius: baseRadius * 0.62,
        blur: 22,
        opacity: 0.48,
        pulse: 10,
        primaryAlpha: 0.25,
        secondaryAlpha: 0.22,
        tertiaryAlpha: 0.14
      };
    case "magma":
      return {
        cx: width * 0.5,
        cy: height * 1.08,
        cx2: width * 0.15,
        cy2: height * 0.9,
        cx3: width * 0.85,
        cy3: height * 0.86,
        radius: baseRadius * 0.78,
        blur: 38,
        opacity: 0.48,
        pulse: 3,
        primaryAlpha: 0.3,
        secondaryAlpha: 0.18,
        tertiaryAlpha: 0.16
      };
    case "mystic":
      return {
        cx: width * 0.5,
        cy: height * 0.46,
        cx2: width * 0.72,
        cy2: height * 0.28,
        cx3: width * 0.28,
        cy3: height * 0.68,
        radius: baseRadius * 0.64,
        blur: 34,
        opacity: 0.34,
        pulse: 4,
        primaryAlpha: 0.22,
        secondaryAlpha: 0.2,
        tertiaryAlpha: 0.12
      };
    case "dark":
      return {
        cx: width * 0.5,
        cy: height * 0.52,
        cx2: width * 0.5,
        cy2: height * 0.98,
        cx3: width * 0.5,
        cy3: height * 0.06,
        radius: baseRadius * 0.6,
        blur: 32,
        opacity: 0.44,
        pulse: 2,
        primaryAlpha: 0.2,
        secondaryAlpha: 0.18,
        tertiaryAlpha: 0.1
      };
  }
}

function motifCountForEffect(effect: ThemeParticles["effect"]): number {
  switch (effect) {
    case "light":
      return 7;
    case "fire":
      return 12;
    case "water":
      return 10;
    case "air":
      return 9;
    case "nature":
      return 11;
    case "ice":
      return 12;
    case "storm":
      return 10;
    case "magma":
      return 9;
    case "mystic":
      return 8;
    case "dark":
      return 7;
  }
}

function motifRadiusForEffect(
  effect: ThemeParticles["effect"],
  seed: number
): number {
  switch (effect) {
    case "light":
      return 18 + seed * 28;
    case "fire":
      return 3 + seed * 8;
    case "water":
      return 6 + seed * 16;
    case "air":
      return 2 + seed * 6;
    case "nature":
      return 4 + seed * 10;
    case "ice":
      return 2 + seed * 5;
    case "storm":
      return 2 + seed * 7;
    case "magma":
      return 10 + seed * 20;
    case "mystic":
      return 7 + seed * 15;
    case "dark":
      return 18 + seed * 26;
  }
}

function motifBlurForEffect(effect: ThemeParticles["effect"]): number {
  switch (effect) {
    case "light":
      return 20;
    case "fire":
      return 5;
    case "water":
      return 8;
    case "air":
      return 10;
    case "nature":
      return 7;
    case "ice":
      return 3;
    case "storm":
      return 2;
    case "magma":
      return 16;
    case "mystic":
      return 12;
    case "dark":
      return 18;
  }
}

function pulseForEffect(effect: ThemeParticles["effect"]): number {
  switch (effect) {
    case "light":
      return 2;
    case "fire":
      return 5;
    case "water":
      return 2.5;
    case "air":
      return 4;
    case "nature":
      return 3;
    case "ice":
      return 1.8;
    case "storm":
      return 10;
    case "magma":
      return 2.4;
    case "mystic":
      return 3.6;
    case "dark":
      return 2;
  }
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
