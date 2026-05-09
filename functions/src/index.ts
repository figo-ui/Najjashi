// ─── Najjashi Cloud Functions ───
// Server-side logic for prayer reminders, AI profile sync,
// data aggregation, user onboarding, and weekly reports.

import * as admin from 'firebase-admin';
import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { beforeUserCreated } from 'firebase-functions/v2/identity';
import * as functionsV1 from 'firebase-functions/v1';

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// ═══════════════════════════════════════
// 1. USER ONBOARDING — Auto-create profile on signup
// ═══════════════════════════════════════

export const onUserCreate = beforeUserCreated(async (event) => {
  const user = event.data;
  if (!user) return;
  const uid = user.uid;
  const now = admin.firestore.Timestamp.now();

  try {
    await db.collection('users').doc(uid).set({
      uid,
      email: user.email || null,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      authMethod: user.providerData[0]?.providerId === 'google.com' ? 'google'
        : user.providerData[0]?.providerId === 'password' ? 'email'
        : 'guest',
      locale: 'en',
      preferences: {
        notificationsEnabled: true,
        prayerReminderMinutesBefore: 15,
        adhkarReminderEnabled: true,
        darkMode: false,
        fontSize: 'medium',
      },
      createdAt: now,
      lastLoginAt: now,
    }, { merge: true });

    await db.collection('aiProfiles').doc(uid).set({
      uid,
      prayerFrequency: { fajr: 0.5, dhuhr: 0.5, asr: 0.5, maghrib: 0.5, isha: 0.5 },
      adhkarCompletionRate: { morning: 0.5, evening: 0.5, after_prayer: 0.5, sleep: 0.5, general: 0.5 },
      spiritualLevel: 1,
      consistencyScore: 0,
      totalInteractions: 0,
      lastUpdated: now,
    });

    await db.collection('sahabaProgress').doc(`${uid}_lesson_1`).set({
      uid,
      lessonId: 'lesson_1',
      isComplete: false,
      isUnlocked: true,
      updatedAt: now,
    });

    console.log(`[onUserCreate] Profile created for ${uid}`);
  } catch (e) {
    console.error('[onUserCreate] Failed:', e);
  }
});

// ═══════════════════════════════════════
// 2. USER CLEANUP — Delete data on account removal
// ═══════════════════════════════════════

export const onUserDelete = functionsV1.auth.user().onDelete(async (user) => {
  const uid = user.uid;
  const batch = db.batch();

  try {
    batch.delete(db.collection('users').doc(uid));
    batch.delete(db.collection('aiProfiles').doc(uid));

    const prayerSnap = await db.collection('prayerLogs').where('uid', '==', uid).get();
    prayerSnap.forEach((doc) => batch.delete(doc.ref));

    const sahabaSnap = await db.collection('sahabaProgress').where('uid', '==', uid).get();
    sahabaSnap.forEach((doc) => batch.delete(doc.ref));

    const tasbihSnap = await db.collection('tasbihSessions').where('uid', '==', uid).get();
    tasbihSnap.forEach((doc) => batch.delete(doc.ref));

    const tokenSnap = await db.collection('fcmTokens').where('uid', '==', uid).get();
    tokenSnap.forEach((doc) => batch.delete(doc.ref));

    await batch.commit();
    console.log(`[onUserDelete] Data cleaned for ${uid}`);
  } catch (e) {
    console.error('[onUserDelete] Failed:', e);
  }
});

// ═══════════════════════════════════════
// 3. PRAYER REMINDERS — Scheduled push notifications
// ═══════════════════════════════════════

