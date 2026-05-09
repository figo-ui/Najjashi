// ─── Najjashi AI Engine ───
// On-device learning engine — no cloud, no API calls for AI
// Trains from user behavior: prayer patterns, adhkar completion, recitation quality,
// session habits, and content engagement. Uses statistical learning (Bayesian updates,
// frequency analysis, exponential moving averages) to personalize the app.

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AdhkarTime,
  AIPersonalization,
  RecitationState,
  FocusModeSession,
} from '../types';

// ═══════════════════════════════════════
// TYPES
// ═══════════════════════════════════════

/** Rich behavioral profile that grows with usage */
export interface UserProfile {
  // Prayer patterns
  prayerFrequency: Record<string, number>;       // prayer name → completion rate (0-1)
  avgPrayerTime: Record<string, number>;          // prayer name → avg minutes after adhan
  prayerStreakCurrent: number;
  prayerStreakBest: number;
  missedPrayers: string[];                         // recently missed

  // Adhkar patterns
  adhkarCompletionRate: Record<AdhkarTime, number>; // time → completion rate (0-1)
  adhkarAvgDuration: Record<AdhkarTime, number>;   // time → avg seconds per session
  strugglingAdhkar: string[];                       // adhkar IDs user struggles with
  masteredAdhkar: string[];                          // adhkar IDs user has mastered
  adhkarTimePreference: Record<AdhkarTime, number>; // time → preferred hour (0-23)

  // Recitation quality
  recitationAccuracy: number;                     // 0-1 average across all sessions
  recitationSessions: number;                     // total sessions with AI listening
  recitationImprovement: number;                  // slope of improvement (-1 to 1)
  commonMispronunciations: string[];              // detected patterns

  // Session habits
  avgSessionDuration: number;                     // seconds
  sessionFrequency: number;                       // sessions per week
  preferredSessionLength: 'short' | 'medium' | 'long'; // adaptive
  peakEngagementHour: number;                     // 0-23
  focusModeUsageRate: number;                     // 0-1

  // Content engagement
  hadithClickRate: number;                        // 0-1
  quranReadRate: number;                          // surahs/week
  duaFavoriteCount: number;
  lastActiveDate: string;                         // ISO date

  // Spiritual level (computed)
  spiritualLevel: 1 | 2 | 3 | 4 | 5;
  consistencyScore: number;                       // 0-1
  growthVelocity: number;                         // rate of improvement

  // Metadata
  totalInteractions: number;
  daysSinceFirstUse: number;
  firstUseDate: string;
}

/** A learned pattern from user behavior */
export interface LearnedPattern {
  type: 'time_prayer' | 'time_adhkar' | 'struggle_cycle' | 'engagement_peak' | 'content_preference';
  confidence: number;  // 0-1
  data: Record<string, any>;
  observedCount: number;
  lastObserved: string; // ISO date
}

/** AI recommendation with confidence and reasoning */
export interface AIRecommendation {
  id: string;
  type: 'adhkar' | 'prayer' | 'quran' | 'hadith' | 'dua' | 'tasbih' | 'sahaba' | 'focus' | 'recitation_coach';
  title: string;
  reason: string;
  contentId: string;
  priority: number;      // 0-10
  confidence: number;   // 0-1 how confident the AI is
  reasoning: string;    // explainable AI — why this recommendation
}

/** Recitation coaching feedback */
export interface RecitationFeedback {
  overallScore: number;       // 0-1
  pronunciationScore: number; // 0-1
  fluencyScore: number;       // 0-1
  consistencyScore: number;   // 0-1
  detectedPhrases: string[];
  missedPhrases: string[];
  improvementTip: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  nextSuggestedAdhkar: string | null;
}

// ═══════════════════════════════════════
// CONSTANTS & DEFAULTS
// ═══════════════════════════════════════

