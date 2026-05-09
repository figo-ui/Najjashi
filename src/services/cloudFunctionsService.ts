// ─── Najjashi Cloud Functions Client ───
// Callable wrappers for server-side Cloud Functions

import functions from '@react-native-firebase/functions';

// ─── Register FCM Token ───

export async function callRegisterFCMToken(
  token: string,
  platform: string,
): Promise<{ success: boolean }> {
  try {
    const result = await functions().httpsCallable('registerFCMToken')({
      token,
      platform,
    });
    return result.data as { success: boolean };
  } catch (e) {
    console.warn('[CloudFn] registerFCMToken failed:', e);
    return { success: false };
  }
}

// ─── Sync AI Profile ───

export async function callSyncAIProfile(data: {
  prayerFrequency?: Record<string, number>;
  adhkarCompletionRate?: Record<string, number>;
  spiritualLevel?: number;
  consistencyScore?: number;
  totalInteractions?: number;
}): Promise<{ success: boolean }> {
  try {
    const result = await functions().httpsCallable('syncAIProfile')(data);
    return result.data as { success: boolean };
  } catch (e) {
    console.warn('[CloudFn] syncAIProfile failed:', e);
    return { success: false };
  }
}

// ─── Get Prayer Stats ───

export interface PrayerStats {
  period: number;
  totalPrayers: number;
  completedPrayers: number;
  overallRate: number;
  byPrayer: Record<string, { total: number; completed: number }>;
  currentStreak: number;
  bestStreak: number;
  dailyRates: Array<{ date: string; rate: number }>;
}

export async function callGetPrayerStats(
  days: number = 30,
): Promise<PrayerStats | null> {
  try {
    const result = await functions().httpsCallable('getPrayerStats')({ days });
    return result.data as PrayerStats;
  } catch (e) {
    console.warn('[CloudFn] getPrayerStats failed:', e);
    return null;
  }
}

// ─── Get Leaderboard ───

export interface LeaderboardEntry {
  rank: number;
  uid: string;
  spiritualLevel: number;
  consistencyScore: number;
  totalInteractions: number;
}

export interface LeaderboardResult {
  leaderboard: LeaderboardEntry[];
  myRank: number;
}

export async function callGetLeaderboard(
  limit: number = 50,
): Promise<LeaderboardResult | null> {
  try {
    const result = await functions().httpsCallable('getLeaderboard')({ limit });
    return result.data as LeaderboardResult;
  } catch (e) {
    console.warn('[CloudFn] getLeaderboard failed:', e);
    return null;
  }
}
