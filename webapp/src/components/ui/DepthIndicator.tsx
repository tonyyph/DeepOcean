"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

interface DepthIndicatorProps {
  targetDepth?: number;
}

export default function DepthIndicator({
  targetDepth = 8743
}: DepthIndicatorProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.floor(v).toLocaleString());

  useEffect(() => {
    const controls = animate(count, targetDepth, {
      duration: 4,
      delay: 0.8,
      ease: [0.16, 1, 0.3, 1]
    });
    return controls.stop;
  }, [count, targetDepth]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.2 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.25rem",
        marginBottom: "1.5rem"
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono), JetBrains Mono, monospace",
          fontSize: "0.6rem",
          letterSpacing: "0.35em",
          color: "#7186A5",
          textTransform: "uppercase"
        }}
      >
        MAX DEPTH RECORDED
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
        <motion.span
          style={{
            fontFamily: "var(--font-mono), JetBrains Mono, monospace",
            fontSize: "2.5rem",
            fontWeight: 300,
            color: "#22E4FF",
            lineHeight: 1,
            textShadow: "0 0 30px rgba(34,228,255,0.6)"
          }}
        >
          {rounded}
        </motion.span>
        <span
          style={{
            fontFamily: "var(--font-mono), JetBrains Mono, monospace",
            fontSize: "0.85rem",
            color: "rgba(34,228,255,0.5)",
            letterSpacing: "0.1em"
          }}
        >
          m
        </span>
      </div>
    </motion.div>
  );
}
