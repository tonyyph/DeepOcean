import SwiftUI
import UIKit
import WidgetKit

private let widgetSnapshotKey = "app.widget.snapshot"
private let widgetAppGroup = "__APP_GROUP__"

private enum OceanColor {
  static let abyss = Color(red: 0.01, green: 0.04, blue: 0.09)
  static let cyan = Color(red: 0.10, green: 0.82, blue: 0.98)
  static let teal = Color(red: 0.22, green: 0.76, blue: 0.72)
  static let violet = Color(red: 0.48, green: 0.38, blue: 0.96)
  static let pearl = Color(red: 0.94, green: 0.97, blue: 1)
  static let mist = Color(red: 0.66, green: 0.78, blue: 0.88)
  static let track = Color(red: 0.08, green: 0.25, blue: 0.39)
}

private enum WidgetConcept {
  case portal
  case instrument
  case living
}

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

  let capturedAt: Double
  let isPremium: Bool
  let language: String
  let preferredMinutes: Int
  let streakDays: Int
  let todayFocusMinutes: Int
  let dailyTargetMinutes: Int
  let weeklyFocusMinutes: Int
  let weeklyTargetMinutes: Int
  let currentZone: String
  let currentDepthMeters: Int
  let discoveryCount: Int
  let totalDives: Int
  let session: Session?
  let primaryAction: String

  static let fallback = WidgetSnapshot(
    capturedAt: 0,
    isPremium: false,
    language: "en",
    preferredMinutes: 25,
    streakDays: 0,
    todayFocusMinutes: 0,
    dailyTargetMinutes: 25,
    weeklyFocusMinutes: 0,
    weeklyTargetMinutes: 125,
    currentZone: "Sunlight Zone",
    currentDepthMeters: 0,
    discoveryCount: 0,
    totalDives: 0,
    session: nil,
    primaryAction: "start_focus"
  )

  var isVietnamese: Bool { language == "vi" }
  var isActive: Bool { session?.status == "diving" }
  var todayProgress: Double {
    min(1, max(0, Double(todayFocusMinutes) / Double(max(1, dailyTargetMinutes))))
  }
  var depthProgress: Double {
    min(1, max(0, Double(currentDepthMeters) / 6_000))
  }
  var actionTitle: String {
    switch primaryAction {
    case "pause_session": return isVietnamese ? "Tạm dừng" : "Pause Dive"
    case "resume_current": return isVietnamese ? "Tiếp tục lặn" : "Resume Dive"
    default: return isVietnamese ? "Bắt đầu lặn" : "Start Dive"
    }
  }
  var actionURL: URL {
    URL(string: "deepocean-widget://widget?action=\(primaryAction)&minutes=\(preferredMinutes)")!
  }
  var zoneLabel: String {
    guard isVietnamese else { return currentZone }
    switch currentZone {
    case "Twilight Zone": return "Vùng Chạng Vạng"
    case "Midnight Zone": return "Vùng Nửa Đêm"
    case "Abyssal Zone": return "Vùng Vực Thẳm"
    case "Hadal Trench": return "Rãnh Hadal"
    default: return "Vùng Ánh Sáng"
    }
  }
  var oceanLevel: Int {
    switch currentZone {
    case "Twilight Zone": return 2
    case "Midnight Zone": return 3
    case "Abyssal Zone": return 4
    case "Hadal Trench": return 5
    default: return 1
    }
  }
  var message: String {
    if isActive {
      return isVietnamese ? "Biển đang thức giấc…" : "The ocean is awakening…"
    }
    return isVietnamese ? "Chạm để bắt đầu chuyến lặn." : "Tap to begin your dive."
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
    let next = Calendar.current.date(byAdding: .minute, value: 10, to: Date()) ?? Date().addingTimeInterval(600)
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

private struct ConceptEntryView: View {
  @Environment(\.widgetFamily) private var family
  let entry: DeepOceanWidgetProvider.Entry
  let concept: WidgetConcept

  var body: some View {
    Group {
      switch concept {
      case .portal:
        PortalWidget(snapshot: entry.snapshot, family: family)
      case .instrument:
        InstrumentWidget(snapshot: entry.snapshot, family: family)
      case .living:
        LivingWidget(snapshot: entry.snapshot, family: family)
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .clipped()
    .widgetURL(entry.snapshot.actionURL)
    .containerBackground(for: .widget) {
      ConceptBackground(concept: concept, family: family)
    }
  }
}

private struct ConceptBackground: View {
  let concept: WidgetConcept
  let family: WidgetFamily

  var body: some View {
    switch concept {
    case .portal:
      PortalBackground(family: family)
    case .instrument:
      InstrumentBackground()
    case .living:
      LivingBackground(family: family)
    }
  }
}

// MARK: - Concept 1 · Ocean Portal

private struct PortalWidget: View {
  let snapshot: WidgetSnapshot
  let family: WidgetFamily

  var body: some View {
    ZStack {
      LinearGradient(
        colors: [Color.clear, OceanColor.abyss.opacity(0.76)],
        startPoint: .top,
        endPoint: .bottom
      )

      switch family {
      case .systemSmall: portalSmall
      case .systemMedium: portalMedium
      default: portalLarge
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .clipped()
  }

  private var portalSmall: some View {
    VStack(spacing: 6) {
      Spacer()
      FullColorLogo(size: 42)
      Text(snapshot.zoneLabel)
        .font(.system(size: 12, weight: .medium, design: .rounded))
        .foregroundStyle(OceanColor.pearl)
        .lineLimit(1)
      Text("\(snapshot.currentDepthMeters)m")
        .font(.system(size: 22, weight: .bold, design: .rounded))
        .foregroundStyle(OceanColor.cyan)
    }
    .padding(24)
  }

  private var portalMedium: some View {
    VStack(alignment: .leading, spacing: 0) {
      OceanBrand()
      Spacer()
      Text(snapshot.zoneLabel)
        .font(.system(size: 20, weight: .bold, design: .rounded))
        .foregroundStyle(OceanColor.pearl)
      Text("\(snapshot.todayFocusMinutes) / \(snapshot.dailyTargetMinutes) \(snapshot.isVietnamese ? "phút" : "min")")
        .font(.system(size: 17, weight: .semibold, design: .rounded))
        .foregroundStyle(OceanColor.cyan)
        .padding(.top, 8)
      Spacer()
      MetricLine(snapshot: snapshot, discoveries: false)
    }
    .padding(24)
  }

  private var portalLarge: some View {
    VStack(alignment: .leading, spacing: 0) {
      OceanBrand()
      Spacer()
      Text("\(snapshot.todayFocusMinutes) / \(snapshot.dailyTargetMinutes) \(snapshot.isVietnamese ? "phút" : "min")")
        .font(.system(size: 30, weight: .bold, design: .rounded))
        .foregroundStyle(OceanColor.pearl)
      Text(snapshot.zoneLabel)
        .font(.system(size: 16, weight: .medium, design: .rounded))
        .foregroundStyle(OceanColor.pearl)
        .padding(.top, 5)
      MetricLine(snapshot: snapshot, discoveries: true)
        .padding(.top, 20)
      Link(destination: snapshot.actionURL) {
        OceanActionButton(snapshot: snapshot)
      }
      .frame(height: 50)
      .padding(.top, 22)
    }
    .padding(24)
  }
}

private struct PortalBackground: View {
  let family: WidgetFamily
  var body: some View {
    BundledWidgetImage(
      name: family == .systemSmall ? "OceanPortalSquare" : "OceanPortalWide",
      fallback: LinearGradient(
        colors: [
          Color(red: 0.02, green: 0.32, blue: 0.52),
          Color(red: 0.01, green: 0.10, blue: 0.22),
          OceanColor.abyss
        ],
        startPoint: .top,
        endPoint: .bottom
      )
    )
  }
}

// MARK: - Concept 2 · Diving Instrument

private struct InstrumentWidget: View {
  let snapshot: WidgetSnapshot
  let family: WidgetFamily

  var body: some View {
    ZStack {
      switch family {
      case .systemSmall: instrumentSmall
      case .systemMedium: instrumentMedium
      default: instrumentLarge
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .clipped()
  }

  private var instrumentSmall: some View {
    VStack(spacing: 8) {
      DepthGauge(snapshot: snapshot, diameter: 116)
      Text(snapshot.zoneLabel)
        .font(.system(size: 12, weight: .medium, design: .rounded))
        .foregroundStyle(OceanColor.pearl)
        .lineLimit(1)
    }
    .padding(20)
  }

  private var instrumentMedium: some View {
    HStack(spacing: 26) {
      DepthGauge(snapshot: snapshot, diameter: 126)
      VStack(alignment: .leading, spacing: 0) {
        Text(snapshot.zoneLabel)
          .font(.system(size: 15, weight: .medium, design: .rounded))
          .foregroundStyle(OceanColor.mist)
        Text("\(snapshot.todayFocusMinutes) / \(snapshot.dailyTargetMinutes) \(snapshot.isVietnamese ? "phút" : "min")")
          .font(.system(size: 27, weight: .bold, design: .rounded))
          .foregroundStyle(OceanColor.pearl)
          .padding(.top, 10)
        OceanProgress(progress: snapshot.todayProgress)
          .padding(.top, 12)
        Spacer()
        HStack(spacing: 22) {
          InlineMetric(icon: "flame", text: "\(snapshot.streakDays) \(snapshot.isVietnamese ? "ngày" : "days")")
          InlineMetric(icon: "star", text: "\(snapshot.discoveryCount)")
        }
      }
    }
    .padding(24)
  }

  private var instrumentLarge: some View {
    VStack(spacing: 0) {
      HStack(spacing: 28) {
        DepthGauge(snapshot: snapshot, diameter: 176)
        VStack(alignment: .leading, spacing: 0) {
          Text(snapshot.zoneLabel)
            .font(.system(size: 17, weight: .medium, design: .rounded))
            .foregroundStyle(OceanColor.mist)
          Text("\(snapshot.todayFocusMinutes) / \(snapshot.dailyTargetMinutes) \(snapshot.isVietnamese ? "phút" : "min")")
            .font(.system(size: 30, weight: .bold, design: .rounded))
            .foregroundStyle(OceanColor.pearl)
            .padding(.top, 10)
          OceanProgress(progress: snapshot.todayProgress)
            .padding(.top, 14)
          InlineMetric(icon: "flame", text: "\(snapshot.streakDays) \(snapshot.isVietnamese ? "ngày" : "days")")
            .padding(.top, 24)
          InlineMetric(icon: "star", text: "\(snapshot.discoveryCount) \(snapshot.isVietnamese ? "khám phá" : "discoveries")")
            .padding(.top, 14)
        }
      }
      Spacer()
      Link(destination: snapshot.actionURL) {
        OceanActionButton(snapshot: snapshot)
      }
      .frame(height: 50)
    }
    .padding(24)
  }
}

private struct InstrumentBackground: View {
  var body: some View {
    ZStack {
      LinearGradient(
        colors: [
          Color(red: 0.03, green: 0.19, blue: 0.33),
          Color(red: 0.02, green: 0.10, blue: 0.21),
          OceanColor.abyss
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
      )
      Circle()
        .fill(OceanColor.violet.opacity(0.24))
        .blur(radius: 40)
        .frame(width: 180)
        .offset(x: 120, y: -90)
      Circle()
        .fill(OceanColor.cyan.opacity(0.13))
        .blur(radius: 34)
        .frame(width: 150)
        .offset(x: -110, y: 100)
    }
  }
}

private struct DepthGauge: View {
  let snapshot: WidgetSnapshot
  let diameter: CGFloat

  var body: some View {
    ZStack {
      Circle()
        .stroke(OceanColor.track.opacity(0.7), style: StrokeStyle(lineWidth: 8, dash: [2, 5]))
      Circle()
        .trim(from: 0.08, to: 0.08 + snapshot.depthProgress * 0.84)
        .stroke(
          AngularGradient(
            colors: [OceanColor.cyan, OceanColor.teal, OceanColor.violet],
            center: .center
          ),
          style: StrokeStyle(lineWidth: 8, lineCap: .round)
        )
        .rotationEffect(.degrees(90))
      VStack(spacing: -2) {
        Text("\(snapshot.currentDepthMeters)")
          .font(.system(size: diameter * 0.29, weight: .bold, design: .rounded))
          .foregroundStyle(OceanColor.pearl)
          .minimumScaleFactor(0.6)
          .lineLimit(1)
        Text("m")
          .font(.system(size: 13, weight: .semibold, design: .rounded))
          .foregroundStyle(OceanColor.pearl)
      }
    }
    .frame(width: diameter, height: diameter)
  }
}

// MARK: - Concept 3 · Living Ocean

private struct LivingWidget: View {
  let snapshot: WidgetSnapshot
  let family: WidgetFamily

  var body: some View {
    ZStack {
      LinearGradient(
        colors: [Color.clear, OceanColor.abyss.opacity(0.84)],
        startPoint: .top,
        endPoint: .bottom
      )
      switch family {
      case .systemSmall: livingSmall
      case .systemMedium: livingMedium
      default: livingLarge
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .clipped()
  }

  private var livingSmall: some View {
    VStack(spacing: 3) {
      Spacer()
      Text("Ocean Level \(snapshot.oceanLevel)")
        .font(.system(size: 13, weight: .medium, design: .rounded))
        .foregroundStyle(OceanColor.pearl)
      Text("\(snapshot.todayFocusMinutes) \(snapshot.isVietnamese ? "phút" : "min")")
        .font(.system(size: 15, weight: .bold, design: .rounded))
        .foregroundStyle(OceanColor.cyan)
    }
    .padding(24)
  }

  private var livingMedium: some View {
    HStack(spacing: 0) {
      Spacer()
      VStack(alignment: .leading, spacing: 0) {
        Text(snapshot.zoneLabel)
          .font(.system(size: 15, weight: .medium, design: .rounded))
          .foregroundStyle(OceanColor.mist)
        Text("\(snapshot.todayFocusMinutes) / \(snapshot.dailyTargetMinutes) \(snapshot.isVietnamese ? "phút" : "min")")
          .font(.system(size: 26, weight: .bold, design: .rounded))
          .foregroundStyle(OceanColor.pearl)
          .padding(.top, 9)
        OceanProgress(progress: snapshot.todayProgress)
          .padding(.top, 13)
        Spacer()
        HStack(spacing: 22) {
          InlineMetric(icon: "water.waves", text: "\(snapshot.currentDepthMeters)m")
          InlineMetric(icon: "star", text: "\(snapshot.streakDays) \(snapshot.isVietnamese ? "ngày" : "days")")
        }
      }
      .frame(width: 170)
    }
    .padding(24)
  }

  private var livingLarge: some View {
    VStack(alignment: .leading, spacing: 0) {
      OceanBrand()
      Spacer()
      Text(snapshot.zoneLabel)
        .font(.system(size: 17, weight: .medium, design: .rounded))
        .foregroundStyle(OceanColor.pearl)
      Text("\(snapshot.todayFocusMinutes) / \(snapshot.dailyTargetMinutes) \(snapshot.isVietnamese ? "phút" : "min")")
        .font(.system(size: 31, weight: .bold, design: .rounded))
        .foregroundStyle(OceanColor.pearl)
        .padding(.top, 7)
      OceanProgress(progress: snapshot.todayProgress)
        .frame(maxWidth: 130)
        .padding(.top, 14)
      MetricLine(snapshot: snapshot, discoveries: true)
        .padding(.top, 24)
      Spacer()
      Text(snapshot.message)
        .font(.system(size: 14, weight: .medium, design: .rounded))
        .foregroundStyle(OceanColor.cyan)
    }
    .padding(24)
  }
}

private struct LivingBackground: View {
  let family: WidgetFamily
  var body: some View {
    BundledWidgetImage(
      name: family == .systemSmall ? "LivingJellyfishSquare" : "LivingWhaleWide",
      fallback: LinearGradient(
        colors: [
          Color(red: 0.12, green: 0.20, blue: 0.58),
          Color(red: 0.02, green: 0.13, blue: 0.31),
          OceanColor.abyss
        ],
        startPoint: .topTrailing,
        endPoint: .bottomLeading
      )
    )
  }
}

// MARK: - Shared components

private struct BundledWidgetImage<Fallback: View>: View {
  let name: String
  let fallback: Fallback

  init(name: String, fallback: Fallback) {
    self.name = name
    self.fallback = fallback
  }

  private var image: UIImage? {
    guard let url = Bundle.main.url(forResource: name, withExtension: "png") else {
      return nil
    }
    return UIImage(contentsOfFile: url.path)
  }

  @ViewBuilder
  var body: some View {
    if let image {
      if #available(iOSApplicationExtension 18.0, *) {
        Image(uiImage: image)
          .resizable()
          .widgetAccentedRenderingMode(.fullColor)
          .scaledToFill()
      } else {
        Image(uiImage: image)
          .resizable()
          .scaledToFill()
      }
    } else {
      fallback
    }
  }
}

private struct OceanBrand: View {
  var body: some View {
    HStack(spacing: 8) {
      FullColorLogo(size: 24)
      Text("Deep Ocean")
        .font(.system(size: 14, weight: .semibold, design: .rounded))
        .foregroundStyle(OceanColor.pearl)
    }
  }
}

private struct FullColorLogo: View {
  let size: CGFloat

  private var image: UIImage? {
    guard let url = Bundle.main.url(forResource: "DeepOceanLogo", withExtension: "png") else {
      return nil
    }
    return UIImage(contentsOfFile: url.path)
  }

  @ViewBuilder
  var body: some View {
    if let image {
      if #available(iOSApplicationExtension 18.0, *) {
        Image(uiImage: image)
          .resizable()
          .widgetAccentedRenderingMode(.fullColor)
          .scaledToFit()
          .frame(width: size, height: size)
      } else {
        Image(uiImage: image)
          .resizable()
          .scaledToFit()
          .frame(width: size, height: size)
      }
    } else {
      Image(systemName: "water.waves")
        .font(.system(size: size * 0.62, weight: .semibold))
        .foregroundStyle(OceanColor.cyan)
        .frame(width: size, height: size)
    }
  }
}

private struct MetricLine: View {
  let snapshot: WidgetSnapshot
  let discoveries: Bool

  var body: some View {
    HStack(spacing: 18) {
      InlineMetric(icon: "water.waves", text: "\(snapshot.currentDepthMeters)m")
      Divider().frame(height: 18).overlay(OceanColor.track)
      InlineMetric(icon: "flame", text: "\(snapshot.streakDays) \(snapshot.isVietnamese ? "ngày" : "days")")
      if discoveries {
        Divider().frame(height: 18).overlay(OceanColor.track)
        InlineMetric(icon: "star", text: "\(snapshot.discoveryCount) \(snapshot.isVietnamese ? "khám phá" : "discoveries")")
      }
    }
  }
}

private struct InlineMetric: View {
  let icon: String
  let text: String
  var body: some View {
    HStack(spacing: 6) {
      Image(systemName: icon)
        .font(.system(size: 12, weight: .medium))
        .foregroundStyle(OceanColor.cyan)
      Text(text)
        .font(.system(size: 12, weight: .medium, design: .rounded))
        .foregroundStyle(OceanColor.mist)
        .lineLimit(1)
    }
  }
}

private struct OceanProgress: View {
  let progress: Double
  var body: some View {
    GeometryReader { proxy in
      ZStack(alignment: .leading) {
        Capsule().fill(OceanColor.track)
        Capsule()
          .fill(LinearGradient(colors: [OceanColor.cyan, OceanColor.violet], startPoint: .leading, endPoint: .trailing))
          .frame(width: proxy.size.width * progress)
      }
    }
    .frame(height: 6)
  }
}

private struct OceanActionButton: View {
  let snapshot: WidgetSnapshot
  var body: some View {
    HStack(spacing: 10) {
      Text(snapshot.actionTitle)
        .font(.system(size: 14, weight: .semibold, design: .rounded))
      Image(systemName: "arrow.right")
        .font(.system(size: 12, weight: .semibold))
    }
    .foregroundStyle(OceanColor.cyan)
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .background(OceanColor.abyss.opacity(0.76))
    .clipShape(Capsule())
    .overlay(Capsule().stroke(OceanColor.track.opacity(0.7), lineWidth: 1))
  }
}

// MARK: - Widget configurations

struct DeepOceanPortalWidget: Widget {
  // Keep the original kind stable so widgets already placed on the Home
  // Screen continue rendering after the visual redesign.
  let kind = "DeepOceanFocusWidget"
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: DeepOceanWidgetProvider()) { entry in
      ConceptEntryView(entry: entry, concept: .portal)
    }
    .configurationDisplayName("Ocean Portal")
    .description("A cinematic window into your current Deep Ocean dive.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    .contentMarginsDisabled()
  }
}

struct DeepOceanInstrumentWidget: Widget {
  let kind = "DeepOceanInstrumentWidget"
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: DeepOceanWidgetProvider()) { entry in
      ConceptEntryView(entry: entry, concept: .instrument)
    }
    .configurationDisplayName("Diving Instrument")
    .description("Depth and focus progress presented as a precise dive instrument.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    .contentMarginsDisabled()
  }
}

struct DeepOceanLivingWidget: Widget {
  let kind = "DeepOceanLivingWidget"
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: DeepOceanWidgetProvider()) { entry in
      ConceptEntryView(entry: entry, concept: .living)
    }
    .configurationDisplayName("Living Ocean")
    .description("Bioluminescent ocean life that evolves with your focus.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    .contentMarginsDisabled()
  }
}
