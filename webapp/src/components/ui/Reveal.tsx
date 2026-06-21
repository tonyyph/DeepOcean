"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { landingTheme } from "@/lib/landingTheme";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: landingTheme.motion.duration,
        delay,
        ease: landingTheme.motion.enter,
      }}
    >
      {children}
    </motion.div>
  );
}
