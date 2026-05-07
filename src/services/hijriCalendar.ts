import type { HijriDate } from '../types';

const HIJRI_MONTHS = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhul Qi'dah", 'Dhul Hijjah',
];

const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

export function gregorianToHijri(date: Date): HijriDate {
  const gd = date.getTime();
  const jd = Math.floor(gd / 86400000) + 2440587.5;
  const l = Math.floor(jd - 1948439.5 + 10632);
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 30;
  const month = Math.floor((l3 - 1) / 29.5);
  const day = l3 - Math.floor((29.5 * month) + 0.99);
  const year = 30 * n + j - 30;

  return {
    day: Math.max(1, Math.round(day)),
    month: Math.min(12, Math.max(1, Math.round(month + 1))),
    year: Math.round(year),
    monthName: HIJRI_MONTHS[Math.min(11, Math.max(0, Math.round(month)))] || 'Muharram',
    monthNameAr: HIJRI_MONTHS_AR[Math.min(11, Math.max(0, Math.round(month)))] || 'محرم',
    gregorianDate: date.toISOString().split('T')[0],
  };
}

export function formatHijriDate(hijri: HijriDate): string {
  return `${hijri.day} ${hijri.monthName} ${hijri.year}`;
}
