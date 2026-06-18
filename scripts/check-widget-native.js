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

function expectPngWithin(relPath, maxWidth, maxHeight) {
  if (!exists(relPath)) {
    fail(`cannot check PNG dimensions; file missing ${relPath}`);
    return;
  }

  const data = fs.readFileSync(path.join(root, relPath));
  const pngSignature = "89504e470d0a1a0a";
  if (data.length < 24 || data.subarray(0, 8).toString("hex") !== pngSignature) {
    fail(`${relPath} is not a valid PNG`);
    return;
  }

  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  if (width > maxWidth || height > maxHeight) {
    fail(
      `${relPath} is ${width}x${height}; WidgetKit-safe maximum is ${maxWidth}x${maxHeight}`
    );
    return;
  }

  pass(`${relPath} dimensions are WidgetKit-safe (${width}x${height})`);
}

const requiredFiles = [
  "plugins/with-focus-widget.js",
  "android/app/src/main/java/co/deepocean/app/widget/FocusWidgetProvider.kt",
  "android/app/src/main/java/co/deepocean/app/widget/DeepOceanWidgetSnapshotModule.kt",
  "android/app/src/main/java/co/deepocean/app/widget/DeepOceanWidgetSnapshotPackage.kt",
  "android/app/src/main/res/layout/widget_focus_small.xml",
  "android/app/src/main/res/layout/widget_focus_medium.xml",
  "android/app/src/main/res/layout/widget_focus_large.xml",
  "android/app/src/main/res/xml/focus_widget_info.xml",
  "ios/Widgets/DeepOceanFocusWidget.swift",
  "ios/Widgets/DeepOceanLogo.png",
  "ios/Widgets/OceanPortalSquare.png",
  "ios/Widgets/OceanPortalWide.png",
  "ios/Widgets/LivingJellyfishSquare.png",
  "ios/Widgets/LivingWhaleWide.png",
  "ios/Widgets/DeepOceanWidgetIntents.swift",
  "ios/Widgets/DeepOceanWidgetBundle.swift",
  "ios/Widgets/DeepOceanDiveAttributes.swift",
  "ios/Widgets/DeepOceanDiveLiveActivity.swift",
  "ios/DeepOcean/DeepOceanLiveActivity.swift",
  "ios/DeepOcean/DeepOceanLiveActivityBridge.m",
  "ios/DeepOcean/DeepOceanWidgetSnapshot.swift",
  "ios/DeepOcean/DeepOceanWidgetSnapshotBridge.m",
  "ios/DeepOcean/DeepOcean.entitlements"
];

requiredFiles.forEach(expectFile);

[
  "assets/widget-concepts/ocean-portal-square.png",
  "assets/widget-concepts/ocean-portal-wide.png",
  "assets/widget-concepts/living-jellyfish-square.png",
  "assets/widget-concepts/living-whale-wide.png",
  "ios/Widgets/OceanPortalSquare.png",
  "ios/Widgets/OceanPortalWide.png",
  "ios/Widgets/LivingJellyfishSquare.png",
  "ios/Widgets/LivingWhaleWide.png"
].forEach((relPath) => expectPngWithin(relPath, 1000, 1000));

expectContains(
  "android/app/src/main/AndroidManifest.xml",
  ".widget.FocusWidgetProvider",
  "android widget receiver"
);
expectContains(
  "android/app/src/main/AndroidManifest.xml",
  ".widget.DivingInstrumentWidgetProvider",
  "android instrument widget receiver"
);
expectContains(
  "android/app/src/main/AndroidManifest.xml",
  ".widget.LivingOceanWidgetProvider",
  "android living widget receiver"
);
expectContains(
  "android/app/src/main/java/co/deepocean/app/MainApplication.kt",
  "DeepOceanWidgetSnapshotPackage()",
  "android widget snapshot native package"
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
  "group.co.deepocean.app",
  "ios app group value"
);
expectContains(
  "ios/DeepOcean/Info.plist",
  "deepocean-widget",
  "ios dedicated widget URL scheme"
);
expectContains(
  "ios/DeepOcean/Info.plist",
  "NSSupportsLiveActivities",
  "ios live activities info plist flag"
);
expectContains(
  "app.json",
  "./plugins/with-focus-widget",
  "plugin registration"
);
expectContains(
  "app.json",
  "NSSupportsLiveActivities",
  "app config live activities flag"
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
expectContains(
  pbxprojPath,
  "DeepOceanLiveActivity.swift",
  "ios app live activity native module source"
);
expectContains(
  pbxprojPath,
  "DeepOceanDiveAttributes.swift",
  "ios live activity attributes source"
);
expectContains(
  pbxprojPath,
  "DeepOceanDiveLiveActivity.swift",
  "ios widget live activity source"
);
expectContains(
  "ios/Widgets/DeepOceanWidgetBundle.swift",
  "DeepOceanPortalWidget()",
  "ios portal widget registration"
);
expectContains(
  "ios/Widgets/DeepOceanWidgetBundle.swift",
  "DeepOceanInstrumentWidget()",
  "ios instrument widget registration"
);
expectContains(
  "ios/Widgets/DeepOceanWidgetBundle.swift",
  "DeepOceanLivingWidget()",
  "ios living widget registration"
);
expectContains(
  "ios/Widgets/DeepOceanFocusWidget.swift",
  'let kind = "DeepOceanFocusWidget"',
  "ios stable portal widget kind"
);
expectContains(
  "plugins/focus-widget/native/ios-widget/DeepOceanFocusWidget.swift",
  'let kind = "DeepOceanFocusWidget"',
  "ios template stable portal widget kind"
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
