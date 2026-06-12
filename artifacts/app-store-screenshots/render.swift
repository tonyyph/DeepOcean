import AppKit
import Foundation

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let sourceDir = root.appendingPathComponent("assets/screenshots")
let outputDir = root.appendingPathComponent("artifacts/app-store-screenshots/pro")
try FileManager.default.createDirectory(at: outputDir, withIntermediateDirectories: true)

let files = try FileManager.default.contentsOfDirectory(at: sourceDir, includingPropertiesForKeys: nil)
  .filter { $0.pathExtension.lowercased() == "png" }
  .sorted { $0.lastPathComponent < $1.lastPathComponent }

let slides: [(title: String, subtitle: String, tag: String, accent: UInt32)] = [
  ("Focus feels like a dive", "Begin a calm descent and let the ocean hold your attention.", "ritual", 0x67e8f9),
  ("Stay beneath the noise", "A cinematic timer keeps the session quiet, clear, and intentional.", "session", 0x8ce99a),
  ("Surface with discoveries", "Every completed dive can reveal creatures, relics, and lore.", "rewards", 0xffd166),
  ("See your focus take shape", "Depth, streaks, XP, and weekly rhythm at a glance.", "analytics", 0x7dd3fc),
  ("Collect the ocean", "Build a personal bestiary from the dives you finish.", "collection", 0xc4b5fd),
  ("Make it yours", "Themes, reminders, sound, and haptics tuned for your routine.", "profile", 0xfca5a5),
  ("Progress without pressure", "Level up gently with milestones that respect your flow.", "growth", 0x93c5fd),
  ("Designed for daily return", "A premium focus companion in English and Vietnamese.", "companion", 0x5eead4)
]

let canvas = CGSize(width: 1290, height: 2796)
let logo = NSImage(contentsOf: root.appendingPathComponent("assets/images/logo.png"))

func color(_ hex: UInt32, _ alpha: CGFloat = 1) -> NSColor {
  NSColor(
    calibratedRed: CGFloat((hex >> 16) & 0xff) / 255,
    green: CGFloat((hex >> 8) & 0xff) / 255,
    blue: CGFloat(hex & 0xff) / 255,
    alpha: alpha
  )
}

func roundedRect(_ rect: CGRect, radius: CGFloat) -> NSBezierPath {
  NSBezierPath(roundedRect: rect, xRadius: radius, yRadius: radius)
}

func drawText(_ value: String, rect: CGRect, font: NSFont, color: NSColor, align: NSTextAlignment = .left, lineHeight: CGFloat? = nil) {
  let paragraph = NSMutableParagraphStyle()
  paragraph.alignment = align
  paragraph.lineBreakMode = .byWordWrapping
  if let lineHeight {
    paragraph.minimumLineHeight = lineHeight
    paragraph.maximumLineHeight = lineHeight
  }
  value.draw(
    with: rect,
    options: [.usesLineFragmentOrigin, .usesFontLeading],
    attributes: [.font: font, .foregroundColor: color, .paragraphStyle: paragraph]
  )
}

func drawLinearGlow(from start: CGPoint, to end: CGPoint, color glow: NSColor, width: CGFloat) {
  let path = NSBezierPath()
  path.move(to: start)
  path.line(to: end)
  glow.setStroke()
  path.lineWidth = width
  path.lineCapStyle = .round
  path.stroke()
}

func drawPhone(_ screenshot: NSImage, in rect: CGRect, accent: UInt32) {
  NSGraphicsContext.saveGraphicsState()
  let shadow = NSShadow()
  shadow.shadowColor = NSColor.black.withAlphaComponent(0.54)
  shadow.shadowBlurRadius = 78
  shadow.shadowOffset = CGSize(width: 0, height: -38)
  shadow.set()
  color(0x020711).setFill()
  roundedRect(rect, radius: 108).fill()
  NSGraphicsContext.restoreGraphicsState()

  color(0xffffff, 0.15).setStroke()
  let outer = roundedRect(rect.insetBy(dx: 3, dy: 3), radius: 104)
  outer.lineWidth = 6
  outer.stroke()

  color(accent, 0.45).setStroke()
  let glowStroke = roundedRect(rect.insetBy(dx: 11, dy: 11), radius: 94)
  glowStroke.lineWidth = 2
  glowStroke.stroke()

  color(0x0b1220).setFill()
  let screen = rect.insetBy(dx: 22, dy: 22)
  roundedRect(screen, radius: 84).fill()

  NSGraphicsContext.saveGraphicsState()
  roundedRect(screen, radius: 84).addClip()
  screenshot.draw(in: screen, from: .zero, operation: .sourceOver, fraction: 1)
  NSGraphicsContext.restoreGraphicsState()

  color(0xffffff, 0.18).setFill()
  roundedRect(CGRect(x: rect.minX - 7, y: rect.maxY - 620, width: 7, height: 160), radius: 3.5).fill()
  roundedRect(CGRect(x: rect.maxX, y: rect.maxY - 740, width: 7, height: 250), radius: 3.5).fill()
}

