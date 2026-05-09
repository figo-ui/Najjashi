import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AppSection,
  SupportedLocale,
  SalahLog,
  ZikrItem,
  SahabaLesson,
  AIRecommendation,
  UserPreferences,
  AdhkarTime,
  TasbihSession,
  AuthMethod,
  UserProfile,
  FocusModeSettings,
  FocusModeSession,
  FocusModePhase,
  AdhkarStreak,
  AIPersonalization,
  RecitationState,
  BlockedApp,
  HadithItem,
  DailyHadithItem,
  QuranAyahItem,
  HisnulDuaItem,
  DuaCategoryItem,
  VoskRecognitionState,
} from '../types';
import {
  DEFAULT_FOCUS_SETTINGS,
  DEFAULT_STREAK,
  DEFAULT_PERSONALIZATION,
  createFocusSession,
  completeFocusSession,
  updateStreak,
  updatePersonalization,
} from '../services/focusModeService';

interface AppState {
  // Auth
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;

  // Navigation
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;

  // Preferences
  preferences: UserPreferences;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;

  // Prayer
  salahLog: SalahLog;
  toggleSalah: (prayer: keyof Omit<SalahLog, 'id' | 'date'>) => void;

  // Zikr / Adhkar
  zikrList: ZikrItem[];
  incrementZikr: (id: string) => void;
  resetZikr: (id: string) => void;
  resetAllZikr: () => void;
  immersiveZikr: ZikrItem | null;
  setImmersiveZikr: (z: ZikrItem | null) => void;
  immersiveCount: number;
  setImmersiveCount: (n: number) => void;
  adhkarTime: AdhkarTime;
  setAdhkarTime: (t: AdhkarTime) => void;

  // Tasbih
  tasbihCount: number;
  incrementTasbih: () => void;
  resetTasbih: () => void;
  tasbihTarget: number;
  setTasbihTarget: (n: number) => void;
  tasbihSessions: TasbihSession[];
  saveTasbihSession: (session: TasbihSession) => void;

  // Sahaba
  sahabaLessons: SahabaLesson[];
  currentLessonIndex: number;
  markLessonComplete: (id: string) => void;
  setCurrentLessonIndex: (i: number) => void;

  // AI
  recommendations: AIRecommendation[];
  setRecommendations: (recs: AIRecommendation[]) => void;

  // Hadith (sunnah.com API)
  dailyHadith: DailyHadithItem | null;
  setDailyHadith: (h: DailyHadithItem | null) => void;
  hadithBookmarks: HadithItem[];
  toggleHadithBookmark: (h: HadithItem) => void;
  adhkarHadiths: HadithItem[];
  setAdhkarHadiths: (h: HadithItem[]) => void;

  // Quran (alquran.cloud API)
  dailyAyah: QuranAyahItem | null;
  setDailyAyah: (a: QuranAyahItem | null) => void;
  quranBookmarks: QuranAyahItem[];
  toggleQuranBookmark: (a: QuranAyahItem) => void;

  // Duas (duas.muslim-api.com)
  duaCategories: DuaCategoryItem[];
  setDuaCategories: (c: DuaCategoryItem[]) => void;
  hisnulDuas: HisnulDuaItem[];
  setHisnulDuas: (d: HisnulDuaItem[]) => void;
  duaFavorites: HisnulDuaItem[];
  toggleDuaFavorite: (d: HisnulDuaItem) => void;

  // Vosk Speech Recognition
  voskState: VoskRecognitionState;
  setVoskState: (s: Partial<VoskRecognitionState>) => void;

  // Spiritual Focus Mode
  focusSettings: FocusModeSettings;
  setFocusSettings: (s: Partial<FocusModeSettings>) => void;
  focusPhase: FocusModePhase;
  setFocusPhase: (p: FocusModePhase) => void;
  focusSession: FocusModeSession | null;
  startFocusSession: (type: 'morning' | 'evening', adhkarTotal: number) => void;
  completeFocusSession: (engagementScore: number) => void;
  adhkarStreak: AdhkarStreak;
  recordAdhkarCompletion: (type: 'morning' | 'evening') => void;
  aiPersonalization: AIPersonalization;
  updateAIPersonalization: (strugglingIds: string[]) => void;
  syncAIPersonalization: () => void;
  recitationState: RecitationState | null;
  setRecitationState: (s: RecitationState | null) => void;
  guidedAdhkarIndex: number;
  setGuidedAdhkarIndex: (i: number) => void;
  focusBypassUsed: boolean;
  setFocusBypassUsed: (v: boolean) => void;

  // Hydration
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
}

const PERSIST_KEY = 'najjashi-store';

