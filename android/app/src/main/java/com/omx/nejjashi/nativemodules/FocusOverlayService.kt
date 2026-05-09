package com.omx.nejjashi.nativemodules

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.view.Gravity
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.app.NotificationCompat

class FocusOverlayService : Service() {

    companion object {
        const val CHANNEL_ID = "focus_mode_channel"
        const val NOTIFICATION_ID = 1001
        const val OVERLAY_TYPE_DEPRECATED = 2002
    }

    private var overlayView: android.view.View? = null
    private val handler = Handler(Looper.getMainLooper())
    private var isOverlayShown = false

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == "STOP_FOCUS") {
            removeOverlay()
            stopSelf()
            return START_NOT_STICKY
        }

        // Start as foreground service
        val notification = buildNotification()
        startForeground(NOTIFICATION_ID, notification)

        // Show overlay if focus mode is active
        if (FocusModeModule.isFocusActive && !isOverlayShown) {
            showFocusOverlay()
        }

        return START_STICKY
    }

    override fun onDestroy() {
        removeOverlay()
        super.onDestroy()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Spiritual Focus Mode",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Active during adhkar focus sessions"
                setShowBadge(false)
            }
            val nm = getSystemService(NotificationManager::class.java)
            nm.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Spiritual Focus Mode")
            .setContentText("Complete your adhkar to dismiss")
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .build()
    }

    private fun showFocusOverlay() {
        if (!Settings.canDrawOverlays(this)) return
        if (isOverlayShown) return

        handler.post {
            try {
                val wm = getSystemService(WINDOW_SERVICE) as WindowManager

                val overlay = LinearLayout(this).apply {
                    orientation = LinearLayout.VERTICAL
                    setBackgroundColor(android.graphics.Color.parseColor("#E60A0F0D"))
                    gravity = Gravity.CENTER
                    setPadding(48, 96, 48, 96)

                    val title = TextView(this@FocusOverlayService).apply {
                        text = "Spiritual Focus Mode"
                        setTextColor(android.graphics.Color.parseColor("#FBBF24"))
                        textSize = 22f
                        typeface = android.graphics.Typeface.DEFAULT_BOLD
                        gravity = Gravity.CENTER
                    }
                    addView(title)

                    val subtitle = TextView(this@FocusOverlayService).apply {
                        text = "Complete your adhkar before returning to other apps"
                        setTextColor(android.graphics.Color.parseColor("#E8F5E9"))
                        textSize = 14f
                        gravity = Gravity.CENTER
                        setPadding(0, 24, 0, 0)
                    }
                    addView(subtitle)

                    val emergencyBtn = TextView(this@FocusOverlayService).apply {
                        text = "Emergency Bypass ▸"
                        setTextColor(android.graphics.Color.parseColor("#10B981"))
                        textSize = 13f
                        gravity = Gravity.CENTER
                        setPadding(0, 48, 0, 0)
                        setOnClickListener {
                            removeOverlay()
                            FocusModeModule.isFocusActive = false
                            FocusModeModule.blockedPackages.clear()
                            stopSelf()
                        }
                    }
                    addView(emergencyBtn)
                }

                val params = WindowManager.LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.MATCH_PARENT,
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                    else
                        @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                    android.graphics.PixelFormat.TRANSLUCENT
                ).apply {
                    gravity = Gravity.CENTER
                }

                wm.addView(overlay, params)
                overlayView = overlay
                isOverlayShown = true
            } catch (e: Exception) {
                // Overlay creation failed — likely permission not granted
            }
        }
    }

    private fun removeOverlay() {
        if (overlayView != null) {
            try {
                val wm = getSystemService(WINDOW_SERVICE) as WindowManager
                wm.removeView(overlayView)
            } catch (_: Exception) {}
            overlayView = null
            isOverlayShown = false
        }
    }
}