const AI_STORAGE_KEY = 'najjashi_ai_profile';
const AI_PATTERNS_KEY = 'najjashi_ai_patterns';
const EMA_ALPHA = 0.3; // Exponential Moving Average smoothing factor
const BAYESIAN_PRIOR = 0.5; // Initial belief
const MIN_OBSERVATIONS = 3; // Minimum data points before pattern is trusted
const SPIRITUAL_LEVEL_THRESHOLDS = [0, 0.15, 0.3, 0.5, 0.7, 0.85]; // levels 1-5

const DEFAULT_PROFILE: UserProfile = {
  prayerFrequency: { fajr: BAYESIAN_PRIOR, dhuhr: BAYESIAN_PRIOR, asr: BAYESIAN_PRIOR, maghrib: BAYESIAN_PRIOR, isha: BAYESIAN_PRIOR },
  avgPrayerTime: {},
  prayerStreakCurrent: 0,
  prayerStreakBest: 0,
  missedPrayers: [],
  adhkarCompletionRate: { morning: BAYESIAN_PRIOR, evening: BAYESIAN_PRIOR, after_prayer: BAYESIAN_PRIOR, sleep: BAYESIAN_PRIOR, general: BAYESIAN_PRIOR },
  adhkarAvgDuration: { morning: 120, evening: 120, after_prayer: 60, sleep: 90, general: 100 },
  strugglingAdhkar: [],
  masteredAdhkar: [],
  adhkarTimePreference: { morning: 7, evening: 18, after_prayer: 13, sleep: 22, general: 12 },
  recitationAccuracy: BAYESIAN_PRIOR,
  recitationSessions: 0,
  recitationImprovement: 0,
  commonMispronunciations: [],
  avgSessionDuration: 120,
  sessionFrequency: BAYESIAN_PRIOR,
  preferredSessionLength: 'medium',
  peakEngagementHour: 7,
  focusModeUsageRate: BAYESIAN_PRIOR,
  hadithClickRate: BAYESIAN_PRIOR,
  quranReadRate: BAYESIAN_PRIOR,
  duaFavoriteCount: 0,
  lastActiveDate: '',
  spiritualLevel: 1,
  consistencyScore: 0,
  growthVelocity: 0,
  totalInteractions: 0,
  daysSinceFirstUse: 0,
  firstUseDate: new Date().toISOString().slice(0, 10),
};

// ═══════════════════════════════════════
// AI ENGINE CLASS
// ═══════════════════════════════════════

class NajjashiAIEngine {
  private profile: UserProfile = { ...DEFAULT_PROFILE };
  private patterns: LearnedPattern[] = [];
  private loaded = false;
  private recentRecitationScores: number[] = []; // last 20 for trend

  // ─── Initialization ───