export const sendPrayerReminders = onSchedule(
  { schedule: 'every 15 minutes', timeZone: 'UTC' },
  async () => {
    const now = new Date();
    const currentHour = now.getUTCHours();
    const timeSlot = `${currentHour.toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}`;

    const prayerMap: Record<string, string> = {
      '04': 'fajr', '05': 'fajr',
      '11': 'dhuhr', '12': 'dhuhr',
      '15': 'asr', '16': 'asr',
      '18': 'maghrib', '19': 'maghrib',
      '20': 'isha', '21': 'isha',
    };

    const hourKey = currentHour.toString().padStart(2, '0');
    const approachingPrayer = prayerMap[hourKey];

    if (!approachingPrayer) {
      console.log(`[sendPrayerReminders] No prayer near ${timeSlot} UTC, skipping`);
      return;
    }

    const tokenSnap = await db.collection('fcmTokens').get();
    const tokens: string[] = [];

    tokenSnap.forEach((doc) => {
      const data = doc.data();
      if (data.token && data.notificationsEnabled !== false) {
        tokens.push(data.token);
      }
    });

    if (tokens.length === 0) {
      console.log('[sendPrayerReminders] No FCM tokens found');
      return;
    }

    const messages = tokens.map((token) => ({
      token,
      notification: {
        title: `${capitalize(approachingPrayer)} Prayer Reminder`,
        body: `It's time for ${approachingPrayer} prayer. May Allah bless your worship.`,
      },
      data: {
        type: 'prayer_reminder',
        prayer: approachingPrayer,
        clickAction: 'PRAYER_SCREEN',
      },
      android: {
        priority: 'high' as const,
        notification: {
          channelId: 'prayer_reminders',
          icon: 'ic_notification',
          color: '#1B5E20',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'adhan.caf',
            badge: 1,
          },
        },
      },
    }));

    const batchSize = 500;
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const response = await messaging.sendEach(batch);
      successCount += response.successCount;
      failureCount += response.failureCount;

      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const token = batch[idx].token;
          if (
            resp.error?.code === 'messaging/invalid-registration-token' ||
            resp.error?.code === 'messaging/registration-token-not-registered'
          ) {
            db.collection('fcmTokens').where('token', '==', token).get()
              .then((snap) => snap.forEach((doc) => doc.ref.delete()));
          }
        }
      });
    }

    console.log(`[sendPrayerReminders] ${approachingPrayer}: ${successCount} sent, ${failureCount} failed`);
  },
);

// ═══════════════════════════════════════
// 4. FCM TOKEN REGISTRATION — HTTP callable
// ═══════════════════════════════════════

interface TokenData { token: string; platform?: string }

