#!/usr/bin/env ruby
# frozen_string_literal: true

# Experimental CLI-only patcher for iOS Widget Extension target.
# It uses the xcodeproj gem (typically available with CocoaPods).

require "fileutils"

begin
  require "xcodeproj"
rescue LoadError
  warn "[widget-patch] Missing gem 'xcodeproj'. Install via: gem install xcodeproj"
  exit 1
end

ROOT = File.expand_path("..", __dir__)
IOS_DIR = File.join(ROOT, "ios")
PROJECT_PATH = File.join(IOS_DIR, "DeepOcean.xcodeproj")
PBXPROJ_PATH = File.join(PROJECT_PATH, "project.pbxproj")
WIDGET_TARGET_NAME = "DeepOceanWidgets"
APP_TARGET_NAME = "DeepOcean"

unless File.exist?(PBXPROJ_PATH)
  warn "[widget-patch] Missing project.pbxproj at #{PBXPROJ_PATH}"
  exit 1
end

def read_bundle_id
  app_json = File.join(ROOT, "app.json")
  return "co.deepocean.app" unless File.exist?(app_json)

  json = JSON.parse(File.read(app_json))
  json.dig("expo", "ios", "bundleIdentifier") || "co.deepocean.app"
rescue StandardError
  "co.deepocean.app"
end

def ensure_file(path, content)
  FileUtils.mkdir_p(File.dirname(path))
  File.write(path, content)
end

require "json"
bundle_id = read_bundle_id
app_group = "group.#{bundle_id}"

widget_dir = File.join(IOS_DIR, "Widgets")
app_dir = File.join(IOS_DIR, "DeepOcean")
info_plist_path = File.join(widget_dir, "Info.plist")
entitlements_path = File.join(widget_dir, "DeepOceanWidgets.entitlements")
bundle_swift_path = File.join(widget_dir, "DeepOceanWidgetBundle.swift")
attributes_swift_path = File.join(widget_dir, "DeepOceanDiveAttributes.swift")
dive_live_activity_swift_path = File.join(widget_dir, "DeepOceanDiveLiveActivity.swift")
live_activity_swift_path = File.join(app_dir, "DeepOceanLiveActivity.swift")
live_activity_bridge_path = File.join(app_dir, "DeepOceanLiveActivityBridge.m")
widget_snapshot_swift_path = File.join(app_dir, "DeepOceanWidgetSnapshot.swift")
widget_snapshot_bridge_path = File.join(app_dir, "DeepOceanWidgetSnapshotBridge.m")

ensure_file(
  info_plist_path,
  <<~PLIST
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
      <dict>
        <key>CFBundleDevelopmentRegion</key>
        <string>$(DEVELOPMENT_LANGUAGE)</string>
        <key>CFBundleDisplayName</key>
        <string>DeepOcean Widgets</string>
        <key>CFBundleExecutable</key>
        <string>$(EXECUTABLE_NAME)</string>
        <key>CFBundleIdentifier</key>
        <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
        <key>CFBundleInfoDictionaryVersion</key>
        <string>6.0</string>
        <key>CFBundleName</key>
        <string>$(PRODUCT_NAME)</string>
        <key>CFBundlePackageType</key>
        <string>XPC!</string>
        <key>CFBundleShortVersionString</key>
        <string>1.0.0</string>
        <key>CFBundleVersion</key>
        <string>1</string>
        <key>NSExtension</key>
        <dict>
          <key>NSExtensionPointIdentifier</key>
          <string>com.apple.widgetkit-extension</string>
        </dict>
      </dict>
    </plist>
  PLIST
)

ensure_file(
  entitlements_path,
  <<~PLIST
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
      <dict>
        <key>com.apple.security.application-groups</key>
        <array>
          <string>#{app_group}</string>
        </array>
      </dict>
    </plist>
  PLIST
)

ensure_file(
  bundle_swift_path,
  <<~SWIFT
    import WidgetKit
    import SwiftUI

    @main
    struct DeepOceanWidgetBundle: WidgetBundle {
      var body: some Widget {
        DeepOceanPortalWidget()
        DeepOceanInstrumentWidget()
        DeepOceanLivingWidget()
        if #available(iOS 16.1, *) {
          DeepOceanDiveLiveActivity()
        }
      }
    }
  SWIFT
)

