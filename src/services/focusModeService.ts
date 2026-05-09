import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import type {
  FocusModeSettings,
  FocusModeSession,
  AdhkarStreak,
  AIPersonalization,
  BlockedApp,
  FocusModePhase,
  FocusModeIntensity,
} from '../types';

const { FocusModeBridge } = NativeModules;

// ─── Permission Helpers ───

export async function checkOverlayPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  return FocusModeBridge?.canDrawOverlays() ?? false;
}

export async function requestOverlayPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  return FocusModeBridge?.requestOverlayPermission() ?? false;
}

export async function checkAccessibilityPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  return FocusModeBridge?.isAccessibilityEnabled() ?? false;
}

export async function requestAccessibilityPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  return FocusModeBridge?.requestAccessibilityPermission() ?? false;
}

export async function checkNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  if (Platform.Version >= 33) {
    const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    return granted;
  }
  return true;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  if (Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}

export async function checkRecordAudioPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
}

export async function requestRecordAudioPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export async function checkBatteryOptimizationExemption(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  return FocusModeBridge?.isIgnoringBatteryOptimizations() ?? false;
}

export async function requestBatteryOptimizationExemption(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  return FocusModeBridge?.requestIgnoreBatteryOptimization() ?? false;
}

// ─── All Permissions Check ───

export interface FocusModePermissionStatus {
  overlay: boolean;
  accessibility: boolean;
  notifications: boolean;
  recordAudio: boolean;
  batteryOptimization: boolean;
  allGranted: boolean;
}

export async function checkAllPermissions(): Promise<FocusModePermissionStatus> {
  const [overlay, accessibility, notifications, recordAudio, batteryOptimization] = await Promise.all([
    checkOverlayPermission(),
    checkAccessibilityPermission(),
    checkNotificationPermission(),
    checkRecordAudioPermission(),
    checkBatteryOptimizationExemption(),
  ]);

  return {
    overlay,
    accessibility,
    notifications,
    recordAudio,
    batteryOptimization,
    allGranted: overlay && notifications && recordAudio,
  };
}

// ─── Focus Mode Control ───

export async function startFocusMode(blockedApps: BlockedApp[]): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  return FocusModeBridge?.startFocusMode(blockedApps) ?? false;
}

export async function stopFocusMode(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  return FocusModeBridge?.stopFocusMode() ?? false;
}

export async function isFocusModeActive(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  return FocusModeBridge?.isFocusModeActive() ?? false;
}

export async function setEssentialApps(packageNames: string[]): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  return FocusModeBridge?.setEssentialApps(packageNames) ?? false;
}

// ─── Defaults ───

export const DEFAULT_FOCUS_SETTINGS: FocusModeSettings = {
  enabled: false,
  intensity: 'gentle',
  schedule: {
    morningEnabled: true,
    morningTime: '05:00',
    eveningEnabled: true,
    eveningTime: '18:30',
  },
  blockedApps: [],
  blockedCategories: ['social', 'video', 'games'],
  essentialApps: [
    'com.android.phone',
    'com.android.dialer',
    'com.google.android.dialer',
    'com.android.messaging',
    'com.google.android.apps.messaging',
    'com.android.camera',
  ],
  aiListeningEnabled: true,
  audioOnlyMode: false,
  readOnlyMode: false,
  reminderMinutesBefore: 15,
  bypassDurationMinutes: 5,
  recitationSpeed: 'normal',
};

export const DEFAULT_STREAK: AdhkarStreak = {
  currentStreak: 0,
  longestStreak: 0,
  morningHistory: [],
  eveningHistory: [],
};

export const DEFAULT_PERSONALIZATION: AIPersonalization = {
  preferredLanguage: 'en',
  preferredSpeed: 'normal',
  strugglingAdhkarIds: [],
  averageSessionDurationSeconds: 0,
  preferredReminderTime: 15,
  shortSessionThreshold: 60,
  spiritualLevel: 1,
  consistencyScore: 0,
  recitationAccuracy: 0,
  recitationSessions: 0,
  focusModeUsageRate: 0,
  peakEngagementHour: 7,
  totalInteractions: 0,
};

// ─── Session Tracking ───

export function createFocusSession(type: 'morning' | 'evening', adhkarTotal: number): FocusModeSession {
  return {
    id: `focus_${Date.now()}`,
    type,
    startedAt: Date.now(),
    adhkarCompleted: 0,
    adhkarTotal,
    aiEngagementScore: 0,
    durationSeconds: 0,
    wasBypassed: false,
  };
}

export function completeFocusSession(session: FocusModeSession, engagementScore: number): FocusModeSession {
  return {
    ...session,
    completedAt: Date.now(),
    durationSeconds: Math.round((Date.now() - session.startedAt) / 1000),
    aiEngagementScore: engagementScore,
  };
}

// ─── Streak Calculation ───

export function updateStreak(
  streak: AdhkarStreak,
  type: 'morning' | 'evening',
  timestamp: number
): AdhkarStreak {
  const dateStr = new Date(timestamp).toISOString().split('T')[0];
  const historyKey = type === 'morning' ? 'morningHistory' : 'eveningHistory';
  const lastKey = type === 'morning' ? 'lastMorningAt' : 'lastEveningAt';

  const history = [...streak[historyKey]];
  if (!history.includes(dateStr)) {
    history.push(dateStr);
  }

  // Calculate streak
  const today = new Date(dateStr);
  let currentStreak = 1;
  const checkDate = new Date(today);

  // Check both morning and evening for full day completion
  const allDates = new Set([...streak.morningHistory, ...streak.eveningHistory]);
  const sortedDates = [...allDates].sort().reverse();

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  const longestStreak = Math.max(streak.longestStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    [lastKey]: timestamp,
    morningHistory: type === 'morning' ? history : streak.morningHistory,
    eveningHistory: type === 'evening' ? history : streak.eveningHistory,
  };
}

// ─── AI Personalization Updates ───

export function updatePersonalization(
  current: AIPersonalization,
  session: FocusModeSession,
  strugglingIds: string[]
): AIPersonalization {
  const totalSessions = current.averageSessionDurationSeconds > 0 ? 1 : 0;
  const newAvg = totalSessions === 0
    ? session.durationSeconds
    : Math.round((current.averageSessionDurationSeconds + session.durationSeconds) / 2);

  return {
    ...current,
    averageSessionDurationSeconds: newAvg,
    strugglingAdhkarIds: [...new Set([...current.strugglingAdhkarIds, ...strugglingIds])].slice(0, 10),
  };
}
