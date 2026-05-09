// ─── Al Quran Cloud API Client ───
// https://alquran.cloud/api
// Free Quran text, translations, and audio recitations

const BASE_URL = 'https://api.alquran.cloud/v1';

interface QuranRequestOptions {
  params?: Record<string, string>;
}

// ─── Raw API Types ───

export interface QuranSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
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
  surah: QuranSurah;
}

export interface QuranEdition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
  direction: string;
}

export interface QuranAudio {
  ayah: QuranAyah;
  audio: string;
  audioSecondary: string[];
}

export interface JuzData {
  number: number;
  ayahs: QuranAyah[];
  surahs: QuranSurah[];
}

// ─── Core Fetch ───

async function apiFetch<T>(path: string, opts?: QuranRequestOptions): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (opts?.params) {
    Object.entries(opts.params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.warn(`[AlQuran] ${res.status} ${path}`);
    throw new Error(`AlQuran ${res.status}: ${path}`);
  }
  const json: any = await res.json();
  return json.data;
}

// ─── Surahs ───

export async function getSurahs(): Promise<QuranSurah[]> {
  return apiFetch('/surah');
}

export async function getSurah(surahNumber: number, edition?: string): Promise<QuranAyah[]> {
  const path = edition ? `/surah/${surahNumber}/${edition}` : `/surah/${surahNumber}`;
  return apiFetch(path);
}

// ─── Ayah ───

export async function getAyah(ayahRef: number | string, edition?: string): Promise<QuranAyah> {
  const path = edition ? `/ayah/${ayahRef}/${edition}` : `/ayah/${ayahRef}`;
  return apiFetch(path);
}

// ─── Juz ───

export async function getJuz(juzNumber: number, edition?: string): Promise<JuzData> {
  const path = edition ? `/juz/${juzNumber}/${edition}` : `/juz/${juzNumber}`;
  return apiFetch(path);
}

// ─── Search ───

export async function searchQuran(query: string, language = 'en', surah?: number): Promise<QuranAyah[]> {
  const params: Record<string, string> = { language };
  if (surah) params.surah = String(surah);
  return apiFetch(`/search/${encodeURIComponent(query)}`, { params });
}

// ─── Audio ───

export async function getAyahAudio(ayahNumber: number, reciter = 'ar.alafasy'): Promise<QuranAudio> {
  return apiFetch(`/ayah/${ayahNumber}/${reciter}`);
}

// ─── Editions / Translations ───

export async function getEditions(type?: string, language?: string): Promise<QuranEdition[]> {
  const params: Record<string, string> = {};
  if (type) params.type = type;
  if (language) params.language = language;
  return apiFetch('/edition', { params });
}

// ─── Convenience: Random Ayah ───

export async function getRandomAyah(translationEdition = 'en.sahih'): Promise<{ arabic: QuranAyah; translation: QuranAyah }> {
  const ayahNum = Math.floor(Math.random() * 6236) + 1;
  const [arabic, translation] = await Promise.all([
    getAyah(ayahNum),
    getAyah(ayahNum, translationEdition),
  ]);
  return { arabic, translation };
}

// ─── Key Translation Editions ───

export const QURAN_EDITIONS = {
  arabicUthmani: 'quran-uthmani-quran-academy',
  sahihInternational: 'en.sahih',
  pickthall: 'en.pickthall',
  yusufAli: 'en.yusufali',
  amharic: 'am.sadiq_hasan', // may not exist, fallback to en
} as const;
