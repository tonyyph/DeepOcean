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
info_plist_path = File.join(widget_dir, "Info.plist")
entitlements_path = File.join(widget_dir, "DeepOceanWidgets.entitlements")
bundle_swift_path = File.join(widget_dir, "DeepOceanWidgetBundle.swift")

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
        DeepOceanFocusWidget()
      }
    }
  SWIFT
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

widget_filenames = [
  "DeepOceanFocusWidget.swift",
  "DeepOceanWidgetIntents.swift",
  "DeepOceanWidgetBundle.swift",
  "Info.plist",
  "DeepOceanWidgets.entitlements"
]

# Remove all old widget refs/build files first, then recreate cleanly.
all_widget_refs = widgets_group.files.select do |ref|
  ref.path && widget_filenames.include?(File.basename(ref.path))
end

all_widget_refs.each do |ref|
  widget_target.source_build_phase.files.each do |build_file|
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
puts "[widget-patch] Generated/updated files in ios/Widgets for Info.plist, entitlements, and WidgetBundle."
