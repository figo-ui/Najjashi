import type { AIRecommendation, SalahLog, AdhkarTime, SahabaLesson, DailyHadithItem, QuranAyahItem } from '../types';
import { aiEngine, type RecitationFeedback } from './aiEngine';

// ─── Public API: Generate Smart Recommendations ───
// The AI engine trains on user behavior and generates personalized recommendations.
// This module provides the bridge between the engine and the app's UI.

interface RecommendationContext {
  currentPrayer?: keyof Omit<SalahLog, 'id' | 'date'>;
  adhkarTime?: AdhkarTime;
  adhkarCompleted?: number;
  adhkarTotal?: number;
  sahabaLessons?: SahabaLesson[];
  currentLessonIndex?: number;
  tasbihCountToday?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  prayersCompleted?: number;
  dailyHadith?: DailyHadithItem | null;
  dailyAyah?: QuranAyahItem | null;
}

export function generateRecommendations(ctx: RecommendationContext): AIRecommendation[] {
  const hour = new Date().getHours();

  // Get AI-engine-powered recommendations
  const engineRecs = aiEngine.generateRecommendations({
    currentHour: hour,
    currentPrayer: ctx.currentPrayer as string | undefined,
    adhkarTime: ctx.adhkarTime,
    prayersCompletedToday: ctx.prayersCompleted,
    adhkarCompletedToday: ctx.adhkarCompleted,
    tasbihCountToday: ctx.tasbihCountToday,
  });

  // Add content-based recommendations the engine doesn't handle
  const contentRecs = generateContentRecommendations(ctx);

  // Merge, deduplicate by contentId, and sort by priority*confidence
  const all = [...engineRecs, ...contentRecs];
  const seen = new Set<string>();
  const deduped = all.filter(r => {
    if (seen.has(r.contentId)) return false;
    seen.add(r.contentId);
    return true;
  });

  return deduped
    .sort((a, b) => (b.priority * b.confidence) - (a.priority * a.confidence))
    .slice(0, 7);
}

// ─── Content-Based Recommendations ───
// These supplement the AI engine with specific content from APIs

function generateContentRecommendations(ctx: RecommendationContext): AIRecommendation[] {
  const recs: AIRecommendation[] = [];

  // Sahaba lesson — next incomplete lesson
  if (ctx.sahabaLessons && ctx.sahabaLessons.length > 0) {
    const nextIncomplete = ctx.sahabaLessons.find(l => !l.isComplete);
    if (nextIncomplete) {
      recs.push({
        id: `sahaba_${nextIncomplete.id}`,
        type: 'sahaba',
        title: nextIncomplete.title,
        reason: `Lesson ${nextIncomplete.lessonNumber}: ${nextIncomplete.takeaway}`,
        contentId: nextIncomplete.id,
        priority: 6,
        confidence: 0.8,
        reasoning: 'Next incomplete Sahaba lesson',
      });
    }
  }

  // Daily hadith — from UmmahAPI
  if (ctx.dailyHadith) {
    recs.push({
      id: 'daily_hadith',
      type: 'hadith',
      title: `Hadith of the Day — ${ctx.dailyHadith.collectionTitle}`,
      reason: truncateEnglish(ctx.dailyHadith.english, 80),
      contentId: ctx.dailyHadith.id,
      priority: 4,
      confidence: 0.7,
      reasoning: 'Daily hadith from UmmahAPI',
    });
  }

  // Daily Quran ayah — from alquran.cloud
  if (ctx.dailyAyah) {
    recs.push({
      id: 'daily_ayah',
      type: 'quran',
      title: `Quran — ${ctx.dailyAyah.surahName} ${ctx.dailyAyah.ayahNumber}`,
      reason: truncateEnglish(ctx.dailyAyah.translation, 80),
      contentId: ctx.dailyAyah.id,
      priority: 4,
      confidence: 0.7,
      reasoning: 'Daily ayah from alquran.cloud',
    });
  }

  return recs;
}

// ─── Async: Fetch daily hadith & ayah for enrichment ───

export async function fetchDailyInsights(): Promise<{
  hadith: DailyHadithItem | null;
  ayah: QuranAyahItem | null;
}> {
  const [hadithResult, ayahResult] = await Promise.allSettled([
    fetchDailyHadithFromApi(),
    fetchDailyAyahFromApi(),
  ]);

  return {
    hadith: hadithResult.status === 'fulfilled' ? hadithResult.value : null,
    ayah: ayahResult.status === 'fulfilled' ? ayahResult.value : null,
  };
}