const persistState = async (state: Partial<AppState>) => {
  try {
    const toSave = {
      preferences: state.preferences,
      salahLog: state.salahLog,
      tasbihCount: state.tasbihCount,
      adhkarTime: state.adhkarTime,
      zikrList: state.zikrList,
      tasbihSessions: state.tasbihSessions,
      sahabaLessons: state.sahabaLessons,
      currentLessonIndex: state.currentLessonIndex,
      focusSettings: state.focusSettings,
      adhkarStreak: state.adhkarStreak,
      aiPersonalization: state.aiPersonalization,
      hadithBookmarks: state.hadithBookmarks,
      quranBookmarks: state.quranBookmarks,
      duaFavorites: state.duaFavorites,
    };
    await AsyncStorage.setItem(PERSIST_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('Persist error:', e);
  }
};

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),

  activeSection: 'home',
  setActiveSection: (section) => set({ activeSection: section }),

  preferences: {
    locale: 'en',
    darkMode: true,
    notificationsEnabled: true,
    adhanEnabled: true,
    locationCity: 'Addis Ababa',
    locationLat: 9.02,
    locationLng: 38.75,
    calculationMethod: 'MWL',
    onboardingComplete: false,
    authMethod: 'guest' as AuthMethod,
    hapticEnabled: true,
  },
  setPreferences: (prefs) =>
    set((state) => {
      const next = { preferences: { ...state.preferences, ...prefs } };
      persistState({ ...state, ...next });
      return next;
    }),
  locale: 'en',
  setLocale: (locale) =>
    set((state) => {
      const next = { locale, preferences: { ...state.preferences, locale } };
      persistState({ ...state, ...next });
      return next;
    }),

  salahLog: { id: '', date: '', fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false },
  toggleSalah: (prayer) =>
    set((state) => {
      const next = { salahLog: { ...state.salahLog, [prayer]: !state.salahLog[prayer] } };
      persistState({ ...state, ...next });
      return next;
    }),

  zikrList: [],
  incrementZikr: (id) =>
    set((state) => {
      const next = {
        zikrList: state.zikrList.map((z) =>
          z.id === id && z.completed < z.count ? { ...z, completed: z.completed + 1 } : z
        ),
      };
      persistState({ ...state, ...next });
      return next;
    }),
  resetZikr: (id) =>
    set((state) => ({
      zikrList: state.zikrList.map((z) => (z.id === id ? { ...z, completed: 0 } : z)),
    })),
  resetAllZikr: () =>
    set((state) => ({
      zikrList: state.zikrList.map((z) => ({ ...z, completed: 0 })),
    })),
  immersiveZikr: null,
  setImmersiveZikr: (z) => set({ immersiveZikr: z, immersiveCount: 0 }),
  immersiveCount: 0,
  setImmersiveCount: (n) => set({ immersiveCount: n }),
  adhkarTime: 'morning',
  setAdhkarTime: (t) =>
    set((state) => {
      const next = { adhkarTime: t };
      persistState({ ...state, ...next });
      return next;
    }),

  tasbihCount: 0,
  incrementTasbih: () =>
    set((state) => {
      const next = { tasbihCount: state.tasbihCount + 1 };
      persistState({ ...state, ...next });
      return next;
    }),
  resetTasbih: () =>
    set((state) => {
      const next = { tasbihCount: 0 };
      persistState({ ...state, ...next });
      return next;
    }),
  tasbihTarget: 33,
  setTasbihTarget: (n) => set({ tasbihTarget: n }),
  tasbihSessions: [],
  saveTasbihSession: (session) =>
    set((state) => {
      const next = { tasbihSessions: [...state.tasbihSessions, session] };
      persistState({ ...state, ...next });
      return next;
    }),

  sahabaLessons: [],
  currentLessonIndex: 0,
  markLessonComplete: (id) =>
    set((state) => {
      const next = {
        sahabaLessons: state.sahabaLessons.map((l) =>
          l.id === id ? { ...l, isComplete: true } : l
        ),
      };
      persistState({ ...state, ...next });
      return next;
    }),
  setCurrentLessonIndex: (i) => set({ currentLessonIndex: i }),

  recommendations: [],
  setRecommendations: (recs) => set({ recommendations: recs }),

  // Hadith
  dailyHadith: null,
  setDailyHadith: (h) => set({ dailyHadith: h }),
  hadithBookmarks: [],
  toggleHadithBookmark: (h) =>
    set((state) => {
      const exists = state.hadithBookmarks.some(b => b.id === h.id);
      const next = {
        hadithBookmarks: exists
          ? state.hadithBookmarks.filter(b => b.id !== h.id)
          : [...state.hadithBookmarks, h],
      };
      persistState({ ...state, ...next });
      return next;
    }),
  adhkarHadiths: [],
  setAdhkarHadiths: (h) => set({ adhkarHadiths: h }),

  // Quran
  dailyAyah: null,
  setDailyAyah: (a) => set({ dailyAyah: a }),
  quranBookmarks: [],
  toggleQuranBookmark: (a) =>
    set((state) => {
      const exists = state.quranBookmarks.some(b => b.id === a.id);
      const next = {
        quranBookmarks: exists
          ? state.quranBookmarks.filter(b => b.id !== a.id)
          : [...state.quranBookmarks, a],
      };
      persistState({ ...state, ...next });
      return next;
    }),

  // Duas
  duaCategories: [],
  setDuaCategories: (c) => set({ duaCategories: c }),
  hisnulDuas: [],
  setHisnulDuas: (d) => set({ hisnulDuas: d }),
  duaFavorites: [],
  toggleDuaFavorite: (d) =>
    set((state) => {
      const exists = state.duaFavorites.some(f => f.id === d.id);
      const next = {
        duaFavorites: exists
          ? state.duaFavorites.filter(f => f.id !== d.id)
          : [...state.duaFavorites, d],
      };
      persistState({ ...state, ...next });
      return next;
    }),

  // Vosk
  voskState: { isAvailable: false, isModelLoaded: false, isListening: false, lastDetectedText: '', lastConfidence: 0, matchedZikr: null },
  setVoskState: (s) => set((state) => ({ voskState: { ...state.voskState, ...s } })),

  // Spiritual Focus Mode
  focusSettings: { ...DEFAULT_FOCUS_SETTINGS },
  setFocusSettings: (s) =>
    set((state) => {
      const next = { focusSettings: { ...state.focusSettings, ...s } };
      persistState({ ...state, ...next });
      return next;
    }),
  focusPhase: 'idle',
  setFocusPhase: (p) => set({ focusPhase: p }),
  focusSession: null,
  startFocusSession: (type, adhkarTotal) =>
    set((state) => {
      const session = createFocusSession(type, adhkarTotal);
      return { focusSession: session, focusPhase: 'active', guidedAdhkarIndex: 0, focusBypassUsed: false };
    }),
  completeFocusSession: (engagementScore) =>
    set((state) => {
      if (!state.focusSession) return {};
      const completed = completeFocusSession(state.focusSession, engagementScore);
      return { focusSession: completed, focusPhase: 'completed' };
    }),
  adhkarStreak: { ...DEFAULT_STREAK },
  recordAdhkarCompletion: (type) =>
    set((state) => {
      const next = { adhkarStreak: updateStreak(state.adhkarStreak, type, Date.now()) };
      persistState({ ...state, ...next });
      return next;
    }),
  aiPersonalization: { ...DEFAULT_PERSONALIZATION },
  updateAIPersonalization: (strugglingIds) =>
    set((state) => {
      if (!state.focusSession) return {};
      const next = { aiPersonalization: updatePersonalization(state.aiPersonalization, state.focusSession, strugglingIds) };
      persistState({ ...state, ...next });
      return next;
    }),
  syncAIPersonalization: () =>
    set((state) => {
      try {
        const { aiEngine } = require('../services/aiEngine') as typeof import('../services/aiEngine');
        const next = { aiPersonalization: aiEngine.toLegacyPersonalization() };
        persistState({ ...state, ...next });
        return next;
      } catch { return {}; }
    }),
  recitationState: null,
  setRecitationState: (s) => set({ recitationState: s }),
  guidedAdhkarIndex: 0,
  setGuidedAdhkarIndex: (i) => set({ guidedAdhkarIndex: i }),
  focusBypassUsed: false,
  setFocusBypassUsed: (v) => set({ focusBypassUsed: v }),

  _hasHydrated: false,
  setHasHydrated: (v) => set({ _hasHydrated: v }),
}));

