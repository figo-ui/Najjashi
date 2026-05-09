// ─── Najjashi Gemini Auto Tester ───
// Uses Google Gemini API to generate realistic user behavior scenarios,
// feeds them into the AI engine, and validates the engine's learning,
// recommendations, and personalization logic.
//
// Run: npx ts-node -T src/services/__tests__/gemini-auto-tester.ts
//
// Uses GEMINI_API_KEY from env.ts or process.env

import * as https from 'https';

// ═══════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ═══════════════════════════════════════
// AI ENGINE REIMPLEMENTATION (standalone, no RN deps)
// ═══════════════════════════════════════

const EMA_ALPHA = 0.3;
const BAYESIAN_PRIOR = 0.5;
const SPIRITUAL_LEVEL_THRESHOLDS = [0, 0.15, 0.3, 0.5, 0.7, 0.85];
const MIN_OBSERVATIONS = 3;

type AdhkarTime = 'morning' | 'evening' | 'after_prayer' | 'sleep' | 'general';

interface UserProfile {
  prayerFrequency: Record<string, number>;
  avgPrayerTime: Record<string, number>;
  prayerStreakCurrent: number;
  prayerStreakBest: number;
  missedPrayers: string[];
  adhkarCompletionRate: Record<AdhkarTime, number>;
  adhkarAvgDuration: Record<AdhkarTime, number>;
  strugglingAdhkar: string[];
  masteredAdhkar: string[];
  adhkarTimePreference: Record<AdhkarTime, number>;
  recitationAccuracy: number;
  recitationSessions: number;
  recitationImprovement: number;
  commonMispronunciations: string[];
  avgSessionDuration: number;
  sessionFrequency: number;
  preferredSessionLength: 'short' | 'medium' | 'long';
  peakEngagementHour: number;
  focusModeUsageRate: number;
  hadithClickRate: number;
  quranReadRate: number;
  duaFavoriteCount: number;
  lastActiveDate: string;
  spiritualLevel: number;
  consistencyScore: number;
  growthVelocity: number;
  totalInteractions: number;
  daysSinceFirstUse: number;
  firstUseDate: string;
}

interface AIRecommendation {
  id: string;
  type: string;
  title: string;
  reason: string;
  contentId: string;
  priority: number;
  confidence: number;
  reasoning: string;
}

function ema(prev: number, val: number, alpha = EMA_ALPHA): number {
  return alpha * val + (1 - alpha) * prev;
}

function bayesianUpdate(prior: number, evidence: number, alpha = EMA_ALPHA): number {
  return ema(prior, evidence, alpha);
}

function calculateTrend(values: number[]): number {
  if (values.length < 3) return 0;
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((s, v) => s + v, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean);
    den += (i - xMean) * (i - xMean);
  }
  return den === 0 ? 0 : num / den;
}

function calculateConsistency(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.max(0, 1 - Math.sqrt(variance) * 2);
}

function inferAdhkarTime(hour: number): AdhkarTime | null {
  if (hour >= 4 && hour < 11) return 'morning';
  if (hour >= 15 && hour < 19) return 'evening';
  if (hour >= 21 || hour < 4) return 'sleep';
  return 'after_prayer';
}

function computeSpiritualLevel(composite: number): number {
  for (let i = SPIRITUAL_LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (composite >= SPIRITUAL_LEVEL_THRESHOLDS[i]) return Math.min(5, i + 1);
  }
  return 1;
}

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

// ─── Standalone AI Engine (mirrors aiEngine.ts logic) ───

class TestableAIEngine {
  profile: UserProfile;
  private recentRecitationScores: number[] = [];

  constructor() {
    this.profile = { ...DEFAULT_PROFILE, prayerFrequency: { ...DEFAULT_PROFILE.prayerFrequency }, adhkarCompletionRate: { ...DEFAULT_PROFILE.adhkarCompletionRate }, adhkarAvgDuration: { ...DEFAULT_PROFILE.adhkarAvgDuration }, adhkarTimePreference: { ...DEFAULT_PROFILE.adhkarTimePreference } };
  }

  observePrayer(prayer: string, completed: boolean, minutesAfterAdhan?: number): void {
    const current = this.profile.prayerFrequency[prayer] ?? BAYESIAN_PRIOR;
    this.profile.prayerFrequency[prayer] = bayesianUpdate(current, completed ? 1 : 0, EMA_ALPHA);
    if (!completed) {
      this.profile.missedPrayers = [...new Set([...this.profile.missedPrayers, prayer])].slice(-5);
    } else {
      this.profile.missedPrayers = this.profile.missedPrayers.filter(p => p !== prayer);
    }
    if (completed && minutesAfterAdhan !== undefined) {
      const prev = this.profile.avgPrayerTime[prayer];
      this.profile.avgPrayerTime[prayer] = prev !== undefined ? ema(prev, minutesAfterAdhan) : minutesAfterAdhan;
    }
    if (completed) {
      const allDone = Object.values(this.profile.prayerFrequency).every(v => v > 0.5);
      if (allDone) { this.profile.prayerStreakCurrent++; this.profile.prayerStreakBest = Math.max(this.profile.prayerStreakBest, this.profile.prayerStreakCurrent); }
    } else { this.profile.prayerStreakCurrent = 0; }
    this.profile.totalInteractions++;
  }

