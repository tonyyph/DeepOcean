package __ANDROID_PACKAGE__.widget

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class DeepOceanWidgetSnapshotModule(
  reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "DeepOceanWidgetSnapshot"

  @ReactMethod
  fun setSnapshot(snapshot: String) {
    reactApplicationContext
      .getSharedPreferences("deep-ocean-widget", Context.MODE_PRIVATE)
      .edit()
      .putString("app.widget.snapshot", snapshot)
      .apply()
    FocusWidgetProvider.refreshAll(reactApplicationContext)
  }
}