for (index, file) in files.enumerated() {
  guard let source = NSImage(contentsOf: file) else { continue }
  let slide = slides[min(index, slides.count - 1)]
  let image = NSImage(size: canvas)
  image.lockFocus()

  let bounds = CGRect(origin: .zero, size: canvas)
  NSGradient(colors: [color(0x061521), color(0x071827), color(0x020611)])!.draw(in: bounds, angle: -90)

  color(slide.accent, 0.07).setFill()
  NSBezierPath(ovalIn: CGRect(x: 160, y: 1670, width: 980, height: 430)).fill()
  color(0x050b16, 0.58).setFill()
  NSBezierPath(rect: bounds).fill()

  for i in 0..<10 {
    let x = CGFloat(i) * 170 - 210
    drawLinearGlow(
      from: CGPoint(x: x, y: 2780),
      to: CGPoint(x: x + 630, y: 860),
      color: color(0xffffff, 0.022),
      width: 2
    )
  }
  for i in 0..<7 {
    let y = CGFloat(i) * 155 + 132
    drawLinearGlow(
      from: CGPoint(x: 90, y: y),
      to: CGPoint(x: 1200, y: y + 34),
      color: color(slide.accent, 0.030),
      width: 1.4
    )
  }

  if let logo {
    let logoRect = CGRect(x: 92, y: 2658, width: 66, height: 66)
    NSGraphicsContext.saveGraphicsState()
    roundedRect(logoRect, radius: 18).addClip()
    logo.draw(in: logoRect)
    NSGraphicsContext.restoreGraphicsState()
  }
  drawText("DEEP OCEAN", rect: CGRect(x: 180, y: 2672, width: 430, height: 40), font: .systemFont(ofSize: 30, weight: .heavy), color: color(0xf2fbff, 0.92))

  let tagRect = CGRect(x: 92, y: 2478, width: 260, height: 58)
  color(slide.accent, 0.13).setFill()
  roundedRect(tagRect, radius: 29).fill()
  color(slide.accent, 0.52).setStroke()
  let tagStroke = roundedRect(tagRect.insetBy(dx: 1, dy: 1), radius: 28)
  tagStroke.lineWidth = 1.4
  tagStroke.stroke()
  drawText(slide.tag.uppercased(), rect: CGRect(x: 92, y: 2494, width: 260, height: 24), font: .systemFont(ofSize: 20, weight: .bold), color: color(slide.accent), align: .center)

  drawText(slide.title, rect: CGRect(x: 92, y: 2278, width: 1058, height: 180), font: .systemFont(ofSize: 82, weight: .black), color: color(0xffffff), lineHeight: 86)
  drawText(slide.subtitle, rect: CGRect(x: 92, y: 2150, width: 900, height: 96), font: .systemFont(ofSize: 36, weight: .semibold), color: color(0xd9eef7, 0.78), lineHeight: 45)

  let phoneRect = CGRect(x: 203, y: 122, width: 884, height: 1916)
  color(slide.accent, 0.075).setFill()
  NSBezierPath(ovalIn: CGRect(x: 100, y: 0, width: 1090, height: 430)).fill()
  drawPhone(source, in: phoneRect, accent: slide.accent)

  image.unlockFocus()

  guard let tiff = image.tiffRepresentation,
        let bitmap = NSBitmapImageRep(data: tiff),
        let data = bitmap.representation(using: .png, properties: [:]) else { continue }
  let output = outputDir.appendingPathComponent(String(format: "deep-ocean-pro-%02d.png", index + 1))
  try data.write(to: output)
  print(output.path)
}
