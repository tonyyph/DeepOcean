import Image from "next/image";
import { BellRing, Radio, Smartphone } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { widgetHighlights } from "@/content/landingContent";

export function WidgetSection() {
  return (
    <section id="widgets" className="section widget-section">
      <div className="section-inner widget-grid">
        <div className="widget-copy">
          <p className="eyebrow">Widgets, Live Activities & notifications</p>
          <h2>Your dive stays close, even when the app is not open.</h2>
          <p className="section-description">
            Native surfaces use the same session engine and a shared action
            contract, so a widget never becomes a second, conflicting timer.
          </p>
          <div className="widget-feature-list">
            {widgetHighlights.map((highlight) => (
              <div key={highlight}><Radio size={15} /><span>{highlight}</span></div>
            ))}
          </div>
          <div className="platform-pills">
            <span><Smartphone size={15} /> iOS WidgetKit & Live Activity</span>
            <span><BellRing size={15} /> Android active-dive notification</span>
          </div>
        </div>

        <Reveal className="widget-visual">
          <div className="widget-wide">
            <Image
              src="/assets/living-whale-wide.png"
              alt="Deep Ocean living whale widget artwork"
              fill
              sizes="(max-width: 800px) 90vw, 560px"
            />
            <div className="widget-overlay">
              <span>DIVE IN PROGRESS</span>
              <strong>18:42</strong>
              <small>684 m · Twilight Zone</small>
              <button type="button">Pause session</button>
            </div>
          </div>
          <div className="widget-square">
            <Image
              src="/assets/living-jellyfish-square.png"
              alt="Deep Ocean living jellyfish widget artwork"
              fill
              sizes="220px"
            />
            <div className="widget-square-overlay">
              <span>7 day streak</span>
              <strong>25m</strong>
              <small>Start focus</small>
            </div>
          </div>
          <div className="live-activity">
            <span className="live-dot" />
            <strong>Deep Ocean</strong>
            <small>12:08 left · 420 m</small>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
