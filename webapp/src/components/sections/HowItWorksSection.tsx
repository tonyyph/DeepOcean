import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { steps } from "@/content/landingContent";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section how-section">
      <div className="section-inner">
        <SectionHeading
          eyebrow="How it works"
          title="From intention to expedition report."
          description="Deep Ocean keeps the interaction simple while giving each stage a clear emotional purpose."
          align="center"
        />
        <div className="steps-grid">
          {steps.map((step, index) => (
            <Reveal className="step-card" delay={index * 0.06} key={step.number}>
              <span className="step-number">{step.number}</span>
              <div className="step-line" aria-hidden />
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
