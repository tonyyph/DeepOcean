import { ArrowDown, Waves } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { problemSolution } from "@/content/landingContent";

export function ProblemSolutionSection() {
  return (
    <section id="problem" className="section problem-section">
      <div className="section-inner problem-grid">
        <Reveal className="problem-card problem-card-muted">
          <span className="problem-index">01</span>
          <p className="eyebrow">{problemSolution.problem.eyebrow}</p>
          <h2>{problemSolution.problem.title}</h2>
          <p>{problemSolution.problem.body}</p>
          <div className="problem-visual" aria-hidden>
            <span>25:00</span>
            <i />
            <small>another countdown</small>
          </div>
        </Reveal>

        <div className="problem-connector" aria-hidden>
          <ArrowDown size={18} />
        </div>

        <Reveal className="problem-card problem-card-solution" delay={0.12}>
          <span className="problem-index">02</span>
          <p className="eyebrow">{problemSolution.solution.eyebrow}</p>
          <h2>{problemSolution.solution.title}</h2>
          <p>{problemSolution.solution.body}</p>
          <div className="solution-visual">
            <Waves size={28} />
            <div>
              <strong>Focus becomes a place.</strong>
              <small>A ritual you can return to.</small>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
