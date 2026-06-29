// src/design-system/animations/components/ParticleBurst.tsx
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Canvas, Circle } from "@shopify/react-native-skia";
import {
  Easing,
  cancelAnimation,
  runOnJS,
  useSharedValue,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";

const SIZE = 160;
const PARTICLE_COUNT = 18;
const HALF = SIZE / 2;

type Particle = { angle: number; speed: number; radius: number };

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    angle: (i / PARTICLE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.4,
    speed: 28 + Math.random() * 28,
    radius: 2.5 + Math.random() * 3,
  }));
}

type Props = {
  x: number;
  y: number;
  color: string;
  onDone: () => void;
};

export function ParticleBurst({ x, y, color, onDone }: Props) {
  const t = useSharedValue(0);

  const [particles] = useState<Particle[]>(generateParticles);

  useEffect(() => {
    t.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    const timer = setTimeout(() => runOnJS(onDone)(), 820);
    return () => {
      cancelAnimation(t);
      clearTimeout(timer);
    };
  }, [t, onDone]);

  return (
    <Canvas
      style={[styles.canvas, { left: x - HALF, top: y - HALF }]}
      pointerEvents="none"
    >
      {particles.map((p, i) => (
        <ParticleCircle key={i} p={p} t={t} color={color} />
      ))}
    </Canvas>
  );
}

function ParticleCircle({
  p,
  t,
  color,
}: {
  p: Particle;
  t: ReturnType<typeof useSharedValue<number>>;
  color: string;
}) {
  const cx = useDerivedValue(
    () => HALF + Math.cos(p.angle) * p.speed * t.value * 2.2
  );
  const cy = useDerivedValue(
    () => HALF + Math.sin(p.angle) * p.speed * t.value * 2.2
  );
  const opacity = useDerivedValue(() =>
    Math.max(0, 1 - t.value * 1.3)
  );

  return <Circle cx={cx} cy={cy} r={p.radius} color={color} opacity={opacity} />;
}

const styles = StyleSheet.create({
  canvas: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    zIndex: 9998,
    pointerEvents: "none",
  },
});
