"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const NAV_LINKS = [
  { label: "How", href: "#how" },
  { label: "Zones", href: "#zones" },
  { label: "Discoveries", href: "#discoveries" },
  { label: "Premium", href: "#premium" }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 48);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <motion.nav
      className={`site-nav${scrolled ? " site-nav-scrolled" : ""}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
    >
      <a className="nav-brand" href="#hero" aria-label="Deep Ocean home">
        <span className="nav-mark" aria-hidden />
        <span>Deep Ocean</span>
      </a>

      <div className="nav-links" aria-label="Primary navigation">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>

      <a className="nav-cta" href="#waitlist">
        Join waitlist
      </a>
    </motion.nav>
  );
}
