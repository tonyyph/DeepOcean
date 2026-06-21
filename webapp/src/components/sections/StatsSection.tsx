import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { progressFeatures, progressMetrics } from "@/content/landingContent";

export function StatsSection() {
  return (
    <section id="progress" className="section stats-section">
      <div className="section-inner">
        <SectionHeading
          eyebrow="Progress without pressure"
          title="A history of attention you can actually feel."
          description="Deep Ocean turns sessions into a coherent personal record: where you went, how often you returned, and what your focus revealed."
          align="center"
        />
        <div className="metric-grid">
          {progressMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Reveal className="metric-card" delay={index * 0.05} key={metric.label}>
                <Icon size={18} />
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </Reveal>
            );
          })}
        </div>
        <div className="progress-detail-grid">
          <Reveal className="analytics-visual">
            <div className="analytics-heading">
              <span>WEEKLY FOCUS</span>
              <strong>3h 42m</strong>
            </div>
            <div className="analytics-bars">
              {[38, 74, 24, 58, 91, 46, 68].map((height, index) => (
                <div key={index}>
                  <i style={{ height: `${height}%` }} />
                  <span>{["M", "T", "W", "T", "F", "S", "S"][index]}</span>
                </div>
              ))}
            </div>
            <div className="analytics-footer">
              <span>Longest streak <strong>12 days</strong></span>
              <span>Max depth <strong>4,280 m</strong></span>
            </div>
          </Reveal>
          <div className="progress-feature-list">
            {progressFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Reveal className="progress-feature" delay={index * 0.06} key={feature.title}>
                  <span><Icon size={20} /></span>
                  <div><h3>{feature.title}</h3><p>{feature.body}</p></div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