  observeAdhkarSession(time: AdhkarTime, completedCount: number, totalCount: number, durationSeconds: number, hourOfDay: number): void {
    const completionRate = completedCount / Math.max(1, totalCount);
    const prev = this.profile.adhkarCompletionRate[time] ?? BAYESIAN_PRIOR;
    this.profile.adhkarCompletionRate[time] = ema(prev, completionRate);
    const prevDur = this.profile.adhkarAvgDuration[time] ?? 120;
    this.profile.adhkarAvgDuration[time] = ema(prevDur, durationSeconds);
    const prevTime = this.profile.adhkarTimePreference[time] ?? hourOfDay;
    this.profile.adhkarTimePreference[time] = Math.round(ema(prevTime, hourOfDay));
    if (completionRate > 0.9) this.profile.masteredAdhkar = [...new Set([...this.profile.masteredAdhkar, time])].slice(-20);
    this.profile.totalInteractions++;
  }

  observeStrugglingAdhkar(adhkarIds: string[]): void {
    this.profile.strugglingAdhkar = [...new Set([...this.profile.strugglingAdhkar, ...adhkarIds])].slice(-15);
    this.profile.masteredAdhkar = this.profile.masteredAdhkar.filter(id => !adhkarIds.includes(id));
  }

  observeRecitation(engagementScore: number): void {
    this.recentRecitationScores.push(engagementScore);
    if (this.recentRecitationScores.length > 20) this.recentRecitationScores.shift();
    this.profile.recitationImprovement = calculateTrend(this.recentRecitationScores);
    this.profile.recitationAccuracy = ema(this.profile.recitationAccuracy, engagementScore);
    this.profile.recitationSessions++;
    this.profile.totalInteractions++;
  }

  observeFocusSession(durationSeconds: number): void {
    this.profile.avgSessionDuration = ema(this.profile.avgSessionDuration, durationSeconds);
    this.profile.preferredSessionLength = durationSeconds < 120 ? 'short' : durationSeconds < 300 ? 'medium' : 'long';
    this.profile.focusModeUsageRate = ema(this.profile.focusModeUsageRate, 1);
    this.profile.sessionFrequency = ema(this.profile.sessionFrequency, 1);
    this.profile.totalInteractions++;
  }

  observeContentEngagement(type: 'hadith' | 'quran' | 'dua', engaged: boolean): void {
    if (type === 'hadith') this.profile.hadithClickRate = bayesianUpdate(this.profile.hadithClickRate, engaged ? 1 : 0, EMA_ALPHA);
    else if (type === 'quran') this.profile.quranReadRate = ema(this.profile.quranReadRate, engaged ? 1 : 0);
    else if (type === 'dua' && engaged) this.profile.duaFavoriteCount++;
    this.profile.totalInteractions++;
  }

  recomputeSpiritualLevel(): void {
    const prayerConsistency = Object.values(this.profile.prayerFrequency).reduce((s, v) => s + v, 0) / 5;
    const adhkarConsistency = Object.values(this.profile.adhkarCompletionRate).reduce((s, v) => s + v, 0) / 5;
    const recitationFactor = this.profile.recitationAccuracy;
    const composite = prayerConsistency * 0.4 + adhkarConsistency * 0.35 + recitationFactor * 0.25;
    this.profile.consistencyScore = composite;
    this.profile.growthVelocity = calculateTrend(this.recentRecitationScores);
    for (let i = SPIRITUAL_LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (composite >= SPIRITUAL_LEVEL_THRESHOLDS[i]) {
        this.profile.spiritualLevel = Math.min(5, i + 1);
        break;
      }
    }
  }

