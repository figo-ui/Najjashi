// ─── Hadith Service ───
// App-level service using UmmahAPI (https://ummahapi.com)
// Provides daily hadith, contextual hadith for adhkar, and collection browsing

import {
  getRandomHadith,
  getHadith,
  getHadithsByBook,
  getHadithCollections,
  getHadithBooks,
  HADITH_COLLECTIONS,
  type UmmahHadith,
  type UmmahHadithCollection,
  type UmmahHadithBook,
} from './sunnahApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Cache Keys ───

const CACHE_DAILY_HADITH = 'najjashi_daily_hadith';
const CACHE_HADITH_COLLECTIONS = 'najjashi_collections';
const CACHE_BOOKS_PREFIX = 'najjashi_books_';
const CACHE_HADITH_PREFIX = 'najjashi_hadiths_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

// ─── App-Level Types ───

export interface AppHadith {
  id: string;
  collection: string;
  bookNumber: string;
  hadithNumber: string;
  arabic: string;
  english: string;
  chapterTitle: string;
  grades: Array<{ graded_by: string; grade: string }>;
  narrator: string;
  reference: string;
}

export interface DailyHadith extends AppHadith {
  date: string; // ISO date
  collectionTitle: string;
}

// ─── Cache Helper ───

async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    console.warn('[HadithService] Cache write failed:', e);
  }
}

// ─── Map raw UmmahHadith to AppHadith ───

function mapToAppHadith(raw: UmmahHadith): AppHadith {
  return {
    id: `${raw.collection}:${raw.hadith_number}`,
    collection: raw.collection,
    bookNumber: raw.book_number ?? '',
    hadithNumber: String(raw.hadith_number),
    arabic: raw.arabic ?? '',
    english: raw.english ?? '',
    chapterTitle: raw.chapter ?? '',
    grades: raw.grade ? [{ graded_by: 'Scholar', grade: raw.grade }] : [],
    narrator: raw.narrator ?? '',
    reference: raw.reference ?? '',
  };
}

// ─── Daily Hadith ───

export async function getDailyHadith(): Promise<DailyHadith | null> {
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `${CACHE_DAILY_HADITH}_${today}`;

  const cached = await getCached<DailyHadith>(cacheKey);
  if (cached) return cached;

  try {
    const raw = await getRandomHadith();
    const app = mapToAppHadith(raw);

    // Get collection title
    let collectionTitle = raw.collection;
    try {
      const colData = await getHadithCollections();
      const col = colData.collections.find((c: UmmahHadithCollection) => c.key === raw.collection);
      if (col) collectionTitle = col.name;
    } catch {}

    const daily: DailyHadith = {
      ...app,
      date: today,
      collectionTitle,
    };

    await setCache(cacheKey, daily);
    return daily;
  } catch (e) {
    console.warn('[HadithService] Daily hadith failed:', e);
    return null;
  }
}

// ─── Hadiths for Adhkar Context ───

const ADHKAR_HADITH_MAP: Record<string, { collection: string; bookNumber: string }[]> = {
  morning: [
    { collection: HADITH_COLLECTIONS.bukhari, bookNumber: '19' },
    { collection: HADITH_COLLECTIONS.muslim, bookNumber: '1' },
  ],
  evening: [
    { collection: HADITH_COLLECTIONS.bukhari, bookNumber: '56' },
    { collection: HADITH_COLLECTIONS.muslim, bookNumber: '2' },
  ],
  after_prayer: [
    { collection: HADITH_COLLECTIONS.muslim, bookNumber: '5' },
    { collection: HADITH_COLLECTIONS.bukhari, bookNumber: '10' },
  ],
  sleep: [
    { collection: HADITH_COLLECTIONS.bukhari, bookNumber: '21' },
  ],
};

