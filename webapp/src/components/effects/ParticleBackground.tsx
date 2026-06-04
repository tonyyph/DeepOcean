/* eslint-disable react-hooks/preserve-manual-memoization */
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function createSeededRandom(seed: number) {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function OceanParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1800;

  const particleTexture = useMemo(() => {
    const size = 128;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return new THREE.Texture();
    }

    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );

    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.4, "rgba(255,255,255,0.8)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvas);
  }, []);

  const { positions, colors } = useMemo(() => {
    const random = createSeededRandom(123456);

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const cyan = new THREE.Color("#22E4FF");
    const violet = new THREE.Color("#A78BFA");
    const teal = new THREE.Color("#5FF7E0");
    const dimCyan = new THREE.Color("#0A4A5A");

    const palette = [cyan, cyan, teal, violet, dimCyan];

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (random() - 0.5) * 28;
      positions[i * 3 + 1] = (random() - 0.5) * 35;
      positions[i * 3 + 2] = (random() - 0.5) * 18 - 3;

      const c = palette[Math.floor(random() * palette.length)];

      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    return {
      positions,
      colors
    };
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    const t = clock.elapsedTime;

    pointsRef.current.rotation.y = t * 0.012;
    pointsRef.current.rotation.x = Math.sin(t * 0.007) * 0.06;
    pointsRef.current.position.y = Math.sin(t * 0.04) * 0.35;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>

      <pointsMaterial
        map={particleTexture}
        vertexColors
        transparent
        opacity={0.7}
        size={0.12}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ParticleBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none"
      }}
    >
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 75
        }}
        style={{
          background: "transparent"
        }}
        gl={{
          alpha: true,
          antialias: false
        }}
      >
        <OceanParticles />
      </Canvas>
    </div>
  );
}
