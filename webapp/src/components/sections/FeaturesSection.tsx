import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { features } from "@/content/landingContent";

export function FeaturesSection() {
  return (
    <section id="features" className="section">
      <div className="section-inner">
        <SectionHeading
          eyebrow="Core experience"
          title="A focus system with depth—literally."
          description="Every layer is tied to the real mobile product: the dive engine, ocean progression, collection, rewards, analytics, and sensory feedback."
        />
        <div className="feature-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal className="feature-card" delay={index * 0.05} key={feature.title}>
                <div className="feature-card-top">
                  <span className="feature-icon"><Icon size={22} /></span>
                  <span className="feature-tag">{feature.tag}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
