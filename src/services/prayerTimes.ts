import type { PrayerTime } from '../types';

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function sin(d: number) { return Math.sin(d * DEG); }
function cos(d: number) { return Math.cos(d * DEG); }
function tan(d: number) { return Math.tan(d * DEG); }
function arcsin(x: number) { return RAD * Math.asin(x); }
function arccos(x: number) { return RAD * Math.acos(x); }
function arctan2(y: number, x: number) { return RAD * Math.atan2(y, x); }

function fixAngle(a: number) { return a - 360 * Math.floor(a / 360); }
function fixHour(h: number) { return h - 24 * Math.floor(h / 24); }

function sunPosition(jd: number) {
  const D = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(q + 1.915 * sin(g) + 0.020 * sin(2 * g));
  const e = 23.439 - 0.00000036 * D;
  const RA = arctan2(cos(e) * sin(L), cos(L)) / 15;
  const dec = arcsin(sin(e) * sin(L));
  return { dec, eqTime: q / 15 - fixHour(RA) };
}

function calcPrayerTimes(date: Date, lat: number, lng: number, tz: number) {
  const jd = Math.floor(date.getTime() / 86400000) + 2440588;
  const { dec, eqTime } = sunPosition(jd + 0.5);

  const dhuhr = fixHour(12 + tz - lng / 15 - eqTime);

  function asrAngle(factor: number) {
    const angle = -arccos(tan(lat) * tan(dec) + factor * (1 / cos(lat) / cos(dec)));
    const asr = dhuhr + angle / 15;
    return fixHour(asr);
  }

  function sunAngleTime(angle: number, rising: boolean) {
    const cosH = (sin(angle) - sin(lat) * sin(dec)) / (cos(lat) * cos(dec));
    if (cosH < -1 || cosH > 1) return null;
    const h = RAD * Math.acos(cosH);
    const t = h / 15;
    return fixHour(dhuhr + (rising ? -t : t));
  }

  // MWL angles: Fajr 18°, Isha 17°
  const fajr = sunAngleTime(-18, true);
  const sunrise = sunAngleTime(-0.833, true);
  const asr = asrAngle(1); // Shafi'i
  const sunset = sunAngleTime(-0.833, false);
  const isha = sunAngleTime(-17, false);

  // Maghrib = sunset + 1-2 min
  const maghrib = sunset !== null ? fixHour(sunset + 2 / 60) : null;

  return { fajr, sunrise, dhuhr, asr, maghrib, isha };
}

function formatTime(hour: number | null): string {
  if (hour === null) return '--:--';
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  const hh = h.toString().padStart(2, '0');
  const mm = m.toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export interface PrayerTimesResult {
  fajr: PrayerTime;
  sunrise: PrayerTime;
  dhuhr: PrayerTime;
  asr: PrayerTime;
  maghrib: PrayerTime;
  isha: PrayerTime;
  nextPrayer: string;
  nextPrayerTime: string;
  timeRemaining: string;
}

export function getPrayerTimes(
  date: Date = new Date(),
  lat: number = 9.02,
  lng: number = 38.75,
  tz: number = 3,
): PrayerTimesResult {
  const times = calcPrayerTimes(date, lat, lng, tz);
  const now = date.getHours() + date.getMinutes() / 60;

  const prayers = [
    { key: 'fajr', hour: times.fajr },
    { key: 'sunrise', hour: times.sunrise },
    { key: 'dhuhr', hour: times.dhuhr },
    { key: 'asr', hour: times.asr },
    { key: 'maghrib', hour: times.maghrib },
    { key: 'isha', hour: times.isha },
  ] as const;

  let nextPrayer = 'fajr';
  let nextHour = 24;

  for (const p of prayers) {
    if (p.hour !== null && p.hour > now && p.key !== 'sunrise') {
      nextPrayer = p.key;
      nextHour = p.hour;
      break;
    }
  }

  const remaining = nextHour - now;
  const remH = Math.floor(remaining);
  const remM = Math.floor((remaining - remH) * 60);
  const timeRemaining = `${remH}h ${remM}m`;

  function makePT(key: string, hour: number | null): PrayerTime {
    const time = formatTime(hour);
    const ts = hour !== null ? hour * 3600 : 0;
    return {
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      nameAr: { fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' }[key] || key,
      time,
      timestamp: ts,
      isNext: key === nextPrayer,
      isPassed: hour !== null && hour < now,
    };
  }

  return {
    fajr: makePT('fajr', times.fajr),
    sunrise: makePT('sunrise', times.sunrise),
    dhuhr: makePT('dhuhr', times.dhuhr),
    asr: makePT('asr', times.asr),
    maghrib: makePT('maghrib', times.maghrib),
    isha: makePT('isha', times.isha),
    nextPrayer,
    nextPrayerTime: formatTime(prayers.find(p => p.key === nextPrayer)?.hour ?? null),
    timeRemaining,
  };
}
