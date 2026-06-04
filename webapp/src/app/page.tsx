"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/ui/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import OceanZones from "@/components/sections/OceanZones";
import DiscoveriesSection from "@/components/sections/DiscoveriesSection";
import StatsSection from "@/components/sections/StatsSection";
import ExpeditionLog from "@/components/sections/ExpeditionLog";

// Three.js particle background — client-only, no SSR
const ParticleBackground = dynamic(
  () => import("@/components/effects/ParticleBackground"),
  { ssr: false }
);

export default function Home() {
  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#010512",
        color: "#FFFFFF",
        overflowX: "hidden"
      }}
    >
      <ParticleBackground />
      <Navbar />
      <div style={{ position: "relative", zIndex: 1 }}>
        <HeroSection />
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 2rem",
            height: 1,
            background:
              "linear-gradient(to right, transparent, rgba(34,228,255,0.15), transparent)"
          }}
        />
        <OceanZones />
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 2rem",
            height: 1,
            background:
              "linear-gradient(to right, transparent, rgba(167,139,250,0.12), transparent)"
          }}
        />
        <DiscoveriesSection />
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 2rem",
            height: 1,
            background:
              "linear-gradient(to right, transparent, rgba(95,247,224,0.1), transparent)"
          }}
        />
        <StatsSection />
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 2rem",
            height: 1,
            background:
              "linear-gradient(to right, transparent, rgba(34,228,255,0.1), transparent)"
          }}
        />
        <ExpeditionLog />
        <footer
          style={{
            borderTop: "1px solid rgba(255,255,255,0.04)",
            padding: "3rem 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            maxWidth: 1200,
            margin: "0 auto"
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22E4FF",
                boxShadow: "0 0 8px #22E4FF"
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-display), Space Grotesk, sans-serif",
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#B6C2D9"
              }}
            >
              Deep Ocean
            </span>
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono), JetBrains Mono, monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              color: "#7186A5"
            }}
          >
            Expedition Intelligence System &copy; 2024
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono), JetBrains Mono, monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              color: "#7186A5"
            }}
          >
            Depth: ∞
          </span>
        </footer>
      </div>
    </main>
  );
}