ensure_file(
  attributes_swift_path,
  <<~SWIFT
    import ActivityKit
    import Foundation

    struct DeepOceanDiveAttributes: ActivityAttributes {
      public struct ContentState: Codable, Hashable {
        var status: String
        var startedAt: Date
        var targetSeconds: Int?
        var elapsedSeconds: Int
        var depthMeters: Int
        var zone: String
      }

      var sessionId: String
      var title: String
    }
  SWIFT
)

ensure_file(
  widget_snapshot_swift_path,
  <<~SWIFT
    import Foundation
    import WidgetKit

    @objc(DeepOceanWidgetSnapshot)
    final class DeepOceanWidgetSnapshot: NSObject {
      @objc
      func setSnapshot(_ snapshot: String) {
        let defaults = UserDefaults(suiteName: "#{app_group}")
        defaults?.set(snapshot, forKey: "app.widget.snapshot")
        defaults?.synchronize()
        WidgetCenter.shared.reloadAllTimelines()
      }

      @objc
      static func requiresMainQueueSetup() -> Bool {
        false
      }
    }
  SWIFT
)

ensure_file(
  widget_snapshot_bridge_path,
  <<~OBJC
    #import <React/RCTBridgeModule.h>

    @interface RCT_EXTERN_MODULE(DeepOceanWidgetSnapshot, NSObject)
    RCT_EXTERN_METHOD(setSnapshot:(NSString *)snapshot)
    @end
  OBJC
)

