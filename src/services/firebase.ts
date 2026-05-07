import { firebase } from '@react-native-firebase/app';
import type { FirebaseAppTypes } from '@react-native-firebase/app';

let app: FirebaseAppTypes.Module | null = null;

export function getFirebaseApp(): FirebaseAppTypes.Module | null {
  return app;
}

export async function initializeFirebase(): Promise<boolean> {
  try {
    // React Native Firebase auto-initializes from google-services.json / GoogleService-Info.plist
    // Just verify it's available
    if (firebase.apps.length === 0) {
      console.warn('Firebase: No default app found. Ensure google-services.json is configured.');
      return false;
    }
    app = firebase.app();
    console.log('Firebase initialized:', app.name);
    return true;
  } catch (e) {
    console.warn('Firebase init failed:', e);
    return false;
  }
}
