package __ANDROID_PACKAGE__.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.RemoteViews
import __ANDROID_PACKAGE__.MainActivity
import __ANDROID_PACKAGE__.R

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

    val snapshot = WidgetSnapshot.read(context)
    val views = RemoteViews(context.packageName, layout)
    bindSnapshot(views, layout, snapshot)

    views.setOnClickPendingIntent(
      R.id.widget_primary_action,
      deepLinkPendingIntent(context, "deepocean://widget?action=${snapshot.primaryAction}&minutes=${snapshot.preferredMinutes}")
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

  private fun bindSnapshot(views: RemoteViews, layout: Int, snapshot: WidgetSnapshot) {
    views.setTextViewText(R.id.widget_primary_action, snapshot.primaryLabel)
    views.setContentDescription(R.id.widget_primary_action, snapshot.primaryA11y)

    when (layout) {
      R.layout.widget_focus_small -> {
        views.setTextViewText(R.id.widget_context_primary, snapshot.shortContext)
        views.setTextViewText(R.id.widget_context_secondary, snapshot.progressLabel)
        views.setViewVisibility(R.id.widget_premium_badge, if (snapshot.isPremium) View.VISIBLE else View.GONE)
      }

      R.layout.widget_focus_medium -> {
        views.setTextViewText(R.id.widget_context_primary, snapshot.mediumContext)
        views.setTextViewText(R.id.widget_context_secondary, snapshot.progressLabel)
        views.setViewVisibility(R.id.widget_premium_badge, if (snapshot.isPremium) View.VISIBLE else View.GONE)
      }

      R.layout.widget_focus_large -> {
        views.setTextViewText(R.id.widget_goal_status, snapshot.goalLabel)
        views.setTextViewText(R.id.widget_context_primary, snapshot.largeMetric)
        views.setTextViewText(R.id.widget_context_secondary, snapshot.insightLabel)
        views.setTextViewText(R.id.widget_premium_badge, if (snapshot.isPremium) "PRO TIDE" else "FOCUS")
        views.setViewVisibility(R.id.widget_premium_detail, if (snapshot.isPremium) View.VISIBLE else View.GONE)
      }
    }
  }

  private fun deepLinkPendingIntent(context: Context, url: String): PendingIntent {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url), context, MainActivity::class.java)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)

    val requestCode = url.hashCode()
    val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    return PendingIntent.getActivity(context, requestCode, intent, flags)
  }
}

private data class WidgetSnapshot(
  val isPremium: Boolean,
  val preferredMinutes: Int,
  val primaryAction: String,
  val elapsedSeconds: Int,
  val targetSeconds: Int?
) {
  val primaryLabel: String
    get() = when (primaryAction) {
      "pause_session" -> "Pause Dive"
      "resume_current" -> "Resume Dive"
      "skip_break" -> "Skip Break"
      else -> "Start Focus"
    }

  val primaryA11y: String
    get() = when (primaryAction) {
      "pause_session" -> "Pause current focus session"
      "resume_current" -> "Resume current focus session"
      "skip_break" -> "Skip break"
      else -> "Start a ${preferredMinutes} minute focus session"
    }

  val shortContext: String
    get() = if (targetSeconds != null && primaryAction == "pause_session") {
      "${minutesRemaining()}m left"
    } else {
      "Next: ${preferredMinutes}m"
    }

  val mediumContext: String
    get() = if (primaryAction == "pause_session") {
      "In dive · ${minutesRemaining()}m remaining"
    } else {
      "Ready for a ${preferredMinutes}m dive"
    }

  val progressLabel: String
    get() = if (targetSeconds != null && targetSeconds > 0) {
      "${progressPercent()}%"
    } else if (isPremium) {
      "Prime"
    } else {
      "Today"
    }

  val goalLabel: String
    get() = if (targetSeconds != null && targetSeconds > 0) {
      "Goal ${progressPercent()}%"
    } else {
      "Goal ${preferredMinutes}m"
    }

  val largeMetric: String
    get() = if (targetSeconds != null && targetSeconds > 0) {
      "${formatTime(elapsedSeconds)} elapsed · ${minutesRemaining()}m left"
    } else {
      "One tap starts your next deep-work block"
    }

  val insightLabel: String
    get() = if (isPremium) {
      "Smart window ready · AI plan unlocked"
    } else {
      "AI and progress are one tap away"
    }

  private fun progressPercent(): Int {
    val target = targetSeconds ?: return 0
    if (target <= 0) return 0
    return ((elapsedSeconds.coerceAtLeast(0) * 100) / target).coerceIn(0, 100)
  }

  private fun minutesRemaining(): Int {
    val target = targetSeconds ?: return preferredMinutes
    return ((target - elapsedSeconds).coerceAtLeast(0) + 59) / 60
  }

  private fun formatTime(totalSeconds: Int): String {
    val mins = (totalSeconds.coerceAtLeast(0) / 60).coerceAtMost(999)
    val secs = totalSeconds.coerceAtLeast(0) % 60
    return "%d:%02d".format(mins, secs)
  }

  companion object {
    fun read(context: Context): WidgetSnapshot {
      val raw = context.getSharedPreferences("deep-ocean-widget", Context.MODE_PRIVATE)
        .getString("app.widget.snapshot", null)

      return WidgetSnapshot(
        isPremium = raw?.contains("\"isPremium\":true") == true,
        preferredMinutes = raw?.extractInt("preferredMinutes") ?: 25,
        primaryAction = raw?.extractString("primaryAction") ?: "start_focus",
        elapsedSeconds = raw?.extractInt("elapsedSeconds") ?: 0,
        targetSeconds = raw?.extractNullableInt("targetSeconds")
      )
    }
  }
}

private fun String.extractString(key: String): String? {
  val match = Regex("\"$key\"\\s*:\\s*\"([^\"]+)\"").find(this)
  return match?.groupValues?.getOrNull(1)
}

private fun String.extractInt(key: String): Int? {
  val match = Regex("\"$key\"\\s*:\\s*(\\d+)").find(this)
  return match?.groupValues?.getOrNull(1)?.toIntOrNull()
}

private fun String.extractNullableInt(key: String): Int? {
  if (Regex("\"$key\"\\s*:\\s*null").containsMatchIn(this)) return null
  return extractInt(key)
}
