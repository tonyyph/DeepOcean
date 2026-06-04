"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ALL_DISCOVERIES,
  OCEAN_ZONES,
  RARITY_CONFIG,
  Discovery
} from "@/lib/data";

function DiscoveryCard({ item, delay }: { item: Discovery; delay: number }) {
  const rarity = RARITY_CONFIG[item.rarity];
  const zone = OCEAN_ZONES.find((z) => z.id === item.zone);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.5,
        delay: delay * 0.04,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{
        y: -4,
        boxShadow: `0 0 40px ${rarity.glow}, 0 12px 40px rgba(0,0,0,0.4)`,
        borderColor: `${rarity.color}30`
      }}
      style={{
        padding: "1.5rem",
        background: "rgba(10, 22, 44, 0.6)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        border: "1px solid rgba(255,255,255,0.06)",
        cursor: "default",
        transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Artifact/creature badge */}
      {item.type === "artifact" && (
        <div
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            fontFamily: "var(--font-mono), JetBrains Mono, monospace",
            fontSize: "0.5rem",
            letterSpacing: "0.2em",
            color: "#F59E0B",
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.2)",
            padding: "0.2rem 0.5rem",
            textTransform: "uppercase"
          }}
        >
          Relic
        </div>
      )}

      {/* Emoji icon */}
      <div style={{ fontSize: "2rem", marginBottom: "0.75rem", lineHeight: 1 }}>
        {item.emoji}
      </div>

      {/* Name */}
      <h4
        style={{
          fontFamily: "var(--font-display), Space Grotesk, sans-serif",
          fontSize: "0.95rem",
          fontWeight: 600,
          color: "#FFFFFF",
          margin: "0 0 0.4rem",
          letterSpacing: "-0.01em"
        }}
      >
        {item.name}
      </h4>

      {/* Description */}
      <p
        style={{
          fontFamily: "var(--font-body), Inter, sans-serif",
          fontSize: "0.75rem",
          lineHeight: 1.55,
          color: "#7186A5",
          margin: "0 0 1.2rem",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}
      >
        {item.description}
      </p>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        {/* Rarity badge */}
        <span
          style={{
            fontFamily: "var(--font-mono), JetBrains Mono, monospace",
            fontSize: "0.55rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: rarity.color,
            background: `${rarity.color}10`,
            border: `1px solid ${rarity.color}25`,
            padding: "0.2rem 0.5rem"
          }}
        >
          {rarity.label}
        </span>

        {/* Depth */}
        <span
          style={{
            fontFamily: "var(--font-mono), JetBrains Mono, monospace",
            fontSize: "0.6rem",
            color: zone?.accentColor ?? "#7186A5",
            opacity: 0.7
          }}
        >
          {item.depth.toLocaleString()}m
        </span>
      </div>
    </motion.div>
  );
}

const ALL_FILTER = { id: "all", name: "All", accentColor: "#22E4FF" };

export default function DiscoveriesSection() {
  const [activeZone, setActiveZone] = useState<string>("all");
  const [showArtifacts, setShowArtifacts] = useState(true);

  const filtered = ALL_DISCOVERIES.filter((d) => {
    const zoneMatch = activeZone === "all" || d.zone === activeZone;
    const typeMatch = showArtifacts || d.type !== "artifact";
    return zoneMatch && typeMatch;
  });

  const filters = [
    ALL_FILTER,
    ...OCEAN_ZONES.map((z) => ({
      id: z.id,
      name: z.name,
      accentColor: z.accentColor
    }))
  ];

  return (
    <section
      id="discoveries"
      style={{
        position: "relative",
        padding: "8rem 2rem",
        maxWidth: 1200,
        margin: "0 auto"
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        style={{ marginBottom: "3rem" }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono), JetBrains Mono, monospace",
            fontSize: "0.6rem",
            letterSpacing: "0.35em",
            color: "#7186A5",
            textTransform: "uppercase",
            marginBottom: "0.75rem"
          }}
        >
          03 / Known Species
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem"
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display), Space Grotesk, sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 600,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              margin: 0
            }}
          >
            Catalogued
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #A78BFA, #22E4FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              Lifeforms
            </span>
          </h2>

          {/* Artifacts toggle */}
          <button
            onClick={() => setShowArtifacts((v) => !v)}
            style={{
              fontFamily: "var(--font-mono), JetBrains Mono, monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: showArtifacts ? "#F59E0B" : "#7186A5",
              background: showArtifacts
                ? "rgba(245,158,11,0.08)"
                : "transparent",
              border: `1px solid ${showArtifacts ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.1)"}`,
              padding: "0.45rem 1rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            Relics &amp; Artifacts
          </button>
        </div>
      </motion.div>

      {/* Zone filter tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          marginBottom: "2.5rem"
        }}
      >
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveZone(f.id)}
            style={{
              fontFamily: "var(--font-mono), JetBrains Mono, monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "0.4rem 0.9rem",
              cursor: "pointer",
              color: activeZone === f.id ? f.accentColor : "#7186A5",
              background:
                activeZone === f.id ? `${f.accentColor}10` : "transparent",
              border: `1px solid ${activeZone === f.id ? `${f.accentColor}40` : "rgba(255,255,255,0.08)"}`,
              transition: "all 0.2s"
            }}
          >
            {f.name}
          </button>
        ))}

        {/* Count */}
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "var(--font-mono), JetBrains Mono, monospace",
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
            color: "#7186A5",
            alignSelf: "center"
          }}
        >
          {filtered.length} entries
        </span>
      </motion.div>

      {/* Card grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeZone + showArtifacts}
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 240px), 1fr))",
            gap: "1px",
            background: "rgba(255,255,255,0.03)"
          }}
        >
          {filtered.map((item, i) => (
            <DiscoveryCard key={item.id} item={item} delay={i} />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