  async initialize(): Promise<void> {
    if (this.loaded) return;
    await this.loadFromStorage();
    this.loaded = true;
    console.log('[AI] Engine initialized — level', this.profile.spiritualLevel, '— interactions:', this.profile.totalInteractions);
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const [profileRaw, patternsRaw] = await Promise.all([
        AsyncStorage.getItem(AI_STORAGE_KEY),
        AsyncStorage.getItem(AI_PATTERNS_KEY),
      ]);
      if (profileRaw) {
        const saved = JSON.parse(profileRaw);
        // Merge with defaults to handle new fields
        this.profile = { ...DEFAULT_PROFILE, ...saved };
        // Ensure new AdhkarTime keys exist
        for (const key of ['morning', 'evening', 'after_prayer', 'sleep', 'general'] as AdhkarTime[]) {
          if (this.profile.adhkarCompletionRate[key] === undefined) {
            this.profile.adhkarCompletionRate[key] = BAYESIAN_PRIOR;
          }
          if (this.profile.adhkarAvgDuration[key] === undefined) {
            this.profile.adhkarAvgDuration[key] = DEFAULT_PROFILE.adhkarAvgDuration[key];
          }
          if (this.profile.adhkarTimePreference[key] === undefined) {
            this.profile.adhkarTimePreference[key] = DEFAULT_PROFILE.adhkarTimePreference[key];
          }
        }
      }
      if (patternsRaw) {
        this.patterns = JSON.parse(patternsRaw);
      }
    } catch (e) {
      console.warn('[AI] Load failed, using defaults:', e);
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(AI_STORAGE_KEY, JSON.stringify(this.profile)),
        AsyncStorage.setItem(AI_PATTERNS_KEY, JSON.stringify(this.patterns)),
      ]);
    } catch (e) {
      console.warn('[AI] Save failed:', e);
    }
  }

  // ─── Training: Observe User Behavior ───

  /** Train on prayer completion */
  observePrayer(prayer: string, completed: boolean, minutesAfterAdhan?: number): void {
    // Bayesian update on prayer frequency
    const current = this.profile.prayerFrequency[prayer] ?? BAYESIAN_PRIOR;
    this.profile.prayerFrequency[prayer] = this.bayesianUpdate(current, completed ? 1 : 0, EMA_ALPHA);

    // Track missed prayers
    if (!completed) {
      this.profile.missedPrayers = [...new Set([...this.profile.missedPrayers, prayer])].slice(-5);
    } else {
      this.profile.missedPrayers = this.profile.missedPrayers.filter(p => p !== prayer);
    }

    // Track timing
    if (completed && minutesAfterAdhan !== undefined) {
      const prev = this.profile.avgPrayerTime[prayer];
      this.profile.avgPrayerTime[prayer] = prev !== undefined
        ? this.ema(prev, minutesAfterAdhan)
        : minutesAfterAdhan;
    }

    // Update streak
    if (completed) {
      const allDone = Object.values(this.profile.prayerFrequency).every(v => v > 0.5);
      if (allDone) {
        this.profile.prayerStreakCurrent++;
        this.profile.prayerStreakBest = Math.max(this.profile.prayerStreakBest, this.profile.prayerStreakCurrent);
      }
    } else {
      this.profile.prayerStreakCurrent = 0;
    }

    this.recordInteraction();
    this.detectPattern('time_prayer', { prayer, completed, minutesAfterAdhan });
    this.saveToStorage();
  }

  /** Train on adhkar session completion */
  observeAdhkarSession(
    time: AdhkarTime,
    completedCount: number,
    totalCount: number,
    durationSeconds: number,
    hourOfDay: number,
  ): void {
    const completionRate = completedCount / Math.max(1, totalCount);

    // Update completion rate (EMA)
    const prev = this.profile.adhkarCompletionRate[time] ?? BAYESIAN_PRIOR;
    this.profile.adhkarCompletionRate[time] = this.ema(prev, completionRate);

    // Update average duration
    const prevDur = this.profile.adhkarAvgDuration[time] ?? 120;
    this.profile.adhkarAvgDuration[time] = this.ema(prevDur, durationSeconds);

    // Update preferred time
    const prevTime = this.profile.adhkarTimePreference[time] ?? hourOfDay;
    this.profile.adhkarTimePreference[time] = Math.round(this.ema(prevTime, hourOfDay));

    // Track struggling vs mastered
    if (completionRate < 0.3) {
      // User is struggling — will be handled by observeStrugglingAdhkar
    } else if (completionRate > 0.9) {
      this.profile.masteredAdhkar = [...new Set([...this.profile.masteredAdhkar, time])].slice(-20);
    }

    this.recordInteraction();
    this.detectPattern('time_adhkar', { time, completionRate, hourOfDay, durationSeconds });
    this.saveToStorage();
  }

  /** Train on struggling adhkar detection */
  observeStrugglingAdhkar(adhkarIds: string[]): void {
    this.profile.strugglingAdhkar = [...new Set([...this.profile.strugglingAdhkar, ...adhkarIds])].slice(-15);
    // Remove from mastered if struggling
    this.profile.masteredAdhkar = this.profile.masteredAdhkar.filter(id => !adhkarIds.includes(id));
    this.saveToStorage();
  }

  /** Train on recitation session */
  observeRecitation(states: RecitationState[], targetCount: number): RecitationFeedback {
    const engagedStates = states.filter(s => s.isEngaged);
    const overallScore = states.length > 0 ? engagedStates.length / states.length : 0;
    const avgConfidence = engagedStates.length > 0
      ? engagedStates.reduce((sum, s) => sum + s.confidence, 0) / engagedStates.length
      : 0;

    // Track improvement trend
    this.recentRecitationScores.push(overallScore);
    if (this.recentRecitationScores.length > 20) this.recentRecitationScores.shift();

    const improvement = this.calculateTrend(this.recentRecitationScores);
    this.profile.recitationImprovement = improvement;
    this.profile.recitationAccuracy = this.ema(this.profile.recitationAccuracy, overallScore);
    this.profile.recitationSessions++;

    // Determine difficulty
    const difficulty: 'beginner' | 'intermediate' | 'advanced' =
      this.profile.recitationAccuracy < 0.3 ? 'beginner'
      : this.profile.recitationAccuracy < 0.7 ? 'intermediate'
      : 'advanced';

    // Detect phrases
    const detectedPhrases = engagedStates
      .map(s => s.detectedText.trim())
      .filter(t => t.length > 0)
      .slice(-5);

    // Generate tip
    const improvementTip = this.generateRecitationTip(difficulty, overallScore, improvement);

    // Suggest next adhkar based on difficulty
    const nextSuggested = this.suggestNextRecitation(difficulty);

    const feedback: RecitationFeedback = {
      overallScore,
      pronunciationScore: avgConfidence,
      fluencyScore: overallScore,
      consistencyScore: this.calculateConsistency(this.recentRecitationScores),
      detectedPhrases,
      missedPhrases: [], // Would need expected phrases to compare
      improvementTip,
      difficulty,
      nextSuggestedAdhkar: nextSuggested,
    };

    this.recordInteraction();
    this.saveToStorage();
    return feedback;
  }

  /** Train on focus mode session */
  observeFocusSession(session: FocusModeSession): void {
    // Update session duration
    this.profile.avgSessionDuration = this.ema(this.profile.avgSessionDuration, session.durationSeconds);

    // Update session length preference
    const dur = session.durationSeconds;
    this.profile.preferredSessionLength =
      dur < 120 ? 'short' : dur < 300 ? 'medium' : 'long';

    // Update focus mode usage rate
    this.profile.focusModeUsageRate = this.ema(this.profile.focusModeUsageRate, 1);

    // Update session frequency (weekly estimate)
    this.profile.sessionFrequency = this.ema(this.profile.sessionFrequency, 1);

    this.recordInteraction();
    this.saveToStorage();
  }

  /** Train on content engagement (hadith click, quran read, etc.) */
  observeContentEngagement(type: 'hadith' | 'quran' | 'dua', engaged: boolean): void {
    if (type === 'hadith') {
      this.profile.hadithClickRate = this.bayesianUpdate(this.profile.hadithClickRate, engaged ? 1 : 0, EMA_ALPHA);
    } else if (type === 'quran') {
      this.profile.quranReadRate = this.ema(this.profile.quranReadRate, engaged ? 1 : 0);
    } else if (type === 'dua') {
      if (engaged) this.profile.duaFavoriteCount++;
    }
    this.recordInteraction();
    this.saveToStorage();
  }

  /** Record daily activity */
  observeDailyActivity(): void {
    const today = new Date().toISOString().slice(0, 10);
    if (this.profile.lastActiveDate !== today) {
      this.profile.daysSinceFirstUse = this.daysBetween(this.profile.firstUseDate, today);
      this.profile.lastActiveDate = today;
      this.recomputeSpiritualLevel();
      this.saveToStorage();
    }
  }

  // ─── Inference: Generate Smart Recommendations ───

  /** Generate personalized recommendations based on trained profile */
  generateRecommendations(context: {
    currentHour: number;
    currentPrayer?: string;
    adhkarTime?: AdhkarTime;
    prayersCompletedToday?: number;
    adhkarCompletedToday?: number;
    tasbihCountToday?: number;
  }): AIRecommendation[] {
    const recs: AIRecommendation[] = [];
    const p = this.profile;
    const hour = context.currentHour;

    // 1. Missed prayer nudge — high confidence if pattern detected
    if (p.missedPrayers.length > 0) {
      const missed = p.missedPrayers[0];
      const freq = p.prayerFrequency[missed] ?? BAYESIAN_PRIOR;
      recs.push({
        id: `missed_prayer_${missed}`,
        type: 'prayer',
        title: `${this.capitalize(missed)} Prayer`,
        reason: `You've been missing ${missed} — let's get back on track`,
        contentId: missed,
        priority: 9,
        confidence: 1 - freq,
        reasoning: `Prayer frequency for ${missed} is ${(freq * 100).toFixed(0)}% — below threshold`,
      });
    }

    // 2. Time-based adhkar — use learned preferences
    const adhkarTime = context.adhkarTime ?? this.inferAdhkarTime(hour);
    if (adhkarTime) {
      const completionRate = p.adhkarCompletionRate[adhkarTime] ?? BAYESIAN_PRIOR;
      const preferredHour = p.adhkarTimePreference[adhkarTime] ?? 7;
      const isRightTime = Math.abs(hour - preferredHour) < 2;
      const title = adhkarTime === 'morning' ? 'Morning Adhkar'
        : adhkarTime === 'evening' ? 'Evening Adhkar'
        : adhkarTime === 'sleep' ? 'Sleep Adhkar'
        : 'After-Prayer Adhkar';

      recs.push({
        id: `${adhkarTime}_adhkar`,
        type: 'adhkar',
        title,
        reason: completionRate < 0.5
          ? `You usually complete ${Math.round(completionRate * 100)}% — let's improve!`
          : isRightTime ? 'This is your preferred time for this adhkar' : 'Time for remembrance',
        contentId: adhkarTime,
        priority: isRightTime ? 9 : 7,
        confidence: isRightTime ? 0.9 : 0.6,
        reasoning: `Completion rate: ${(completionRate * 100).toFixed(0)}%, preferred hour: ${preferredHour}, current: ${hour}`,
      });
    }

    // 3. Struggling adhkar practice — suggest easier versions
    if (p.strugglingAdhkar.length > 0) {
      const strugglingId = p.strugglingAdhkar[0];
      recs.push({
        id: `struggle_${strugglingId}`,
        type: 'recitation_coach',
        title: 'Practice Difficult Adhkar',
        reason: 'The AI detected you struggle with this — practice makes perfect',
        contentId: strugglingId,
        priority: 8,
        confidence: p.recitationSessions > MIN_OBSERVATIONS ? 0.8 : 0.4,
        reasoning: `Struggling adhkar detected: ${strugglingId}, recitation accuracy: ${(p.recitationAccuracy * 100).toFixed(0)}%`,
      });
    }

    // 4. Post-prayer adhkar — if prayer just completed
    if (context.currentPrayer) {
      const afterRate = p.adhkarCompletionRate.after_prayer ?? BAYESIAN_PRIOR;
      recs.push({
        id: 'post_prayer_adhkar',
        type: 'adhkar',
        title: 'After-Prayer Adhkar',
        reason: afterRate < 0.5
          ? `You often skip after-prayer adhkar (${(afterRate * 100).toFixed(0)}% completion)`
          : 'Complete your prayer with recommended adhkar',
        contentId: 'after_prayer',
        priority: 10,
        confidence: 0.95,
        reasoning: `Just completed ${context.currentPrayer}, after-prayer rate: ${(afterRate * 100).toFixed(0)}%`,
      });
    }

    // 5. Tasbih — encourage if not done, adapt count to level
    const tasbihCount = context.tasbihCountToday ?? 0;
    if (tasbihCount < 33) {
      const targetCount = p.spiritualLevel >= 4 ? 100 : p.spiritualLevel >= 2 ? 33 : 10;
      recs.push({
        id: 'tasbih_daily',
        type: 'tasbih',
        title: 'Daily Tasbih',
        reason: targetCount > 33
          ? `At level ${p.spiritualLevel}, try ${targetCount} dhikr today`
          : 'Remember Allah with SubhanAllah, Alhamdulillah, Allahu Akbar',
        contentId: `tasbih_${targetCount}`,
        priority: 5,
        confidence: 0.7,
        reasoning: `Tasbih today: ${tasbihCount}, spiritual level: ${p.spiritualLevel}, target: ${targetCount}`,
      });
    }

    // 6. Hadith — adapt frequency to engagement
    if (p.hadithClickRate > 0.3) {
      recs.push({
        id: 'daily_hadith',
        type: 'hadith',
        title: 'Hadith of the Day',
        reason: 'You engage with hadith — here\'s today\'s selection',
        contentId: 'daily_hadith',
        priority: 4,
        confidence: p.hadithClickRate,
        reasoning: `Hadith click rate: ${(p.hadithClickRate * 100).toFixed(0)}% — above threshold`,
      });
    }

    // 7. Quran — suggest based on reading patterns and time
    if (hour >= 4 && hour <= 7 && p.quranReadRate > 0.2) {
      recs.push({
        id: 'morning_quran',
        type: 'quran',
        title: 'Morning Quran Reading',
        reason: 'Early morning is the best time for Quran — and you read regularly',
        contentId: 'quran_morning',
        priority: 6,
        confidence: 0.8,
        reasoning: `Quran read rate: ${(p.quranReadRate * 100).toFixed(0)}%, time: ${hour}:00 (Fajr time)`,
      });
    }

    // 8. Focus mode — suggest if user has used it and it's adhkar time
    if (p.focusModeUsageRate > 0.3 && adhkarTime) {
      recs.push({
        id: 'focus_mode_suggest',
        type: 'focus',
        title: 'Start Focus Mode',
        reason: p.preferredSessionLength === 'short'
          ? 'A quick focused session — you prefer shorter sessions'
          : 'Deep focus session for your adhkar',
        contentId: `focus_${adhkarTime}`,
        priority: 6,
        confidence: p.focusModeUsageRate,
        reasoning: `Focus usage: ${(p.focusModeUsageRate * 100).toFixed(0)}%, preferred: ${p.preferredSessionLength}`,
      });
    }

    // 9. Night reflection — for consistent users
    if (hour >= 21 && p.consistencyScore > 0.5) {
      recs.push({
        id: 'night_reflection',
        type: 'dua',
        title: 'Night Supplication',
        reason: 'You\'re consistent in your worship — end the day with heartfelt dua',
        contentId: 'night_dua',
        priority: 3,
        confidence: p.consistencyScore,
        reasoning: `Consistency: ${(p.consistencyScore * 100).toFixed(0)}%, time: night`,
      });
    }

    // 10. Spiritual level milestone
    if (p.spiritualLevel > 1 && p.totalInteractions % 50 === 0) {
      recs.push({
        id: 'level_milestone',
        type: 'sahaba',
        title: `Level ${p.spiritualLevel} Achievement`,
        reason: `MashaAllah! You've reached spiritual level ${p.spiritualLevel}`,
        contentId: 'level_milestone',
        priority: 2,
        confidence: 0.9,
        reasoning: `Consistency: ${(p.consistencyScore * 100).toFixed(0)}%, growth velocity: ${p.growthVelocity.toFixed(2)}`,
      });
    }

    return recs
      .sort((a, b) => (b.priority * b.confidence) - (a.priority * a.confidence))
      .slice(0, 7);
  }

  /** Get the optimal reminder time for a given adhkar */
  getOptimalReminderTime(adhkarTime: AdhkarTime): number {
    return this.profile.adhkarTimePreference[adhkarTime] ?? DEFAULT_PROFILE.adhkarTimePreference[adhkarTime];
  }

  /** Get the recommended session duration based on learned preferences */
  getRecommendedSessionDuration(): number {
    const map = { short: 90, medium: 180, long: 300 };
    return map[this.profile.preferredSessionLength] ?? 180;
  }

  /** Get recitation coaching feedback */
  getRecitationCoaching(): { difficulty: string; tip: string; nextSuggested: string | null } {
    const difficulty = this.profile.recitationAccuracy < 0.3 ? 'beginner'
      : this.profile.recitationAccuracy < 0.7 ? 'intermediate' : 'advanced';
    return {
      difficulty,
      tip: this.generateRecitationTip(difficulty as any, this.profile.recitationAccuracy, this.profile.recitationImprovement),
      nextSuggested: this.suggestNextRecitation(difficulty as any),
    };
  }

  /** Convert profile to legacy AIPersonalization format */
  toLegacyPersonalization(): AIPersonalization {
    return {
      preferredLanguage: 'en',
      preferredSpeed: this.profile.preferredSessionLength === 'short' ? 'fast' : this.profile.preferredSessionLength === 'long' ? 'slow' : 'normal',
      strugglingAdhkarIds: this.profile.strugglingAdhkar,
      averageSessionDurationSeconds: this.profile.avgSessionDuration,
      preferredReminderTime: 15,
      shortSessionThreshold: this.profile.preferredSessionLength === 'short' ? 60 : 120,
      spiritualLevel: this.profile.spiritualLevel,
      consistencyScore: this.profile.consistencyScore,
      recitationAccuracy: this.profile.recitationAccuracy,
      recitationSessions: this.profile.recitationSessions,
      focusModeUsageRate: this.profile.focusModeUsageRate,
      peakEngagementHour: this.profile.peakEngagementHour,
      totalInteractions: this.profile.totalInteractions,
    };
  }

  /** Get the full profile (for debugging/display) */
  getProfile(): UserProfile {
    return { ...this.profile };
  }

  /** Get learned patterns */
  getPatterns(): LearnedPattern[] {
    return [...this.patterns];
  }

  /** Get spiritual level info */
  getSpiritualInfo(): { level: number; title: string; description: string; nextThreshold: number } {
    const level = this.profile.spiritualLevel;
    const titles = ['', 'Seeker', 'Student', 'Practitioner', 'Devotee', 'Muhsin'];
    const descriptions = [
      '',
      'Beginning your journey — focus on consistency',
      'Building habits — prayer and adhkar are becoming routine',
      'Steady practitioner — your worship has rhythm',
      'Devoted worshipper — your consistency inspires others',
      'Excellence (Ihsan) — worshipping as if you see Allah',
    ];
    return {
      level,
      title: titles[level],
      description: descriptions[level],
      nextThreshold: SPIRITUAL_LEVEL_THRESHOLDS[Math.min(level, 5)] ?? 1,
    };
  }

  // ─── Internal: Statistical Learning Methods ───

  /** Exponential Moving Average — smooth update */
  private ema(previous: number, newValue: number, alpha: number = EMA_ALPHA): number {
    return alpha * newValue + (1 - alpha) * previous;
  }

  /** Bayesian update — update belief with evidence */
  private bayesianUpdate(prior: number, evidence: number, alpha: number = EMA_ALPHA): number {
    // Simple Bayesian-inspired update: prior * (1-alpha) + evidence * alpha
    return this.ema(prior, evidence, alpha);
  }

  /** Calculate linear trend (slope) of a series */
  private calculateTrend(values: number[]): number {
    if (values.length < 3) return 0;
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((s, v) => s + v, 0) / n;
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += (i - xMean) * (i - xMean);
    }
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /** Calculate consistency (inverse of variance) */
  private calculateConsistency(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
    // Convert variance to 0-1 consistency score (lower variance = higher consistency)
    return Math.max(0, 1 - Math.sqrt(variance) * 2);
  }

  /** Detect and store a pattern */
  private detectPattern(type: LearnedPattern['type'], data: Record<string, any>): void {
    const existing = this.patterns.find(p => p.type === type);
    if (existing) {
      existing.data = { ...existing.data, ...data };
      existing.observedCount++;
      existing.confidence = Math.min(1, existing.observedCount / (MIN_OBSERVATIONS * 3));
      existing.lastObserved = new Date().toISOString().slice(0, 10);
    } else {
      this.patterns.push({
        type,
        confidence: 1 / (MIN_OBSERVATIONS * 3),
        data,
        observedCount: 1,
        lastObserved: new Date().toISOString().slice(0, 10),
      });
    }

    // Prune low-confidence patterns older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    this.patterns = this.patterns.filter(p => p.confidence > 0.1 || p.lastObserved >= thirtyDaysAgo);
  }

  /** Recompute spiritual level from profile data */
  private recomputeSpiritualLevel(): void {
    const p = this.profile;

    // Prayer consistency
    const prayerScores = Object.values(p.prayerFrequency);
    const avgPrayer = prayerScores.length > 0
      ? prayerScores.reduce((s, v) => s + v, 0) / prayerScores.length
      : 0;

    // Adhkar consistency
    const adhkarScores = Object.values(p.adhkarCompletionRate);
    const avgAdhkar = adhkarScores.length > 0
      ? adhkarScores.reduce((s, v) => s + v, 0) / adhkarScores.length
      : 0;

    // Recitation quality
    const recitationScore = p.recitationAccuracy;

    // Session engagement
    const sessionScore = Math.min(1, p.sessionFrequency / 7); // normalize to weekly

    // Composite score
    const composite = (avgPrayer * 0.35) + (avgAdhkar * 0.25) + (recitationScore * 0.2) + (sessionScore * 0.2);

    // Consistency score
    p.consistencyScore = composite;

    // Growth velocity
    p.growthVelocity = this.calculateTrend(this.recentRecitationScores);

    // Determine level
    for (let i = SPIRITUAL_LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (composite >= SPIRITUAL_LEVEL_THRESHOLDS[i]) {
        p.spiritualLevel = Math.min(5, i + 1) as UserProfile['spiritualLevel'];
        break;
      }
    }
  }

  /** Infer which adhkar time is appropriate based on hour */
  private inferAdhkarTime(hour: number): AdhkarTime | null {
    if (hour >= 4 && hour < 11) return 'morning';
    if (hour >= 15 && hour < 19) return 'evening';
    if (hour >= 21 || hour < 4) return 'sleep';
    return 'after_prayer';
  }

  /** Generate a recitation improvement tip */
  private generateRecitationTip(
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    score: number,
    improvement: number,
  ): string {
    if (difficulty === 'beginner') {
      if (improvement > 0) return 'Great progress! Keep practicing at your own pace — every dhikr counts';
      return 'Start with shorter adhkar and focus on pronunciation — speed will come naturally';
    }
    if (difficulty === 'intermediate') {
      if (score > 0.6) return 'You\'re doing well! Try longer sessions to build stamina';
      return 'Focus on consistency — try to recite at the same time each day';
    }
    // advanced
    if (improvement > 0.05) return 'Excellent improvement! Challenge yourself with longer adhkar sequences';
    return 'Your recitation is strong — consider helping others learn (teaching is the best learning)';
  }

  /** Suggest next adhkar for recitation practice */
  private suggestNextRecitation(difficulty: 'beginner' | 'intermediate' | 'advanced'): string | null {
    if (difficulty === 'beginner') return 'morning_short'; // Short morning adhkar
    if (difficulty === 'intermediate') return 'evening_full'; // Full evening adhkar
    return 'sleep_full'; // Full sleep adhkar (longest)
  }

  /** Record an interaction (for tracking activity) */
  private recordInteraction(): void {
    this.profile.totalInteractions++;
    this.profile.lastActiveDate = new Date().toISOString().slice(0, 10);
  }

  /** Days between two ISO date strings */
  private daysBetween(start: string, end: string): number {
    const d1 = new Date(start);
    const d2 = new Date(end);
    return Math.floor((d2.getTime() - d1.getTime()) / (24 * 60 * 60 * 1000));
  }

  /** Capitalize first letter */
  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}

// ═══════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════

export const aiEngine = new NajjashiAIEngine();
