// ─── UmmahAPI Client ───
// https://ummahapi.com
// FREE Islamic API — Hadith (36K+), Quran, Tafsir, Prayer Times, Qibla, Hijri, Duas, 99 Names
// Replaces sunnah.com (not free) as our primary hadith/Quran source

import { ENV } from '../config/env';

const BASE_URL = ENV.UMMAH_API_BASE;
const API_KEY = ENV.UMMAH_API_KEY;

// ─── Core Fetch ───

async function apiFetch<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('api_key', API_KEY);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`UmmahAPI ${res.status}: ${text.slice(0, 200)}`);
    }
    const json: any = await res.json();
    if (!json.success) {
      throw new Error(`UmmahAPI error: ${json.message || 'Unknown'}`);
    }
    return json.data ?? json;
  } catch (error: any) {
    if (error.message?.includes('Failed to fetch') || error.message?.includes('Network request failed')) {
      throw new Error('OFFLINE');
    }
    throw error;
  }
}

// ═══════════════════════════════════════
// HADITH
// ═══════════════════════════════════════

export interface UmmahHadithCollection {
  key: string;
  name: string;
  arabic_name: string;
  author: string;
  reliability: string;
  total_hadiths: number;
}

export interface UmmahHadith {
  collection: string;
  hadith_number: number | string;
  arabic: string;
  english: string;
  narrator?: string;
  reference?: string;
  grade?: string;
  book_number?: string;
  chapter?: string;
}

export interface UmmahHadithBook {
  book_number: string;
  book_name: string;
  arabic_book_name: string;
  hadith_start_number: number;
  hadith_end_number: number;
  number_of_hadiths: number;
}

export async function getHadithCollections(): Promise<{ collections: UmmahHadithCollection[]; total_hadiths: number }> {
  return apiFetch('/hadith/collections');
}

export async function getHadithsByBook(collection: string, bookNumber: string, page?: number, limit?: number): Promise<{ hadiths: UmmahHadith[]; total: number }> {
  const params: Record<string, string | number> = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  return apiFetch(`/hadith/${collection}/books/${bookNumber}`, params);
}

export async function getHadith(collection: string, hadithNumber: string | number): Promise<UmmahHadith> {
  return apiFetch(`/hadith/${collection}/${hadithNumber}`);
}

export async function getRandomHadith(): Promise<UmmahHadith> {
  return apiFetch('/hadith/random');
}

export async function getHadithBooks(collection: string): Promise<{ books: UmmahHadithBook[] }> {
  return apiFetch(`/hadith/${collection}/books`);
}

export const HADITH_COLLECTIONS = {
  bukhari: 'bukhari',
  muslim: 'muslim',
  tirmidhi: 'tirmidhi',
  abudawud: 'abudawud',
  nasai: 'nasai',
  ibnmajah: 'ibnmajah',
  malik: 'malik',
} as const;

export type HadithCollectionName = keyof typeof HADITH_COLLECTIONS;

// ═══════════════════════════════════════
// QURAN
// ═══════════════════════════════════════

export interface UmmahSurah {
  number: number;
  name: string;
  english_name: string;
  arabic_name: string;
  revelation_type: string;
  number_of_ayahs: number;
}

export interface UmmahAyah {
  number: number;
  text: string;
  translation: string;
  transliteration?: string;
  number_in_surah: number;
  juz: number;
  sajda: boolean;
  audio_url?: string;
}

export async function getSurahs(): Promise<{ surahs: UmmahSurah[] }> {
  return apiFetch('/quran/surahs');
}

export async function getSurah(surahNumber: number, edition?: string): Promise<{ surah: UmmahSurah; ayahs: UmmahAyah[] }> {
  const path = edition ? `/quran/surah/${surahNumber}/${edition}` : `/quran/surah/${surahNumber}`;
  return apiFetch(path);
}

export async function getAyah(surahNumber: number, ayahNumber: number, edition?: string): Promise<UmmahAyah> {
  const path = edition ? `/quran/surah/${surahNumber}/ayah/${ayahNumber}/${edition}` : `/quran/surah/${surahNumber}/ayah/${ayahNumber}`;
  return apiFetch(path);
}

export async function getRandomAyah(): Promise<UmmahAyah> {
  return apiFetch('/quran/random');
}

export async function searchQuran(query: string, language?: string): Promise<{ matches: UmmahAyah[]; total: number }> {
  const params: Record<string, string | number> = { q: query };
  if (language) params.language = language;
  return apiFetch('/quran/search', params);
}

