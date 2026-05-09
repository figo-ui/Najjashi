// ─── Duas Service ───
// Primary: Local Hisnul Muslim dataset (bundled, offline-ready)
// Secondary: IslamicAPI.com (requires API key, online only)
// NOTE: duas.muslim-api.com is defunct — removed

import { searchHisnulMuslim, getEnrichedAdhkarByTime } from './localData';
import type { AdhkarTime } from '../types';

// ─── Types ───

export interface DuaEntry {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  category: string;
  chapter: string;
}

export interface DuaCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  count: number;
}

// ─── Hisnul Muslim Categories (mapped from chapter titles) ───

export const DUA_CATEGORIES: DuaCategory[] = [
  { id: 'morning', nameEn: 'Morning Adhkar', nameAr: 'أذكار الصباح', count: 0 },
  { id: 'evening', nameEn: 'Evening Adhkar', nameAr: 'أذكار المساء', count: 0 },
  { id: 'sleep', nameEn: 'Sleep Adhkar', nameAr: 'أذكار النوم', count: 0 },
  { id: 'prayer', nameEn: 'Prayer', nameAr: 'الصلاة', count: 0 },
  { id: 'quran', nameEn: 'Quran & Recitation', nameAr: 'القرآن', count: 0 },
  { id: 'protection', nameEn: 'Protection', nameAr: 'الحماية', count: 0 },
  { id: 'illness', nameEn: 'Illness & Health', nameAr: 'المرض والصحة', count: 0 },
  { id: 'travel', nameEn: 'Travel', nameAr: 'السفر', count: 0 },
  { id: 'food', nameEn: 'Food & Eating', nameAr: 'الطعام', count: 0 },
  { id: 'forgiveness', nameEn: 'Forgiveness', nameAr: 'الاستغفار', count: 0 },
];

// ─── Get Duas by Category ───

export async function getDuasByCategory(categoryId: string): Promise<DuaEntry[]> {
  // For adhkar time categories, use enriched local data
  if (['morning', 'evening', 'sleep'].includes(categoryId)) {
    const adhkar = getEnrichedAdhkarByTime(categoryId as AdhkarTime);
    return adhkar.map(a => ({
      id: a.id,
      arabic: a.arabic,
      transliteration: a.transliteration,
      translation: a.translation,
      reference: a.reward || '',
      category: categoryId,
      chapter: a.category,
    }));
  }

  // For other categories, search Hisnul Muslim by keywords
  const keywordMap: Record<string, string[]> = {
    prayer: ['prayer', 'after the prayer', 'mosque', 'adhan', 'call to prayer', 'ablution'],
    quran: ['quran', 'reciting', 'reading'],
    protection: ['protection', 'seeking refuge', 'evil eye', 'dajjal', 'shirk'],
    illnes: ['illness', 'sick', 'health', 'calamity', 'pain'],
    travel: ['travel', 'mounting', 'journey', 'returning', 'animal'],
    food: ['eating', 'food', 'fast', 'meal', 'fruit', 'sneezing', 'drink'],
    forgiveness: ['forgiveness', 'repentance', 'seeking forgiveness', 'tasbih', 'tahmid'],
  };

  const keywords = keywordMap[categoryId] || [categoryId];
  const results: DuaEntry[] = [];

  for (const kw of keywords) {
    const found = searchHisnulMuslim(kw);
    found.forEach((entry: any, i: number) => {
      // Parse transliteration and translation from english field
      const parts: string[] = (entry.english || '').split('\n\n');
      const refIdx = parts.findIndex((p: string) => p.trim().startsWith('Reference:'));
      const reference = refIdx >= 0 ? parts.slice(refIdx).join('\n\n').trim() : entry.reference || '';
      const contentParts = refIdx >= 0 ? parts.slice(0, refIdx) : parts;
      const transliteration = contentParts[0]?.replace(/\n/g, ' ').trim() || '';
      const translation = contentParts.slice(1).join('\n\n').replace(/\n/g, ' ').trim() || contentParts[0]?.replace(/\n/g, ' ').trim() || '';

      results.push({
        id: `dua_${categoryId}_${i}_${entry.reference?.replace(/\s/g, '_') || i}`,
        arabic: (entry.arabic || '').replace(/\n/g, ' ').trim(),
        transliteration,
        translation,
        reference,
        category: categoryId,
        chapter: entry.title || '',
      });
    });
  }

  // Deduplicate by arabic text
  const seen = new Set<string>();
  return results.filter(d => {
    if (seen.has(d.arabic)) return false;
    seen.add(d.arabic);
    return true;
  });
}

// ─── Search Duas ───

export async function searchDuas(query: string): Promise<DuaEntry[]> {
  const results = searchHisnulMuslim(query);
  return results.map((entry: any, i: number) => {
    const parts = (entry.english || '').split('\n\n');
    const refIdx = parts.findIndex((p: string) => p.trim().startsWith('Reference:'));
    const reference = refIdx >= 0 ? parts.slice(refIdx).join('\n\n').trim() : entry.reference || '';
    const contentParts = refIdx >= 0 ? parts.slice(0, refIdx) : parts;
    const transliteration = contentParts[0]?.replace(/\n/g, ' ').trim() || '';
    const translation = contentParts.slice(1).join('\n\n').replace(/\n/g, ' ').trim() || contentParts[0]?.replace(/\n/g, ' ').trim() || '';

    return {
      id: `dua_search_${i}`,
      arabic: (entry.arabic || '').replace(/\n/g, ' ').trim(),
      transliteration,
      translation,
      reference,
      category: entry.title?.toLowerCase().includes('morning') ? 'morning'
        : entry.title?.toLowerCase().includes('evening') ? 'evening'
        : entry.title?.toLowerCase().includes('sleep') ? 'sleep'
        : 'other',
      chapter: entry.title || '',
    };
  });
}
