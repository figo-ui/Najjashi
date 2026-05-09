// ─── Najjashi Remote Config Service ───
// Feature flags, A/B testing, and dynamic configuration from Firebase

import remoteConfig, { FirebaseRemoteConfigTypes } from '@react-native-firebase/remote-config';

// ─── Defaults ───

const REMOTE_CONFIG_DEFAULTS: Record<string, string | number | boolean> = {
  // Feature flags
  enable_ai_recommendations: true,
  enable_recitation_coach: true,
  enable_focus_mode: true,
  enable_community_leaderboard: false,
  enable_streak_celebrations: true,
  enable_night_mode_auto: true,

  // AI tuning
  ai_ema_alpha: 0.3,
  ai_bayesian_prior: 0.5,
  ai_min_observations: 3,
  ai_max_recommendations: 7,
  ai_spiritual_level_thresholds: '0,0.15,0.3,0.5,0.7,0.85',

  // Prayer reminders
  prayer_reminder_minutes_before: 15,
  prayer_reminder_enabled: true,
  adhkar_reminder_enabled: true,
  weekly_report_enabled: true,

  // Content limits
  max_tasbih_target: 1000,
  default_tasbih_target: 33,
  max_adhkar_session_minutes: 30,

  // UI
  show_onboarding_tips: true,
  home_screen_layout: 'default',
  dark_mode_default: false,

  // API
  islamic_api_timeout_ms: 10000,
  quran_audio_quality: 'medium',
};

// ─── Initialization ───

export async function initRemoteConfig(): Promise<void> {
  try {
    // Set defaults first (used when fetch fails)
    await remoteConfig().setDefaults(REMOTE_CONFIG_DEFAULTS);

    // Fetch and activate — 12 hour cache by default
    await remoteConfig().fetchAndActivate();

    // Set minimum fetch interval (1 hour for dev, 12 for prod)
    const isDev = __DEV__;
    await remoteConfig().setConfigSettings({
      minimumFetchIntervalMillis: isDev ? 3600000 : 43200000,
    });

    console.log('[RemoteConfig] Initialized — dev mode:', isDev);
  } catch (e) {
    console.warn('[RemoteConfig] Init failed, using defaults:', e);
  }
}

// ─── Getters ───

export function getBoolean(key: string): boolean {
  try {
    return remoteConfig().getBoolean(key);
  } catch {
    return REMOTE_CONFIG_DEFAULTS[key] as boolean ?? false;
  }
}

export function getNumber(key: string): number {
  try {
    return remoteConfig().getNumber(key);
  } catch {
    return REMOTE_CONFIG_DEFAULTS[key] as number ?? 0;
  }
}

export function getString(key: string): string {
  try {
    return remoteConfig().getString(key);
  } catch {
    return (REMOTE_CONFIG_DEFAULTS[key] as string) ?? '';
  }
}

// ─── Feature Flag Helpers ───

export function isAIEnabled(): boolean {
  return getBoolean('enable_ai_recommendations');
}

export function isRecitationCoachEnabled(): boolean {
  return getBoolean('enable_recitation_coach');
}

export function isFocusModeEnabled(): boolean {
  return getBoolean('enable_focus_mode');
}

export function isLeaderboardEnabled(): boolean {
  return getBoolean('enable_community_leaderboard');
}

export function isStreakCelebrationsEnabled(): boolean {
  return getBoolean('enable_streak_celebrations');
}

export function isNightModeAutoEnabled(): boolean {
  return getBoolean('enable_night_mode_auto');
}

// ─── AI Config Helpers ───

export function getAIAlpha(): number {
  return getNumber('ai_ema_alpha');
}

export function getAIMaxRecommendations(): number {
  return getNumber('ai_max_recommendations');
}

export function getAISpiritualThresholds(): number[] {
  const str = getString('ai_spiritual_level_thresholds');
  return str.split(',').map(Number).filter(n => !isNaN(n));
}

// ─── Prayer Config Helpers ───

export function getPrayerReminderMinutes(): number {
  return getNumber('prayer_reminder_minutes_before');
}

export function isPrayerReminderEnabled(): boolean {
  return getBoolean('prayer_reminder_enabled');
}

export function isAdhkarReminderEnabled(): boolean {
  return getBoolean('adhkar_reminder_enabled');
}

export function isWeeklyReportEnabled(): boolean {
  return getBoolean('weekly_report_enabled');
}

// ─── Content Config Helpers ───

export function getMaxTasbihTarget(): number {
  return getNumber('max_tasbih_target');
}

export function getDefaultTasbihTarget(): number {
  return getNumber('default_tasbih_target');
}

// ─── Debug ───

export async function getAllConfig(): Promise<Record<string, FirebaseRemoteConfigTypes.ConfigValue>> {
  return remoteConfig().getAll();
}

export async function forceFetch(): Promise<boolean> {
  try {
    await remoteConfig().fetch(0); // 0 = force fetch
    return remoteConfig().activate();
  } catch {
    return false;
  }
}
