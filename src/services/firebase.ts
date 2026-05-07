import firebase from '@react-native-firebase/app';

type FirebaseApp = ReturnType<typeof firebase.app>;

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  return app;
}

export async function initializeFirebase(): Promise<boolean> {
  try {
    if (firebase.apps.length === 0) {
      console.warn('Firebase: No default app found. Ensure google-services.json is configured.');
      return false;
    }
    app = firebase.app();
    console.log('Firebase initialized:', (app as any).name);
    return true;
  } catch (e) {
    console.warn('Firebase init failed:', e);
    return false;
  }
}
