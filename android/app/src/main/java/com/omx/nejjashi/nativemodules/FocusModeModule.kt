package com.omx.nejjashi.nativemodules

import android.accessibilityservice.AccessibilityServiceInfo
import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.view.accessibility.AccessibilityManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableNativeArray

class FocusModeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        var blockedPackages: MutableSet<String> = mutableSetOf()
        var essentialPackages: MutableSet<String> = mutableSetOf(
            "com.android.phone",
            "com.android.dialer",
            "com.google.android.dialer",
            "com.android.messaging",
            "com.google.android.apps.messaging",
            "com.android.server.telecom",
            "com.android.emergency",
            "com.google.android.apps.safety",
            "com.android.camera",
            "com.google.android.apps.wallet"
        )
        var isFocusActive: Boolean = false
    }

    override fun getName(): String {
        return "FocusModeBridge"
    }

    // ─── Overlay Permission ───

    @ReactMethod
    fun canDrawOverlays(promise: Promise) {
        try {
            val canDraw = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Settings.canDrawOverlays(reactApplicationContext)
            } else {
                true
            }
            promise.resolve(canDraw)
        } catch (e: Exception) {
            promise.reject("OVERLAY_CHECK_ERROR", e.message)
        }
    }

    @ReactMethod
    fun requestOverlayPermission(promise: Promise) {
        try {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:com.omx.nejjashi")
            )
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("OVERLAY_PERMISSION_ERROR", e.message)
        }
    }

    // ─── Accessibility Permission ───

    @ReactMethod
    fun isAccessibilityEnabled(promise: Promise) {
        try {
            val am = reactApplicationContext.getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
            val enabled = am.isEnabled
            promise.resolve(enabled)
        } catch (e: Exception) {
            promise.reject("ACCESSIBILITY_CHECK_ERROR", e.message)
        }
    }

    @ReactMethod
    fun requestAccessibilityPermission(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ACCESSIBILITY_PERMISSION_ERROR", e.message)
        }
    }

    // ─── Focus Mode Control ───

    @ReactMethod
    fun startFocusMode(blockedAppsList: com.facebook.react.bridge.ReadableArray, promise: Promise) {
        try {
            blockedPackages.clear()
            for (i in 0 until blockedAppsList.size()) {
                val app = blockedAppsList.getMap(i)
                val packageName = app?.getString("packageName")
                if (packageName != null && !essentialPackages.contains(packageName)) {
                    blockedPackages.add(packageName)
                }
            }
            isFocusActive = true

            // Start the overlay service
            val intent = Intent(reactApplicationContext, FocusOverlayService::class.java)
            intent.action = "START_FOCUS"
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactApplicationContext.startForegroundService(intent)
            } else {
                reactApplicationContext.startService(intent)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("FOCUS_START_ERROR", e.message)
        }
    }

    @ReactMethod
    fun stopFocusMode(promise: Promise) {
        try {
            isFocusActive = false
            blockedPackages.clear()

            val intent = Intent(reactApplicationContext, FocusOverlayService::class.java)
            intent.action = "STOP_FOCUS"
            reactApplicationContext.stopService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("FOCUS_STOP_ERROR", e.message)
        }
    }

    @ReactMethod
    fun isFocusModeActive(promise: Promise) {
        promise.resolve(isFocusActive)
    }

    // ─── App Monitoring ───

    @ReactMethod
    fun isAppBlocked(packageName: String, promise: Promise) {
        promise.resolve(isFocusActive && blockedPackages.contains(packageName))
    }

    @ReactMethod
    fun setEssentialApps(essentialList: com.facebook.react.bridge.ReadableArray, promise: Promise) {
        try {
            // Always keep core emergency apps
            essentialPackages.clear()
            essentialPackages.add("com.android.phone")
            essentialPackages.add("com.android.dialer")
            essentialPackages.add("com.google.android.dialer")
            essentialPackages.add("com.android.messaging")
            essentialPackages.add("com.google.android.apps.messaging")
            essentialPackages.add("com.android.server.telecom")
            essentialPackages.add("com.android.emergency")
            essentialPackages.add("com.google.android.apps.safety")

            for (i in 0 until essentialList.size()) {
                val pkg = essentialList.getString(i)
                if (pkg != null) essentialPackages.add(pkg)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ESSENTIAL_APPS_ERROR", e.message)
        }
    }

    // ─── Battery Optimization ───

    @ReactMethod
    fun isIgnoringBatteryOptimizations(promise: Promise) {
        try {
            val pm = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as android.os.PowerManager
            val isIgnoring = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                pm.isIgnoringBatteryOptimizations("com.omx.nejjashi")
            } else {
                true
            }
            promise.resolve(isIgnoring)
        } catch (e: Exception) {
            promise.reject("BATTERY_OPT_ERROR", e.message)
        }
    }

    @ReactMethod
    fun requestIgnoreBatteryOptimization(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
            intent.data = Uri.parse("package:com.omx.nejjashi")
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("BATTERY_OPT_REQUEST_ERROR", e.message)
        }
    }

    // ─── Notification Permission (Android 13+) ───

    @ReactMethod
    fun requestNotificationPermission(promise: Promise) {
        // On Android 13+, this should be handled by the React Native side
        // using @react-native-firebase/messaging or PermissionsAndroid
        promise.resolve(true)
    }
}
