"use client";

import { motion } from "framer-motion";
import { useStore, DiveSession } from "@/lib/store";
import { OCEAN_ZONES, ALL_DISCOVERIES } from "@/lib/data";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

function DiveEntry({
  session,
  index
}: {
  session: DiveSession;
  index: number;
}) {
  const zone = OCEAN_ZONES.find((z) => z.id === session.zone);
  const accentColor = zone?.accentColor ?? "#22E4FF";
  const discoveries = session.discoveries
    .map((id) => ALL_DISCOVERIES.find((d) => d.id === id))
    .filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      style={{ display: "flex", gap: "2rem", position: "relative" }}
    >
      {/* Timeline node + line */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
          width: 24
        }}
      >
        <motion.div
          animate={{
            boxShadow: [
              `0 0 8px ${accentColor}60`,
              `0 0 20px ${accentColor}`,
              `0 0 8px ${accentColor}60`
            ]
          }}
          transition={{ repeat: Infinity, duration: 3 + index * 0.5 }}
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: accentColor,
            flexShrink: 0,
            marginTop: "0.35rem"
          }}
        />
        {index < 4 && (
          <div
            style={{
              flex: 1,
              width: 1,
              background: `linear-gradient(to bottom, ${accentColor}40, rgba(255,255,255,0.04))`,
              minHeight: 80
            }}
          />
        )}
      </div>

      {/* Entry card */}
      <div
        style={{
          flex: 1,
          padding: "1.5rem",
          background: "rgba(10, 20, 40, 0.5)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderLeft: `2px solid ${accentColor}30`,
          marginBottom: index < 4 ? "0.5rem" : 0
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "1rem"
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <span
              style={{
                fontFamily: "var(--font-display), Space Grotesk, sans-serif",
                fontSize: "1rem",
                fontWeight: 600,
                color: "#FFFFFF"
              }}
            >
              {zone?.name ?? session.zone}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono), JetBrains Mono, monospace",
                fontSize: "0.55rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: accentColor,
                background: `${accentColor}10`,
                border: `1px solid ${accentColor}20`,
                padding: "0.15rem 0.5rem"
              }}
            >
              Dive {String(session.id).padStart(3, "0")}
            </span>
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono), JetBrains Mono, monospace",
              fontSize: "0.6rem",
              color: "#7186A5",
              letterSpacing: "0.1em"
            }}
          >
            {formatDate(session.date)}
          </span>
        </div>

        {/* Metrics row */}
        <div
          style={{
            display: "flex",
            gap: "2rem",
            marginBottom: "1rem",
            flexWrap: "wrap"
          }}
        >
          {[
            {
              label: "Max Depth",
              value: `${session.depth.toLocaleString()}m`,
              color: accentColor
            },
            {
              label: "Duration",
              value: formatDuration(session.duration),
              color: "#B6C2D9"
            },
            {
              label: "Discoveries",
              value: String(session.discoveries.length),
              color: "#5FF7E0"
            }
          ].map((metric) => (
            <div key={metric.label}>
              <div
                style={{
                  fontFamily: "var(--font-mono), JetBrains Mono, monospace",
                  fontSize: "0.55rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#7186A5",
                  marginBottom: "0.2rem"
                }}
              >
                {metric.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono), JetBrains Mono, monospace",
                  fontSize: "1.1rem",
                  fontWeight: 300,
                  color: metric.color,
                  textShadow: `0 0 15px ${metric.color}50`
                }}
              >
                {metric.value}
              </div>
            </div>
          ))}
        </div>

        {/* Discoveries */}
        {discoveries.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {discoveries.map(
              (d) =>
                d && (
                  <span
                    key={d.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontFamily: "var(--font-body), Inter, sans-serif",
                      fontSize: "0.7rem",
                      color: "#B6C2D9",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      padding: "0.25rem 0.6rem"
                    }}
                  >
                    <span>{d.emoji}</span>
                    <span>{d.name}</span>
                  </span>
                )
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ExpeditionLog() {
  const { sessions } = useStore();

  return (
    <section
      id="log"
      style={{
        position: "relative",
        padding: "8rem 2rem",
        overflow: "hidden"
      }}
    >
      {/* Subtle bg gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 100% 60% at 20% 50%, rgba(34,228,255,0.025) 0%, transparent 60%)",
          pointerEvents: "none"
        }}
      />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
        {/* Header */}
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
            05 / Dive Log
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
            Recent
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #22E4FF, #5FF7E0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              Expeditions
            </span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {sessions.map((session, i) => (
            <DiveEntry key={session.id} session={session} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
