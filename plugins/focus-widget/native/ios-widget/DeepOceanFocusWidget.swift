import SwiftUI
import WidgetKit

private let widgetSnapshotKey = "app.widget.snapshot"
private let widgetAppGroup = "__APP_GROUP__"

struct DeepOceanWidgetEntry: TimelineEntry {
  let date: Date
  let snapshot: WidgetSnapshot
}

struct WidgetSnapshot: Decodable {
  struct Session: Decodable {
    let status: String
    let elapsedSeconds: Int
    let targetSeconds: Int?
  }

  let isPremium: Bool
  let preferredMinutes: Int
  let session: Session?
  let primaryAction: String

  static let fallback = WidgetSnapshot(
    isPremium: false,
    preferredMinutes: 25,
    session: nil,
    primaryAction: "start_focus"
  )

  var title: String {
    switch primaryAction {
    case "pause_session": return "Pause Dive"
    case "resume_current": return "Resume Dive"
    case "skip_break": return "Skip Break"
    default: return "Start Focus"
    }
  }

  var actionURL: URL {
    URL(string: "deepocean://widget?action=\(primaryAction)&minutes=\(preferredMinutes)")!
  }

  var context: String {
    guard let session, let target = session.targetSeconds, session.status == "diving" else {
      return "Next: \(preferredMinutes)m"
    }
    return "\(Self.minutesLeft(elapsed: session.elapsedSeconds, target: target))m left"
  }

  var progressLabel: String {
    guard let session, let target = session.targetSeconds, target > 0 else {
      return isPremium ? "Prime" : "Ready"
    }
    return "\(Self.progress(elapsed: session.elapsedSeconds, target: target))%"
  }

  var goalLabel: String {
    guard let session, let target = session.targetSeconds, target > 0 else {
      return "Goal \(preferredMinutes)m"
    }
    return "Goal \(Self.progress(elapsed: session.elapsedSeconds, target: target))%"
  }

  var metricLine: String {
    guard let session, let target = session.targetSeconds, target > 0 else {
      return "One tap starts your next deep-work block"
    }
    return "\(Self.clock(session.elapsedSeconds)) elapsed · \(Self.minutesLeft(elapsed: session.elapsedSeconds, target: target))m left"
  }

  var insight: String {
    isPremium ? "Smart window ready · AI plan unlocked" : "AI and progress are one tap away"
  }

  private static func progress(elapsed: Int, target: Int) -> Int {
    min(100, max(0, (max(0, elapsed) * 100) / max(1, target)))
  }

  private static func minutesLeft(elapsed: Int, target: Int) -> Int {
    max(0, target - max(0, elapsed) + 59) / 60
  }

  private static func clock(_ seconds: Int) -> String {
    let safe = max(0, seconds)
    return "\(min(999, safe / 60)):" + String(format: "%02d", safe % 60)
  }
}

struct DeepOceanWidgetProvider: TimelineProvider {
  func placeholder(in context: Context) -> DeepOceanWidgetEntry {
    DeepOceanWidgetEntry(date: Date(), snapshot: .fallback)
  }

  func getSnapshot(in context: Context, completion: @escaping (DeepOceanWidgetEntry) -> Void) {
    completion(readEntry())
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<DeepOceanWidgetEntry>) -> Void) {
    let entry = readEntry()
    let next = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date().addingTimeInterval(900)
    completion(Timeline(entries: [entry], policy: .after(next)))
  }

  private func readEntry() -> DeepOceanWidgetEntry {
    let defaults = UserDefaults(suiteName: widgetAppGroup)
    guard
      let raw = defaults?.string(forKey: widgetSnapshotKey),
      let data = raw.data(using: .utf8),
      let snapshot = try? JSONDecoder().decode(WidgetSnapshot.self, from: data)
    else {
      return DeepOceanWidgetEntry(date: Date(), snapshot: .fallback)
    }

    return DeepOceanWidgetEntry(date: Date(), snapshot: snapshot)
  }
}

struct DeepOceanFocusWidgetEntryView: View {
  @Environment(\.widgetFamily) private var family
  let entry: DeepOceanWidgetProvider.Entry