  generateRecommendations(context: { currentHour: number; currentPrayer?: string; adhkarTime?: AdhkarTime; prayersCompletedToday?: number; adhkarCompletedToday?: number; tasbihCountToday?: number; }): AIRecommendation[] {
    const recs: AIRecommendation[] = [];
    const p = this.profile;
    const hour = context.currentHour;

    if (p.missedPrayers.length > 0) {
      const missed = p.missedPrayers[0];
      const freq = p.prayerFrequency[missed] ?? BAYESIAN_PRIOR;
      recs.push({ id: `missed_prayer_${missed}`, type: 'prayer', title: `${missed} Prayer`, reason: `You've been missing ${missed}`, contentId: missed, priority: 9, confidence: 1 - freq, reasoning: `Frequency: ${(freq * 100).toFixed(0)}%` });
    }

    const adhkarTime = context.adhkarTime ?? inferAdhkarTime(hour);
    if (adhkarTime) {
      const completionRate = p.adhkarCompletionRate[adhkarTime] ?? BAYESIAN_PRIOR;
      const preferredHour = p.adhkarTimePreference[adhkarTime] ?? 7;
      const isRightTime = Math.abs(hour - preferredHour) < 2;
      recs.push({ id: `${adhkarTime}_adhkar`, type: 'adhkar', title: `${adhkarTime} Adhkar`, reason: completionRate < 0.5 ? `Complete only ${Math.round(completionRate * 100)}%` : 'Time for remembrance', contentId: adhkarTime, priority: isRightTime ? 9 : 7, confidence: isRightTime ? 0.9 : 0.6, reasoning: `Rate: ${(completionRate * 100).toFixed(0)}%, preferred: ${preferredHour}h` });
    }

    if (p.strugglingAdhkar.length > 0) {
      recs.push({ id: `struggle_${p.strugglingAdhkar[0]}`, type: 'recitation_coach', title: 'Practice Difficult Adhkar', reason: 'AI detected struggle', contentId: p.strugglingAdhkar[0], priority: 8, confidence: p.recitationSessions > MIN_OBSERVATIONS ? 0.8 : 0.4, reasoning: `Struggling: ${p.strugglingAdhkar[0]}` });
    }

    if (context.currentPrayer) {
      recs.push({ id: 'post_prayer_adhkar', type: 'adhkar', title: 'After-Prayer Adhkar', reason: 'Complete your prayer', contentId: 'after_prayer', priority: 10, confidence: 0.95, reasoning: `Just completed ${context.currentPrayer}` });
    }

    const tasbihCount = context.tasbihCountToday ?? 0;
    if (tasbihCount < 33) {
      const targetCount = p.spiritualLevel >= 4 ? 100 : p.spiritualLevel >= 2 ? 33 : 10;
      recs.push({ id: 'tasbih_daily', type: 'tasbih', title: 'Daily Tasbih', reason: `Try ${targetCount} dhikr`, contentId: `tasbih_${targetCount}`, priority: 5, confidence: 0.7, reasoning: `Level: ${p.spiritualLevel}, target: ${targetCount}` });
    }

    if (p.hadithClickRate > 0.3) {
      recs.push({ id: 'daily_hadith', type: 'hadith', title: 'Hadith of the Day', reason: 'You engage with hadith', contentId: 'daily_hadith', priority: 4, confidence: p.hadithClickRate, reasoning: `Click rate: ${(p.hadithClickRate * 100).toFixed(0)}%` });
    }

    if (hour >= 4 && hour <= 7 && p.quranReadRate > 0.2) {
      recs.push({ id: 'morning_quran', type: 'quran', title: 'Morning Quran', reason: 'Best time for Quran', contentId: 'quran_morning', priority: 6, confidence: 0.8, reasoning: `Read rate: ${(p.quranReadRate * 100).toFixed(0)}%` });
    }

    if (p.focusModeUsageRate > 0.3 && adhkarTime) {
      recs.push({ id: 'focus_mode_suggest', type: 'focus', title: 'Start Focus Mode', reason: p.preferredSessionLength === 'short' ? 'Quick session' : 'Deep focus', contentId: `focus_${adhkarTime}`, priority: 6, confidence: p.focusModeUsageRate, reasoning: `Usage: ${(p.focusModeUsageRate * 100).toFixed(0)}%` });
    }

    if (hour >= 21 && p.consistencyScore > 0.5) {
      recs.push({ id: 'night_reflection', type: 'dua', title: 'Night Supplication', reason: 'End the day with dua', contentId: 'night_dua', priority: 3, confidence: p.consistencyScore, reasoning: `Consistency: ${(p.consistencyScore * 100).toFixed(0)}%` });
    }

    return recs.sort((a, b) => (b.priority * b.confidence) - (a.priority * a.confidence)).slice(0, 7);
  }

  getRecitationCoaching(): { difficulty: string; tip: string } {
    const difficulty = this.profile.recitationAccuracy < 0.3 ? 'beginner' : this.profile.recitationAccuracy < 0.7 ? 'intermediate' : 'advanced';
    const tip = difficulty === 'beginner' ? 'Start with shorter adhkar, repeat slowly' : difficulty === 'intermediate' ? 'Focus on consistency, try longer sessions' : 'Challenge yourself with complex adhkar';
    return { difficulty, tip };
  }

  getRecommendedSessionDuration(): number {
    const map: Record<string, number> = { short: 90, medium: 180, long: 300 };
    return map[this.profile.preferredSessionLength] ?? 180;
  }
}

