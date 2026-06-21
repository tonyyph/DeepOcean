import { PhoneMockup } from "@/components/mockups/PhoneMockup";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { screenPreviews } from "@/content/landingContent";

export function ScreensPreviewSection() {
  return (
    <section id="screens" className="section screens-section">
      <div className="section-inner">
        <SectionHeading
          eyebrow="Product preview"
          title="The real app flow, rebuilt as faithful web mockups."
          description="These previews follow the current mobile screen hierarchy and wording. Replace them with final App Store screenshots whenever those are ready."
        />
        <div className="screen-gallery">
          {screenPreviews.map((screen, index) => (
            <Reveal className="screen-preview-card" delay={index * 0.06} key={screen.id}>
              <div className="screen-copy">
                <span>{screen.label}</span>
                <h3>{screen.title}</h3>
                <p>{screen.description}</p>
              </div>
              <PhoneMockup
                screen={screen.id as "home" | "dive" | "collection" | "insights"}
                compact
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
