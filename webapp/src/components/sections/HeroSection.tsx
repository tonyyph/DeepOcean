import Image from "next/image";
import { ArrowDown, ArrowRight, Check } from "lucide-react";
import { PhoneMockup } from "@/components/mockups/PhoneMockup";
import { Reveal } from "@/components/ui/Reveal";
import { siteLinks } from "@/content/landingContent";

export function HeroSection() {
  return (
    <section id="hero" className="hero-section">
      <div className="hero-art" aria-hidden>
        <Image
          src="/assets/ocean-portal-wide.png"
          alt=""
          fill
          priority
          sizes="100vw"
        />
      </div>
      <div className="hero-shade" />
      <div className="hero-inner">
        <Reveal className="hero-copy">
          <div className="hero-brand-line">
            <Image src="/assets/app-icon.png" alt="" width={38} height={38} />
            <span>Premium focus for iPhone & Android</span>
          </div>
          <h1>
            Focus deeper.
            <span>Surface calmer.</span>
          </h1>
          <p className="hero-lede">
            Deep Ocean turns each focus session into an underwater dive—where
            uninterrupted minutes become depth, discoveries, and a lasting
            record of the attention you protected.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={siteLinks.primaryCta}>
              Join the beta
              <ArrowRight size={18} />
            </a>
            <a className="button button-secondary" href={siteLinks.secondaryCta}>
              Explore the dive
              <ArrowDown size={17} />
            </a>
          </div>
          <div className="hero-proof">
            <span><Check size={14} /> Timed or free dives</span>
            <span><Check size={14} /> Core focus loop stays accessible</span>
            <span><Check size={14} /> English & Vietnamese app UI</span>
          </div>
        </Reveal>

        <Reveal className="hero-device-stage" delay={0.15}>
          <div className="hero-orbit hero-orbit-one" />
          <div className="hero-orbit hero-orbit-two" />
          <PhoneMockup screen="dive" />
          <div className="floating-card floating-card-depth">
            <small>LIVE DEPTH</small>
            <strong>684 m</strong>
            <span>Twilight Zone</span>
          </div>
          <div className="floating-card floating-card-reward">
            <small>SURFACE REWARD</small>
            <strong>+275 XP</strong>
            <span>2 discoveries</span>
          </div>
        </Reveal>
      </div>
      <div className="hero-depth-scale" aria-hidden>
        <span>0 m</span><i /><span>6,000 m+</span>
      </div>
    </section>
  );
}
