const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  withAndroidManifest,
  withDangerousMod,
  withEntitlementsPlist,
  withInfoPlist,
  withStringsXml
} = require("expo/config-plugins");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeFile(projectRoot, relativePath, content) {
  const absPath = path.join(projectRoot, relativePath);
  ensureDir(path.dirname(absPath));
  fs.writeFileSync(absPath, content, "utf8");
}

function writeTemplate(projectRoot, templatePath, outputPath, replacements = {}) {
  const absTemplate = path.join(__dirname, "focus-widget", templatePath);
  let content = fs.readFileSync(absTemplate, "utf8");
  Object.entries(replacements).forEach(([key, value]) => {
    content = content.split(key).join(value);
  });
  writeFile(projectRoot, outputPath, content);
}

function runIosWidgetPatcher(projectRoot) {
  const scriptPath = path.join(projectRoot, "scripts/patch-ios-widget-target.rb");
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Missing iOS widget patcher at ${scriptPath}`);
  }

  const result = spawnSync("ruby", [scriptPath], {
    cwd: projectRoot,
    stdio: "inherit"
  });
  if (result.status !== 0) {
    throw new Error(
      `iOS widget patcher failed with exit code ${result.status ?? "unknown"}`
    );
  }
}

function addOrUpdateString(resources, name, value) {
  const list = resources.string || [];
  const found = list.find((entry) => entry.$?.name === name);
  if (found) {
    found._ = value;
    return;
  }
  list.push({ $: { name }, _: value });
  resources.string = list;
}

function packageNameToPath(packageName) {
  return packageName.replace(/\./g, "/");
}

function getAndroidPackage(config) {
  return config.android?.package || config.ios?.bundleIdentifier || "co.deepocean.app";
}

function getIosBundleIdentifier(config) {
  return config.ios?.bundleIdentifier || "co.deepocean.app";
}

function getAppGroup(config, props = {}) {
  return props.appGroup || `group.${getIosBundleIdentifier(config)}`;
}

function withFocusWidgetAndroidFiles(config) {
  return withDangerousMod(config, [
    "android",
    async (modConfig) => {
      const androidPackage = getAndroidPackage(config);
      const androidPackagePath = packageNameToPath(androidPackage);

      writeTemplate(
        modConfig.modRequest.projectRoot,
        "native/android-widget/java/FocusWidgetProvider.kt",
        `android/app/src/main/java/${androidPackagePath}/widget/FocusWidgetProvider.kt`,
        { __ANDROID_PACKAGE__: androidPackage }
      );

      [
        "widget_focus_small.xml",
        "widget_focus_medium.xml",
        "widget_focus_large.xml"
      ].forEach((fileName) => {
        writeTemplate(
          modConfig.modRequest.projectRoot,
          `native/android-widget/layout/${fileName}`,
          `android/app/src/main/res/layout/${fileName}`
        );
      });

      [
        "widget_glass_panel.xml",
        "widget_ocean_background.xml",
        "widget_premium_pill.xml",
        "widget_primary_cta.xml",
        "widget_progress_chip.xml",
        "widget_secondary_action.xml"
      ].forEach((fileName) => {
        writeTemplate(
          modConfig.modRequest.projectRoot,
          `native/android-widget/drawable/${fileName}`,
          `android/app/src/main/res/drawable/${fileName}`
        );
      });

      writeFile(
        modConfig.modRequest.projectRoot,
        "android/app/src/main/res/xml/focus_widget_info.xml",
        `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="120dp"
    android:minHeight="120dp"
    android:maxResizeWidth="320dp"
    android:maxResizeHeight="320dp"
    android:updatePeriodMillis="0"
    android:initialLayout="@layout/widget_focus_small"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen"
    android:description="@string/widget_focus_description" />
`
      );

      writeFile(
        modConfig.modRequest.projectRoot,
        `android/app/src/main/java/${androidPackagePath}/widget/FocusWidgetProvider.kt`,
        `package ${androidPackage}.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.RemoteViews
import ${androidPackage}.MainActivity
import ${androidPackage}.R

class FocusWidgetProvider : AppWidgetProvider() {

  override fun onUpdate(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetIds: IntArray
  ) {
    appWidgetIds.forEach { appWidgetId ->
      val options = appWidgetManager.getAppWidgetOptions(appWidgetId)
      val views = buildViews(context, options)
      appWidgetManager.updateAppWidget(appWidgetId, views)
    }
  }

  override fun onAppWidgetOptionsChanged(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetId: Int,
    newOptions: Bundle
  ) {
    val views = buildViews(context, newOptions)
    appWidgetManager.updateAppWidget(appWidgetId, views)
  }

  override fun onEnabled(context: Context) {
    super.onEnabled(context)
    forceRefresh(context)
  }

  override fun onReceive(context: Context, intent: Intent) {
    super.onReceive(context, intent)
    if (intent.action == AppWidgetManager.ACTION_APPWIDGET_UPDATE) {
      forceRefresh(context)
    }
  }

  private fun forceRefresh(context: Context) {
    val manager = AppWidgetManager.getInstance(context)
    val ids = manager.getAppWidgetIds(
      ComponentName(context, FocusWidgetProvider::class.java)
    )
    onUpdate(context, manager, ids)
  }

  private fun buildViews(context: Context, options: Bundle): RemoteViews {
    val minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0)
    val minHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0)

    val layout = when {
      minWidth >= 250 && minHeight >= 180 -> R.layout.widget_focus_large
      minWidth >= 180 -> R.layout.widget_focus_medium
      else -> R.layout.widget_focus_small
    }

    val views = RemoteViews(context.packageName, layout)

    views.setOnClickPendingIntent(
      R.id.widget_primary_action,
      deepLinkPendingIntent(context, "deepocean://widget?action=start_focus")
    )

    when (layout) {
      R.layout.widget_focus_medium -> {
        views.setOnClickPendingIntent(
          R.id.widget_secondary_ai,
          deepLinkPendingIntent(context, "deepocean://widget?action=open_ai_companion")
        )
        views.setOnClickPendingIntent(
          R.id.widget_secondary_progress,
          deepLinkPendingIntent(context, "deepocean://widget?action=view_daily_progress")
        )
      }

      R.layout.widget_focus_large -> {
        views.setOnClickPendingIntent(
          R.id.widget_action_resume,
          deepLinkPendingIntent(context, "deepocean://widget?action=resume_current")
        )
        views.setOnClickPendingIntent(
          R.id.widget_action_pause,
          deepLinkPendingIntent(context, "deepocean://widget?action=pause_session")
        )
        views.setOnClickPendingIntent(
          R.id.widget_action_skip,
          deepLinkPendingIntent(context, "deepocean://widget?action=skip_break")
        )
        views.setOnClickPendingIntent(
          R.id.widget_action_ai,
          deepLinkPendingIntent(context, "deepocean://widget?action=open_ai_companion")
        )
        views.setOnClickPendingIntent(
          R.id.widget_action_stats,
          deepLinkPendingIntent(context, "deepocean://widget?action=view_daily_progress")
        )
      }
    }

    return views
  }

  private fun deepLinkPendingIntent(context: Context, url: String): PendingIntent {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url), context, MainActivity::class.java)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)

    val requestCode = url.hashCode()
    val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    return PendingIntent.getActivity(context, requestCode, intent, flags)
  }
}
`
      );

      writeFile(
        modConfig.modRequest.projectRoot,
        "android/app/src/main/res/layout/widget_focus_small.xml",
        `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="12dp"
    android:background="#071426">

    <TextView
        android:id="@+id/widget_primary_action"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:gravity="center"
        android:text="Start Focus"
        android:textStyle="bold"
        android:textColor="#02111D"
        android:textSize="16sp"
        android:background="#22E4FF"
        android:contentDescription="Start focus session" />

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="10dp"
        android:orientation="horizontal"
        android:gravity="center_vertical">

        <TextView
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="Next: 25m"
            android:textColor="#B8D6E8"
            android:textSize="11sp" />

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="3/6"
            android:textColor="#B8D6E8"
            android:textSize="11sp" />
    </LinearLayout>