export const registerFCMToken = onCall(async (request: CallableRequest<TokenData>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in');
  }

  const uid = request.auth.uid;
  const { token } = request.data;

  if (!token || typeof token !== 'string') {
    throw new HttpsError('invalid-argument', 'Token is required');
  }

  await db.collection('fcmTokens').doc(uid).set({
    uid,
    token,
    notificationsEnabled: true,
    platform: request.data.platform || 'android',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  return { success: true };
});

// ═══════════════════════════════════════
// 5. AI PROFILE SYNC — Merge client AI data to server
// ═══════════════════════════════════════

interface AIProfileData {
  prayerFrequency?: Record<string, number>;
  adhkarCompletionRate?: Record<string, number>;
  spiritualLevel?: number;
  consistencyScore?: number;
  totalInteractions?: number;
}

export const syncAIProfile = onCall(async (request: CallableRequest<AIProfileData>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in');
  }

  const uid = request.auth.uid;
  const { prayerFrequency, adhkarCompletionRate, spiritualLevel, consistencyScore, totalInteractions } = request.data;

  const update: Record<string, any> = {
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (prayerFrequency) update.prayerFrequency = prayerFrequency;
  if (adhkarCompletionRate) update.adhkarCompletionRate = adhkarCompletionRate;
  if (spiritualLevel !== undefined) update.spiritualLevel = spiritualLevel;
  if (consistencyScore !== undefined) update.consistencyScore = consistencyScore;
  if (totalInteractions !== undefined) update.totalInteractions = totalInteractions;

  await db.collection('aiProfiles').doc(uid).set(update, { merge: true });

  return { success: true };
});

// ═══════════════════════════════════════
// 6. WEEKLY REPORT — Generate & send summary
// ═══════════════════════════════════════

export const generateWeeklyReport = onSchedule(
  { schedule: 'every monday 06:00', timeZone: 'Asia/Riyadh' },
  async () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().slice(0, 10);

    const tokenSnap = await db.collection('fcmTokens').get();

    for (const tokenDoc of tokenSnap.docs) {
      const { uid, token, notificationsEnabled } = tokenDoc.data();
      if (!notificationsEnabled) continue;

      try {
        const prayerSnap = await db.collection('prayerLogs')
          .where('uid', '==', uid)
          .where('date', '>=', weekAgoStr)
          .get();

        let totalPrayers = 0;
        let completedPrayers = 0;
        const prayerBreakdown: Record<string, number> = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };

        prayerSnap.forEach((doc) => {
          const d = doc.data();
          for (const prayer of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const) {
            totalPrayers++;
            if (d[prayer]) {
              completedPrayers++;
              prayerBreakdown[prayer]++;
            }
          }
        });

        const completionRate = totalPrayers > 0 ? completedPrayers / totalPrayers : 0;

        const aiDoc = await db.collection('aiProfiles').doc(uid).get();
        const spiritualLevel = aiDoc.exists ? (aiDoc.data()?.spiritualLevel ?? 1) : 1;

        const emoji = completionRate >= 0.8 ? '🌟' : completionRate >= 0.5 ? '👍' : '💪';
        const title = `${emoji} Weekly Worship Report`;
        const body = `Prayers: ${completedPrayers}/${totalPrayers} (${(completionRate * 100).toFixed(0)}%) • Level: ${spiritualLevel}`;

        await messaging.send({
          token,
          notification: { title, body },
          data: {
            type: 'weekly_report',
            completionRate: completionRate.toString(),
            spiritualLevel: spiritualLevel.toString(),
            clickAction: 'HOME_SCREEN',
          },
          android: {
            priority: 'normal' as const,
            notification: {
              channelId: 'weekly_reports',
              icon: 'ic_notification',
            },
          },
        });

        await db.collection('weeklyReports').add({
          uid,
          weekStarting: weekAgoStr,
          totalPrayers,
          completedPrayers,
          completionRate,
          prayerBreakdown,
          spiritualLevel,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      } catch (e) {
        console.error(`[generateWeeklyReport] Failed for ${uid}:`, e);
      }
    }

    console.log('[generateWeeklyReport] Reports generated');
  },
);

// ═══════════════════════════════════════
// 7. DAILY STREAK CHECK — Reset streaks for inactive users
// ═══════════════════════════════════════

export const checkDailyStreaks = onSchedule(
  { schedule: 'every day 00:00', timeZone: 'Asia/Riyadh' },
  async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const usersSnap = await db.collection('users').get();

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;

      try {
        const prayerLogDoc = await db.collection('prayerLogs').doc(`${uid}_${yesterdayStr}`).get();

        if (!prayerLogDoc.exists) {
          await db.collection('users').doc(uid).update({
            prayerStreakCurrent: 0,
          });
        }
      } catch (e) {
        console.error(`[checkDailyStreaks] Failed for ${uid}:`, e);
      }
    }

    console.log('[checkDailyStreaks] Streaks checked');
  },
);

// ═══════════════════════════════════════
// 8. ADHKAR REMINDERS — Time-based push notifications
// ═══════════════════════════════════════

export const sendAdhkarReminders = onSchedule(
  { schedule: 'every day 05:30', timeZone: 'Asia/Riyadh' },
  async () => {
    await sendAdhkarNotification('morning', 'Morning Adhkar', 'Start your day with remembrance of Allah ﷻ');
  },
);

export const sendEveningAdhkarReminders = onSchedule(
  { schedule: 'every day 16:00', timeZone: 'Asia/Riyadh' },
  async () => {
    await sendAdhkarNotification('evening', 'Evening Adhkar', 'Don\'t forget your evening adhkar before maghrib');
  },
);

export const sendSleepAdhkarReminders = onSchedule(
  { schedule: 'every day 21:00', timeZone: 'Asia/Riyadh' },
  async () => {
    await sendAdhkarNotification('sleep', 'Sleep Adhkar', 'End your day with the sleep adhkar for protection');
  },
);

