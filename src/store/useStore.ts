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
} from '../types';

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
      locale: saved.preferences?.locale ?? state.locale,
      _hasHydrated: true,
    });
  } catch (e) {
    console.warn('Hydration error:', e);
    useStore.setState({ _hasHydrated: true });
  }
}
