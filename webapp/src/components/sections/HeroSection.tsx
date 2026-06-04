"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import LogoHero from "@/components/effects/LogoHero";
import DepthIndicator from "@/components/ui/DepthIndicator";

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section
      ref={ref}
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        paddingTop: "80px"
      }}
    >
      {/* Deep gradient overlay */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(34,228,255,0.05) 0%, transparent 70%)",
          scale: bgScale,
          pointerEvents: "none",
          zIndex: 1
        }}
      />

      {/* Bottom fade to next section */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "200px",
          background: "linear-gradient(to bottom, transparent, #010512)",
          zIndex: 2,
          pointerEvents: "none"
        }}
      />

      {/* Main content */}
      <motion.div
        style={{
          y: contentY,
          opacity: contentOpacity,
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "0 1.5rem"
        }}
      >
        {/* Depth counter */}
        <DepthIndicator />

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.4,
            delay: 0.1,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          style={{
            fontFamily: "var(--font-display), Space Grotesk, sans-serif",
            fontSize: "clamp(4rem, 12vw, 9rem)",
            fontWeight: 700,
            lineHeight: 0.9,
            letterSpacing: "-0.03em",
            margin: 0
          }}
        >
          <span
            style={{
              background:
                "linear-gradient(135deg, #22E4FF 0%, #FFFFFF 45%, #A78BFA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              display: "block"
            }}
          >
            DEEP
          </span>
          <span style={{ color: "rgba(255,255,255,0.88)", display: "block" }}>
            OCEAN
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.8, delay: 0.5 }}
          style={{
            fontFamily: "var(--font-mono), JetBrains Mono, monospace",
            fontSize: "0.65rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#7186A5",
            marginTop: "1.25rem",
            marginBottom: 0
          }}
        >
          Expedition Intelligence System &nbsp;/&nbsp; Est. 2024
        </motion.p>

        {/* Brand logo visual */}
        <LogoHero />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem"
        }}
        animate={{ opacity: [0.3, 0.9, 0.3] }}
        transition={{ repeat: Infinity, duration: 2.8 }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono), JetBrains Mono, monospace",
            fontSize: "0.55rem",
            letterSpacing: "0.35em",
            color: "#7186A5",
            textTransform: "uppercase"
          }}
        >
          Scroll to Descend
        </span>
        <div
          style={{
            width: 1,
            height: 44,
            background:
              "linear-gradient(to bottom, rgba(34,228,255,0.6), transparent)"
          }}
        />
      </motion.div>
    </section>
  );
}
