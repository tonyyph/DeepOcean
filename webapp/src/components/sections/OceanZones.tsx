"use client";

import { motion } from "framer-motion";
import { OCEAN_ZONES, OceanZone } from "@/lib/data";
import { CREATURES } from "@/lib/data";

function ZoneCard({ zone, index }: { zone: OceanZone; index: number }) {
  const creatureCount = CREATURES.filter((c) => c.zone === zone.id).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ scale: 1.015, borderColor: zone.accentColor + "40" }}
      style={{
        position: "relative",
        padding: "2rem",
        background: `linear-gradient(135deg, ${zone.bgFrom} 0%, ${zone.bgTo} 100%)`,
        border: "1px solid rgba(255,255,255,0.06)",
        borderLeft: `3px solid ${zone.accentColor}`,
        overflow: "hidden",
        transition: "transform 0.3s, border-color 0.3s",
        cursor: "default"
      }}
    >
      {/* Depth indicator badge */}
      <div
        style={{
          position: "absolute",
          top: "1.5rem",
          right: "1.5rem",
          fontFamily: "var(--font-mono), JetBrains Mono, monospace",
          fontSize: "0.6rem",
          letterSpacing: "0.2em",
          color: zone.accentColor,
          opacity: 0.7
        }}
      >
        {zone.depth}
      </div>

      {/* Zone index */}
      <div
        style={{
          fontFamily: "var(--font-mono), JetBrains Mono, monospace",
          fontSize: "0.55rem",
          letterSpacing: "0.25em",
          color: "rgba(255,255,255,0.25)",
          marginBottom: "0.75rem",
          textTransform: "uppercase"
        }}
      >
        Zone {String(index + 1).padStart(2, "0")}
      </div>

      {/* Zone name */}
      <h3
        style={{
          fontFamily: "var(--font-display), Space Grotesk, sans-serif",
          fontSize: "1.4rem",
          fontWeight: 600,
          color: "#FFFFFF",
          margin: "0 0 0.5rem",
          letterSpacing: "-0.01em"
        }}
      >
        {zone.name}
      </h3>

      {/* Description */}
      <p
        style={{
          fontFamily: "var(--font-body), Inter, sans-serif",
          fontSize: "0.85rem",
          lineHeight: 1.6,
          color: "#7186A5",
          margin: "0 0 1.5rem",
          maxWidth: "340px"
        }}
      >
        {zone.description}
      </p>

      {/* Atmosphere */}
      <p
        style={{
          fontFamily: "var(--font-mono), JetBrains Mono, monospace",
          fontSize: "0.65rem",
          lineHeight: 1.5,
          color: zone.accentColor,
          opacity: 0.65,
          margin: "0 0 1.5rem",
          letterSpacing: "0.05em"
        }}
      >
        {zone.atmosphere}
      </p>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "1rem"
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "var(--font-mono), JetBrains Mono, monospace",
              fontSize: "1.4rem",
              fontWeight: 300,
              color: zone.accentColor,
              textShadow: `0 0 20px ${zone.accentColor}80`
            }}
          >
            {creatureCount}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono), JetBrains Mono, monospace",
              fontSize: "0.6rem",
              color: "#7186A5",
              letterSpacing: "0.15em",
              marginLeft: "0.4rem",
              textTransform: "uppercase"
            }}
          >
            Species
          </span>
        </div>
        <div
          style={{
            height: 1,
            flex: 1,
            background: `linear-gradient(to right, ${zone.accentColor}30, transparent)`
          }}
        />
        <div
          style={{
            fontFamily: "var(--font-mono), JetBrains Mono, monospace",
            fontSize: "0.6rem",
            color: "#7186A5",
            letterSpacing: "0.15em",
            textTransform: "uppercase"
          }}
        >
          {zone.minDepth.toLocaleString()}m ↓
        </div>
      </div>

      {/* Subtle glow at border */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: `linear-gradient(to bottom, transparent, ${zone.accentColor}, transparent)`,
          filter: `blur(4px)`,
          opacity: 0.6
        }}
      />
    </motion.div>
  );
}

export default function OceanZones() {
  return (
    <section
      id="zones"
      style={{
        position: "relative",
        padding: "8rem 2rem",
        maxWidth: 1100,
        margin: "0 auto"
      }}
    >
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        style={{ marginBottom: "4rem" }}
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
          02 / Chart the Descent
        </p>
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
          Five Layers of
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #22E4FF, #A78BFA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            the Deep
          </span>
        </h2>
      </motion.div>

      {/* Vertical depth line */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 0,
          position: "relative"
        }}
      >
        {/* Connecting depth line */}
        <div
          style={{
            position: "absolute",
            left: "-2.5rem",
            top: 0,
            bottom: 0,
            width: 1,
            background:
              "linear-gradient(to bottom, rgba(34,228,255,0.4), rgba(167,139,250,0.3), rgba(255,107,107,0.2))",
            display: "none"
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
            gap: "1px",
            background: "rgba(255,255,255,0.04)"
          }}
        >
          {OCEAN_ZONES.map((zone, i) => (
            <ZoneCard key={zone.id} zone={zone} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
