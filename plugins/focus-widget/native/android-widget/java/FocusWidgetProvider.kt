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
import org.json.JSONObject
import __ANDROID_PACKAGE__.MainActivity
import __ANDROID_PACKAGE__.R

enum class WidgetConcept {
  PORTAL,
  INSTRUMENT,
  LIVING
}

open class FocusWidgetProvider(
  private val concept: WidgetConcept = WidgetConcept.PORTAL
) : AppWidgetProvider() {

  companion object {
    fun refreshAll(context: Context) {
      val manager = AppWidgetManager.getInstance(context)
      listOf(
        FocusWidgetProvider::class.java,
        DivingInstrumentWidgetProvider::class.java,
        LivingOceanWidgetProvider::class.java
      ).forEach { provider ->
        val ids = manager.getAppWidgetIds(ComponentName(context, provider))
        if (ids.isNotEmpty()) {
          context.sendBroadcast(Intent(context, provider).apply {
            action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
          })
        }
      }
    }
  }

  override fun onUpdate(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetIds: IntArray
  ) {
    appWidgetIds.forEach { id ->
      appWidgetManager.updateAppWidget(
        id,
        buildViews(context, appWidgetManager.getAppWidgetOptions(id))
      )
    }
  }

  override fun onAppWidgetOptionsChanged(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetId: Int,
    newOptions: Bundle
  ) {
    appWidgetManager.updateAppWidget(appWidgetId, buildViews(context, newOptions))
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

    views.setInt(R.id.widget_root, "setBackgroundResource", backgroundFor(layout, snapshot.isPremium))
    views.setTextViewText(R.id.widget_primary_action, snapshot.actionTitle)
    views.setContentDescription(R.id.widget_primary_action, snapshot.actionDescription)
    views.setOnClickPendingIntent(
      R.id.widget_primary_action,
      deepLinkPendingIntent(
        context,
        "deepocean://widget?action=${snapshot.primaryAction}&minutes=${snapshot.preferredMinutes}"
      )
    )
    views.setViewVisibility(R.id.widget_premium_badge, if (snapshot.isPremium) View.VISIBLE else View.GONE)

    when (layout) {
      R.layout.widget_focus_small -> bindSmall(views, snapshot)
      R.layout.widget_focus_medium -> bindMedium(views, snapshot)
      R.layout.widget_focus_large -> bindLarge(views, snapshot)
    }
    return views
  }

  private fun bindSmall(views: RemoteViews, snapshot: WidgetSnapshot) {
    views.setTextViewText(
      R.id.widget_zone_value,
      when (concept) {
        WidgetConcept.PORTAL -> "${snapshot.zoneLabel} · ${snapshot.currentDepthMeters}m"
        WidgetConcept.INSTRUMENT -> "${snapshot.currentDepthMeters}m · ${snapshot.zoneLabel}"
        WidgetConcept.LIVING -> "Ocean Level ${snapshot.oceanLevel} · ${snapshot.todayFocusMinutes} min"
      }
    )
  }

  private fun bindMedium(views: RemoteViews, snapshot: WidgetSnapshot) {
    views.setTextViewText(R.id.widget_zone_value, snapshot.zoneLabel)
    views.setTextViewText(
      R.id.widget_today_value,
      if (concept == WidgetConcept.INSTRUMENT) "${snapshot.currentDepthMeters}m" else "${snapshot.todayFocusMinutes} min"
    )
    views.setTextViewText(
      R.id.widget_context_value,
      "${snapshot.currentDepthMeters}m · ${snapshot.streakDays} ${snapshot.t("day streak", "ngày liên tiếp")}"
    )
    views.setProgressBar(R.id.widget_today_progress, 100, snapshot.todayProgress, false)
  }

  private fun bindLarge(views: RemoteViews, snapshot: WidgetSnapshot) {
    views.setTextViewText(R.id.widget_today_value, "${snapshot.todayFocusMinutes} min")
    views.setProgressBar(R.id.widget_today_progress, 100, snapshot.todayProgress, false)
    views.setTextViewText(R.id.widget_zone_value, snapshot.zoneLabel)
    views.setTextViewText(R.id.widget_depth_value, "${snapshot.currentDepthMeters}m")
    views.setTextViewText(R.id.widget_streak_value, "${snapshot.streakDays} ${snapshot.t("days", "ngày")}")
    views.setTextViewText(R.id.widget_message, snapshot.message)
  }

  private fun backgroundFor(layout: Int, premium: Boolean): Int {
    return when (concept) {
      WidgetConcept.PORTAL ->
        if (layout == R.layout.widget_focus_small) R.drawable.ocean_portal_square else R.drawable.ocean_portal_wide
      WidgetConcept.LIVING ->
        if (layout == R.layout.widget_focus_small) R.drawable.living_jellyfish_square else R.drawable.living_whale_wide
      WidgetConcept.INSTRUMENT ->
        if (premium) R.drawable.widget_ocean_background_premium else R.drawable.widget_ocean_background
    }
  }

  private fun deepLinkPendingIntent(context: Context, url: String): PendingIntent {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url), context, MainActivity::class.java)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    return PendingIntent.getActivity(
      context,
      url.hashCode(),
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }
}

