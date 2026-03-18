package com.ehr

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    setTheme(R.style.AppTheme)
    window.statusBarColor = getColor(R.color.splash_background)
    super.onCreate(null)

    // Preserve green background during startup to avoid white flash
    window.setBackgroundDrawableResource(R.color.splash_background)

    // Switch to theme background after splash screen (5s delay) for keyboard compatibility
    android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
        window.setBackgroundDrawableResource(R.color.app_background)
    }, 2000)
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "EHR"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
