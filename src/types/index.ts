// ─── Locale ───
export type SupportedLocale = 'en' | 'am' | 'om' | 'ar';

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
export interface PrayerTime {
  id: string;
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

// ─── Quran ───
export interface QuranVerse {
  id: string;
  surah: number;
  ayah: number;
  surahName: string;
  surahNameAr: string;
  arabic: string;
  translation: string;
  transliteration?: string;
  juz: number;
  page: number;
  isBookmarked: boolean;
}

export interface QuranAudio {
  id: string;
  reciterName: string;
  reciterNameAr: string;
  surah: number;
  audioUrl: string;
  duration: number;
}

export interface TafsirEntry {
  id: string;
  surah: number;
  ayah: number;
  textAr: string;
  textEn: string;
  textAm?: string;
  textOm?: string;
  source: string;
}

// ─── Adhkar & Dua ───
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

export type AdhkarTime = 'morning' | 'evening' | 'after_prayer' | 'sleep' | 'general';

export interface DuaItem {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
  repeat: number;
  category: string;
  isFavorite: boolean;
  audioUrl?: string;
}

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

// ─── Stories ───
export interface StoryLesson {
  id: string;
  type: 'prophet' | 'companion' | 'faith' | 'history' | 'morality';
  title: string;
  titleAr: string;
  lessonNumber: number;
  totalLessons: number;
  body: string;
  bodyAr: string;
  bodyAm?: string;
  bodyOm?: string;
  takeaway: string;
  takeawayAr: string;
  audioUrl?: string;
  isComplete: boolean;
  characterName: string;
  characterNameAr: string;
}

// ─── Audio ───
export interface AudioItem {
  id: string;
  title: string;
  titleAr: string;
  category: 'quran' | 'ruqyah' | 'dua' | 'sermon' | 'reminder' | 'lecture';
  reciter?: string;
  audioUrl: string;
  duration: number;
  playbackPosition: number;
  isFavorite: boolean;
}

export interface RadioStation {
  id: string;
  name: string;
  nameAr: string;
  streamUrl: string;
  isLive: boolean;
  description: string;
}

// ─── Fatwas & Fiqh ───
export interface FatwaItem {
  id: string;
  question: string;
  questionAr: string;
  answer: string;
  answerAr: string;
  category: string;
  source: string;
  isWomensFatwa: boolean;
}

export interface FiqhTopic {
  id: string;
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  category: string;
}

// ─── Ruqyah ───
export interface RuqyahItem {
  id: string;
  arabic: string;
  translation: string;
  transliteration: string;
  source: string;
  audioUrl?: string;
  category: 'quran' | 'sunnah';
}

// ─── Prophetic Medicine ───
export interface PropheticMedicineItem {
  id: string;
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  hadithSource: string;
  category: string;
}

// ─── Dream Interpretation ───
export interface DreamItem {
  id: string;
  keyword: string;
  keywordAr: string;
  interpretation: string;
  interpretationAr: string;
  source: string;
}

// ─── Signs of Last Hour ───
export interface SignItem {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  hadithSource: string;
  category: 'minor' | 'major';
}

// ─── Knowledge ───
export interface KnowledgeArticle {
  id: string;
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  category: string;
}

// ─── Learn to Pray ───
export interface PrayerStep {
  id: string;
  stepNumber: number;
  title: string;
  titleAr: string;
  instruction: string;
  instructionAr: string;
  audioUrl?: string;
  posture: string;
}

// ─── Quests & Gamification ───
export interface QuestItem {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  type: 'reading' | 'prayer' | 'zikr' | 'memorization' | 'streak';
  target: number;
  progress: number;
  reward: string;
  isComplete: boolean;
}

// ─── Hijri Calendar ───
export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
  monthNameAr: string;
  gregorianDate: string;
}

// ─── AI Recommendations ───
export interface AIRecommendation {
  id: string;
  type: 'story' | 'adhkar' | 'audio' | 'quran' | 'lesson' | 'sahaba' | 'tasbih' | 'hadith' | 'dua' | 'prayer' | 'focus' | 'recitation_coach';
  title: string;
  reason: string;
  contentId: string;
  priority: number;
  confidence: number;  // 0-1 how confident the AI is
  reasoning: string;   // explainable AI — why this recommendation
}

