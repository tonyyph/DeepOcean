import Image from "next/image";
import { ArrowRight, Apple, Play } from "lucide-react";
import { siteLinks } from "@/content/landingContent";

export function FinalCTASection() {
  return (
    <section id="final-cta" className="final-cta-section">
      <Image src="/assets/ocean-portal-wide.png" alt="" fill sizes="100vw" />
      <div className="final-cta-overlay" />
      <div className="final-cta-content">
        <p className="eyebrow">The next dive starts at the surface</p>
        <h2>Give your focus somewhere deeper to go.</h2>
        <p>
          Join the Deep Ocean beta and turn the next protected block of time
          into an expedition worth remembering.
        </p>
        <div id="store-links" className="store-buttons">
          <a href={siteLinks.appStore} aria-label="App Store link placeholder">
            <Apple size={22} />
            <span><small>Placeholder for</small>App Store</span>
          </a>
          <a href={siteLinks.playStore} aria-label="Google Play link placeholder">
            <Play size={20} />
            <span><small>Placeholder for</small>Google Play</span>
          </a>
        </div>
        <a className="text-link" href={siteLinks.contact}>
          Contact link placeholder <ArrowRight size={16} />
        </a>
      </div>
    </section>
  );
}
