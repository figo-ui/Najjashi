// ─── Najjashi Crashlytics Service ───
// Centralized crash and error reporting with user context

import crashlytics, { FirebaseCrashlyticsTypes } from '@react-native-firebase/crashlytics';
import type { AuthMethod } from '../types';

// ─── Initialization ───

export async function initCrashlytics(): Promise<void> {
  try {
    // Enable collection (respects user privacy settings)
    await crashlytics().setCrashlyticsCollectionEnabled(true);
    console.log('[Crashlytics] Initialized');
  } catch (e) {
    console.warn('[Crashlytics] Init failed:', e);
  }
}

// ─── User Identification ───

export async function setCrashlyticsUser(
  uid: string,
  email?: string,
  authMethod?: AuthMethod,
): Promise<void> {
  try {
    await crashlytics().setUserId(uid);
    if (email) await crashlytics().setAttribute('email', email);
    if (authMethod) await crashlytics().setAttribute('auth_method', authMethod);
  } catch (e) {
    // Don't crash if Crashlytics fails
  }
}

export async function clearCrashlyticsUser(): Promise<void> {
  try {
    await crashlytics().setUserId('');
  } catch (_) {}
}

// ─── Custom Attributes ───

export async function setCrashlyticsAttributes(attrs: Record<string, string>): Promise<void> {
  try {
    for (const [key, value] of Object.entries(attrs)) {
      await crashlytics().setAttribute(key, value);
    }
  } catch (_) {}
}

// ─── Logging ───

export function logToCrashlytics(message: string): void {
  try {
    crashlytics().log(message);
  } catch (_) {}
}

// ─── Error Reporting ───

export function recordError(error: Error, context?: string): void {
  try {
    if (context) crashlytics().log(`Context: ${context}`);
    crashlytics().recordError(error);
  } catch (_) {}
}

export async function recordNonFatalError(
  code: string,
  message: string,
  details?: Record<string, string>,
): Promise<void> {
  try {
    if (details) {
      for (const [key, value] of Object.entries(details)) {
        await crashlytics().setAttribute(`err_${key}`, value);
      }
    }
    crashlytics().recordError(new Error(`[${code}] ${message}`));
  } catch (_) {}
}

// ─── Force Crash (testing only, never call in production) ───

export function forceCrash(): void {
  crashlytics().crash();
}
