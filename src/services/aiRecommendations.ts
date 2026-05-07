import type { AIRecommendation, SalahLog, AdhkarTime, SahabaLesson } from '../types';

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
}

export function generateRecommendations(ctx: RecommendationContext): AIRecommendation[] {
  const recs: AIRecommendation[] = [];

  // 1. After-prayer adhkar — highest priority if a prayer was just completed
  if (ctx.currentPrayer) {
    recs.push({
      id: `post_${ctx.currentPrayer}`,
      type: 'adhkar',
      title: 'After-Prayer Adhkar',
      reason: 'Complete your prayer with recommended adhkar',
      contentId: 'after_prayer',
      priority: 10,
    });
  }

  // 2. Time-based adhkar — morning/evening based on time of day
  if (ctx.adhkarTime && ctx.adhkarTime !== 'after_prayer') {
    const isMorning = ctx.adhkarTime === 'morning';
    recs.push({
      id: `${ctx.adhkarTime}_adhkar`,
      type: 'adhkar',
      title: isMorning ? 'Morning Adhkar' : 'Evening Adhkar',
      reason: isMorning
        ? 'Start your day with morning remembrances for spiritual protection'
        : 'Protect your evening with remembrances before nightfall',
      contentId: ctx.adhkarTime,
      priority: isMorning ? 9 : 8,
    });
  }

  // 3. Incomplete adhkar — if user started but didn't finish
  if (ctx.adhkarCompleted !== undefined && ctx.adhkarTotal !== undefined && ctx.adhkarCompleted < ctx.adhkarTotal) {
    recs.push({
      id: 'adhkar_continue',
      type: 'adhkar',
      title: 'Continue Your Adhkar',
      reason: `You've completed ${ctx.adhkarCompleted}/${ctx.adhkarTotal} — finish strong!`,
      contentId: ctx.adhkarTime || 'morning',
      priority: 7,
    });
  }

  // 4. Sahaba lesson — next incomplete lesson
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
      });
    } else {
      recs.push({
        id: 'sahaba_complete',
        type: 'sahaba',
        title: 'All Lessons Complete!',
        reason: 'MashaAllah! Review your favorite lessons',
        contentId: 'sahaba_review',
        priority: 3,
      });
    }
  }

  // 5. Tasbih — encourage daily dhikr if not done yet
  if (!ctx.tasbihCountToday || ctx.tasbihCountToday < 33) {
    recs.push({
      id: 'tasbih_daily',
      type: 'tasbih',
      title: 'Daily Tasbih',
      reason: 'Remember Allah with SubhanAllah, Alhamdulillah, Allahu Akbar',
      contentId: 'tasbih_33',
      priority: 5,
    });
  }

  // 6. Night Quran suggestion
  if (ctx.timeOfDay === 'night' && (ctx.prayersCompleted ?? 0) >= 5) {
    recs.push({
      id: 'night_reflection',
      type: 'adhkar',
      title: 'Night Reflection',
      reason: 'The quiet of night is the best time for deep remembrance',
      contentId: 'evening',
      priority: 4,
    });
  }

  return recs.sort((a, b) => b.priority - a.priority).slice(0, 5);
}

// Lightweight context builder — call from screens/store
export function buildRecommendationContext(state: {
  salahLog: SalahLog;
  adhkarTime: AdhkarTime;
  sahabaLessons: SahabaLesson[];
  currentLessonIndex: number;
  tasbihSessions: { count: number; date: string }[];
  zikrList: { completed: number; count: number }[];
}): RecommendationContext {
  const now = new Date();
  const hour = now.getHours();
  const today = now.toISOString().slice(0, 10);

  const timeOfDay = hour < 6 ? 'night'
    : hour < 12 ? 'morning'
    : hour < 17 ? 'afternoon'
    : hour < 21 ? 'evening'
    : 'night';

  // Find current prayer (most recent uncompleted)
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
  };
}
