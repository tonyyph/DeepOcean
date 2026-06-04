"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function OceanParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1800;

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const cyan = new THREE.Color("#22E4FF");
    const violet = new THREE.Color("#A78BFA");
    const teal = new THREE.Color("#5FF7E0");
    const dimCyan = new THREE.Color("#0A4A5A");
    const palette = [cyan, cyan, teal, violet, dimCyan, dimCyan, dimCyan];

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 18 - 3;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    return { positions, colors };
  }, []);

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
        vertexColors
        transparent
        alphaTest={0.01}
        opacity={0.5}
        size={0.04}
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
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: false }}
      >
        <OceanParticles />
      </Canvas>
    </div>
  );
}