</LinearLayout>
`
      );

      writeFile(
        modConfig.modRequest.projectRoot,
        "android/app/src/main/res/layout/widget_focus_medium.xml",
        `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="12dp"
    android:background="#071426">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:orientation="horizontal"
        android:gravity="center_vertical">

        <TextView
            android:id="@+id/widget_primary_action"
            android:layout_width="0dp"
            android:layout_height="match_parent"
            android:layout_weight="2"
            android:gravity="center"
            android:text="Start Focus"
            android:textStyle="bold"
            android:textColor="#02111D"
            android:textSize="15sp"
            android:background="#22E4FF"
            android:contentDescription="Start focus session" />

        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="match_parent"
            android:layout_weight="1"
            android:layout_marginStart="8dp"
            android:orientation="vertical">

            <TextView
                android:id="@+id/widget_secondary_ai"
                android:layout_width="match_parent"
                android:layout_height="0dp"
                android:layout_weight="1"
                android:gravity="center"
                android:text="AI"
                android:textColor="#D8ECF8"
                android:textStyle="bold"
                android:textSize="12sp"
                android:background="#143149"
                android:contentDescription="Open AI companion" />

            <TextView
                android:id="@+id/widget_secondary_progress"
                android:layout_width="match_parent"
                android:layout_height="0dp"
                android:layout_weight="1"
                android:layout_marginTop="6dp"
                android:gravity="center"
                android:text="Progress"
                android:textColor="#D8ECF8"
                android:textStyle="bold"
                android:textSize="12sp"
                android:background="#143149"
                android:contentDescription="View daily progress" />
        </LinearLayout>
    </LinearLayout>

    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="10dp"
        android:text="Today: 2h10m   Sessions: 4   Streak 7"
        android:textColor="#B8D6E8"
        android:textSize="11sp" />

