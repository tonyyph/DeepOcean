"use client";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";

interface StatCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
  sublabel?: string;
  color?: string;
  delay?: number;
}

function StatCounter({
  value,
  suffix = "",
  prefix = "",
  label,
  sublabel,
  color = "#22E4FF",
  delay = 0
}: StatCounterProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    return prefix + Math.floor(v).toLocaleString() + suffix;
  });
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          const controls = animate(count, value, {
            duration: 2.5,
            delay,
            ease: [0.16, 1, 0.3, 1]
          });
          return controls.stop;
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [count, value, delay, started]);

  return (
    <div ref={ref} style={{ padding: "2.5rem", position: "relative" }}>
      {/* Glow behind number */}
      <div
        style={{
          position: "absolute",
          top: "2.5rem",
          left: "2.5rem",
          width: "80px",
          height: "60px",
          background: `radial-gradient(ellipse, ${color}20 0%, transparent 70%)`,
          filter: "blur(20px)",
          pointerEvents: "none"
        }}
      />

      <motion.div
        style={{
          fontFamily: "var(--font-mono), JetBrains Mono, monospace",
          fontSize: "clamp(2.8rem, 6vw, 5rem)",
          fontWeight: 300,
          color,
          lineHeight: 1,
          textShadow: `0 0 40px ${color}60`,
          position: "relative"
        }}
      >
        {rounded}
      </motion.div>

      <div
        style={{
          marginTop: "0.75rem",
          fontFamily: "var(--font-display), Space Grotesk, sans-serif",
          fontSize: "1rem",
          fontWeight: 500,
          color: "#B6C2D9",
          letterSpacing: "-0.01em"
        }}
      >
        {label}
      </div>

      {sublabel && (
        <div
          style={{
            marginTop: "0.3rem",
            fontFamily: "var(--font-mono), JetBrains Mono, monospace",
            fontSize: "0.65rem",
            color: "#7186A5",
            letterSpacing: "0.1em"
          }}
        >
          {sublabel}
        </div>
      )}

      <div
        style={{
          marginTop: "1.25rem",
          height: 1,
          width: "60%",
          background: `linear-gradient(to right, ${color}40, transparent)`
        }}
      />
    </div>
  );
}

export default function StatsSection() {
  const {
    totalDives,
    totalDiveTime,
    deepestDive,
    currentStreak,
    speciesCollected
  } = useStore();

  const totalHours = Math.floor(totalDiveTime / 60);
  const totalMins = totalDiveTime % 60;

  return (
    <section
      id="stats"
      style={{
        position: "relative",
        padding: "8rem 2rem",
        overflow: "hidden"
      }}
    >
      {/* Background atmosphere */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 120% 80% at 80% 50%, rgba(167,139,250,0.04) 0%, transparent 60%)",
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
            04 / Expedition Data
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
            The Numbers
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #5FF7E0, #22E4FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              {`Don't Lie`}
            </span>
          </h2>
        </motion.div>

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            borderRadius: "1.5rem",
            justifyContent: "center",
            background: "rgba(27, 4, 4, 0.03)",
            gap: "14px"
          }}
        >
          <StatCounter
            value={totalDives}
            label="Total Dives"
            sublabel="Logged expeditions"
            color="#22E4FF"
            delay={0}
          />
          <StatCounter
            value={totalHours}
            suffix={`h ${String(totalMins).padStart(2, "0")}m`}
            label="Time Submerged"
            sublabel="Cumulative dive time"
            color="#5FF7E0"
            delay={0.15}
          />
          <StatCounter
            value={deepestDive}
            suffix="m"
            label="Deepest Descent"
            sublabel="Personal record"
            color="#A78BFA"
            delay={0.3}
          />
          <StatCounter
            value={currentStreak}
            suffix=" days"
            label="Active Streak"
            sublabel="Consecutive dive days"
            color="#F59E0B"
            delay={0.45}
          />
          <StatCounter
            value={speciesCollected}
            label="Species Catalogued"
            sublabel="Unique lifeforms recorded"
            color="#FF6B6B"
            delay={0.6}
          />
        </div>

        {/* Lore quote */}
        <motion.blockquote
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.4 }}
          style={{
            marginTop: "4rem",
            padding: "2rem",
            borderLeft: "2px solid rgba(34,228,255,0.2)",
            background: "rgba(34,228,255,0.02)"
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body), Inter, sans-serif",
              fontSize: "1.1rem",
              lineHeight: 1.7,
              color: "#B6C2D9",
              fontStyle: "italic",
              margin: "0 0 1rem"
            }}
          >
            {`"We know more about the surface of Mars than we do about the deep
            ocean floor. Each dive is a step into genuinely unknown territory."`}
          </p>
          <cite
            style={{
              fontFamily: "var(--font-mono), JetBrains Mono, monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              color: "#7186A5",
              fontStyle: "normal"
            }}
          >
            — Deep Ocean Field Log, Vol. 47
          </cite>
        </motion.blockquote>
      </div>
    </section>
  );
}
