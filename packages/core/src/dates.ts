import type { ISODate } from './types.ts';

const DAY = 86_400_000;

export function toISODate(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODate(s: ISODate): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function daysBetween(from: ISODate, to: ISODate): number {
  return Math.round((parseISODate(to).getTime() - parseISODate(from).getTime()) / DAY);
}

export function addDays(date: ISODate, n: number): ISODate {
  const d = parseISODate(date);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function monthKey(date: ISODate): string {
  return date.slice(0, 7);
}

export function isWeekend(date: ISODate): boolean {
  const wd = parseISODate(date).getDay();
  return wd === 0 || wd === 6;
}

/** Jours fériés français (fixes + liés à Pâques). */
export function isFrenchHoliday(date: ISODate): boolean {
  const d = parseISODate(date);
  const y = d.getFullYear();
  const md = date.slice(5);
  if (['01-01', '05-01', '05-08', '07-14', '08-15', '11-01', '11-11', '12-25'].includes(md)) return true;
  const easter = easterSunday(y);
  const offsets = [1, 39, 50]; // lundi de Pâques, Ascension, lundi de Pentecôte
  return offsets.some((o) => toISODate(new Date(easter.getTime() + o * DAY)) === date);
}

function easterSunday(y: number): Date {
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month - 1, day);
}

export function formatMinutes(min: number): string {
  const m = Math.round(min);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} h ${String(r).padStart(2, '0')}` : `${h} h`;
}
