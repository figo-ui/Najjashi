import { ENV } from '../config/env';

// ─── API Configuration ───

const SUNNAH_BASE = 'https://api.sunnah.com/v1';
const SUNNAH_KEY = ENV.SUNNAH_API_KEY;
const QURAN_BASE = 'https://api.alquran.cloud/v1';
const ALADHAN_BASE = 'https://api.aladhan.com/v1';

// ─── Types ───

export interface HadithCollection {
  name: string;
  hasBooks: boolean;
  hasChapters: boolean;
  collection: Array<{
    bookNumber: string;
    book: Array<{
      lang: string;
      name: string;
    }>;
    hadithStartNumber: number;
    hadithEndNumber: number;
    numberOfHadith: number;
  }>;
}

export interface Hadith {
  collection: string;
  bookNumber: string;
  chapterId: string;
  hadithNumber: string;
  hadith: Array<{
    lang: string;
    chapterTitle: string;
    body: string;
    grades: Array<{ gradedBy: string; grade: string }>;
  }>;
}

export interface QuranSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface QuranAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

export interface PrayerTimeResult {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
}

export interface HisnulMuslimEntry {
  reference: string;
  arabic: string;
  english: string;
  title: string;
}

// ─── Generic Fetch with Auth ───

async function apiFetch(url: string, options: RequestInit = {}): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Add Sunnah API key if hitting sunnah.com
  if (url.includes('sunnah.com')) {
    headers['x-api-key'] = SUNNAH_KEY;
  }

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`API ${response.status}: ${errorBody.slice(0, 200)}`);
    }
    return response.json();
  } catch (error: any) {
    if (error.message?.includes('Failed to fetch') || error.message?.includes('Network request failed')) {
      throw new Error('OFFLINE');
    }
    throw error;
  }
}

// ═══════════════════════════════════════════
// SUNNAH.COM API — Hadith Collections
// ═══════════════════════════════════════════

export async function getHadithCollections(): Promise<HadithCollection[]> {
  const data = await apiFetch(`${SUNNAH_BASE}/collections`);
  return data.data ?? [];
}

export async function getHadithsByCollection(
  collectionName: string,
  bookNumber: string,
  page: number = 1,
  limit: number = 50
): Promise<Hadith[]> {
  const data = await apiFetch(
    `${SUNNAH_BASE}/collections/${collectionName}/books/${bookNumber}/hadiths?page=${page}&limit=${limit}`
  );
  return data.data ?? [];
}