  var body: some View {
    ZStack {
      OceanGlassBackground(isPremium: entry.snapshot.isPremium)

      switch family {
      case .systemSmall:
        SmallWidget(snapshot: entry.snapshot)
      case .systemMedium:
        MediumWidget(snapshot: entry.snapshot)
      default:
        LargeWidget(snapshot: entry.snapshot)
      }
    }
    .containerBackground(for: .widget) {
      OceanGlassBackground(isPremium: entry.snapshot.isPremium)
    }
  }
}

private struct SmallWidget: View {
  let snapshot: WidgetSnapshot

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack {
        Spacer()
        if snapshot.isPremium {
          PremiumPill(text: "PRO")
        }
      }

      Link(destination: snapshot.actionURL) {
        PrimaryCTA(title: snapshot.title, compact: false)
      }

      HStack(spacing: 6) {
        Text(snapshot.context)
          .font(.system(.caption, design: .rounded).weight(.semibold))
          .lineLimit(1)
          .foregroundStyle(.white)
        Spacer(minLength: 2)
        ProgressChip(text: snapshot.progressLabel)
      }
      .minimumScaleFactor(0.82)
    }
    .padding(12)
  }
}

private struct MediumWidget: View {
  let snapshot: WidgetSnapshot

  var body: some View {
    VStack(spacing: 10) {
      HStack(spacing: 10) {
        Link(destination: snapshot.actionURL) {
          PrimaryCTA(title: snapshot.title, compact: false)
        }

        VStack(spacing: 8) {
          UtilityLink(title: "AI", url: "deepocean://widget?action=open_ai_companion")
          UtilityLink(title: "Stats", url: "deepocean://widget?action=view_daily_progress")
        }
        .frame(width: 92)
      }

      GlassPanel {
        HStack(spacing: 8) {
          Text(snapshot.session?.status == "diving" ? "In dive · \(snapshot.context)" : "Ready for a \(snapshot.preferredMinutes)m dive")
            .font(.system(.caption, design: .rounded).weight(.semibold))
            .foregroundStyle(.white)
            .lineLimit(1)
          Spacer(minLength: 4)
          if snapshot.isPremium {
            PremiumPill(text: "PRO")
          }
          ProgressChip(text: snapshot.progressLabel)
        }
      }
    }
    .padding(12)
  }
}

private struct LargeWidget: View {
  let snapshot: WidgetSnapshot

  var body: some View {
    VStack(spacing: 10) {
      HStack(spacing: 10) {
        Link(destination: snapshot.actionURL) {
          PrimaryCTA(title: snapshot.title, compact: false)
        }
        GlassPanel {
          VStack(spacing: 4) {
            Text(snapshot.goalLabel)
              .font(.system(.caption, design: .rounded).weight(.bold))
              .foregroundStyle(.white)
              .lineLimit(1)
            PremiumPill(text: snapshot.isPremium ? "PRO TIDE" : "FOCUS")
          }
          .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .frame(width: 112)
      }
      .frame(height: 58)

      HStack(spacing: 7) {
        UtilityLink(title: "Resume", url: "deepocean://widget?action=resume_current")
        UtilityLink(title: "Pause", url: "deepocean://widget?action=pause_session")
        UtilityLink(title: "Skip", url: "deepocean://widget?action=skip_break")
        UtilityLink(title: "AI", url: "deepocean://widget?action=open_ai_companion")
        UtilityLink(title: "Stats", url: "deepocean://widget?action=view_daily_progress")
      }
      .frame(height: 44)

      GlassPanel {
        VStack(alignment: .leading, spacing: 4) {
          Text(snapshot.metricLine)
            .font(.system(.subheadline, design: .rounded).weight(.bold))
            .foregroundStyle(.white)
            .lineLimit(1)
          Text(snapshot.insight)
            .font(.system(.caption, design: .rounded).weight(.medium))
            .foregroundStyle(.white.opacity(0.72))
            .lineLimit(1)
          if snapshot.isPremium {
            Text("Premium layout: smarter cue, glass depth, richer state")
              .font(.system(size: 10, weight: .bold, design: .rounded))
              .foregroundStyle(Color(red: 1.0, green: 0.82, blue: 0.48))
              .lineLimit(1)
          }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
      }
    }
    .padding(14)
  }
}

private struct PrimaryCTA: View {
  let title: String
  let compact: Bool

  var body: some View {
    Text(title)
      .font(.system(size: compact ? 15 : 17, weight: .heavy, design: .rounded))
      .foregroundStyle(Color(red: 0.01, green: 0.06, blue: 0.11))
      .minimumScaleFactor(0.78)
      .lineLimit(1)
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      .padding(.horizontal, 12)
      .background(
        LinearGradient(
          colors: [
            Color(red: 1.0, green: 0.91, blue: 0.65),
            Color(red: 0.37, green: 0.97, blue: 0.88),
            Color(red: 0.13, green: 0.89, blue: 1.0)
          ],
          startPoint: .topLeading,
          endPoint: .bottomTrailing
        )
      )
      .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
      .shadow(color: Color(red: 0.13, green: 0.89, blue: 1.0).opacity(0.32), radius: 12, y: 4)
  }
}

private struct UtilityLink: View {
  let title: String
  let url: String

  var body: some View {
    Link(destination: URL(string: url)!) {
      Text(title)
        .font(.system(.caption, design: .rounded).weight(.bold))
        .foregroundStyle(.white)
        .minimumScaleFactor(0.74)
        .lineLimit(1)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.white.opacity(0.12))
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
          RoundedRectangle(cornerRadius: 18, style: .continuous)
            .stroke(Color(red: 0.37, green: 0.97, blue: 0.88).opacity(0.2), lineWidth: 1)
        )
    }
  }
}