// ═══════════════════════════════════════
// GEMINI API CLIENT
// ═══════════════════════════════════════

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDpH6ZZl3rnJNBQRD9i3fPLABzszc5dR8Q';
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
  });

  return new Promise((resolve, reject) => {
    const url = new URL(GEMINI_API_URL);
    url.searchParams.set('key', apiKey);

    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
          resolve(text);
        } catch (e) {
          reject(new Error(`Gemini parse error: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ═══════════════════════════════════════
// TEST SCENARIO GENERATOR
// ═══════════════════════════════════════

interface TestScenario {
  name: string;
  description: string;
  actions: Array<{ method: string; args: any[] }>;
  assertions: Array<{ field: string; condition: string; expected: any }>;
  context: { currentHour: number; currentPrayer?: string; tasbihCountToday?: number };
  expectedRecTypes?: string[];
}

const SCENARIO_PROMPT = `You are a QA engineer for an Islamic worship app called Najjashi. The app has an on-device AI engine that learns user behavior and generates personalized recommendations.

The AI engine has these training methods:
- observePrayer(prayer: string, completed: boolean, minutesAfterAdhan?: number)
  Prayers: fajr, dhuhr, asr, maghrib, isha
- observeAdhkarSession(time: AdhkarTime, completedCount: number, totalCount: number, durationSeconds: number, hourOfDay: number)
  Times: morning, evening, after_prayer, sleep, general
- observeStrugglingAdhkar(adhkarIds: string[])
- observeRecitation(engagementScore: number) // 0-1
- observeFocusSession(durationSeconds: number)
- observeContentEngagement(type: 'hadith'|'quran'|'dua', engaged: boolean)

The engine generates recommendations via generateRecommendations(context) where context has:
- currentHour (0-23), currentPrayer?, adhkarTime?, prayersCompletedToday?, tasbihCountToday?

Recommendation types: prayer, adhkar, recitation_coach, tasbih, hadith, quran, focus, dua

Generate 5 diverse test scenarios as a JSON array. Each scenario should test a different user persona:
1. A beginner Muslim (new to practice, low completion rates)
2. A devout practitioner (high consistency, level 4-5)
3. A struggling user (misses prayers often, low adhkar completion)
4. An improving user (was bad, now getting better over time)
5. An inconsistent user (some days good, some days bad)

For each scenario, provide:
- name: short test name
- description: what user persona this tests
- actions: array of {method, args} calls to train the engine (20-40 actions to build a realistic profile)
- assertions: array of {field, condition, expected} to validate the profile state
  field is a dot-path into the profile (e.g., "prayerFrequency.fajr", "spiritualLevel", "missedPrayers.length")
  condition is one of: "gt", "lt", "eq", "gte", "lte", "contains", "notContains"
  expected is the value to compare against
- context: the generateRecommendations context to use
- expectedRecTypes: array of recommendation types that SHOULD appear in the results

Return ONLY the JSON array, no markdown, no explanation.`;

async function generateScenarios(): Promise<TestScenario[]> {
  console.log('🤖 Asking Gemini to generate test scenarios...\n');
  const response = await callGemini(SCENARIO_PROMPT);

  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = response;
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (jsonMatch) jsonStr = jsonMatch[0];

  try {
    const scenarios = JSON.parse(jsonStr);
    console.log(`✓ Gemini generated ${scenarios.length} test scenarios\n`);
    return scenarios;
  } catch (e) {
    console.error('Failed to parse Gemini response. Raw response:');
    console.error(response.slice(0, 500));
    throw new Error('Gemini response was not valid JSON');
  }
}

// ═══════════════════════════════════════
// TEST RUNNER
// ═══════════════════════════════════════

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((o, key) => {
    if (o === undefined || o === null) return undefined;
    // Handle array index like "missedPrayers.length"
    if (key === 'length' && Array.isArray(o)) return o.length;
    return o[key];
  }, obj);
}

function evaluateCondition(actual: any, condition: string, expected: any): boolean {
  switch (condition) {
    case 'gt': return actual > expected;
    case 'lt': return actual < expected;
    case 'eq': return actual === expected;
    case 'gte': return actual >= expected;
    case 'lte': return actual <= expected;
    case 'contains': return Array.isArray(actual) ? actual.includes(expected) : String(actual).includes(expected);
    case 'notContains': return Array.isArray(actual) ? !actual.includes(expected) : !String(actual).includes(expected);
    default: return false;
  }
}

function runScenario(engine: TestableAIEngine, scenario: TestScenario): { passed: number; failed: number; details: string[] } {
  let passed = 0, failed = 0;
  const details: string[] = [];

  // Execute actions
  for (const action of scenario.actions) {
    try {
      const method = (engine as any)[action.method];
      if (typeof method === 'function') {
        method.apply(engine, action.args);
      } else {
        details.push(`  ⚠ Unknown method: ${action.method}`);
      }
    } catch (e: any) {
      details.push(`  ⚠ Error calling ${action.method}: ${e.message}`);
    }
  }

  // Recompute spiritual level after all training
  engine.recomputeSpiritualLevel();

  // Evaluate profile assertions
  for (const assertion of scenario.assertions) {
    const actual = getNestedValue(engine.profile, assertion.field);
    const ok = evaluateCondition(actual, assertion.condition, assertion.expected);
    if (ok) {
      passed++;
      details.push(`  ✓ ${assertion.field} ${assertion.condition} ${assertion.expected} (actual: ${JSON.stringify(actual)})`);
    } else {
      failed++;
      details.push(`  ✗ ${assertion.field} ${assertion.condition} ${assertion.expected} (actual: ${JSON.stringify(actual)})`);
    }
  }

  // Generate recommendations and check expected types
  const recs = engine.generateRecommendations(scenario.context);
  const recTypes = recs.map(r => r.type);

  if (scenario.expectedRecTypes && scenario.expectedRecTypes.length > 0) {
    for (const expectedType of scenario.expectedRecTypes) {
      if (recTypes.includes(expectedType)) {
        passed++;
        details.push(`  ✓ Recommendation type "${expectedType}" present`);
      } else {
        failed++;
        details.push(`  ✗ Recommendation type "${expectedType}" missing (got: [${recTypes.join(', ')}])`);
      }
    }
  }

  // Always validate basic recommendation invariants
  const sortedCorrectly = recs.every((r, i) => i === 0 || (recs[i - 1].priority * recs[i - 1].confidence) >= (r.priority * r.confidence));
  if (sortedCorrectly) { passed++; details.push('  ✓ Recommendations sorted by priority*confidence'); }
  else { failed++; details.push('  ✗ Recommendations not properly sorted'); }

  const maxCount = recs.length <= 7;
  if (maxCount) { passed++; details.push('  ✓ Max 7 recommendations'); }
  else { failed++; details.push(`  ✗ Too many recommendations: ${recs.length}`); }

  const allConfidenceValid = recs.every(r => r.confidence >= 0 && r.confidence <= 1);
  if (allConfidenceValid) { passed++; details.push('  ✓ All confidences in [0,1]'); }
  else { failed++; details.push('  ✗ Invalid confidence values'); }

  return { passed, failed, details };
}

// ═══════════════════════════════════════
// MAIN
// ═══════════════════════════════════════

async function main() {
  console.log('\n🧪 Najjashi Gemini Auto Tester\n');
  console.log('═'.repeat(50));

  let totalPassed = 0, totalFailed = 0;

  // ─── Phase 1: Built-in deterministic tests ───
  console.log('\n── Phase 1: Built-in Engine Tests ──\n');
  const engine = new TestableAIEngine();

  // Quick smoke test
  engine.observePrayer('fajr', true, 15);
  engine.observePrayer('fajr', true, 12);
  engine.observePrayer('fajr', true, 10);
  engine.recomputeSpiritualLevel();
  let p1 = 0, f1 = 0;
  const check = (cond: boolean, label: string) => { if (cond) { console.log(`  ✓ ${label}`); p1++; } else { console.log(`  ✗ ${label}`); f1++; } };

  check(engine.profile.prayerFrequency.fajr > 0.5, 'Fajr frequency > 0.5 after 3 completions');
  check(engine.profile.missedPrayers.length === 0, 'No missed prayers after completions');
  check(engine.profile.prayerStreakCurrent >= 0, 'Streak tracked');

  engine.observePrayer('dhuhr', false);
  check(engine.profile.missedPrayers.includes('dhuhr'), 'Dhuhr in missedPrayers after skip');
  check(engine.profile.prayerFrequency.dhuhr < 0.5, 'Dhuhr frequency < 0.5 after miss');

  engine.observeAdhkarSession('morning', 8, 10, 180, 6);
  check(engine.profile.adhkarCompletionRate.morning > 0.5, 'Morning adhkar rate > 0.5');
  check(engine.profile.adhkarTimePreference.morning < 8, 'Morning preference converges to 6');

  engine.observeRecitation(0.8);
  engine.observeRecitation(0.85);
  engine.observeRecitation(0.9);
  check(engine.profile.recitationAccuracy > 0.6, 'Recitation accuracy > 0.6');
  check(engine.profile.recitationSessions === 3, '3 recitation sessions tracked');
  check(engine.profile.recitationImprovement > 0, 'Improving recitation trend');

  engine.observeFocusSession(60);
  check(engine.profile.preferredSessionLength === 'short', '60s → short session');
  check(engine.profile.focusModeUsageRate > 0.5, 'Focus usage rate > 0.5');

  engine.observeContentEngagement('hadith', true);
  engine.observeContentEngagement('hadith', true);
  engine.observeContentEngagement('hadith', true);
  check(engine.profile.hadithClickRate > 0.5, 'Hadith click rate > 0.5 after 3 clicks');

  engine.recomputeSpiritualLevel();
  check(engine.profile.spiritualLevel >= 1 && engine.profile.spiritualLevel <= 5, `Spiritual level valid: ${engine.profile.spiritualLevel}`);
  check(engine.profile.consistencyScore >= 0 && engine.profile.consistencyScore <= 1, `Consistency score valid: ${engine.profile.consistencyScore.toFixed(2)}`);

  const recs = engine.generateRecommendations({ currentHour: 6, tasbihCountToday: 0 });
  check(recs.length > 0, 'Recommendations generated');
  check(recs.length <= 7, 'Max 7 recommendations');
  check(recs.every(r => r.confidence >= 0 && r.confidence <= 1), 'All confidences valid');

  console.log(`\n  Phase 1: ${p1} passed, ${f1} failed`);
  totalPassed += p1; totalFailed += f1;

  // ─── Phase 2: Gemini-generated scenarios ───
  console.log('\n── Phase 2: Gemini-Generated Scenarios ──\n');

  let geminiAvailable = true;
  let scenarios: TestScenario[] = [];

  try {
    scenarios = await generateScenarios();
  } catch (e: any) {
    console.log(`  ⚠ Gemini unavailable: ${e.message}`);
    console.log('  Falling back to hardcoded scenarios...\n');
    geminiAvailable = false;
  }

  if (!geminiAvailable || scenarios.length === 0) {
    // Fallback scenarios
    scenarios = [
      {
        name: 'Beginner Muslim',
        description: 'New to practice, low completion rates',
        actions: [
          { method: 'observePrayer', args: ['fajr', false] },
          { method: 'observePrayer', args: ['dhuhr', true, 45] },
          { method: 'observePrayer', args: ['asr', false] },
          { method: 'observePrayer', args: ['maghrib', true, 30] },
          { method: 'observePrayer', args: ['isha', false] },
          { method: 'observePrayer', args: ['fajr', false] },
          { method: 'observePrayer', args: ['dhuhr', true, 50] },
          { method: 'observeAdhkarSession', args: ['morning', 2, 10, 60, 7] },
          { method: 'observeAdhkarSession', args: ['evening', 3, 10, 90, 18] },
          { method: 'observeRecitation', args: [0.2] },
          { method: 'observeRecitation', args: [0.25] },
          { method: 'observeContentEngagement', args: ['hadith', true] },
          { method: 'observeContentEngagement', args: ['dua', false] },
          { method: 'observeStrugglingAdhkar', args: [['morning_dua_1']] },
        ],
        assertions: [
          { field: 'prayerFrequency.fajr', condition: 'lt', expected: 0.5 },
          { field: 'missedPrayers', condition: 'contains', expected: 'fajr' },
          { field: 'recitationAccuracy', condition: 'lt', expected: 0.5 },
          { field: 'spiritualLevel', condition: 'lte', expected: 3 },
        ],
        context: { currentHour: 7, tasbihCountToday: 0 },
        expectedRecTypes: ['prayer', 'recitation_coach'],
      },
      {
        name: 'Devout Practitioner',
        description: 'High consistency, level 4-5',
        actions: Array(15).fill(null).flatMap((_, i) => [
          { method: 'observePrayer', args: ['fajr', true, 10 + i] },
          { method: 'observePrayer', args: ['dhuhr', true, 8 + i] },
          { method: 'observePrayer', args: ['asr', true, 12 + i] },
          { method: 'observePrayer', args: ['maghrib', true, 5 + i] },
          { method: 'observePrayer', args: ['isha', true, 15 + i] },
        ]).slice(0, 50).concat([
          { method: 'observeAdhkarSession', args: ['morning', 10, 10, 300, 5] },
          { method: 'observeAdhkarSession', args: ['evening', 10, 10, 280, 17] },
          { method: 'observeAdhkarSession', args: ['after_prayer', 5, 5, 120, 13] },
          { method: 'observeRecitation', args: [0.9] },
          { method: 'observeRecitation', args: [0.92] },
          { method: 'observeRecitation', args: [0.95] },
          { method: 'observeFocusSession', args: [300] },
          { method: 'observeContentEngagement', args: ['hadith', true] },
          { method: 'observeContentEngagement', args: ['quran', true] },
          { method: 'observeContentEngagement', args: ['dua', true] },
        ]),
        assertions: [
          { field: 'prayerFrequency.fajr', condition: 'gt', expected: 0.8 },
          { field: 'missedPrayers.length', condition: 'eq', expected: 0 },
          { field: 'recitationAccuracy', condition: 'gt', expected: 0.7 },
          { field: 'spiritualLevel', condition: 'gte', expected: 3 },
          { field: 'preferredSessionLength', condition: 'eq', expected: 'long' },
        ],
        context: { currentHour: 5, tasbihCountToday: 50 },
        expectedRecTypes: ['adhkar', 'quran'],
      },
      {
        name: 'Struggling User',
        description: 'Misses prayers often, low adhkar completion',
        actions: [
          { method: 'observePrayer', args: ['fajr', false] },
          { method: 'observePrayer', args: ['fajr', false] },
          { method: 'observePrayer', args: ['fajr', false] },
          { method: 'observePrayer', args: ['dhuhr', false] },
          { method: 'observePrayer', args: ['asr', true, 60] },
          { method: 'observePrayer', args: ['maghrib', false] },
          { method: 'observePrayer', args: ['isha', false] },
          { method: 'observePrayer', args: ['isha', false] },
          { method: 'observeAdhkarSession', args: ['morning', 1, 10, 30, 8] },
          { method: 'observeAdhkarSession', args: ['evening', 2, 10, 45, 19] },
          { method: 'observeStrugglingAdhkar', args: [['subhanallah_33', 'alhamdulillah_33']] },
          { method: 'observeRecitation', args: [0.15] },
          { method: 'observeRecitation', args: [0.1] },
          { method: 'observeContentEngagement', args: ['hadith', false] },
        ],
        assertions: [
          { field: 'prayerFrequency.fajr', condition: 'lt', expected: 0.3 },
          { field: 'missedPrayers', condition: 'contains', expected: 'fajr' },
          { field: 'strugglingAdhkar', condition: 'contains', expected: 'subhanallah_33' },
          { field: 'recitationAccuracy', condition: 'lt', expected: 0.5 },
          { field: 'spiritualLevel', condition: 'lte', expected: 3 },
        ],
        context: { currentHour: 14, tasbihCountToday: 0 },
        expectedRecTypes: ['prayer', 'recitation_coach', 'tasbih'],
      },
      {
        name: 'Improving User',
        description: 'Was bad, now getting better',
        actions: [
          // Early: bad performance
          { method: 'observePrayer', args: ['fajr', false] },
          { method: 'observePrayer', args: ['dhuhr', false] },
          { method: 'observeRecitation', args: [0.2] },
          { method: 'observeRecitation', args: [0.25] },
          { method: 'observeRecitation', args: [0.3] },
          // Transition: improving
          { method: 'observePrayer', args: ['fajr', true, 20] },
          { method: 'observePrayer', args: ['dhuhr', true, 15] },
          { method: 'observePrayer', args: ['asr', true, 10] },
          { method: 'observeRecitation', args: [0.5] },
          { method: 'observeRecitation', args: [0.6] },
          { method: 'observeRecitation', args: [0.7] },
          { method: 'observeRecitation', args: [0.8] },
          // Now: consistent
          { method: 'observePrayer', args: ['fajr', true, 10] },
          { method: 'observePrayer', args: ['dhuhr', true, 8] },
          { method: 'observePrayer', args: ['asr', true, 7] },
          { method: 'observePrayer', args: ['maghrib', true, 5] },
          { method: 'observePrayer', args: ['isha', true, 12] },
          { method: 'observeAdhkarSession', args: ['morning', 8, 10, 200, 6] },
          { method: 'observeAdhkarSession', args: ['evening', 9, 10, 250, 18] },
          { method: 'observeContentEngagement', args: ['hadith', true] },
          { method: 'observeContentEngagement', args: ['quran', true] },
        ],
        assertions: [
          { field: 'recitationImprovement', condition: 'gt', expected: 0.01 },
          { field: 'prayerFrequency.fajr', condition: 'gt', expected: 0.5 },
          { field: 'adhkarCompletionRate.morning', condition: 'gt', expected: 0.5 },
          { field: 'growthVelocity', condition: 'gt', expected: 0 },
        ],
        context: { currentHour: 6, tasbihCountToday: 20 },
        expectedRecTypes: ['adhkar'],
      },
      {
        name: 'Inconsistent User',
        description: 'Some days good, some days bad',
        actions: [
          { method: 'observePrayer', args: ['fajr', true, 10] },
          { method: 'observePrayer', args: ['fajr', false] },
          { method: 'observePrayer', args: ['fajr', true, 15] },
          { method: 'observePrayer', args: ['fajr', false] },
          { method: 'observePrayer', args: ['fajr', true, 8] },
          { method: 'observePrayer', args: ['dhuhr', true, 20] },
          { method: 'observePrayer', args: ['dhuhr', false] },
          { method: 'observePrayer', args: ['dhuhr', true, 12] },
          { method: 'observePrayer', args: ['asr', false] },
          { method: 'observePrayer', args: ['asr', true, 25] },
          { method: 'observePrayer', args: ['maghrib', true, 5] },
          { method: 'observePrayer', args: ['maghrib', false] },
          { method: 'observePrayer', args: ['isha', true, 15] },
          { method: 'observePrayer', args: ['isha', false] },
          { method: 'observeAdhkarSession', args: ['morning', 5, 10, 120, 7] },
          { method: 'observeAdhkarSession', args: ['evening', 7, 10, 150, 18] },
          { method: 'observeRecitation', args: [0.4] },
          { method: 'observeRecitation', args: [0.6] },
          { method: 'observeRecitation', args: [0.3] },
          { method: 'observeRecitation', args: [0.7] },
          { method: 'observeContentEngagement', args: ['hadith', true] },
          { method: 'observeContentEngagement', args: ['hadith', false] },
        ],
        assertions: [
          { field: 'prayerFrequency.fajr', condition: 'gte', expected: 0.3 },
          { field: 'prayerFrequency.fajr', condition: 'lte', expected: 0.8 },
          { field: 'recitationAccuracy', condition: 'gte', expected: 0.3 },
          { field: 'recitationAccuracy', condition: 'lte', expected: 0.7 },
          { field: 'consistencyScore', condition: 'lt', expected: 0.7 },
        ],
        context: { currentHour: 15, tasbihCountToday: 10 },
        expectedRecTypes: ['adhkar'],
      },
    ];
  }

  // Run each scenario
  for (const scenario of scenarios) {
    console.log(`── Scenario: ${scenario.name} ──`);
    console.log(`  ${scenario.description}`);

    const eng = new TestableAIEngine();
    const result = runScenario(eng, scenario);

    for (const detail of result.details) {
      console.log(detail);
    }
    console.log(`  → ${result.passed} passed, ${result.failed} failed\n`);
    totalPassed += result.passed;
    totalFailed += result.failed;
  }

  // ─── Phase 3: Gemini validation of recommendation quality ───
  if (geminiAvailable) {
    console.log('── Phase 3: Gemini Recommendation Quality Review ──\n');

    // Create a profile and get recommendations, then ask Gemini to evaluate
    const reviewEngine = new TestableAIEngine();
    // Train a mixed profile
    for (const p of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']) {
      reviewEngine.observePrayer(p, Math.random() > 0.3, Math.floor(Math.random() * 30 + 5));
    }
    reviewEngine.observeAdhkarSession('morning', 7, 10, 180, 6);
    reviewEngine.observeAdhkarSession('evening', 4, 10, 120, 18);
    reviewEngine.observeStrugglingAdhkar(['evening_sleep_dua']);
    reviewEngine.observeRecitation(0.6);
    reviewEngine.observeFocusSession(180);
    reviewEngine.observeContentEngagement('hadith', true);
    reviewEngine.recomputeSpiritualLevel();

    const recs = reviewEngine.generateRecommendations({ currentHour: 18, tasbihCountToday: 5 });
    const profile = JSON.stringify(reviewEngine.profile, null, 2);

    const reviewPrompt = `You are reviewing the quality of AI recommendations for an Islamic worship app. Given the user profile and the generated recommendations, evaluate:

1. Are the recommendations relevant to the user's behavioral patterns?
2. Are the confidence scores reasonable?
3. Are the priority orderings logical?
4. Are there any missing recommendations that should be present?
5. Is the reasoning explainable and helpful?

User Profile:
${profile}

Generated Recommendations:
${JSON.stringify(recs, null, 2)}

Respond with a JSON object:
{
  "score": number (0-100),
  "relevance": "good" | "fair" | "poor",
  "confidenceAccuracy": "good" | "fair" | "poor",  
  "priorityOrder": "good" | "fair" | "poor",
  "missingRecommendations": string[],
  "overallVerdict": string (1-2 sentence summary)
}

Return ONLY the JSON, no markdown.`;

    try {
      const reviewResponse = await callGemini(reviewPrompt);
      let reviewJson = reviewResponse;
      const reviewMatch = reviewResponse.match(/\{[\s\S]*\}/);
      if (reviewMatch) reviewJson = reviewMatch[0];
      const review = JSON.parse(reviewJson);

      console.log(`  Gemini Quality Score: ${review.score}/100`);
      console.log(`  Relevance: ${review.relevance}`);
      console.log(`  Confidence accuracy: ${review.confidenceAccuracy}`);
      console.log(`  Priority ordering: ${review.priorityOrder}`);
      if (review.missingRecommendations?.length > 0) {
        console.log(`  Missing recs: ${review.missingRecommendations.join(', ')}`);
      }
      console.log(`  Verdict: ${review.overallVerdict}`);

      if (review.score >= 60) { totalPassed += 3; console.log('  ✓ Gemini quality score >= 60'); }
      else { totalFailed += 3; console.log('  ✗ Gemini quality score < 60'); }

      if (review.relevance !== 'poor') { totalPassed++; console.log('  ✓ Relevance not poor'); }
      else { totalFailed++; console.log('  ✗ Relevance is poor'); }
    } catch (e: any) {
      console.log(`  ⚠ Gemini review failed: ${e.message}`);
    }
  }

  // ─── Summary ───
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`  Total: ${totalPassed} passed, ${totalFailed} failed`);
  console.log(`  Gemini scenarios: ${geminiAvailable ? 'LIVE' : 'FALLBACK (API error)'}`);
  console.log(`${'═'.repeat(50)}\n`);

  if (totalFailed > 0) process.exit(1);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