// ═══════════════════════════════════════
// PRAYER TIMES & QIBLA
// ═══════════════════════════════════════

export interface UmmahPrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  imsak: string;
  midnight: string;
  date: string;
  hijri_date: string;
  timezone: string;
}

export async function getPrayerTimes(latitude: number, longitude: number, method?: number, madhab?: string): Promise<UmmahPrayerTimes> {
  const params: Record<string, string | number> = { lat: latitude, lng: longitude };
  if (method) params.method = method;
  if (madhab) params.madhab = madhab;
  return apiFetch('/prayer-times', params);
}

export async function getQiblaDirection(latitude: number, longitude: number): Promise<{ direction: number; latitude: number; longitude: number }> {
  return apiFetch('/qibla', { lat: latitude, lng: longitude });
}

export async function getPrayerMethods(): Promise<{ methods: Array<{ id: number; name: string }> }> {
  return apiFetch('/prayer-methods');
}

// ═══════════════════════════════════════
// HIJRI CALENDAR
// ═══════════════════════════════════════

export interface UmmahHijriDate {
  hijri: { date: string; day: number; month: { number: number; en: string; ar: string }; year: number; designation: string };
  gregorian: { date: string; day: number; month: { number: number; en: string }; year: number };
}

export async function getTodayHijri(): Promise<UmmahHijriDate> {
  return apiFetch('/today-hijri');
}

export async function getIslamicMonths(): Promise<{ months: Array<{ number: number; en: string; ar: string }> }> {
  return apiFetch('/islamic-months');
}

export async function getIslamicEvents(): Promise<{ events: Array<{ name: string; date: string; description: string }> }> {
  return apiFetch('/islamic-events');
}

// ═══════════════════════════════════════
// DUAS
// ═══════════════════════════════════════

export interface UmmahDuaCategory {
  id: string;
  name: string;
  description: string;
  count: number;
}

export interface UmmahDua {
  id: string;
  category: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  audio_url?: string;
}

export async function getDuaCategories(): Promise<{ categories: UmmahDuaCategory[] }> {
  return apiFetch('/duas/categories');
}

export async function getDuasByCategory(categoryId: string): Promise<{ duas: UmmahDua[] }> {
  return apiFetch(`/duas/category/${categoryId}`);
}

export async function getRandomDua(): Promise<UmmahDua> {
  return apiFetch('/duas/random');
}

// ═══════════════════════════════════════
// ASMA UL HUSNA (99 Names)
// ═══════════════════════════════════════

export interface UmmahNameOfAllah {
  number: number;
  name: string;
  transliteration: string;
  meaning: string;
  arabic_name: string;
}

export async function getAsmaUlHusna(): Promise<{ names: UmmahNameOfAllah[] }> {
  return apiFetch('/asma-ul-husna');
}

export async function getRandomNameOfAllah(): Promise<UmmahNameOfAllah> {
  return apiFetch('/asma-ul-husna/random');
}

export async function searchAsmaUlHusna(query: string): Promise<{ names: UmmahNameOfAllah[] }> {
  return apiFetch('/asma-ul-husna/search', { q: query });
}

// ═══════════════════════════════════════
// TAFSIR
// ═══════════════════════════════════════

export interface UmmahTafsir {
  surah: number;
  ayah: number;
  tafsir: string;
  source: string;
}

export async function getTafsir(source: string, surahNumber: number, ayahNumber: number): Promise<UmmahTafsir> {
  return apiFetch(`/tafsir/${source}/surah/${surahNumber}/ayah/${ayahNumber}`);
}

export async function getAvailableTafsir(): Promise<{ sources: Array<{ key: string; name: string; language: string }> }> {
  return apiFetch('/tafsir');
}

// ═══════════════════════════════════════
// WORD-BY-WORD QURAN
// ═══════════════════════════════════════

export interface UmmahQuranWord {
  word_number: number;
  arabic: string;
  transliteration: string;
  translation: string;
}

export async function getQuranWords(surahNumber: number, ayahNumber: number): Promise<{ words: UmmahQuranWord[] }> {
  return apiFetch(`/quran/words/${surahNumber}/${ayahNumber}`);
}

// ═══════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════

export async function checkUmmahApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const json: any = await res.json();
    return json.status === 'ok' || json.success === true;
  } catch {
    return false;
  }
}