// ─── Hadith (from UmmahAPI) ───
export interface HadithItem {
  id: string;
  collection: string;
  bookNumber: string;
  hadithNumber: string;
  arabic: string;
  english: string;
  chapterTitle: string;
  grades: Array<{ graded_by: string; grade: string }>;
  narrator: string;
  reference: string;
  isBookmarked: boolean;
}

export interface DailyHadithItem extends HadithItem {
  date: string;
  collectionTitle: string;
}

// ─── Quran Ayah (from alquran.cloud) ───
export interface QuranAyahItem {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  surahNameAr: string;
  arabic: string;
  translation: string;
  juz: number;
  page: number;
  isBookmarked: boolean;
}

// ─── Dua (from duas.muslim-api.com) ───
export interface HisnulDuaItem {
  id: string;
  categoryId: string;
  subcategoryId: string;
  titleEn: string;
  titleAr: string;
  arabic: string;
  translation: string;
  reference: string;
  audioUrl?: string;
  isFavorite: boolean;
}

export interface DuaCategoryItem {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  duaCount?: number;
}

// ─── Vosk Speech Recognition ───
export interface VoskRecognitionState {
  isAvailable: boolean;
  isModelLoaded: boolean;
  isListening: boolean;
  lastDetectedText: string;
  lastConfidence: number;
  matchedZikr: string | null;
}

// ─── Spiritual Focus Mode ───
export type FocusModeIntensity = 'gentle' | 'moderate' | 'strict';

export type FocusModePhase = 'idle' | 'reminder' | 'active' | 'reciting' | 'completed';

export type BlockedAppCategory = 'social' | 'video' | 'games' | 'entertainment' | 'other';

export interface BlockedApp {
  packageName: string;
  label: string;
  category: BlockedAppCategory;
}

export interface FocusModeSchedule {
  morningEnabled: boolean;
  morningTime: string; // HH:mm, default Fajr time
  eveningEnabled: boolean;
  eveningTime: string; // HH:mm, default Maghrib time
}

export interface FocusModeSettings {
  enabled: boolean;
  intensity: FocusModeIntensity;
  schedule: FocusModeSchedule;
  blockedApps: BlockedApp[];
  blockedCategories: BlockedAppCategory[];
  essentialApps: string[]; // always allowed package names
  aiListeningEnabled: boolean;
  audioOnlyMode: boolean;
  readOnlyMode: boolean;
  reminderMinutesBefore: number;
  bypassDurationMinutes: number;
  recitationSpeed: 'slow' | 'normal' | 'fast';
}

export interface FocusModeSession {
  id: string;
  type: 'morning' | 'evening';
  startedAt: number;
  completedAt?: number;
  adhkarCompleted: number;
  adhkarTotal: number;
  aiEngagementScore: number; // 0-1
  durationSeconds: number;
  wasBypassed: boolean;
}

export interface AdhkarStreak {
  currentStreak: number;
  longestStreak: number;
  lastMorningAt?: number;
  lastEveningAt?: number;
  morningHistory: string[]; // ISO dates
  eveningHistory: string[]; // ISO dates
}

export interface AIPersonalization {
  preferredLanguage: SupportedLocale;
  preferredSpeed: 'slow' | 'normal' | 'fast';
  strugglingAdhkarIds: string[];
  averageSessionDurationSeconds: number;
  preferredReminderTime: number; // minutes before
  shortSessionThreshold: number; // seconds — suggest shorter sessions below this
  // AI Engine enrichment
  spiritualLevel: number;
  consistencyScore: number;
  recitationAccuracy: number;
  recitationSessions: number;
  focusModeUsageRate: number;
  peakEngagementHour: number;
  totalInteractions: number;
}

export interface RecitationState {
  isListening: boolean;
  detectedText: string;
  confidence: number; // 0-1
  isEngaged: boolean;
  silenceDurationMs: number;
}

// ─── Navigation ───
export type AppSection =
  | 'home'
  | 'quran'
  | 'prayer'
  | 'adhkar'
  | 'hisnul_muslim'
  | 'audio'
  | 'radio'
  | 'stories'
  | 'tafsir'
  | 'ruqyah'
  | 'fatwas'
  | 'learn_prayer'
  | 'tasbih'
  | 'zakat'
  | 'hijri'
  | 'dreams'
  | 'quests'
  | 'fiqh'
  | 'womens_fatwas'
  | 'prophetic_medicine'
  | 'signs'
  | 'knowledge'
  | 'sahaba'
  | 'settings'
  | 'focus_mode';

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
