// ─── Najjashi FCM Token Service ───
// Registers device tokens with Firestore for Cloud Function push notifications

import { getFCMToken } from './messagingService';
import { getFirebaseApp } from './firebase';
import firestore from '@react-native-firebase/firestore';
import { Platform } from 'react-native';

// ─── Register Token ───

export async function registerDeviceToken(uid: string): Promise<boolean> {
  try {
    const token = await getFCMToken();
    if (!token) {
      console.warn('[FCM] No token available');
      return false;
    }

    await firestore().collection('fcmTokens').doc(uid).set({
      uid,
      token,
      notificationsEnabled: true,
      platform: Platform.OS,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log('[FCM] Token registered for', uid);
    return true;
  } catch (e) {
    console.warn('[FCM] Token registration failed:', e);
    return false;
  }
}

// ─── Update Notification Preference ───

export async function updateNotificationPreference(
  uid: string,
  enabled: boolean,
): Promise<void> {
  try {
    await firestore().collection('fcmTokens').doc(uid).set({
      notificationsEnabled: enabled,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.warn('[FCM] Update preference failed:', e);
  }
}
