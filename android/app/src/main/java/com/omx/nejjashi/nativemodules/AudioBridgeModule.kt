package com.omx.nejjashi.nativemodules

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class AudioBridgeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AudioBridge"
    }

    @ReactMethod
    fun getAudioSessionId(promise: Promise) {
        try {
            val sessionId = 0
            promise.resolve(sessionId)
        } catch (e: Exception) {
            promise.reject("AUDIO_ERROR", e.message)
        }
    }

    @ReactMethod
    fun requestAudioFocus(promise: Promise) {
        try {
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("AUDIO_FOCUS_ERROR", e.message)
        }
    }

    @ReactMethod
    fun abandonAudioFocus(promise: Promise) {
        try {
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("AUDIO_FOCUS_ERROR", e.message)
        }
    }
}