async function sendAdhkarNotification(
  adhkarTime: string,
  title: string,
  body: string,
): Promise<void> {
  const tokenSnap = await db.collection('fcmTokens')
    .where('notificationsEnabled', '==', true)
    .get();

  const tokens = tokenSnap.docs.map((doc) => doc.data().token).filter(Boolean);
  if (tokens.length === 0) return;

  const messages = tokens.map((token) => ({
    token,
    notification: { title, body },
    data: {
      type: 'adhkar_reminder',
      adhkarTime,
      clickAction: 'ADHKAR_SCREEN',
    },
    android: {
      priority: 'normal' as const,
      notification: {
        channelId: 'adhkar_reminders',
        icon: 'ic_notification',
        color: '#1B5E20',
      },
    },
  }));

  const batchSize = 500;
  for (let i = 0; i < messages.length; i += batchSize) {
    await messaging.sendEach(messages.slice(i, i + batchSize));
  }
}

// ═══════════════════════════════════════
// 9. DATA AGGREGATION — Prayer stats for analytics
// ═══════════════════════════════════════

interface StatsData { days?: number }

export const getPrayerStats = onCall(async (request: CallableRequest<StatsData>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in');
  }

  const uid = request.auth.uid;
  const days = request.data.days ?? 30;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().slice(0, 10);

  const prayerSnap = await db.collection('prayerLogs')
    .where('uid', '==', uid)
    .where('date', '>=', startStr)
    .get();

  let totalPrayers = 0;
  let completedPrayers = 0;
  const byPrayer: Record<string, { total: number; completed: number }> = {
    fajr: { total: 0, completed: 0 },
    dhuhr: { total: 0, completed: 0 },
    asr: { total: 0, completed: 0 },
    maghrib: { total: 0, completed: 0 },
    isha: { total: 0, completed: 0 },
  };
  const dailyRates: Array<{ date: string; rate: number }> = [];
  const byDate: Record<string, { total: number; completed: number }> = {};

  prayerSnap.forEach((doc) => {
    const d = doc.data();
    let dayTotal = 0;
    let dayCompleted = 0;

    for (const prayer of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const) {
      totalPrayers++;
      dayTotal++;
      byPrayer[prayer].total++;
      if (d[prayer]) {
        completedPrayers++;
        dayCompleted++;
        byPrayer[prayer].completed++;
      }
    }

    byDate[d.date] = { total: dayTotal, completed: dayCompleted };
  });

  for (const [date, stats] of Object.entries(byDate)) {
    dailyRates.push({
      date,
      rate: stats.total > 0 ? stats.completed / stats.total : 0,
    });
  }
  dailyRates.sort((a, b) => a.date.localeCompare(b.date));

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  for (const day of dailyRates) {
    if (day.rate >= 0.5) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  currentStreak = tempStreak;

  return {
    period: days,
    totalPrayers,
    completedPrayers,
    overallRate: totalPrayers > 0 ? completedPrayers / totalPrayers : 0,
    byPrayer,
    currentStreak,
    bestStreak,
    dailyRates,
  };
});

// ═══════════════════════════════════════
// 10. COMMUNITY LEADERBOARD — Anonymous weekly rankings
// ═══════════════════════════════════════

interface LeaderboardData { limit?: number }

export const getLeaderboard = onCall(async (request: CallableRequest<LeaderboardData>) => {
  const limit = request.data.limit ?? 50;

  const aiSnap = await db.collection('aiProfiles')
    .orderBy('consistencyScore', 'desc')
    .limit(limit)
    .get();

  const leaderboard = aiSnap.docs.map((doc, index) => {
    const d = doc.data();
    return {
      rank: index + 1,
      uid: doc.id,
      spiritualLevel: d.spiritualLevel ?? 1,
      consistencyScore: d.consistencyScore ?? 0,
      totalInteractions: d.totalInteractions ?? 0,
    };
  });

  let myRank = -1;
  if (request.auth) {
    const uid = request.auth.uid;
    const myIndex = leaderboard.findIndex((entry) => entry.uid === uid);
    if (myIndex >= 0) {
      myRank = leaderboard[myIndex].rank;
    } else {
      const myDoc = await db.collection('aiProfiles').doc(uid).get();
      if (myDoc.exists) {
        const myScore = myDoc.data()?.consistencyScore ?? 0;
        const aboveCount = (await db.collection('aiProfiles')
          .where('consistencyScore', '>', myScore)
          .get()).size;
        myRank = aboveCount + 1;
      }
    }
  }

  return { leaderboard, myRank };
});

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