export async function getAdhkarHadiths(adhkarTime: string, limit = 3): Promise<AppHadith[]> {
  const refs = ADHKAR_HADITH_MAP[adhkarTime] ?? ADHKAR_HADITH_MAP.morning;
  const hadiths: AppHadith[] = [];

  for (const ref of refs) {
    if (hadiths.length >= limit) break;
    try {
      const cacheKey = `${CACHE_HADITH_PREFIX}${ref.collection}_${ref.bookNumber}`;
      let bookHadiths = await getCached<AppHadith[]>(cacheKey);

      if (!bookHadiths) {
        const res = await getHadithsByBook(ref.collection, ref.bookNumber, 1, limit);
        bookHadiths = (res.hadiths ?? []).map(mapToAppHadith);
        await setCache(cacheKey, bookHadiths);
      }

      hadiths.push(...(bookHadiths ?? []).slice(0, limit - hadiths.length));
    } catch (e) {
      console.warn(`[HadithService] Adhkar hadiths failed for ${adhkarTime}:`, e);
    }
  }

  return hadiths.slice(0, limit);
}

// ─── Collections Browser ───

export async function browseCollections(): Promise<UmmahHadithCollection[]> {
  const cached = await getCached<UmmahHadithCollection[]>(CACHE_HADITH_COLLECTIONS);
  if (cached) return cached;

  try {
    const res = await getHadithCollections();
    await setCache(CACHE_HADITH_COLLECTIONS, res.collections);
    return res.collections;
  } catch (e) {
    console.warn('[HadithService] Browse collections failed:', e);
    return [];
  }
}

export async function browseBooks(collectionName: string): Promise<UmmahHadithBook[]> {
  const cacheKey = `${CACHE_BOOKS_PREFIX}${collectionName}`;
  const cached = await getCached<UmmahHadithBook[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await getHadithBooks(collectionName);
    await setCache(cacheKey, res.books);
    return res.books;
  } catch (e) {
    console.warn('[HadithService] Browse books failed:', e);
    return [];
  }
}

export async function browseHadiths(collectionName: string, bookNumber: string, page = 1): Promise<{ hadiths: AppHadith[]; total: number; nextPage: number | null }> {
  const cacheKey = `${CACHE_HADITH_PREFIX}${collectionName}_${bookNumber}_${page}`;
  const cached = await getCached<{ hadiths: AppHadith[]; total: number; nextPage: number | null }>(cacheKey);
  if (cached) return cached;

  try {
    const res = await getHadithsByBook(collectionName, bookNumber, page, 20);
    const result = {
      hadiths: (res.hadiths ?? []).map(mapToAppHadith),
      total: res.total,
      nextPage: null as number | null, // UmmahAPI doesn't return next page
    };
    await setCache(cacheKey, result);
    return result;
  } catch (e) {
    console.warn('[HadithService] Browse hadiths failed:', e);
    return { hadiths: [], total: 0, nextPage: null };
  }
}

// ─── Single Hadith ───

export async function getSingleHadith(collectionName: string, hadithNumber: string): Promise<AppHadith | null> {
  try {
    const raw = await getHadith(collectionName, hadithNumber);
    return mapToAppHadith(raw);
  } catch (e) {
    console.warn('[HadithService] Get hadith failed:', e);
    return null;
  }
}

// ─── Contextual Hadith for AI Recommendations ───

export async function getContextualHadith(
  context: 'prayer' | 'patience' | 'gratitude' | 'charity' | 'knowledge' | 'mercy',
): Promise<AppHadith | null> {
  const CONTEXT_BOOKS: Record<string, { collection: string; bookNumber: string }[]> = {
    prayer: [{ collection: HADITH_COLLECTIONS.bukhari, bookNumber: '10' }],
    patience: [{ collection: HADITH_COLLECTIONS.bukhari, bookNumber: '78' }],
    gratitude: [{ collection: HADITH_COLLECTIONS.muslim, bookNumber: '2' }],
    charity: [{ collection: HADITH_COLLECTIONS.bukhari, bookNumber: '24' }],
    knowledge: [{ collection: HADITH_COLLECTIONS.bukhari, bookNumber: '3' }],
    mercy: [{ collection: HADITH_COLLECTIONS.bukhari, bookNumber: '78' }],
  };

  const refs = CONTEXT_BOOKS[context] ?? CONTEXT_BOOKS.knowledge;
  if (!refs.length) return null;

  try {
    const ref = refs[0];
    const res = await getHadithsByBook(ref.collection, ref.bookNumber, 1, 10);
    const hadiths = res.hadiths ?? [];
    if (hadiths.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * Math.min(hadiths.length, 5));
    return mapToAppHadith(hadiths[randomIndex]);
  } catch (e) {
    console.warn('[HadithService] Contextual hadith failed:', e);
    return null;
  }
}
