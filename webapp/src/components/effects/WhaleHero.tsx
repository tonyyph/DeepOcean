"use client";

import { motion } from "framer-motion";

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
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(167,139,250,0.2) 0%, rgba(34,228,255,0.14) 42%, transparent 72%)",
          filter: "blur(32px)",
          zIndex: 0,
          pointerEvents: "none"
        }}
        animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.06, 1] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
      />

      <motion.svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%"
        }}
        animate={{
          y: [0, 10, 0],
          rotate: [-1.8, 1.2, -1.8],
          scale: [1, 1.015, 1]
        }}
        transition={{
          y: { repeat: Infinity, duration: 6.2, ease: "easeInOut" },
          rotate: { repeat: Infinity, duration: 8.4, ease: "easeInOut" },
          scale: { repeat: Infinity, duration: 6.2, ease: "easeInOut" }
        }}
      >
        <defs>
          <radialGradient id="logoBase" cx="50%" cy="44%" r="58%">
            <stop offset="0%" stopColor="#FFFDFE" />
            <stop offset="55%" stopColor="#F9F7FF" />
            <stop offset="100%" stopColor="#F1F2FF" />
          </radialGradient>

          <radialGradient id="pinkBloom" cx="40%" cy="35%" r="42%">
            <stop offset="0%" stopColor="#F89FB5" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#F39DB8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F39DB8" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="blueBloom" cx="66%" cy="62%" r="45%">
            <stop offset="0%" stopColor="#6D8ECC" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#7289D4" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#7289D4" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="violetBloom" cx="67%" cy="72%" r="38%">
            <stop offset="0%" stopColor="#7D5FBF" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#8A71D5" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#8A71D5" stopOpacity="0" />
          </radialGradient>

          <filter id="logoGrain" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              seed="9"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="saturate"
              values="0"
              result="desat"
            />
            <feComponentTransfer in="desat" result="softNoise">
              <feFuncA type="table" tableValues="0 0.1" />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" in2="softNoise" mode="multiply" />
          </filter>

          <filter id="logoGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="11" result="b" />
            <feColorMatrix
              in="b"
              type="matrix"
              values="0 0 0 0 0.58  0 0 0 0 0.67  0 0 0 0 0.97  0 0 0 0.24 0"
            />
          </filter>
        </defs>

        <g filter="url(#logoGlow)">
          <circle cx="150" cy="150" r="118" fill="url(#logoBase)" />
        </g>

        <g clipPath="url(#logoClip)" filter="url(#logoGrain)">
          <circle cx="130" cy="114" r="96" fill="url(#pinkBloom)" />
          <circle cx="190" cy="176" r="94" fill="url(#blueBloom)" />
          <circle cx="194" cy="200" r="70" fill="url(#violetBloom)" />

          <circle cx="88" cy="114" r="20" fill="#E88CAB" fillOpacity="0.62" />
          <circle cx="124" cy="94" r="18" fill="#ED9BB4" fillOpacity="0.65" />
          <circle cx="212" cy="162" r="15" fill="#D7C6F5" fillOpacity="0.65" />
          <circle cx="189" cy="182" r="4" fill="#FFF8F2" fillOpacity="0.9" />
          <circle cx="168" cy="194" r="2" fill="#FFF8F2" fillOpacity="0.95" />
          <circle cx="177" cy="209" r="2.4" fill="#FFF8F2" fillOpacity="0.85" />
          <circle cx="206" cy="212" r="1.7" fill="#FFF8F2" fillOpacity="0.7" />
        </g>

        <defs>
          <clipPath id="logoClip">
            <circle cx="150" cy="150" r="118" />
          </clipPath>
        </defs>
      </motion.svg>

      <motion.div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "#FFF6F0",
          boxShadow: "0 0 15px rgba(255,246,240,0.9)",
          pointerEvents: "none"
        }}
        animate={{
          x: [34, 40, 34],
          y: [-24, -28, -24],
          opacity: [0.45, 1, 0.45]
        }}
        transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
