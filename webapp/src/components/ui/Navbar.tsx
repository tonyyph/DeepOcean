"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Explore", href: "#zones" },
  { label: "Species", href: "#discoveries" },
  { label: "Data", href: "#stats" },
  { label: "Log", href: "#log" }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <motion.nav
      initial={false}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.8,
        delay: 0.3
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(1,5,18,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(34,228,255,0.06)"
          : "1px solid transparent",
        transition: "background 0.4s, backdrop-filter 0.4s, border-color 0.4s"
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem"
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            border: "1px solid rgba(34,228,255,0.4)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#22E4FF",
              boxShadow: "0 0 8px #22E4FF"
            }}
          />
        </div>

        <span
          style={{
            fontFamily: "var(--font-display), Space Grotesk, sans-serif",
            fontWeight: 600,
            fontSize: "0.9rem",
            letterSpacing: "0.15em",
            color: "#FFFFFF",
            textTransform: "uppercase"
          }}
        >
          Deep Ocean
        </span>
      </div>

      {/* Links */}
      <div
        style={{
          display: "flex",
          gap: "2.5rem",
          alignItems: "center"
        }}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            style={{
              fontFamily: "var(--font-mono), JetBrains Mono, monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#7186A5",
              textDecoration: "none",
              transition: "color 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#22E4FF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#7186A5";
            }}
          >
            {link.label}
          </a>
        ))}

        <a
          href="#hero"
          style={{
            fontFamily: "var(--font-mono), JetBrains Mono, monospace",
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#22E4FF",
            textDecoration: "none",
            padding: "0.45rem 1.2rem",
            border: "1px solid rgba(34,228,255,0.35)",
            transition: "background 0.2s, border-color 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(34,228,255,0.08)";
            e.currentTarget.style.borderColor = "rgba(34,228,255,0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(34,228,255,0.35)";
          }}
        >
          Begin Dive
        </a>
      </div>
    </motion.nav>
  );
}