ensure_file(
  dive_live_activity_swift_path,
  <<~SWIFT
    import ActivityKit
    import SwiftUI
    import WidgetKit

    @available(iOS 16.1, *)
    struct DeepOceanDiveLiveActivity: Widget {
      private let glow = Color(red: 0.13, green: 0.89, blue: 1.0)
      private let sea = Color(red: 0.02, green: 0.06, blue: 0.11)

      var body: some WidgetConfiguration {
        ActivityConfiguration(for: DeepOceanDiveAttributes.self) { context in
          VStack(alignment: .leading, spacing: 8) {
            HStack {
              Label(context.state.status == "paused" ? "Dive paused" : "Focus dive", systemImage: context.state.status == "paused" ? "pause.circle.fill" : "water.waves")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(glow)
              Spacer()
              Text(context.state.status == "paused" ? "Paused" : "Diving")
                .font(.caption.weight(.bold))
                .foregroundStyle(context.state.status == "paused" ? .black : sea)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(context.state.status == "paused" ? Color.yellow : glow)
                .clipShape(Capsule())
            }

            HStack(spacing: 12) {
              lockMetric(title: context.state.targetSeconds == nil ? "Elapsed" : "Remaining") {
                DeepOceanLiveTimer(state: context.state)
                  .font(.system(size: 24, weight: .bold, design: .rounded))
                  .monospacedDigit()
              }
              lockMetric(title: "Zone") {
                Text(zoneDisplayName(context.state.zone))
                  .font(.subheadline.weight(.semibold))
                  .lineLimit(1)
                  .minimumScaleFactor(0.72)
              }
              lockMetric(title: "Depth") {
                Text(compactDepthText(context.state.depthMeters))
                  .font(.system(size: 22, weight: .bold, design: .rounded))
                  .monospacedDigit()
              }
            }

            DeepOceanLiveProgress(state: context.state)
          }
          .padding(.horizontal, 20)
          .padding(.vertical, 16)
          .activityBackgroundTint(sea)
          .activitySystemActionForegroundColor(glow)
          .widgetURL(actionURL(context.state, sessionId: context.attributes.sessionId))
        } dynamicIsland: { context in
          DynamicIsland {
            DynamicIslandExpandedRegion(.leading) {
              VStack(alignment: .leading, spacing: 2) {
                Text(context.state.status == "paused" ? "Paused" : "Focus dive")
                  .font(.caption2.weight(.semibold))
                  .foregroundStyle(.white.opacity(0.9))
                DeepOceanLiveTimer(state: context.state)
                  .font(.headline.weight(.bold))
                  .monospacedDigit()
              }
            }
            DynamicIslandExpandedRegion(.trailing) {
              VStack(alignment: .trailing, spacing: 2) {
                Text("Depth")
                  .font(.caption2.weight(.medium))
                  .foregroundStyle(.secondary)
                Text(compactDepthText(context.state.depthMeters))
                  .font(.headline.weight(.bold))
                  .foregroundStyle(glow)
                  .monospacedDigit()
              }
            }
            DynamicIslandExpandedRegion(.bottom) {
              VStack(alignment: .leading, spacing: 5) {
                HStack {
                  Text(zoneDisplayName(context.state.zone))
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.white.opacity(0.88))
                    .lineLimit(1)
                  Spacer()
                  Text("\\(progressPercent(context.state))%")
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(glow)
                    .monospacedDigit()
                }
                DeepOceanLiveProgress(state: context.state, compact: true)
              }
            }
          } compactLeading: {
            Image(systemName: context.state.status == "paused" ? "pause.fill" : "water.waves")
              .foregroundStyle(context.state.status == "paused" ? .yellow : glow)
          } compactTrailing: {
            Text(compactDepthText(context.state.depthMeters))
              .font(.caption2.weight(.bold))
              .foregroundStyle(glow)
              .monospacedDigit()
          } minimal: {
            Image(systemName: context.state.status == "paused" ? "pause.fill" : "timer")
              .foregroundStyle(context.state.status == "paused" ? .yellow : glow)
          }
          .widgetURL(actionURL(context.state, sessionId: context.attributes.sessionId))
        }
      }

      @ViewBuilder
      private func lockMetric<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 2) {
          Text(title)
            .font(.caption2.weight(.medium))
            .foregroundStyle(.white.opacity(0.65))
          content()
            .foregroundStyle(.white)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
      }
    }

    @available(iOS 16.1, *)
    private struct DeepOceanLiveTimer: View {
      let state: DeepOceanDiveAttributes.ContentState

      var body: some View {
        if state.status == "paused" {
          Text(formatSeconds(state.elapsedSeconds))
        } else if let targetSeconds = state.targetSeconds {
          Text(timerInterval: Date()...state.startedAt.addingTimeInterval(TimeInterval(targetSeconds)), countsDown: true)
        } else {
          Text(timerInterval: state.startedAt...Date.distantFuture, countsDown: false)
        }
      }
    }

    @available(iOS 16.1, *)
    private struct DeepOceanLiveProgress: View {
      let state: DeepOceanDiveAttributes.ContentState
      var compact = false

      private var progress: Double {
        guard let targetSeconds = state.targetSeconds, targetSeconds > 0 else {
          return min(1, Double(state.elapsedSeconds) / 3600.0)
        }
        return min(1, Double(state.elapsedSeconds) / Double(targetSeconds))
      }

      var body: some View {
        GeometryReader { proxy in
          ZStack(alignment: .leading) {
            Capsule().fill(.white.opacity(0.13))
            Capsule()
              .fill(Color(red: 0.13, green: 0.89, blue: 1.0))
              .frame(width: proxy.size.width * progress)
          }
        }
        .frame(height: compact ? 5 : 6)
      }
    }

    private func formatSeconds(_ seconds: Int) -> String {
      String(format: "%02d:%02d", max(0, seconds) / 60, max(0, seconds) % 60)
    }

    private func compactDepthText(_ meters: Int) -> String {
      "\\(meters)m"
    }

    private func zoneDisplayName(_ zone: String) -> String {
      zone.replacingOccurrences(of: "_", with: " ").capitalized
    }

    private func progressPercent(_ state: DeepOceanDiveAttributes.ContentState) -> Int {
      guard let targetSeconds = state.targetSeconds, targetSeconds > 0 else {
        return Int(min(1, Double(state.elapsedSeconds) / 3600.0) * 100)
      }
      return Int(min(1, Double(state.elapsedSeconds) / Double(targetSeconds)) * 100)
    }

    private func actionURL(
      _ state: DeepOceanDiveAttributes.ContentState,
      sessionId: String
    ) -> URL {
      let action = state.status == "paused" ? "resume_current" : "pause_session"
      let actionId = "\\(sessionId):\\(action)"
      return URL(
        string: "deepocean-widget://widget?action=\\(action)&source=live_activity&actionId=\\(actionId)"
      )!
    }
  SWIFT
)

