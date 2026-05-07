import type { AIRecommendation, AppSection, SalahLog, StoryLesson, AdhkarTime } from '../types';

interface AIContext {
  currentPrayer?: keyof Omit<SalahLog, 'id' | 'date'>;
  adhkarTime?: AdhkarTime;
  incompleteStories?: StoryLesson[];
  recentSections?: AppSection[];
  preferredLocale?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

export function generateRecommendations(ctx: AIContext): AIRecommendation[] {
  const recs: AIRecommendation[] = [];

  if (ctx.currentPrayer) {
    recs.push({
      id: `post_${ctx.currentPrayer}`,
      type: 'adhkar',
      title: 'Post-Prayer Adhkar',
      titleAr: 'أذكار بعد الصلاة',
      reason: 'Complete your prayer with recommended adhkar',
      contentId: `adhkar_after_${ctx.currentPrayer}`,
      priority: 10,
    });
  }

  if (ctx.adhkarTime === 'morning') {
    recs.push({
      id: 'morning_adhkar',
      type: 'adhkar',
      title: 'Morning Adhkar',
      titleAr: 'أذكار الصباح',
      reason: 'Start your day with morning remembrances',
      contentId: 'adhkar_morning',
      priority: 9,
    });
  }

  if (ctx.adhkarTime === 'evening') {
    recs.push({
      id: 'evening_adhkar',
      type: 'adhkar',
      title: 'Evening Adhkar',
      titleAr: 'أذكار المساء',
      reason: 'Protect your evening with remembrances',
      contentId: 'adhkar_evening',
      priority: 9,
    });
  }

  if (ctx.incompleteStories && ctx.incompleteStories.length > 0) {
    const next = ctx.incompleteStories[0];
    recs.push({
      id: `story_${next.id}`,
      type: 'story',
      title: next.title,
      titleAr: next.titleAr,
      reason: 'Continue where you left off',
      contentId: next.id,
      priority: 8,
    });
  }

  if (ctx.timeOfDay === 'night') {
    recs.push({
      id: 'night_quran',
      type: 'quran',
      title: 'Night Quran Reading',
      titleAr: 'قراءة الليل',
      reason: 'The night is the best time for Quran reflection',
      contentId: 'quran_night',
      priority: 7,
    });
  }

  recs.push({
    id: 'daily_lesson',
    type: 'lesson',
    title: 'Daily Lesson',
    titleAr: 'الدرس اليومي',
    reason: 'A short lesson to strengthen your faith',
    contentId: 'lesson_daily',
    priority: 5,
  });

  return recs.sort((a, b) => b.priority - a.priority);
}
