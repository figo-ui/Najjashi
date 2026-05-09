// React Native doesn't have process.env at runtime.
// Use react-native-config or hardcode values for development.
// To use react-native-config: npm install react-native-config
// Then import Config from 'react-native-config' and reference Config.FIREBASE_API_KEY etc.

export const ENV: Record<string, string> = {
  // Firebase (from google-services.json)
  FIREBASE_API_KEY: 'AIzaSyCQ4amvE6Ou5SEr17G5MvcwbNByaEhoEDM',
  FIREBASE_PROJECT_ID: 'nejjashi-a1406',
  FIREBASE_MESSAGING_SENDER_ID: '285791275223',
  FIREBASE_APP_ID: '1:285791275223:android:2842f93d7acbb84e14c892',
  FIREBASE_STORAGE_BUCKET: 'nejjashi-a1406.firebasestorage.app',
  FIREBASE_DATABASE_URL: 'https://nejjashi-a1406-default-rtdb.firebaseio.com',

  // IslamicAPI (https://islamicapi.com) — FREE, key required
  // Provides: Prayer Times, Qibla, Fasting, Zakat Nisab, Asma ul Husna
  ISLAMIC_API_KEY: 's4nnQr5XNDi1IBTg7qteAjPrd5Hx3WN8puGyY0Go2TTtoP7D',
  ISLAMIC_API_BASE: 'https://islamicapi.com/api/v1',

  // UmmahAPI (https://ummahapi.com) — FREE, key recommended for unlimited
  // Provides: Quran, Hadith (36K+), Tafsir, Prayer Times, Qibla, Hijri, Duas, 99 Names
  UMMAH_API_KEY: 'umh_0c0662985088257b237134b788b4ac210bd0ac8f',
  UMMAH_API_BASE: 'https://ummahapi.com/api',

  // NOTE: sunnah.com API is NOT free — do not use without a paid key
  // We use local Hisnul Muslim dataset + alquran.cloud (free, no key) for hadith/quran

  // Google Gemini API — for AI-powered features (recitation coaching, smart recommendations)
  GEMINI_API_KEY: 'AIzaSyDpH6ZZl3rnJNBQRD9i3fPLABzszc5dR8Q',
  GEMINI_MODEL: 'gemini-2.0-flash',
};

// Override with react-native-config if available
try {
  const Config = require('react-native-config').default;
  if (Config) {
    Object.keys(ENV).forEach((key) => {
      if (Config[key]) (ENV as any)[key] = Config[key];
    });
  }
} catch (_) {
  // react-native-config not installed — using defaults
}
