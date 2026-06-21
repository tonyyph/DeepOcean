import { faqs } from "@/content/landingContent";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FAQSection() {
  return (
    <section id="faq" className="section faq-section">
      <div className="section-inner faq-grid">
        <SectionHeading
          eyebrow="FAQ"
          title="Before your first descent."
          description="A concise guide to the current product behavior and launch status."
        />
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details key={faq.question} open={index === 0}>
              <summary>{faq.question}<span>+</span></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