ensure_file(
  live_activity_swift_path,
  <<~SWIFT
    import ActivityKit
    import Foundation
    import React

    @objc(DeepOceanLiveActivity)
    class DeepOceanLiveActivity: NSObject {
      @objc
      static func requiresMainQueueSetup() -> Bool {
        false
      }

      @available(iOS 16.2, *)
      static func endAllActivities() async {
        for activity in Activity<DeepOceanDiveAttributes>.activities {
          await activity.end(nil, dismissalPolicy: .immediate)
        }
      }

      @objc(start:status:targetSeconds:startedAtMs:elapsedSeconds:depthMeters:zone:resolver:rejecter:)
      func start(
        sessionId: NSString,
        status: NSString,
        targetSeconds: NSNumber?,
        startedAtMs: NSNumber,
        elapsedSeconds: NSNumber,
        depthMeters: NSNumber,
        zone: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
      ) {
        guard #available(iOS 16.2, *) else {
          resolve(false)
          return
        }

        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
          resolve(false)
          return
        }

        Task {
          do {
            let id = sessionId as String
            await endExisting(except: id)
            let attributes = DeepOceanDiveAttributes(sessionId: id, title: "Deep Ocean")
            let state = DeepOceanDiveAttributes.ContentState(
              status: status as String,
              startedAt: Date(timeIntervalSince1970: startedAtMs.doubleValue / 1000.0),
              targetSeconds: targetSeconds?.intValue,
              elapsedSeconds: elapsedSeconds.intValue,
              depthMeters: depthMeters.intValue,
              zone: zone as String
            )
            if let existing = Activity<DeepOceanDiveAttributes>.activities.first(where: {
              $0.attributes.sessionId == id
            }) {
              await existing.update(ActivityContent(state: state, staleDate: nil))
              resolve(existing.id)
              return
            }
            let activity = try Activity.request(
              attributes: attributes,
              content: ActivityContent(state: state, staleDate: nil),
              pushType: nil
            )
            resolve(activity.id)
          } catch {
            reject("live_activity_start_failed", error.localizedDescription, error)
          }
        }
      }

      @objc(update:status:startedAtMs:targetSeconds:elapsedSeconds:depthMeters:zone:resolver:rejecter:)
      func update(
        sessionId: NSString,
        status: NSString,
        startedAtMs: NSNumber,
        targetSeconds: NSNumber?,
        elapsedSeconds: NSNumber,
        depthMeters: NSNumber,
        zone: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
      ) {
        guard #available(iOS 16.2, *) else {
          resolve(false)
          return
        }

        Task {
          let id = sessionId as String
          guard let activity = Activity<DeepOceanDiveAttributes>.activities.first(where: {
            $0.attributes.sessionId == id
          }) else {
            resolve(false)
            return
          }

          let state = DeepOceanDiveAttributes.ContentState(
            status: status as String,
            startedAt: Date(timeIntervalSince1970: startedAtMs.doubleValue / 1000.0),
            targetSeconds: targetSeconds?.intValue,
            elapsedSeconds: elapsedSeconds.intValue,
            depthMeters: depthMeters.intValue,
            zone: zone as String
          )

          await activity.update(ActivityContent(state: state, staleDate: nil))
          resolve(true)
        }
      }

      @objc(end:resolver:rejecter:)
      func end(
        sessionId: NSString,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
      ) {
        guard #available(iOS 16.2, *) else {
          resolve(false)
          return
        }

        Task {
          let id = sessionId as String
          var ended = false
          for activity in Activity<DeepOceanDiveAttributes>.activities where activity.attributes.sessionId == id {
            await activity.end(nil, dismissalPolicy: .immediate)
            ended = true
          }
          resolve(ended)
        }
      }

      @objc(endAll:rejecter:)
      func endAll(
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
      ) {
        guard #available(iOS 16.2, *) else {
          resolve(false)
          return
        }

        Task {
          await DeepOceanLiveActivity.endAllActivities()
          resolve(true)
        }
      }

      @available(iOS 16.2, *)
      private func endExisting(except sessionId: String) async {
        for activity in Activity<DeepOceanDiveAttributes>.activities where activity.attributes.sessionId != sessionId {
          await activity.end(nil, dismissalPolicy: .immediate)
        }
      }
    }
  SWIFT
)