class DivingInstrumentWidgetProvider :
  FocusWidgetProvider(WidgetConcept.INSTRUMENT)

class LivingOceanWidgetProvider :
  FocusWidgetProvider(WidgetConcept.LIVING)

private data class WidgetSnapshot(
  val capturedAt: Long,
  val isPremium: Boolean,
  val language: String,
  val preferredMinutes: Int,
  val streakDays: Int,
  val todayFocusMinutes: Int,
  val dailyTargetMinutes: Int,
  val weeklyFocusMinutes: Int,
  val weeklyTargetMinutes: Int,
  val currentZone: String,
  val currentDepthMeters: Int,
  val discoveryCount: Int,
  val totalDives: Int,
  val sessionStatus: String?,
  val primaryAction: String
) {
  val isVietnamese get() = language == "vi"
  fun t(en: String, vi: String) = if (isVietnamese) vi else en

  val actionTitle: String
    get() = when (primaryAction) {
      "pause_session" -> t("Pause Dive", "Tạm dừng")
      "resume_current" -> t("Resume Dive", "Tiếp tục lặn")
      else -> t("Start Dive", "Bắt đầu lặn")
    }

  val actionDescription: String
    get() = t(
      "$actionTitle, $preferredMinutes minute ocean focus dive",
      "$actionTitle, chuyến lặn tập trung $preferredMinutes phút"
    )

  val statusLabel: String
    get() = when (sessionStatus) {
      "diving" -> t("DIVING", "ĐANG LẶN")
      "paused" -> t("PAUSED", "TẠM DỪNG")
      else -> t("READY", "SẴN SÀNG")
    }

  val zoneLabel: String
    get() {
      if (!isVietnamese) return currentZone
      return when (currentZone) {
        "Twilight Zone" -> "Vùng Chạng Vạng"
        "Midnight Zone" -> "Vùng Nửa Đêm"
        "Abyssal Zone" -> "Vùng Vực Thẳm"
        "Hadal Trench" -> "Rãnh Hadal"
        else -> "Vùng Ánh Sáng"
      }
    }

  val todayProgress: Int
    get() = ((todayFocusMinutes * 100) / dailyTargetMinutes.coerceAtLeast(1)).coerceIn(0, 100)

  val weeklyProgress: Int
    get() = ((weeklyFocusMinutes * 100) / weeklyTargetMinutes.coerceAtLeast(1)).coerceIn(0, 100)

  val oceanLevel: Int
    get() = when (currentZone) {
      "Twilight Zone" -> 2
      "Midnight Zone" -> 3
      "Abyssal Zone" -> 4
      "Hadal Trench" -> 5
      else -> 1
    }

  val message: String
    get() = if (sessionStatus == "diving") {
      t("The ocean is awakening…", "Biển đang thức giấc…")
    } else {
      t("Tap to begin your dive.", "Chạm để bắt đầu chuyến lặn.")
    }

  companion object {
    fun read(context: Context): WidgetSnapshot {
      val raw = context.getSharedPreferences("deep-ocean-widget", Context.MODE_PRIVATE)
        .getString("app.widget.snapshot", null)
      val json = runCatching { JSONObject(raw ?: "") }.getOrNull()
      val session = json?.optJSONObject("session")
      return WidgetSnapshot(
        capturedAt = json?.optLong("capturedAt", 0) ?: 0,
        isPremium = json?.optBoolean("isPremium", false) ?: false,
        language = json?.optString("language", "en") ?: "en",
        preferredMinutes = json?.optInt("preferredMinutes", 25) ?: 25,
        streakDays = json?.optInt("streakDays", 0) ?: 0,
        todayFocusMinutes = json?.optInt("todayFocusMinutes", 0) ?: 0,
        dailyTargetMinutes = json?.optInt("dailyTargetMinutes", 25) ?: 25,
        weeklyFocusMinutes = json?.optInt("weeklyFocusMinutes", 0) ?: 0,
        weeklyTargetMinutes = json?.optInt("weeklyTargetMinutes", 125) ?: 125,
        currentZone = json?.optString("currentZone", "Sunlight Zone") ?: "Sunlight Zone",
        currentDepthMeters = json?.optInt("currentDepthMeters", 0) ?: 0,
        discoveryCount = json?.optInt("discoveryCount", 0) ?: 0,
        totalDives = json?.optInt("totalDives", 0) ?: 0,
        sessionStatus = session?.optString("status")?.takeIf { it.isNotBlank() },
        primaryAction = json?.optString("primaryAction", "start_focus") ?: "start_focus"
      )
    }
  }
}
