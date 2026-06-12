"use client";

import dynamic from "next/dynamic";
import {
  Bell,
  Brain,
  CalendarCheck,
  ChevronRight,
  Gem,
  Layers3,
  Moon,
  ShipWheel,
  Sparkles,
  Trophy,
  Waves
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/ui/Navbar";

const ParticleBackground = dynamic(
  () => import("@/components/effects/ParticleBackground"),
  { ssr: false }
);

const zones = [
  {
    name: "Sunlit",
    depth: "0-200m",
    tone: "cyan",
    copy: "Begin with a clean timer, soft light, and the first sense of descent."
  },
  {
    name: "Twilight",
    depth: "200-1,000m",
    tone: "teal",
    copy: "Longer sessions dim the surface noise and reveal your rhythm."
  },
  {
    name: "Midnight",
    depth: "1,000-4,000m",
    tone: "violet",
    copy: "Deep focus unlocks rarer sightings, lore, and personal records."
  },
  {
    name: "Abyssal",
    depth: "4,000-6,000m",
    tone: "steel",
    copy: "Streaks, XP, and achievements turn consistency into a visible map."
  },
  {
    name: "Hadal",
    depth: "6,000m+",
    tone: "coral",
    copy: "The quietest layer: premium themes, sharper insights, and deep rituals."
  }
];

const workflow = [
  {
    icon: ShipWheel,
    title: "Start a focus dive",
    copy: "Choose a session, silence the surface, and let Deep Ocean handle the ritual."
  },
  {
    icon: Waves,
    title: "Descend with time",
    copy: "Every uninterrupted minute carries you deeper through cinematic ocean zones."
  },
  {
    icon: Trophy,
    title: "Surface with rewards",
    copy: "End with XP, streak progress, discoveries, achievements, and a clearer log."
  }
];

const discoveries = [
  "Bioluminescent creatures",
  "Ancient artifacts",
  "Zone lore",
  "Rarity tiers",
  "Collection sightings",
  "Title achievements"
];

const intelligence = [
  {
    icon: CalendarCheck,
    title: "Streaks and history",
    copy: "Track dives, moods, depth records, focus time, and consistency without spreadsheet energy."
  },
  {
    icon: Brain,
    title: "AI companion insights",
    copy: "A quiet companion reflects on your patterns and helps you plan the next descent."
  },
  {
    icon: Bell,
    title: "Reminders and widgets",
    copy: "Dive actions stay close with scheduled nudges and native widget controls."
  },
  {
    icon: Gem,
    title: "Premium themes",
    copy: "Unlock richer ocean moods, deeper personalization, and advanced focus intelligence."
  }
];

const metrics = [
  ["52", "dives logged"],
  ["18h", "time submerged"],
  ["4,200m", "deepest focus"],
  ["12", "day streak"]
];

export default function Home() {
  return (
    <main className="landing-shell">
      <ParticleBackground />
      <Navbar />

      <section id="hero" className="hero-section">
        <div className="hero-waterline" />
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="eyebrow">Premium mobile focus app</p>
          <h1>Deep Ocean</h1>
          <p className="hero-tagline">Turn focus into a descent.</p>
          <p className="hero-copy">
            Start a focus dive, sink through living ocean zones, and surface
            with XP, streaks, discoveries, and calmer evidence of the work you
            actually did.
          </p>

          <div className="hero-actions">
            <a className="primary-cta" href="#waitlist">
              Join waitlist
              <ChevronRight size={18} aria-hidden />
            </a>
            <a className="secondary-cta" href="#how">
              See the dive system
            </a>
          </div>
        </motion.div>

        <motion.div
          className="dive-console"
          initial={{ opacity: 0, y: 42 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Deep Ocean focus dive preview"
        >
          <div className="phone-frame">
            <div className="phone-status">
              <span>Focus Dive</span>
              <span>32:14</span>
            </div>
            <div className="depth-ring">
              <div>
                <span>1,240m</span>
                <small>Twilight Zone</small>
              </div>
            </div>
            <div className="session-bars" aria-hidden>
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="reward-strip">
              <span>+86 XP</span>
              <span>Lanternfish logged</span>
            </div>
          </div>
          <div className="depth-rail" aria-hidden>
            <span>0m</span>
            <i />
            <span>6,000m+</span>
          </div>
        </motion.div>
      </section>

      <section id="how" className="section-block">
        <div className="section-heading">
          <p className="eyebrow">How it works</p>
          <h2>A timer that feels like a voyage.</h2>
          <p>
            Deep Ocean keeps the core interaction simple: begin, protect the
            session, descend, and receive a meaningful log when you surface.
          </p>
        </div>
        <div className="workflow-grid">
          {workflow.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.article
                className="feature-card"
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
              >
                <span className="step-number">0{index + 1}</span>
                <Icon size={24} aria-hidden />
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section id="zones" className="section-block zones-section">
        <div className="section-heading">
          <p className="eyebrow">Ocean progression</p>
          <h2>Every minute has depth.</h2>
          <p>
            Sessions move through five layers, each with its own atmosphere,
            reward pacing, discoveries, and visual mood.
          </p>
        </div>
        <div className="zone-stack">
          {zones.map((zone, index) => (
            <motion.article
              className={`zone-row zone-${zone.tone}`}
              key={zone.name}
              initial={{ opacity: 0, x: index % 2 === 0 ? -24 : 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: index * 0.05 }}
            >
              <span>{zone.depth}</span>
              <h3>{zone.name}</h3>
              <p>{zone.copy}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="discoveries" className="section-block split-section">
        <div className="section-heading align-left">
          <p className="eyebrow">Discoveries</p>
          <h2>Focus leaves artifacts behind.</h2>
          <p>
            Productive sessions can uncover creatures, relics, and lore from
            the zone you reached. The collection becomes a record of attention,
            not just minutes.
          </p>
        </div>
        <div className="discovery-panel">
          {discoveries.map((item, index) => (
            <motion.div
              className="discovery-chip"
              key={item}
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
            >
              <Sparkles size={16} aria-hidden />
              {item}
            </motion.div>
          ))}
        </div>
      </section>

      <section id="intelligence" className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Focus intelligence</p>
          <h2>The app remembers what the day forgets.</h2>
          <p>
            Deep Ocean turns focus history into a calm dashboard: enough signal
            to improve tomorrow, never enough noise to become another chore.
          </p>
        </div>
        <div className="metrics-strip">
          {metrics.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="intelligence-grid">
          {intelligence.map((item) => {
            const Icon = item.icon;
            return (
              <article className="intelligence-card" key={item.title}>
                <Icon size={23} aria-hidden />
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="premium" className="premium-band">
        <div>
          <p className="eyebrow">Premium layer</p>
          <h2>More atmosphere. Sharper rituals.</h2>
          <p>
            Premium expands the dive with exclusive themes, advanced insight,
            deeper personalization, and a more expressive ocean around your
            focus practice.
          </p>
        </div>
        <div className="premium-list">
          <span>
            <Moon size={17} aria-hidden /> Cinematic themes
          </span>
          <span>
            <Brain size={17} aria-hidden /> Advanced insights
          </span>
          <span>
            <Layers3 size={17} aria-hidden /> Widgets and reminders
          </span>
        </div>
      </section>

      <section id="waitlist" className="final-cta">
        <p className="eyebrow">Ready to descend?</p>
        <h2>Make focus feel worth returning to.</h2>
        <p>
          Deep Ocean is being shaped for iPhone-first focus sessions. Join the
          waitlist placeholder and be first in line when the hatch opens.
        </p>
        <div className="hero-actions">
          <a className="primary-cta" href="mailto:hello@deepocean.app">
            Join waitlist
            <ChevronRight size={18} aria-hidden />
          </a>
          <a className="secondary-cta" href="#hero">
            Back to surface
          </a>
        </div>
      </section>

      <footer className="site-footer">
        <span>Deep Ocean</span>
        <span>Focus dives, discoveries, and quiet momentum.</span>
        <span>App Store link coming soon</span>
      </footer>
    </main>
  );
}
