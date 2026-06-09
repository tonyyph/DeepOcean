#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();

function fail(msg) {
  console.error(`[widget-check] FAIL: ${msg}`);
  process.exitCode = 1;
}

function pass(msg) {
  console.log(`[widget-check] OK: ${msg}`);
}

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function expectFile(relPath) {
  if (!exists(relPath)) {
    fail(`missing file ${relPath}`);
    return false;
  }
  pass(`found ${relPath}`);
  return true;
}

function expectContains(relPath, needle, label) {
  if (!exists(relPath)) {
    fail(`cannot check ${label}; file missing ${relPath}`);
    return;
  }
  const text = read(relPath);
  if (!text.includes(needle)) {
    fail(`${label} not found in ${relPath}`);
    return;
  }
  pass(`${label} present in ${relPath}`);
}

const requiredFiles = [
  "plugins/with-focus-widget.js",
  "android/app/src/main/java/com/cuongphan2/OtherSide/widget/FocusWidgetProvider.kt",
  "android/app/src/main/res/layout/widget_focus_small.xml",
  "android/app/src/main/res/layout/widget_focus_medium.xml",
  "android/app/src/main/res/layout/widget_focus_large.xml",
  "android/app/src/main/res/xml/focus_widget_info.xml",
  "ios/Widgets/DeepOceanFocusWidget.swift",
  "ios/Widgets/DeepOceanWidgetIntents.swift",
  "ios/DeepOcean/DeepOcean.entitlements"
];

requiredFiles.forEach(expectFile);

expectContains(
  "android/app/src/main/AndroidManifest.xml",
  ".widget.FocusWidgetProvider",
  "android widget receiver"
);
expectContains(
  "android/app/src/main/res/values/strings.xml",
  "widget_focus_label",
  "widget label string"
);
expectContains(
  "ios/DeepOcean/DeepOcean.entitlements",
  "com.apple.security.application-groups",
  "ios app group entitlement"
);
expectContains(
  "ios/DeepOcean/DeepOcean.entitlements",
  "group.com.cuongphan2.OtherSide",
  "ios app group value"
);
expectContains(
  "app.json",
  "./plugins/with-focus-widget",
  "plugin registration"
);

const pbxprojPath = "ios/DeepOcean.xcodeproj/project.pbxproj";
expectContains(
  pbxprojPath,
  "com.apple.product-type.app-extension",
  "ios widget extension product type"
);
expectContains(
  pbxprojPath,
  "DeepOceanWidgets",
  "ios widget extension target name"
);
expectContains(
  pbxprojPath,
  "Embed App Extensions",
  "ios embed app extensions build phase"
);

if (process.exitCode && process.exitCode !== 0) {
  console.error(
    "[widget-check] Hint: run 'yarn patch:ios-widget-target' then rerun 'yarn check:widget-native'."
  );
  console.error(
    "[widget-check] If patch command fails, install dependency: gem install xcodeproj"
  );
}

if (process.exitCode && process.exitCode !== 0) {
  console.error("[widget-check] One or more checks failed.");
  process.exit(process.exitCode);
}

console.log("[widget-check] All widget native checks passed.");
