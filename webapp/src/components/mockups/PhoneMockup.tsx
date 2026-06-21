import {
  Bell,
  ChevronRight,
  FishSymbol,
  Flame,
  Pause,
  Sparkles,
  Star,
  Trophy,
  Waves,
} from "lucide-react";

type PhoneMockupProps = {
  screen: "home" | "dive" | "collection" | "insights";
  compact?: boolean;
};

export function PhoneMockup({ screen, compact = false }: PhoneMockupProps) {
  return (
    <div className={`phone-shell${compact ? " phone-shell-compact" : ""}`}>
      <div className="phone-island" />
      <div className="phone-statusbar">
        <span>9:41</span>
        <span className="status-dots">● ● ●</span>
      </div>
      <div className="phone-screen">{renderScreen(screen)}</div>
      <div className="phone-home-indicator" />
    </div>
  );
}

function renderScreen(screen: PhoneMockupProps["screen"]) {
  if (screen === "home") {
    return (
      <div className="mock-home">
        <div className="mock-topline">
          <span>GOOD EVENING,</span>
          <Bell size={15} />
        </div>
        <h3>Alex</h3>
        <p>Ready when you are.</p>
        <div className="mock-card last-dive">
          <span>LAST DIVE</span>
          <strong>Twilight Zone</strong>
          <small>25 min · +275 XP · 2 discoveries</small>
        </div>
        <div className="mock-dive-card">
          <span>BEGIN DIVE</span>
          <strong>25</strong>
          <small>minutes</small>
          <p>Estimated reach · Twilight Zone</p>
          <div className="mock-pills">
            <i>15m</i><i>25m</i><i>45m</i><i>∞</i>
          </div>
        </div>
        <div className="mock-stats">
          <span><Flame size={13} /> 7d</span>
          <span><Waves size={13} /> 24</span>
          <span><Trophy size={13} /> 6</span>
        </div>
      </div>
    );
  }

  if (screen === "dive") {
    return (
      <div className="mock-dive">
        <div className="mock-depth-row">
          <span>TWILIGHT ZONE</span>
          <strong>684 m</strong>
        </div>
        <div className="mock-depth-ring">
          <div>
            <span>18:42</span>
            <small>DIVE TIME</small>
          </div>
        </div>
        <p><Sparkles size={13} /> 2 discoveries</p>
        <button type="button"><Pause size={15} /> Pause</button>
        <div className="mock-secondary-actions">
          <span>Surface</span>
          <span>Abort</span>
        </div>
      </div>
    );
  }

  if (screen === "collection") {
    return (
      <div className="mock-collection">
        <span className="mock-kicker">EXPEDITION LOG</span>
        <h3>42 / 164 catalogued</h3>
        <div className="mock-filter-row"><i>All</i><i>Rare</i><i>Mythic</i></div>
        {[
          ["✦", "Crystal Jelly", "TWILIGHT · RARE"],
          ["◆", "Navigator's Compass", "MIDNIGHT · LEGENDARY"],
          ["✦", "Dumbo Octopus", "ABYSSAL · RARE"],
          ["?", "Undiscovered", "??? · MYTHIC"],
        ].map(([icon, title, meta]) => (
          <div className="mock-log-row" key={title}>
            <b>{icon}</b>
            <span><strong>{title}</strong><small>{meta}</small></span>
            <ChevronRight size={14} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mock-insights">
      <span className="mock-kicker">MARINE GUIDE</span>
      <h3>A quiet voice from the deep</h3>
      <div className="mock-card">
        <span>TODAY</span>
        <p>Try a 25-minute dive. Your recent rhythm is strongest when the goal stays simple.</p>
      </div>
      <div className="mock-chart-card">
        <span>WEEKLY HEATMAP</span>
        <div className="mock-bars">
          {[32, 58, 22, 75, 46, 88, 64].map((height, index) => (
            <i key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
      <div className="mock-pro-row">
        <Star size={14} />
        <span>DEEP INSIGHTS · PRO</span>
        <FishSymbol size={16} />
      </div>
    </div>
  );
}