ensure_file(
  live_activity_bridge_path,
  <<~OBJC
    #import <React/RCTBridgeModule.h>

    @interface RCT_EXTERN_MODULE(DeepOceanLiveActivity, NSObject)

    RCT_EXTERN_METHOD(start:(NSString *)sessionId
                      status:(NSString *)status
                      targetSeconds:(NSNumber *)targetSeconds
                      startedAtMs:(nonnull NSNumber *)startedAtMs
                      elapsedSeconds:(nonnull NSNumber *)elapsedSeconds
                      depthMeters:(nonnull NSNumber *)depthMeters
                      zone:(NSString *)zone
                      resolver:(RCTPromiseResolveBlock)resolve
                      rejecter:(RCTPromiseRejectBlock)reject)

    RCT_EXTERN_METHOD(update:(NSString *)sessionId
                      status:(NSString *)status
                      startedAtMs:(nonnull NSNumber *)startedAtMs
                      targetSeconds:(NSNumber *)targetSeconds
                      elapsedSeconds:(nonnull NSNumber *)elapsedSeconds
                      depthMeters:(nonnull NSNumber *)depthMeters
                      zone:(NSString *)zone
                      resolver:(RCTPromiseResolveBlock)resolve
                      rejecter:(RCTPromiseRejectBlock)reject)

    RCT_EXTERN_METHOD(end:(NSString *)sessionId
                      resolver:(RCTPromiseResolveBlock)resolve
                      rejecter:(RCTPromiseRejectBlock)reject)

    RCT_EXTERN_METHOD(endAll:(RCTPromiseResolveBlock)resolve
                      rejecter:(RCTPromiseRejectBlock)reject)

    @end
  OBJC
)

project = Xcodeproj::Project.open(PROJECT_PATH)
app_target = project.targets.find { |t| t.name == APP_TARGET_NAME }
unless app_target
  warn "[widget-patch] Missing app target '#{APP_TARGET_NAME}'"
  exit 1
end

widget_target = project.targets.find { |t| t.name == WIDGET_TARGET_NAME }
if widget_target.nil?
  widget_target = project.new_target(
    :app_extension,
    WIDGET_TARGET_NAME,
    :ios,
    "17.0"
  )
  puts "[widget-patch] Created target '#{WIDGET_TARGET_NAME}'."
else
  puts "[widget-patch] Repairing existing target '#{WIDGET_TARGET_NAME}'."
end

widget_target.product_name = WIDGET_TARGET_NAME
widget_target.build_configurations.each do |cfg|
  cfg.build_settings["PRODUCT_NAME"] = WIDGET_TARGET_NAME
  cfg.build_settings["PRODUCT_BUNDLE_IDENTIFIER"] = "#{bundle_id}.widgets"
  cfg.build_settings["INFOPLIST_FILE"] = "Widgets/Info.plist"
  cfg.build_settings["CODE_SIGN_ENTITLEMENTS"] = "Widgets/DeepOceanWidgets.entitlements"
  cfg.build_settings["SWIFT_VERSION"] = "5.0"
  cfg.build_settings["IPHONEOS_DEPLOYMENT_TARGET"] = "17.0"
  cfg.build_settings["APPLICATION_EXTENSION_API_ONLY"] = "YES"
  cfg.build_settings["LD_RUNPATH_SEARCH_PATHS"] = "$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"
end

main_group = project.main_group
widgets_group = main_group["Widgets"] || main_group.new_group("Widgets", "Widgets")
app_group = main_group[APP_TARGET_NAME] || main_group.new_group(APP_TARGET_NAME, APP_TARGET_NAME)

widget_filenames = [
  "DeepOceanFocusWidget.swift",
  "DeepOceanWidgetIntents.swift",
  "DeepOceanWidgetBundle.swift",
  "DeepOceanDiveAttributes.swift",
  "DeepOceanDiveLiveActivity.swift",
  "DeepOceanLogo.png",
  "OceanPortalSquare.png",
  "OceanPortalWide.png",
  "LivingJellyfishSquare.png",
  "LivingWhaleWide.png",
  "Info.plist",
  "DeepOceanWidgets.entitlements"
]

app_filenames = [
  "DeepOceanLiveActivity.swift",
  "DeepOceanLiveActivityBridge.m",
  "DeepOceanWidgetSnapshot.swift",
  "DeepOceanWidgetSnapshotBridge.m"
]

