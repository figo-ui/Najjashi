// ─── Vosk On-Device Speech Recognition Service ───
// Uses react-native-vosk for offline Arabic recitation detection
// No audio is stored or sent — all processing on-device

import { NativeModules, NativeEventEmitter, Platform, PermissionsAndroid } from 'react-native';

// ─── Vosk Module Interface ───

interface VoskResult {
  text: string;
  confidence: number;
  partial?: boolean;
}

interface VoskModule {
  loadModel(path: string): Promise<boolean>;
  start(language?: string): Promise<boolean>;
  stop(): Promise<boolean>;
  unload(): Promise<boolean>;
  isLoaded(): Promise<boolean>;
}

const Vosk = NativeModules.Vosk as VoskModule | undefined;
const voskEmitter = Vosk ? new NativeEventEmitter(Vosk as any) : null;

// ─── Arabic Recitation Keywords ───

const ARABIC_ZIKR_KEYWORDS: Record<string, string[]> = {
  subhanallah: ['سبحان', 'سبحان الله', 'سبحان الله وبحمده', 'سبحان الله العظيم'],
  alhamdulillah: ['الحمد', 'الحمد لله', 'الحمد لله رب'],
  allahuakbar: ['الله أكبر', 'أكبر', 'الله اكبر'],
  astaghfirullah: ['أستغفر', 'استغفر الله', 'أستغفر الله'],
  lailahaillallah: ['لا إله إلا الله', 'لا اله الا الله', 'لا إله'],
  bismillah: ['بسم الله', 'بسم', 'بسم الله الرحمن'],
  salawat: ['اللهم صل', 'اللهم صلي', 'صلى الله'],
  qulhuwallah: ['قل هو الله', 'هو الله أحد', 'أحد'],
  ayatulkursi: ['الله لا إله إلا', 'الحي القيوم', 'آية الكرسي'],
  fatiha: ['بسم الله الرحمن الرحيم', 'الحمد لله رب العالمين', 'الرحمن الرحيم', 'مالك يوم الدين'],
};

// ─── State ───

let isModelLoaded = false;
let isListening = false;
let onResultCallback: ((result: VoskResult) => void) | null = null;
let onPartialCallback: ((partial: string) => void) | null = null;
let onErrorCallback: ((error: string) => void) | null = null;

// ─── Event Listeners ───

if (voskEmitter && Vosk) {
  voskEmitter.addListener('onResult', (result: VoskResult) => {
    onResultCallback?.(result);
  });

  voskEmitter.addListener('onPartial', (partial: { text: string }) => {
    onPartialCallback?.(partial.text);
  });

  voskEmitter.addListener('onError', (error: { message: string }) => {
    console.warn('[Vosk] Error:', error.message);
    onErrorCallback?.(error.message);
  });
}

// ─── Permissions ───

export async function requestAudioPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Audio Permission',
        message: 'Najjashi needs microphone access for recitation verification (all processing stays on your device)',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (e) {
    console.warn('[Vosk] Permission error:', e);
    return false;
  }
}

export async function checkAudioPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
}

// ─── Model Management ───

export async function loadVoskModel(modelPath?: string): Promise<boolean> {
  if (!Vosk) {
    console.warn('[Vosk] Native module not available');
    return false;
  }

  try {
    const defaultPath = modelPath || 'vosk-model-ar-mgb2'; // Arabic model
    isModelLoaded = await Vosk.loadModel(defaultPath);
    console.log('[Vosk] Model loaded:', isModelLoaded);
    return isModelLoaded;
  } catch (e) {
    console.warn('[Vosk] Load failed:', e);
    return false;
  }
}

export async function unloadVoskModel(): Promise<void> {
  if (!Vosk || !isModelLoaded) return;
  try {
    await Vosk.unload();
    isModelLoaded = false;
  } catch (e) {
    console.warn('[Vosk] Unload failed:', e);
  }
}

// ─── Recognition Control ───

export async function startListening(
  onResult: (result: VoskResult) => void,
  onPartial?: (partial: string) => void,
  onError?: (error: string) => void,
): Promise<boolean> {
  if (!Vosk || !isModelLoaded) {
    console.warn('[Vosk] Cannot start — model not loaded');
    return false;
  }

  const hasPermission = await requestAudioPermission();
  if (!hasPermission) return false;

  onResultCallback = onResult;
  onPartialCallback = onPartial ?? null;
  onErrorCallback = onError ?? null;

  try {
    isListening = await Vosk.start('ar'); // Arabic language
    return isListening;
  } catch (e) {
    console.warn('[Vosk] Start failed:', e);
    return false;
  }
}

export async function stopListening(): Promise<void> {
  if (!Vosk || !isListening) return;
  try {
    await Vosk.stop();
    isListening = false;
    onResultCallback = null;
    onPartialCallback = null;
  } catch (e) {
    console.warn('[Vosk] Stop failed:', e);
  }
}

// ─── Recitation Matching ───

export function matchArabicRecitation(detectedText: string): {
  zikrKey: string | null;
  confidence: number;
  matchedPhrase: string | null;
} {
  if (!detectedText || detectedText.trim().length === 0) {
    return { zikrKey: null, confidence: 0, matchedPhrase: null };
  }

  const normalized = detectedText.trim();

  for (const [key, phrases] of Object.entries(ARABIC_ZIKR_KEYWORDS)) {
    for (const phrase of phrases) {
      if (normalized.includes(phrase)) {
        // Confidence based on how much of the detected text matches
        const ratio = phrase.length / normalized.length;
        const confidence = Math.min(ratio * 1.2, 1.0);
        return { zikrKey: key, confidence, matchedPhrase: phrase };
      }
    }
  }

  return { zikrKey: null, confidence: 0, matchedPhrase: null };
}

// ─── Recitation Verification ───

export interface RecitationVerification {
  isCorrect: boolean;
  confidence: number;
  detectedZikr: string | null;
  expectedZikr: string;
  feedback: string;
}

export function verifyRecitation(
  detectedText: string,
  expectedZikrArabic: string,
): RecitationVerification {
  const match = matchArabicRecitation(detectedText);

  if (!match.zikrKey) {
    // Check if any Arabic was detected at all
    const hasArabic = /[\u0600-\u06FF]/.test(detectedText);
    return {
      isCorrect: false,
      confidence: 0,
      detectedZikr: null,
      expectedZikr: expectedZikrArabic,
      feedback: hasArabic ? 'Keep going — recite clearly' : 'No Arabic detected. Please try again',
    };
  }

  // Check if the detected zikr matches what we expect
  const expectedKey = findZikrKey(expectedZikrArabic);
  const isCorrect = expectedKey ? match.zikrKey === expectedKey : match.confidence > 0.5;

  return {
    isCorrect,
    confidence: match.confidence,
    detectedZikr: match.matchedPhrase,
    expectedZikr: expectedZikrArabic,
    feedback: isCorrect
      ? 'MashaAllah! Correct recitation detected'
      : `Detected: "${match.matchedPhrase}" — expected: "${expectedZikrArabic}"`,
  };
}

function findZikrKey(arabic: string): string | null {
  for (const [key, phrases] of Object.entries(ARABIC_ZIKR_KEYWORDS)) {
    for (const phrase of phrases) {
      if (arabic.includes(phrase) || phrase.includes(arabic)) {
        return key;
      }
    }
  }
  return null;
}

// ─── Status ───

export function isVoskAvailable(): boolean {
  return Platform.OS === 'android' && !!Vosk;
}

export function isVoskListening(): boolean {
  return isListening;
}

export function isVoskModelLoaded(): boolean {
  return isModelLoaded;
}
