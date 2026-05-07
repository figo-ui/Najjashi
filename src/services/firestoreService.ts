import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import type { UserProfile, SalahLog, SahabaLesson, TasbihSession, UserPreferences, SupportedLocale, AuthMethod } from '../types';

const USERS = 'users';
const PRAYER_LOGS = 'prayerLogs';
const SAHABA_PROGRESS = 'sahabaProgress';
const TASBIH_SESSIONS = 'tasbihSessions';

// ─── User Profile ───

export async function createUserProfile(user: UserProfile): Promise<void> {
  try {
    await firestore().collection(USERS).doc(user.uid).set({
      ...user,
      createdAt: firestore.Timestamp.fromMillis(user.createdAt),
      lastLoginAt: firestore.Timestamp.fromMillis(user.lastLoginAt),
    }, { merge: true });
  } catch (e) {
    console.warn('Create user profile failed:', e);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const doc = await firestore().collection(USERS).doc(uid).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    return {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      authMethod: data.authMethod as AuthMethod,
      locale: data.locale as SupportedLocale,
      createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
      lastLoginAt: data.lastLoginAt?.toMillis?.() ?? Date.now(),
    };
  } catch (e) {
    console.warn('Get user profile failed:', e);
    return null;
  }
}

export async function updateUserPreferences(uid: string, prefs: Partial<UserPreferences>): Promise<void> {
  try {
    await firestore().collection(USERS).doc(uid).set({ preferences: prefs }, { merge: true });
  } catch (e) {
    console.warn('Update preferences failed:', e);
  }
}

// ─── Prayer Logs ───

export async function savePrayerLog(uid: string, log: SalahLog): Promise<void> {
  try {
    const dateKey = log.date || new Date().toISOString().slice(0, 10);
    await firestore().collection(PRAYER_LOGS).doc(`${uid}_${dateKey}`).set({
      uid,
      date: dateKey,
      fajr: log.fajr,
      dhuhr: log.dhuhr,
      asr: log.asr,
      maghrib: log.maghrib,
      isha: log.isha,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.warn('Save prayer log failed:', e);
  }
}

export async function getPrayerLog(uid: string, date?: string): Promise<SalahLog | null> {
  try {
    const dateKey = date || new Date().toISOString().slice(0, 10);
    const doc = await firestore().collection(PRAYER_LOGS).doc(`${uid}_${dateKey}`).get();
    if (!doc.exists) return null;
    const d = doc.data()!;
    return {
      id: d.uid,
      date: d.date,
      fajr: d.fajr ?? false,
      dhuhr: d.dhuhr ?? false,
      asr: d.asr ?? false,
      maghrib: d.maghrib ?? false,
      isha: d.isha ?? false,
    };
  } catch (e) {
    console.warn('Get prayer log failed:', e);
    return null;
  }
}

// ─── Sahaba Progress ───

export async function saveSahabaProgress(uid: string, lessons: SahabaLesson[]): Promise<void> {
  try {
    const batch = firestore().batch();
    lessons.forEach((lesson) => {
      const ref = firestore().collection(SAHABA_PROGRESS).doc(`${uid}_${lesson.id}`);
      batch.set(ref, {
        uid,
        lessonId: lesson.id,
        isComplete: lesson.isComplete,
        isUnlocked: lesson.isUnlocked,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });
    await batch.commit();
  } catch (e) {
    console.warn('Save sahaba progress failed:', e);
  }
}

export async function getSahabaProgress(uid: string): Promise<Record<string, { isComplete: boolean; isUnlocked: boolean }>> {
  try {
    const snap = await firestore().collection(SAHABA_PROGRESS).where('uid', '==', uid).get();
    const result: Record<string, { isComplete: boolean; isUnlocked: boolean }> = {};
    snap.forEach((doc) => {
      const d = doc.data();
      result[d.lessonId] = { isComplete: d.isComplete, isUnlocked: d.isUnlocked };
    });
    return result;
  } catch (e) {
    console.warn('Get sahaba progress failed:', e);
    return {};
  }
}

// ─── Tasbih Sessions ───

export async function saveTasbihSession(uid: string, session: TasbihSession): Promise<void> {
  try {
    await firestore().collection(TASBIH_SESSIONS).doc(session.id).set({
      uid,
      ...session,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.warn('Save tasbih session failed:', e);
  }
}

export async function getTasbihSessions(uid: string, limit = 30): Promise<TasbihSession[]> {
  try {
    const snap = await firestore()
      .collection(TASBIH_SESSIONS)
      .where('uid', '==', uid)
      .orderBy('completedAt', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: d.id,
        date: d.date,
        count: d.count,
        target: d.target,
        zikrText: d.zikrText,
        completed: d.completed,
        startedAt: d.startedAt,
        completedAt: d.completedAt,
      } as TasbihSession;
    });
  } catch (e) {
    console.warn('Get tasbih sessions failed:', e);
    return [];
  }
}
