import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { intelligence } from "@/content/landingContent";

export function AISection() {
  return (
    <section id="ai-companion" className="section ai-section">
      <div className="section-inner ai-grid">
        <Reveal className="ai-console">
          <div className="ai-console-header">
            <span className="ai-pulse" />
            <div>
              <strong>Marine Guide</strong>
              <small>Context from your recent rhythm</small>
            </div>
          </div>
          <div className="ai-message">
            <span>TODAY</span>
            <p>
              Your recent dives are strongest when you begin with one clear
              task. Try 25 minutes and let consistency matter more than depth.
            </p>
          </div>
          <div className="ai-context-row">
            <span>Mood · Calm</span>
            <span>Streak · 7 days</span>
            <span>Zone · Twilight</span>
          </div>
          <div className="ai-provider-note">
            Hosted provider when available · cached/local guide when offline
          </div>
        </Reveal>

        <div>
          <SectionHeading
            eyebrow="AI & personalization"
            title="A companion that listens to the dive log."
            description="Recommendations are grounded in user goals and actual app context—not a generic chat window bolted onto a timer."
          />
          <div className="intelligence-list">
            {intelligence.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal className="intelligence-item" delay={index * 0.06} key={item.title}>
                  <span><Icon size={20} /></span>
                  <div><h3>{item.title}</h3><p>{item.description}</p></div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
