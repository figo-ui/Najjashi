// ─── Aladhan.com Prayer Times API Client ───
// https://aladhan.com/prayer-times-api
// Free, accurate prayer times with multiple calculation methods

const BASE_URL = 'https://api.aladhan.com/v1';

// ─── Raw API Types ───

export interface AladhanTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
}

export interface AladhanDate {
  readable: string;
  timestamp: string;
  hijri: {
    date: string;
    format: string;
    day: string;
    weekday: { en: string; ar: string };
    month: { number: number; en: string; ar: string };
    year: string;
    designation: { abbreviated: string; expanded: string };
    holidays: string[];
  };
  gregorian: {
    date: string;
    format: string;
    day: string;
    weekday: { en: string };
    month: { number: number; en: string };
    year: string;
    designation: { abbreviated: string; expanded: string };
  };
}

export interface AladhanMeta {
  latitude: number;
  longitude: number;
  timezone: string;
  method: {
    id: number;
    name: string;
  };
  latitudeAdjustmentMethod: string;
  midnightMode: string;
  school: string;
}

export interface AladhanPrayerTime {
  timings: AladhanTimings;
  date: AladhanDate;
  meta: AladhanMeta;
}

export interface AladhanHijriCalendar {
  data: AladhanPrayerTime[];
}

// ─── Calculation Methods ───

export const ALADHAN_METHODS = {
  MWL: 3,
  ISNA: 2,
  EGYPTIAN: 5,
  UMM_AL_QURA: 4,
  DUBAI: 12,
  QATAR: 13,
  KUWAIT: 14,
  TURKEY: 15,
  MOROCCO: 16,
  CUSTOM: 99,
} as const;

export type AladhanMethod = keyof typeof ALADHAN_METHODS;

// ─── Core Fetch ───

async function apiFetch<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.warn(`[Aladhan] ${res.status} ${path}`);
    throw new Error(`Aladhan ${res.status}: ${path}`);
  }
  const json: any = await res.json();
  return json.data;
}

// ─── Prayer Times by Coordinates ───

export async function getPrayerTimesByCoords(
  latitude: number,
  longitude: number,
  method: number = ALADHAN_METHODS.MWL,
  date?: string, // DD-MM-YYYY
): Promise<AladhanPrayerTime> {
  const datePath = date || formatDatePath(new Date());
  const data = await apiFetch<AladhanPrayerTime[]>(`/timings/${datePath}`, {
    latitude,
    longitude,
    method,
  });
  return Array.isArray(data) ? data[0] : data;
}

// ─── Prayer Times by City ───

export async function getPrayerTimesByCity(
  city: string,
  country: string,
  method: number = ALADHAN_METHODS.MWL,
  date?: string,
): Promise<AladhanPrayerTime> {
  const datePath = date || formatDatePath(new Date());
  const data = await apiFetch<AladhanPrayerTime[]>(`/timingsByCity/${datePath}`, {
    city,
    country,
    method,
  });
  return Array.isArray(data) ? data[0] : data;
}

// ─── Hijri Calendar ───

export async function getHijriCalendar(
  month: number,
  year: number,
  latitude: number,
  longitude: number,
  method: number = ALADHAN_METHODS.MWL,
): Promise<AladhanPrayerTime[]> {
  return apiFetch(`/hijriCalendar/${month}/${year}`, {
    latitude,
    longitude,
    method,
  });
}

// ─── Next Prayer ───

export function getNextPrayerFromTimings(timings: AladhanTimings): { name: string; time: string; minutesUntil: number } {
  const now = new Date();
  const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  for (const name of prayerOrder) {
    const timeStr = timings[name as keyof AladhanTimings];
    if (!timeStr) continue;
    const [h, m] = timeStr.split(':').map(Number);
    const prayerDate = new Date(now);
    prayerDate.setHours(h, m, 0, 0);
    const diff = prayerDate.getTime() - now.getTime();
    if (diff > 0) {
      return { name, time: timeStr, minutesUntil: Math.floor(diff / 60000) };
    }
  }

  // All prayers passed — next is tomorrow's Fajr
  const fajrTime = timings.Fajr;
  const [fh, fm] = fajrTime.split(':').map(Number);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(fh, fm, 0, 0);
  const diff = tomorrow.getTime() - now.getTime();
  return { name: 'Fajr', time: fajrTime, minutesUntil: Math.floor(diff / 60000) };
}

// ─── Helpers ───

function formatDatePath(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

// ─── Map Aladhan method to our app's method strings ───

export function mapCalcMethod(methodStr: string): number {
  const map: Record<string, number> = {
    MWL: 3,
    ISNA: 2,
    EGYPTIAN: 5,
    UMM_AL_QURA: 4,
    DUBAI: 12,
  };
  return map[methodStr] ?? ALADHAN_METHODS.MWL;
}