# Remove all old widget refs/build files first, then recreate cleanly.
all_widget_refs = widgets_group.files.select do |ref|
  ref.path && widget_filenames.include?(File.basename(ref.path))
end

all_widget_refs.each do |ref|
  widget_target.source_build_phase.files.each do |build_file|
    build_file.remove_from_project if build_file.file_ref == ref
  end
  app_target.source_build_phase.files.each do |build_file|
    build_file.remove_from_project if build_file.file_ref == ref
  end
  widget_target.resources_build_phase.files.each do |build_file|
    build_file.remove_from_project if build_file.file_ref == ref
  end
  ref.remove_from_project
end

fresh_refs = {}
widget_filenames.each do |filename|
  fresh_refs[filename] = widgets_group.new_file(filename)
end

widget_target.source_build_phase.add_file_reference(fresh_refs["DeepOceanFocusWidget.swift"], true)
widget_target.source_build_phase.add_file_reference(fresh_refs["DeepOceanWidgetIntents.swift"], true)
widget_target.source_build_phase.add_file_reference(fresh_refs["DeepOceanWidgetBundle.swift"], true)
widget_target.source_build_phase.add_file_reference(fresh_refs["DeepOceanDiveAttributes.swift"], true)
widget_target.source_build_phase.add_file_reference(fresh_refs["DeepOceanDiveLiveActivity.swift"], true)
widget_target.resources_build_phase.add_file_reference(fresh_refs["DeepOceanLogo.png"], true)
widget_target.resources_build_phase.add_file_reference(fresh_refs["OceanPortalSquare.png"], true)
widget_target.resources_build_phase.add_file_reference(fresh_refs["OceanPortalWide.png"], true)
widget_target.resources_build_phase.add_file_reference(fresh_refs["LivingJellyfishSquare.png"], true)
widget_target.resources_build_phase.add_file_reference(fresh_refs["LivingWhaleWide.png"], true)

# Remove and recreate the app-side native module refs so repeated runs stay clean.
all_app_refs = app_group.files.select do |ref|
  ref.path && app_filenames.include?(File.basename(ref.path))
end

all_app_refs.each do |ref|
  app_target.source_build_phase.files.each do |build_file|
    build_file.remove_from_project if build_file.file_ref == ref
  end
  ref.remove_from_project
end

fresh_app_refs = {}
app_filenames.each do |filename|
  fresh_app_refs[filename] = app_group.new_file(File.join(APP_TARGET_NAME, filename))
end

app_target.source_build_phase.add_file_reference(fresh_app_refs["DeepOceanLiveActivity.swift"], true)
app_target.source_build_phase.add_file_reference(fresh_app_refs["DeepOceanLiveActivityBridge.m"], true)
app_target.source_build_phase.add_file_reference(fresh_app_refs["DeepOceanWidgetSnapshot.swift"], true)
app_target.source_build_phase.add_file_reference(fresh_app_refs["DeepOceanWidgetSnapshotBridge.m"], true)
app_target.source_build_phase.add_file_reference(fresh_refs["DeepOceanDiveAttributes.swift"], true)

[app_target, widget_target].each do |target|
  target.source_build_phase.files.each do |build_file|
    build_file.remove_from_project if build_file.file_ref.nil?
  end
end

copy_phase = app_target.copy_files_build_phases.find { |bp| bp.name == "Embed App Extensions" }
unless copy_phase
  copy_phase = app_target.new_copy_files_build_phase("Embed App Extensions")
end
# PlugIns destination for app extensions in PBXCopyFilesBuildPhase.
# Use numeric value for compatibility across xcodeproj versions.
copy_phase.dst_subfolder_spec = "13"
unless copy_phase.files_references.include?(widget_target.product_reference)
  copy_phase.add_file_reference(widget_target.product_reference, true)
end

unless app_target.dependencies.any? { |dep| dep.target == widget_target }
  app_target.add_dependency(widget_target)
end

project.save
puts "[widget-patch] Ensured iOS widget target '#{WIDGET_TARGET_NAME}' is embedded into '#{APP_TARGET_NAME}'."
puts "[widget-patch] Generated/updated iOS widget and Live Activity native files."
