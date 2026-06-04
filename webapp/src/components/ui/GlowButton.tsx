"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlowButtonProps {
  children: ReactNode;
  variant?: "primary" | "ghost";
  onClick?: () => void;
  href?: string;
}

export default function GlowButton({
  children,
  variant = "primary",
  onClick,
  href
}: GlowButtonProps) {
  const isPrimary = variant === "primary";

  const inner = (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.875rem 2.25rem",
        fontFamily: "var(--font-mono), JetBrains Mono, monospace",
        fontSize: "0.75rem",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: isPrimary ? "#22E4FF" : "#7186A5",
        background: isPrimary ? "rgba(34,228,255,0.06)" : "transparent",
        border: `1px solid ${isPrimary ? "rgba(34,228,255,0.4)" : "transparent"}`,
        borderRadius: 1,
        cursor: "pointer",
        overflow: "hidden",
        transition: "color 0.3s, background 0.3s"
      }}
    >
      {/* Shimmer effect on hover */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "60%",
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(34,228,255,0.08), transparent)",
          pointerEvents: "none"
        }}
        initial={{ left: "-100%" }}
        whileHover={{ left: "200%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      {/* Bottom border grow */}
      <motion.div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 1,
          width: 0,
          background: "#22E4FF"
        }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </motion.button>
  );

  if (href) {
    return (
      <a href={href} style={{ textDecoration: "none" }}>
        {inner}
      </a>
    );
  }
  return inner;
}