</LinearLayout>
`
      );

      writeFile(
        modConfig.modRequest.projectRoot,
        "android/app/src/main/res/layout/widget_focus_large.xml",
        `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="12dp"
    android:background="#071426">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="44dp"
        android:orientation="horizontal">

        <TextView
            android:id="@+id/widget_primary_action"
            android:layout_width="0dp"
            android:layout_height="match_parent"
            android:layout_weight="2"
            android:gravity="center"
            android:text="Start Focus Session"
            android:textStyle="bold"
            android:textColor="#02111D"
            android:textSize="14sp"
            android:background="#22E4FF"
            android:contentDescription="Start focus session" />

        <TextView
            android:layout_width="0dp"
            android:layout_height="match_parent"
            android:layout_weight="1"
            android:layout_marginStart="8dp"
            android:gravity="center"
            android:text="Goal 62%"
            android:textColor="#B8D6E8"
            android:textSize="12sp"
            android:background="#10263A" />
    </LinearLayout>

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="10dp"
        android:orientation="horizontal">

        <TextView
            android:id="@+id/widget_action_resume"
            android:layout_width="0dp"
            android:layout_height="34dp"
            android:layout_weight="1"
            android:gravity="center"
            android:text="Resume"
            android:textColor="#D8ECF8"
            android:textSize="11sp"
            android:textStyle="bold"
            android:background="#143149" />

        <TextView
            android:id="@+id/widget_action_pause"
            android:layout_width="0dp"
            android:layout_height="34dp"
            android:layout_weight="1"
            android:layout_marginStart="6dp"
            android:gravity="center"
            android:text="Pause"
            android:textColor="#D8ECF8"
            android:textSize="11sp"
            android:textStyle="bold"
            android:background="#143149" />

        <TextView
            android:id="@+id/widget_action_skip"
            android:layout_width="0dp"
            android:layout_height="34dp"
            android:layout_weight="1"
            android:layout_marginStart="6dp"
            android:gravity="center"
            android:text="Skip"
            android:textColor="#D8ECF8"
            android:textSize="11sp"
            android:textStyle="bold"
            android:background="#143149" />

        <TextView
            android:id="@+id/widget_action_ai"
            android:layout_width="0dp"
            android:layout_height="34dp"
            android:layout_weight="1"
            android:layout_marginStart="6dp"
            android:gravity="center"
            android:text="Ask AI"
            android:textColor="#D8ECF8"
            android:textSize="11sp"
            android:textStyle="bold"
            android:background="#143149" />

        <TextView
            android:id="@+id/widget_action_stats"
            android:layout_width="0dp"
            android:layout_height="34dp"
            android:layout_weight="1"
            android:layout_marginStart="6dp"
            android:gravity="center"
            android:text="Stats"
            android:textColor="#D8ECF8"
            android:textSize="11sp"
            android:textStyle="bold"
            android:background="#143149" />
    </LinearLayout>

    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="12dp"
        android:text="Focus Ring 72%   Sessions: 5   Streak: 12"
        android:textColor="#B8D6E8"
        android:textSize="11sp" />

    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="4dp"
        android:text="Tip: Start now for a high-focus window"
        android:textColor="#9EC6DB"
        android:textSize="11sp" />