export async function getSpecificHadith(
  collectionName: string,
  hadithNumber: string
): Promise<Hadith | null> {
  try {
    const data = await apiFetch(
      `${SUNNAH_BASE}/collections/${collectionName}/hadiths/${hadithNumber}`
    );
    return data.data ?? null;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════
// ALQURAN.CLOUD API — Quran Text & Audio
// ═══════════════════════════════════════════

export async function getAllSurahs(): Promise<QuranSurah[]> {
  const data = await apiFetch(`${QURAN_BASE}/surah`);
  return data.data ?? [];
}

export async function getSurah(surahNumber: number, edition: string = 'quran-uthmani'): Promise<{
  surah: QuranSurah;
  ayahs: QuranAyah[];
}> {
  const data = await apiFetch(`${QURAN_BASE}/surah/${surahNumber}/${edition}`);
  return {
    surah: data.data,
    ayahs: data.data?.ayahs ?? [],
  };
}

export async function getAyah(
  ayahNumber: number,
  edition: string = 'quran-uthmani'
): Promise<QuranAyah & { surah: QuranSurah }> {
  const data = await apiFetch(`${QURAN_BASE}/ayah/${ayahNumber}/${edition}`);
  return data.data;
}

export async function getQuranTranslation(
  surahNumber: number,
  edition: string = 'en.sahih'
): Promise<{ ayahs: Array<{ number: number; numberInSurah: number; text: string }> }> {
  const data = await apiFetch(`${QURAN_BASE}/surah/${surahNumber}/${edition}`);
  return { ayahs: data.data?.ayahs ?? [] };
}

export async function getQuranAudio(
  surahNumber: number,
  reciter: string = 'ar.alafasy'
): Promise<{ ayahs: Array<{ number: number; audio: string; audioSecondary: string[] }> }> {
  const data = await apiFetch(`${QURAN_BASE}/surah/${surahNumber}/${reciter}`);
  return { ayahs: data.data?.ayahs ?? [] };
}

export async function searchQuran(
  query: string,
  surah?: number,
  edition: string = 'en.sahih'
): Promise<Array<{ surah: QuranSurah; ayahs: QuranAyah[] }>> {
  const url = surah
    ? `${QURAN_BASE}/search/${encodeURIComponent(query)}/all/${edition}?surah=${surah}`
    : `${QURAN_BASE}/search/${encodeURIComponent(query)}/all/${edition}`;
  const data = await apiFetch(url);
  return data.data?.matches ?? [];
}

// ═══════════════════════════════════════════
// ALADHAN API — Prayer Times & Hijri Date
// ═══════════════════════════════════════════

export async function getPrayerTimes(
  latitude: number,
  longitude: number,
  method: number = 3, // MWL
  date?: string // DD-MM-YYYY
): Promise<PrayerTimeResult> {
  const d = date || new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const data = await apiFetch(
    `${ALADHAN_BASE}/timings/${d}?latitude=${latitude}&longitude=${longitude}&method=${method}`
  );
  const t = data.data?.timings;
  return {
    fajr: t?.Fajr ?? '',
    sunrise: t?.Sunrise ?? '',
    dhuhr: t?.Dhuhr ?? '',
    asr: t?.Asr ?? '',
    maghrib: t?.Maghrib ?? '',
    isha: t?.Isha ?? '',
    date: data.data?.date?.gregorian?.date ?? '',
  };
}

export async function getHijriDate(
  latitude: number,
  longitude: number,
  method: number = 3
): Promise<{
  hijri: { date: string; day: string; month: { number: number; en: string; ar: string }; year: string; designation: { abbreviated: string } };
  gregorian: { date: string; day: string; month: { number: number; en: string }; year: string };
}> {
  const d = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const data = await apiFetch(
    `${ALADHAN_BASE}/timings/${d}?latitude=${latitude}&longitude=${longitude}&method=${method}`
  );
  return data.data?.date ?? {};
}

// ═══════════════════════════════════════════
// HISNUL MUSLIM — Local Dataset
// ═══════════════════════════════════════════

let cachedHisnulMuslim: HisnulMuslimEntry[] | null = null;

export async function getHisnulMuslimData(): Promise<HisnulMuslimEntry[]> {
  if (cachedHisnulMuslim) return cachedHisnulMuslim;

  try {
    // Load from bundled JSON
    const data = require('../../data/hisnulmuslim.json');
    cachedHisnulMuslim = data;
    return data;
  } catch {
    return [];
  }
}

export async function getHisnulMuslimByChapter(chapterTitle: string): Promise<HisnulMuslimEntry[]> {
  const all = await getHisnulMuslimData();
  return all.filter(e => e.title.toLowerCase().includes(chapterTitle.toLowerCase()));
}

export async function getMorningAdhkarFromHisnul(): Promise<HisnulMuslimEntry[]> {
  const all = await getHisnulMuslimData();
  return all.filter(e =>
    e.title.toLowerCase().includes('morning') ||
    e.title.toLowerCase().includes('waking up') ||
    e.title.toLowerCase().includes('after waking')
  );
}

export async function getEveningAdhkarFromHisnul(): Promise<HisnulMuslimEntry[]> {
  const all = await getHisnulMuslimData();
  return all.filter(e =>
    e.title.toLowerCase().includes('evening') ||
    e.title.toLowerCase().includes('before sleeping') ||
    e.title.toLowerCase().includes('sleep') ||
    e.title.toLowerCase().includes('before going to bed')
  );
}

export async function searchHisnulMuslim(query: string): Promise<HisnulMuslimEntry[]> {
  const all = await getHisnulMuslimData();
  const q = query.toLowerCase();
  return all.filter(e =>
    e.arabic.includes(query) ||
    e.english.toLowerCase().includes(q) ||
    e.title.toLowerCase().includes(q) ||
    e.reference.toLowerCase().includes(q)
  );
}

// ═══════════════════════════════════════════
// COMBINED AI SERVICE — Smart Fetch with Fallbacks
// ═══════════════════════════════════════════

export interface AdhkarWithSource {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  category: string;
  source: 'hisnul_muslim' | 'sunnah_api' | 'local';
  count?: number;
  reward?: string;
}

/**
 * Parse the Hisnul Muslim "english" field which contains
 * transliteration, translation, and reference mixed together.
 */
export function parseHisnulEnglishField(english: string): {
  transliteration: string;
  translation: string;
  reference: string;
} {
  const parts = english.split('\n\n');

  let transliteration = '';
  let translation = '';
  let reference = '';

  // Find the reference section (starts with "Reference:")
  const refIndex = parts.findIndex(p => p.trim().startsWith('Reference:'));
  if (refIndex >= 0) {
    reference = parts.slice(refIndex).join('\n\n').trim();
    const contentParts = parts.slice(0, refIndex);
    // First part(s) are transliteration, last part(s) are translation
    // Arabic transliteration typically contains special chars like ḥ, ṣ, ʿ
    const hasTransliteration = contentParts.length > 1 ||
      contentParts[0]?.match(/[ḥṣʿḍṭḍāīū]/);

    if (contentParts.length >= 2) {
      transliteration = contentParts[0].trim();
      translation = contentParts.slice(1).join('\n\n').trim();
    } else if (hasTransliteration && contentParts.length === 1) {
      // Mixed — try to split at the first English sentence
      const lines = contentParts[0].split('\n');
      const transLines: string[] = [];
      const engLines: string[] = [];
      let inEnglish = false;

      for (const line of lines) {
        if (!inEnglish && line.match(/^[A-Z][a-z]/) && !line.match(/[ḥṣʿḍṭḍāīū]/)) {
          inEnglish = true;
        }
        if (inEnglish) {
          engLines.push(line);
        } else {
          transLines.push(line);
        }
      }

      transliteration = transLines.join('\n').trim();
      translation = engLines.join('\n').trim();
    } else {
      translation = contentParts.join('\n\n').trim();
    }
  } else {
    // No reference found — treat all as translation
    translation = english.trim();
  }

  return { transliteration, translation, reference };
}

/**
 * Get enriched adhkar for a specific time of day,
 * combining local data with Hisnul Muslim entries.
 */
export async function getEnrichedAdhkar(
  time: 'morning' | 'evening' | 'sleep'
): Promise<AdhkarWithSource[]> {
  const results: AdhkarWithSource[] = [];

  // 1. Get from Hisnul Muslim
  try {
    const hisnulEntries = time === 'morning'
      ? await getMorningAdhkarFromHisnul()
      : time === 'evening'
        ? await getEveningAdhkarFromHisnul()
        : await getHisnulMuslimByChapter('sleep');

    hisnulEntries.forEach((entry, i) => {
      const parsed = parseHisnulEnglishField(entry.english);
      results.push({
        id: `hisnul_${time}_${i}`,
        arabic: entry.arabic.replace(/\n/g, ' ').trim(),
        transliteration: parsed.transliteration.replace(/\n/g, ' ').trim(),
        translation: parsed.translation.replace(/\n/g, ' ').trim(),
        reference: parsed.reference.replace(/\n/g, ' ').trim(),
        category: time,
        source: 'hisnul_muslim',
      });
    });
  } catch (e) {
    // Hisnul Muslim not available — continue with local
  }

  return results;
}

/**
 * Check which APIs are reachable (for offline detection)
 */
export async function checkApiConnectivity(): Promise<{
  quran: boolean;
  hadith: boolean;
  prayerTimes: boolean;
  hisnulMuslim: boolean;
}> {
  const results = { quran: false, hadith: false, prayerTimes: false, hisnulMuslim: false };

  // Check alquran.cloud
  try {
    await apiFetch(`${QURAN_BASE}/surah`);
    results.quran = true;
  } catch {}

  // Check sunnah.com
  try {
    await apiFetch(`${SUNNAH_BASE}/collections`);
    results.hadith = true;
  } catch {}

  // Check aladhan
  try {
    await apiFetch(`${ALADHAN_BASE}/methods`);
    results.prayerTimes = true;
  } catch {}

  // Check local Hisnul Muslim
  try {
    const data = await getHisnulMuslimData();
    results.hisnulMuslim = data.length > 0;
  } catch {}

  return results;
}