private struct GlassPanel<Content: View>: View {
  let content: Content

  init(@ViewBuilder content: () -> Content) {
    self.content = content()
  }

  var body: some View {
    content
      .padding(.horizontal, 12)
      .padding(.vertical, 8)
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      .background(Color.white.opacity(0.105))
      .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
      .overlay(
        RoundedRectangle(cornerRadius: 22, style: .continuous)
          .stroke(Color.white.opacity(0.16), lineWidth: 1)
      )
  }
}

private struct PremiumPill: View {
  let text: String

  var body: some View {
    Text(text)
      .font(.system(size: 9, weight: .heavy, design: .rounded))
      .foregroundStyle(Color(red: 1.0, green: 0.82, blue: 0.48))
      .lineLimit(1)
      .padding(.horizontal, 8)
      .padding(.vertical, 4)
      .background(Color(red: 1.0, green: 0.82, blue: 0.48).opacity(0.14))
      .clipShape(Capsule())
      .overlay(Capsule().stroke(Color(red: 1.0, green: 0.82, blue: 0.48).opacity(0.55), lineWidth: 1))
  }
}

private struct ProgressChip: View {
  let text: String

  var body: some View {
    Text(text)
      .font(.system(size: 10, weight: .heavy, design: .rounded))
      .foregroundStyle(Color(red: 0.75, green: 0.97, blue: 1.0))
      .lineLimit(1)
      .padding(.horizontal, 8)
      .padding(.vertical, 4)
      .background(Color.white.opacity(0.14))
      .clipShape(Capsule())
  }
}

private struct OceanGlassBackground: View {
  let isPremium: Bool

  var body: some View {
    ZStack {
      LinearGradient(
        colors: [
          Color(red: 0.02, green: 0.07, blue: 0.13),
          Color(red: 0.03, green: 0.18, blue: 0.28),
          Color(red: 0.0, green: 0.02, blue: 0.07)
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
      )
      Circle()
        .fill(Color(red: 0.13, green: 0.89, blue: 1.0).opacity(isPremium ? 0.28 : 0.18))
        .blur(radius: 28)
        .frame(width: 120, height: 120)
        .offset(x: -70, y: -48)
      Circle()
        .fill(Color(red: 1.0, green: 0.82, blue: 0.48).opacity(isPremium ? 0.18 : 0.06))
        .blur(radius: 30)
        .frame(width: 132, height: 132)
        .offset(x: 86, y: 58)
    }
  }
}

struct DeepOceanFocusWidget: Widget {
  let kind: String = "DeepOceanFocusWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: DeepOceanWidgetProvider()) { entry in
      DeepOceanFocusWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("DeepOcean Focus")
    .description("Start and control focus sessions directly from your Home Screen.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    .contentMarginsDisabled()
  }
}