</LinearLayout>
`
      );

      writeFile(
        modConfig.modRequest.projectRoot,
        "android/app/src/main/res/xml/focus_widget_info.xml",
        `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="120dp"
    android:minHeight="120dp"
    android:maxResizeWidth="320dp"
    android:maxResizeHeight="320dp"
    android:updatePeriodMillis="0"
    android:initialLayout="@layout/widget_focus_small"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen"
    android:description="@string/widget_focus_description" />
`
      );

      writeTemplate(
        modConfig.modRequest.projectRoot,
        "native/android-widget/java/FocusWidgetProvider.kt",
        `android/app/src/main/java/${androidPackagePath}/widget/FocusWidgetProvider.kt`,
        { __ANDROID_PACKAGE__: androidPackage }
      );

      [
        "widget_focus_small.xml",
        "widget_focus_medium.xml",
        "widget_focus_large.xml"
      ].forEach((fileName) => {
        writeTemplate(
          modConfig.modRequest.projectRoot,
          `native/android-widget/layout/${fileName}`,
          `android/app/src/main/res/layout/${fileName}`
        );
      });

      [
        "widget_glass_panel.xml",
        "widget_ocean_background.xml",
        "widget_premium_pill.xml",
        "widget_primary_cta.xml",
        "widget_progress_chip.xml",
        "widget_secondary_action.xml"
      ].forEach((fileName) => {
        writeTemplate(
          modConfig.modRequest.projectRoot,
          `native/android-widget/drawable/${fileName}`,
          `android/app/src/main/res/drawable/${fileName}`
        );
      });

      return modConfig;
    }
  ]);
}

function withFocusWidgetAndroidManifest(config) {
  return withAndroidManifest(config, (modConfig) => {
    const app = modConfig.modResults.manifest.application?.[0];
    if (!app) return modConfig;

    const receivers = app.receiver || [];
    const existing = receivers.find(
      (receiver) => receiver.$["android:name"] === ".widget.FocusWidgetProvider"
    );

    if (!existing) {
      receivers.push({
        $: {
          "android:name": ".widget.FocusWidgetProvider",
          "android:exported": "false",
          "android:label": "@string/widget_focus_label"
        },
        "intent-filter": [
          {
            action: [
              {
                $: {
                  "android:name": "android.appwidget.action.APPWIDGET_UPDATE"
                }
              }
            ]
          }
        ],
        "meta-data": [
          {
            $: {
              "android:name": "android.appwidget.provider",
              "android:resource": "@xml/focus_widget_info"
            }
          }
        ]
      });
      app.receiver = receivers;
    }

    return modConfig;
  });
}

function withFocusWidgetAndroidStrings(config) {
  return withStringsXml(config, (modConfig) => {
    const resources = modConfig.modResults.resources;
    addOrUpdateString(
      resources,
      "widget_focus_label",
      "DeepOcean Focus Widget"
    );
    addOrUpdateString(
      resources,
      "widget_focus_description",
      "Start and control focus sessions directly from home screen"
    );
    return modConfig;
  });
}

function withFocusWidgetAppGroup(config, props = {}) {
  return withEntitlementsPlist(config, (modConfig) => {
    const appGroup = getAppGroup(config, props);

    const key = "com.apple.security.application-groups";
    const current = modConfig.modResults[key] || [];
    if (!current.includes(appGroup)) {
      modConfig.modResults[key] = [...current, appGroup];
    }

    return modConfig;
  });
}

function withFocusWidgetIosScheme(config) {
  return withInfoPlist(config, (modConfig) => {
    const urlTypes = modConfig.modResults.CFBundleURLTypes || [];
    const target = urlTypes.find((entry) =>
      Array.isArray(entry.CFBundleURLSchemes)
    );

    if (target) {
      const schemes = target.CFBundleURLSchemes || [];
      if (!schemes.includes("deepocean-widget")) {
        target.CFBundleURLSchemes = [...schemes, "deepocean-widget"];
      }
    } else {
      urlTypes.push({ CFBundleURLSchemes: ["deepocean-widget"] });
    }

    modConfig.modResults.CFBundleURLTypes = urlTypes;
    return modConfig;
  });
}

function withFocusWidgetIosFiles(config, props = {}) {
  return withDangerousMod(config, [
    "ios",
    async (modConfig) => {
      const appGroup = getAppGroup(config, props);
      const iosRoot = modConfig.modRequest.platformProjectRoot;

      writeTemplate(
        iosRoot,
        "native/ios-widget/DeepOceanFocusWidget.swift",
        "Widgets/DeepOceanFocusWidget.swift",
        { __APP_GROUP__: appGroup }
      );

      writeFile(
        iosRoot,
        "Widgets/DeepOceanWidgetIntents.swift",
        `import AppIntents

