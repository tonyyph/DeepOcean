"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
  delay?: number;
}

export default function GlassCard({
  children,
  className = "",
  glowColor = "rgba(34,228,255,0.08)",
  onClick,
  delay = 0
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{
        borderColor: "rgba(34,228,255,0.25)",
        boxShadow: `0 0 40px ${glowColor}, 0 0 80px ${glowColor}`,
        y: -4
      }}
      onClick={onClick}
      style={{
        background: "rgba(13, 31, 58, 0.35)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: "1px solid rgba(34, 228, 255, 0.1)",
        borderRadius: 2,
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.3s, box-shadow 0.3s"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
