import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

// ─── Permission ───

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    return enabled;
  } catch (e) {
    console.warn('Notification permission failed:', e);
    return false;
  }
}

export async function checkNotificationPermission(): Promise<boolean> {
  try {
    const authStatus = await messaging().hasPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch (e) {
    return false;
  }
}

// ─── FCM Token ───

export async function getFCMToken(): Promise<string | null> {
  try {
    // On iOS, need to register for remote notifications
    if (Platform.OS === 'ios') {
      // iOS registration is handled automatically by RN Firebase messaging
    }
    return await messaging().getToken();
  } catch (e) {
    console.warn('Get FCM token failed:', e);
    return null;
  }
}

// ─── Message Handlers ───

export function setupForegroundMessageHandler(
  onMessage: (message: FirebaseMessagingTypes.RemoteMessage) => void
) {
  return messaging().onMessage(onMessage);
}

export function setupBackgroundMessageHandler(
  handler: (message: FirebaseMessagingTypes.RemoteMessage) => Promise<void>
) {
  messaging().setBackgroundMessageHandler(handler);
}

// ─── Prayer Notification Scheduling ───
// Note: For precise prayer time notifications, use a native module or react-native-push-notification
// FCM is for remote push notifications from server

export function subscribeToPrayerTopic(city: string) {
  messaging().subscribeToTopic(`prayer_${city.toLowerCase().replace(/\s+/g, '_')}`);
}

export function unsubscribeFromPrayerTopic(city: string) {
  messaging().unsubscribeFromTopic(`prayer_${city.toLowerCase().replace(/\s+/g, '_')}`);
}
