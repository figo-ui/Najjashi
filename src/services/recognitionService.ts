import { NativeModules, Platform, PermissionsAndroid } from 'react-native';
import type { RecitationState } from '../types';

// ─── On-Device Speech Recognition ───
// Primary: Vosk (offline Arabic model)
// Fallback: Android SpeechRecognizer via native bridge
// All processing is local — no audio stored or transmitted

const { VoskModule, FocusModeBridge } = NativeModules;

type RecitationListener = (state: RecitationState) => void;

let currentListener: RecitationListener | null = null;
let isListening = false;
let silenceTimer: ReturnType<typeof setTimeout> | null = null;
let engagementScore = 0;
let voskLoaded = false;

// Arabic dhikr phrases for detection
const DHIKR_PHRASES = [
  'سبحان الله', 'الحمد لله', 'الله أكبر', 'لا إله إلا الله',
  'سبحان الله وبحمده', 'أستغفر الله', 'لا حول ولا قوة إلا بالله',
  'بسم الله', 'اللهم', 'أعوذ', 'صلى الله عليه وسلم',
  'رب اغفر لي', 'سبحانك', 'آمنا', 'ربنا',
];

// Transliteration patterns for detection
const TRANSLITERATION_PATTERNS = [
  'subhanallah', 'alhamdulillah', 'allahu akbar', 'la ilaha',
  'astaghfirullah', 'bismillah', 'allahumma', 'aoodhu',
  'rabbighfir', 'subhanaka', 'amanna', 'rabbana',
];

// ─── Vosk Model Management ───

/**
 * Load the Vosk Arabic speech model.
 * Place model at: android/app/src/main/assets/vosk-model-ar/
 * Download: https://alphacephei.com/vosk/models (vosk-model-small-ar-mgb2-0.4 ~50MB)
 */
export async function loadVoskModel(modelPath?: string): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    if (!VoskModule?.loadModel) return false;
    const path = modelPath || 'vosk-model-ar';
    await VoskModule.loadModel(path);
    voskLoaded = true;
    return true;
  } catch {
    voskLoaded = false;
    return false;
  }
}

export function isVoskReady(): boolean {
  return Platform.OS === 'android' && voskLoaded && !!VoskModule;
}

// ─── Speech Recognition ───

export async function startRecitationListening(
  onStateUpdate: RecitationListener
): Promise<boolean> {
  if (isListening) return true;

  const hasPermission = await requestAudioPermissionIfNeeded();
  if (!hasPermission) return false;

  isListening = true;
  currentListener = onStateUpdate;
  engagementScore = 0;

  // Try Vosk first (offline, better Arabic)
  if (isVoskReady() && VoskModule?.startRecognition) {
    try {
      VoskModule.startRecognition();
      if (VoskModule.onResult) {
        VoskModule.onResult((result: any) => {
          processAndNotify(result.text || result.partial || '', result.confidence ?? 0.7);
        });
      }
      if (VoskModule.onPartialResult) {
        VoskModule.onPartialResult((result: any) => {
          processAndNotify(result.partial || '', 0.5);
        });
      }
      return true;
    } catch {}
  }

  // Fallback: Android SpeechRecognizer
  if (Platform.OS === 'android' && FocusModeBridge?.startSpeechRecognition) {
    try {
      FocusModeBridge.startSpeechRecognition((result: any) => {
        processAndNotify(result.text || result.partial || '', result.confidence ?? 0.6);
      });
      return true;
    } catch {}
  }

  // Manual tap mode fallback
  return true;
}

function processAndNotify(detectedText: string, confidence: number): void {
  const lowerText = detectedText.toLowerCase().trim();

  const isDhikrDetected =
    DHIKR_PHRASES.some(phrase => detectedText.includes(phrase)) ||
    TRANSLITERATION_PATTERNS.some(pattern => lowerText.includes(pattern));

  const isEngaged = isDhikrDetected || (detectedText.length > 3 && confidence > 0.3);

  if (isEngaged) {
    engagementScore = Math.min(1, engagementScore + 0.1);
    if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
  }

  currentListener?.({
    isListening,
    detectedText,
    confidence,
    isEngaged,
    silenceDurationMs: 0,
  });
}

export async function stopRecitationListening(): Promise<void> {
  isListening = false;
  currentListener = null;
  if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }

  if (isVoskReady() && VoskModule?.stopRecognition) {
    try { VoskModule.stopRecognition(); } catch {}
  }
  if (Platform.OS === 'android' && FocusModeBridge?.stopSpeechRecognition) {
    try { FocusModeBridge.stopSpeechRecognition(); } catch {}
  }
}

export function startSilenceMonitor(
  silenceThresholdMs: number,
  onSilenceReminder: () => void
): void {
  if (silenceTimer) clearTimeout(silenceTimer);
  silenceTimer = setTimeout(() => {
    if (isListening) {
      currentListener?.({ isListening, detectedText: '', confidence: 0, isEngaged: false, silenceDurationMs: silenceThresholdMs });
      onSilenceReminder();
    }
  }, silenceThresholdMs);
}

export function getEngagementScore(): number { return engagementScore; }
export function resetEngagementScore(): void { engagementScore = 0; }

export function assessAdhkarCompletion(
  recitationStates: RecitationState[],
  _minimumDurationSeconds: number,
  targetCount: number
): { completed: boolean; confidence: number } {
  if (recitationStates.length === 0) return { completed: false, confidence: 0 };
  const engagedStates = recitationStates.filter(s => s.isEngaged);
  const engagementRatio = engagedStates.length / recitationStates.length;
  const avgConfidence = engagedStates.length > 0
    ? engagedStates.reduce((sum, s) => sum + s.confidence, 0) / engagedStates.length : 0;
  const estimatedRecitations = Math.max(1, Math.round(engagedStates.length * engagementRatio));
  const timeBasedCompletion = estimatedRecitations >= targetCount * 0.7;
  const completed = engagementRatio > 0.4 && (timeBasedCompletion || avgConfidence > 0.5);
  return { completed, confidence: Math.min(1, engagementRatio * avgConfidence) };
}

async function requestAudioPermissionIfNeeded(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    if (granted) return true;
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch { return false; }
}