export async function hydrateStore() {
  try {
    const raw = await AsyncStorage.getItem(PERSIST_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    const state = useStore.getState();
    useStore.setState({
      preferences: saved.preferences ?? state.preferences,
      salahLog: saved.salahLog ?? state.salahLog,
      tasbihCount: saved.tasbihCount ?? state.tasbihCount,
      adhkarTime: saved.adhkarTime ?? state.adhkarTime,
      zikrList: saved.zikrList ?? state.zikrList,
      tasbihSessions: saved.tasbihSessions ?? state.tasbihSessions,
      sahabaLessons: saved.sahabaLessons ?? state.sahabaLessons,
      currentLessonIndex: saved.currentLessonIndex ?? state.currentLessonIndex,
      focusSettings: saved.focusSettings ?? state.focusSettings,
      adhkarStreak: saved.adhkarStreak ?? state.adhkarStreak,
      aiPersonalization: saved.aiPersonalization ?? state.aiPersonalization,
      hadithBookmarks: saved.hadithBookmarks ?? state.hadithBookmarks,
      quranBookmarks: saved.quranBookmarks ?? state.quranBookmarks,
      duaFavorites: saved.duaFavorites ?? state.duaFavorites,
      locale: saved.preferences?.locale ?? state.locale,
      _hasHydrated: true,
    });
  } catch (e) {
    console.warn('Hydration error:', e);
    useStore.setState({ _hasHydrated: true });
  }
}
