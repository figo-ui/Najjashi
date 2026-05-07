// ─── Locale ───
export type SupportedLocale = 'en' | 'am' | 'om';

// ─── Auth ───
export type AuthMethod = 'google' | 'email' | 'guest';

export interface UserProfile {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  authMethod: AuthMethod;
  locale: SupportedLocale;
  createdAt: number;
  lastLoginAt: number;
}

// ─── Prayer ───
export interface PrayerTimeInfo {
  name: string;
  nameAr: string;
  time: string;
  timestamp: number;
  isNext: boolean;
  isPassed: boolean;
}

export interface SalahLog {
  id: string;
  date: string;
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

// ─── Adhkar & Zikr ───
export interface ZikrItem {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  count: number;
  completed: number;
  reward: string;
  category: AdhkarTime;
  audioUrl?: string;
}

export type AdhkarTime = 'morning' | 'evening' | 'after_prayer';

// ─── Tasbih ───
export interface TasbihSession {
  id: string;
  date: string;
  count: number;
  target: number;
  zikrText: string;
  completed: boolean;
  startedAt: number;
  completedAt?: number;
}

// ─── Sahaba Micro-Learning ───
export interface SahabaLesson {
  id: string;
  characterName: string;
  characterNameAr: string;
  lessonNumber: number;
  totalLessons: number;
  title: string;
  titleAr: string;
  narration: string;
  narrationAr: string;
  narrationAm?: string;
  narrationOm?: string;
  takeaway: string;
  takeawayAr: string;
  audioUrl?: string;
  isComplete: boolean;
  isUnlocked: boolean;
}

// ─── AI Recommendation ───
export interface AIRecommendation {
  id: string;
  type: 'adhkar' | 'sahaba' | 'tasbih';
  title: string;
  reason: string;
  contentId: string;
  priority: number;
}

// ─── Navigation ───
export type AppSection =
  | 'home'
  | 'prayer'
  | 'adhkar'
  | 'tasbih'
  | 'sahaba'
  | 'settings';

// ─── User Preferences ───
export interface UserPreferences {
  locale: SupportedLocale;
  darkMode: boolean;
  notificationsEnabled: boolean;
  adhanEnabled: boolean;
  locationCity: string;
  locationLat: number;
  locationLng: number;
  calculationMethod: string;
  onboardingComplete: boolean;
  authMethod: AuthMethod;
  hapticEnabled: boolean;
}
