import { Check, Diamond } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { premiumBenefits, siteLinks } from "@/content/landingContent";

export function PremiumSection() {
  return (
    <section id="premium" className="section premium-section">
      <div className="premium-glow" aria-hidden />
      <div className="section-inner premium-grid">
        <Reveal className="premium-copy">
          <p className="eyebrow">Deep Ocean Pro</p>
          <h2>More personal. More reflective. Never louder.</h2>
          <p className="section-description">
            The core dive remains useful on its own. Pro adds richer visual
            identities, deeper guidance, and complete expedition lore.
          </p>
          <div className="premium-principle">
            <Diamond size={18} />
            <span>Designed as depth, not pressure.</span>
          </div>
          <a className="button button-premium" href={siteLinks.primaryCta}>
            Get beta access
          </a>
          <small className="placeholder-note">
            Pricing and store purchase links are placeholders until production listings are supplied.
          </small>
        </Reveal>

        <div className="premium-benefits">
          {premiumBenefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Reveal className="premium-benefit" delay={index * 0.05} key={benefit.title}>
                <span><Icon size={19} /></span>
                <div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </div>
                <Check size={16} />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
