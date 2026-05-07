// React Native doesn't have process.env at runtime.
// Use react-native-config or hardcode values for development.
// To use react-native-config: npm install react-native-config
// Then import Config from 'react-native-config' and reference Config.FIREBASE_API_KEY etc.

export const ENV: Record<string, string> = {
  // Firebase (new MVP)
  FIREBASE_API_KEY: '',
  FIREBASE_PROJECT_ID: '',
  FIREBASE_MESSAGING_SENDER_ID: '',
  FIREBASE_APP_ID: '',
  // Legacy (kept for non-MVP screens)
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
  POWERSYNC_URL: '',
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
