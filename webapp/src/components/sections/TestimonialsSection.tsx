import { Quote } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/content/landingContent";

export function TestimonialsSection() {
  return (
    <section className="section testimonials-section">
      <div className="section-inner">
        <SectionHeading
          eyebrow="Placeholder testimonials"
          title="What the experience is designed to feel like."
          description="These quotes are presentation placeholders only and must be replaced with verified user feedback before public marketing."
          align="center"
        />
        <div className="testimonial-grid">
          {testimonials.map((testimonial, index) => (
            <Reveal className="testimonial-card" delay={index * 0.06} key={testimonial.name}>
              <Quote size={22} />
              <blockquote>{testimonial.quote}</blockquote>
              <div>
                <strong>{testimonial.name}</strong>
                <span>{testimonial.role}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
