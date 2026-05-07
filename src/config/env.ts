export const ENV = {
  // Firebase (new MVP)
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || '',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || '',
  // Legacy (kept for non-MVP screens)
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  POWERSYNC_URL: process.env.POWERSYNC_URL || '',
} as const;
