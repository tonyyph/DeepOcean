"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import logo from "@/app/logo.png";

export default function LogoHero() {
  return (
    <motion.div
      style={{
        width: 280,
        height: 300,
        position: "relative",
        margin: "2rem auto"
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {/* Glow background */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(167,139,250,0.25) 0%, rgba(34,228,255,0.18) 45%, transparent 75%)",
          filter: "blur(35px)",
          zIndex: 0,
          pointerEvents: "none"
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.08, 1]
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut"
        }}
      />

      {/* Logo */}
      <motion.div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          zIndex: 1
        }}
        animate={{
          y: [0, 12, 0],
          rotate: [-2, 2, -2],
          scale: [1, 1.03, 1]
        }}
        transition={{
          y: {
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut"
          },
          rotate: {
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut"
          },
          scale: {
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut"
          }
        }}
      >
        <motion.div
          style={{
            position: "relative",
            width: 280,
            height: 280,
            zIndex: 1
          }}
        >
          <Image
            src={logo}
            alt="Logo"
            priority
            style={{
              objectFit: "contain"
            }}
          />
        </motion.div>
      </motion.div>

      {/* Sparkle */}
      <motion.div
        style={{
          position: "absolute",
          top: "45%",
          left: "62%",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#FFF6F0",
          boxShadow: "0 0 18px rgba(255,246,240,0.9)",
          zIndex: 2
        }}
        animate={{
          scale: [0.8, 1.5, 0.8],
          opacity: [0.4, 1, 0.4]
        }}
        transition={{
          repeat: Infinity,
          duration: 2.5,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}