struct StartFocusIntent: AppIntent {
  static var title: LocalizedStringResource = "Start Focus"
  static var description = IntentDescription("Start a focus session from the widget.")
  static var openAppWhenRun: Bool = false

  @Parameter(title: "Minutes", default: 25)
  var minutes: Int

  func perform() async throws -> some IntentResult {
    // Phase 2 scaffold: wire this to native session execution in the
    // widget extension target for true no-app-open execution.
    return .result()
  }
}
`
      );

      writeFile(
        iosRoot,
        "Widgets/DeepOceanFocusWidget.swift",
        `import SwiftUI
import WidgetKit

struct DeepOceanWidgetEntry: TimelineEntry {
  let date: Date
  let title: String
  let subtitle: String
  let isPremium: Bool
}

struct DeepOceanWidgetProvider: TimelineProvider {
  func placeholder(in context: Context) -> DeepOceanWidgetEntry {
    DeepOceanWidgetEntry(
      date: Date(),
      title: "Start Focus",
      subtitle: "Next: 25m",
      isPremium: false
    )
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
    let defaults = UserDefaults(suiteName: "${appGroup}")
    let raw = defaults?.string(forKey: "app.widget.snapshot")

    if let raw, raw.contains("resume_current") {
      return DeepOceanWidgetEntry(
        date: Date(),
        title: "Resume Session",
        subtitle: "Tap to continue",
        isPremium: raw.contains("\\\"isPremium\\\":true")
      )
    }

    return DeepOceanWidgetEntry(
      date: Date(),
      title: "Start Focus",
      subtitle: "Next: 25m",
      isPremium: raw?.contains("\\\"isPremium\\\":true") == true
    )
  }
}

struct DeepOceanFocusWidgetEntryView: View {
  let entry: DeepOceanWidgetProvider.Entry

  var body: some View {
    ZStack {
      LinearGradient(
        colors: [Color(red: 0.02, green: 0.08, blue: 0.15), Color(red: 0.05, green: 0.16, blue: 0.25)],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
      )

      VStack(alignment: .leading, spacing: 8) {
        Button(intent: StartFocusIntent()) {
          Text(entry.title)
            .font(.system(size: 17, weight: .bold))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
            .background(Color(red: 0.13, green: 0.89, blue: 1.0))
            .foregroundColor(Color(red: 0.01, green: 0.06, blue: 0.11))
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        }
        .buttonStyle(.plain)

        HStack {
          Text(entry.subtitle)
            .font(.system(size: 12, weight: .medium))
            .foregroundColor(Color.white.opacity(0.8))
          Spacer()
          if entry.isPremium {
            Text("PRO")
              .font(.system(size: 10, weight: .bold))
              .foregroundColor(Color(red: 0.13, green: 0.89, blue: 1.0))
          }
        }
      }
      .padding(12)
    }
    .containerBackground(for: .widget) {
      LinearGradient(
        colors: [
          Color(red: 0.02, green: 0.06, blue: 0.11),
          Color(red: 0.03, green: 0.12, blue: 0.20)
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
      )
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
`
      );

      writeTemplate(
        iosRoot,
        "native/ios-widget/DeepOceanFocusWidget.swift",
        "Widgets/DeepOceanFocusWidget.swift",
        { __APP_GROUP__: appGroup }
      );

      runIosWidgetPatcher(modConfig.modRequest.projectRoot);

      return modConfig;
    }
  ]);
}

const withFocusWidget = (config, props = {}) => {
  config = withFocusWidgetAndroidFiles(config);
  config = withFocusWidgetAndroidManifest(config);
  config = withFocusWidgetAndroidStrings(config);
  config = withFocusWidgetAppGroup(config, props);
  config = withFocusWidgetIosScheme(config);
  config = withFocusWidgetIosFiles(config, props);
  return config;
};

module.exports = withFocusWidget;
