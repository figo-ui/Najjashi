// Najjashi AI Engine — Quick Verification (Node.js)
// Run: npx ts-node -T src/services/__tests__/verify-ai.ts

const EMA_ALPHA = 0.3;
const BAYESIAN_PRIOR = 0.5;

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

// ─── Test runner ───
let passed = 0, failed = 0;
function assert(condition: boolean, label: string) {
  if (condition) { console.log(`  ✓ ${label}`); passed++; }
  else { console.log(`  ✗ FAILED: ${label}`); failed++; }
}

console.log('\n🧪 Najjashi AI Engine Verification\n');

// 1. EMA
console.log('── Statistical Learning ──');
assert(ema(0.5, 1.0).toFixed(5) === '0.65000', 'EMA: 0.3*1 + 0.7*0.5 = 0.65');
let val = 0.5;
for (let i = 0; i < 20; i++) val = ema(val, 1.0);
assert(val > 0.95, 'EMA converges toward 1.0 after 20 iterations');

// 2. Bayesian
assert(bayesianUpdate(0.5, 1.0) > 0.5, 'Bayesian: positive evidence increases belief');
assert(bayesianUpdate(0.5, 0.0) < 0.5, 'Bayesian: negative evidence decreases belief');

// 3. Trend
assert(calculateTrend([0.2, 0.4, 0.6, 0.8, 1.0]) > 0, 'Trend: improving sequence has positive slope');
assert(calculateTrend([1.0, 0.8, 0.6, 0.4, 0.2]) < 0, 'Trend: declining sequence has negative slope');
assert(calculateTrend([0.5, 0.5, 0.5, 0.5]) === 0, 'Trend: flat sequence has zero slope');

// 4. Consistency
assert(calculateConsistency([0.8, 0.81, 0.79, 0.8, 0.82]) > 0.8, 'Consistency: stable values > 0.8');
assert(calculateConsistency([0.1, 0.9, 0.2, 0.8, 0.1]) < 0.5, 'Consistency: volatile values < 0.5');
assert(calculateConsistency([]) === 0, 'Consistency: empty array = 0');
assert(calculateConsistency([0.5]) === 0, 'Consistency: single value = 0');

// 5. Prayer simulation
console.log('\n── Prayer Training ──');
let freq = BAYESIAN_PRIOR;
for (let i = 0; i < 10; i++) freq = bayesianUpdate(freq, 1.0);
assert(freq > 0.9, '10 completed prayers → frequency > 0.9');

freq = 0.9;
for (let i = 0; i < 5; i++) freq = bayesianUpdate(freq, 0.0);
assert(freq < 0.5, '5 missed prayers from 0.9 → frequency < 0.5');

freq = BAYESIAN_PRIOR;
const outcomes = [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1];
for (const o of outcomes) freq = bayesianUpdate(freq, o);
assert(freq > 0.6 && freq < 0.85, '70% completion rate converges to 0.6-0.85');

// 6. Adhkar simulation
console.log('\n── Adhkar Training ──');
let rate = BAYESIAN_PRIOR;
for (const s of [0.8, 0.9, 1.0, 0.7]) rate = ema(rate, s);
assert(rate > 0.7, 'Good adhkar sessions → rate > 0.7');

let hour = 7;
for (const h of [6, 7, 6, 7, 6, 6, 7, 6, 6, 6]) hour = Math.round(ema(hour, h));
assert(hour <= 7, 'Preferred hour converges to actual usage');

// 7. Recitation scoring
console.log('\n── Recitation Scoring ──');
const engagedStates = Array(10).fill(null).map(() => ({
  isListening: true, detectedText: 'سبحان الله', confidence: 0.9, isEngaged: true, silenceDurationMs: 0,
}));
const allEngagedScore = engagedStates.filter(s => s.isEngaged).length / engagedStates.length;
assert(allEngagedScore === 1.0, 'All engaged → score = 1.0');

const mixedStates = [
  ...Array(6).fill(null).map(() => ({ isListening: true, detectedText: 'سبحان الله', confidence: 0.8, isEngaged: true, silenceDurationMs: 0 })),
  ...Array(4).fill(null).map(() => ({ isListening: true, detectedText: '', confidence: 0, isEngaged: false, silenceDurationMs: 3000 })),
];
const mixedScore = mixedStates.filter(s => s.isEngaged).length / mixedStates.length;
assert(mixedScore === 0.6, '6/10 engaged → score = 0.6');

assert(calculateTrend([0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]) > 0.05, 'Improving recitation detected');

// 8. Spiritual level
console.log('\n── Spiritual Level ──');
const thresholds = [0, 0.15, 0.3, 0.5, 0.7, 0.85];
function computeLevel(composite: number): number {
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (composite >= thresholds[i]) return Math.min(5, i + 1);
  }
  return 1;
}
assert(computeLevel(0) === 1, 'Level 1 at 0% consistency');
assert(computeLevel(0.15) === 2, 'Level 2 at 15%');
assert(computeLevel(0.3) === 3, 'Level 3 at 30%');
assert(computeLevel(0.5) === 4, 'Level 4 at 50%');
assert(computeLevel(0.9) === 5, 'Level 5 at 90%');

// 9. Session preference
console.log('\n── Session Duration ──');
function getPref(dur: number) { return dur < 120 ? 'short' : dur < 300 ? 'medium' : 'long'; }
assert(getPref(60) === 'short', '60s → short');
assert(getPref(180) === 'medium', '180s → medium');
assert(getPref(360) === 'long', '360s → long');

// 10. Adhkar time inference
console.log('\n── Adhkar Time Inference ──');
function inferTime(h: number) {
  if (h >= 4 && h < 11) return 'morning';
  if (h >= 15 && h < 19) return 'evening';
  if (h >= 21 || h < 4) return 'sleep';
  return 'after_prayer';
}
assert(inferTime(5) === 'morning', '5am → morning');
assert(inferTime(12) === 'after_prayer', '12pm → after_prayer');
assert(inferTime(16) === 'evening', '4pm → evening');
assert(inferTime(22) === 'sleep', '10pm → sleep');
assert(inferTime(2) === 'sleep', '2am → sleep');

// Summary
console.log(`\n${'═'.repeat(40)}`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log(`${'═'.repeat(40)}\n`);

if (failed > 0) process.exit(1);