async function fetchDailyHadithFromApi(): Promise<DailyHadithItem | null> {
  try {
    const { getDailyHadith } = require('./hadithService') as typeof import('./hadithService');
    const daily = await getDailyHadith();
    if (!daily) return null;
    return {
      id: daily.id,
      collection: daily.collection,
      bookNumber: daily.bookNumber,
      hadithNumber: daily.hadithNumber,
      arabic: daily.arabic,
      english: daily.english,
      chapterTitle: daily.chapterTitle,
      grades: daily.grades,
      narrator: daily.narrator,
      reference: daily.reference,
      isBookmarked: false,
      date: daily.date,
      collectionTitle: daily.collectionTitle,
    };
  } catch (e) {
    console.warn('[AI] Daily hadith fetch failed:', e);
    return null;
  }
}

async function fetchDailyAyahFromApi(): Promise<QuranAyahItem | null> {
  try {
    const { getRandomAyah } = require('./alQuranService') as typeof import('./alQuranService');
    const { arabic, translation } = await getRandomAyah();
    return {
      id: `ayah_${arabic.number}`,
      surahNumber: arabic.surah.number,
      ayahNumber: arabic.numberInSurah,
      surahName: arabic.surah.englishName,
      surahNameAr: arabic.surah.name,
      arabic: arabic.text,
      translation: translation.text,
      juz: arabic.juz,
      page: arabic.page,
      isBookmarked: false,
    };
  } catch (e) {
    console.warn('[AI] Daily ayah fetch failed:', e);
    return null;
  }
}

// ─── Lightweight context builder — call from screens/store ───

export function buildRecommendationContext(state: {
  salahLog: SalahLog;
  adhkarTime: AdhkarTime;
  sahabaLessons: SahabaLesson[];
  currentLessonIndex: number;
  tasbihSessions: { count: number; date: string }[];
  zikrList: { completed: number; count: number }[];
  dailyHadith?: DailyHadithItem | null;
  dailyAyah?: QuranAyahItem | null;
}): RecommendationContext {
  const now = new Date();
  const hour = now.getHours();
  const today = now.toISOString().slice(0, 10);

  const timeOfDay = hour < 6 ? 'night'
    : hour < 12 ? 'morning'
    : hour < 17 ? 'afternoon'
    : hour < 21 ? 'evening'
    : 'night';

  const prayerOrder: (keyof Omit<SalahLog, 'id' | 'date'>)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  let currentPrayer: keyof Omit<SalahLog, 'id' | 'date'> | undefined;
  for (const p of prayerOrder) {
    if (!state.salahLog[p]) { currentPrayer = p; break; }
  }

  const prayersCompleted = prayerOrder.filter(p => state.salahLog[p]).length;
  const adhkarCompleted = state.zikrList.filter(z => z.completed >= z.count).length;
  const adhkarTotal = state.zikrList.length;
  const tasbihCountToday = state.tasbihSessions
    .filter(s => s.date === today)
    .reduce((sum, s) => sum + s.count, 0);

  return {
    currentPrayer,
    adhkarTime: state.adhkarTime,
    adhkarCompleted,
    adhkarTotal,
    sahabaLessons: state.sahabaLessons,
    currentLessonIndex: state.currentLessonIndex,
    tasbihCountToday,
    timeOfDay,
    prayersCompleted,
    dailyHadith: state.dailyHadith,
    dailyAyah: state.dailyAyah,
  };
}

// ─── Re-export AI Engine training methods ───
// Screens should call these to train the AI

export { aiEngine };

export function trainOnPrayer(prayer: string, completed: boolean, minutesAfterAdhan?: number): void {
  aiEngine.observePrayer(prayer, completed, minutesAfterAdhan);
}

export function trainOnAdhkarSession(
  time: AdhkarTime,
  completedCount: number,
  totalCount: number,
  durationSeconds: number,
): void {
  const hour = new Date().getHours();
  aiEngine.observeAdhkarSession(time, completedCount, totalCount, durationSeconds, hour);
}

export function trainOnStrugglingAdhkar(adhkarIds: string[]): void {
  aiEngine.observeStrugglingAdhkar(adhkarIds);
}

export function trainOnRecitation(states: import('../types').RecitationState[], targetCount: number): RecitationFeedback {
  return aiEngine.observeRecitation(states, targetCount);
}

export function trainOnFocusSession(session: import('../types').FocusModeSession): void {
  aiEngine.observeFocusSession(session);
}

export function trainOnContentEngagement(type: 'hadith' | 'quran' | 'dua', engaged: boolean): void {
  aiEngine.observeContentEngagement(type, engaged);
}

export function trainOnDailyActivity(): void {
  aiEngine.observeDailyActivity();
}

// ─── Helpers ───

function truncateEnglish(html: string, maxLen: number): string {
  const stripped = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (stripped.length <= maxLen) return stripped;
  return stripped.slice(0, maxLen).replace(/\s+\S*$/, '') + '…';
}
