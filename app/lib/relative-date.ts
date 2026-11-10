import type { TFunction } from 'i18next';

/**
 * Returns the current date formatted as YYYY-MM-DD in Japan Standard Time (JST, Asia/Tokyo).
 */
export function getJstIsoDate(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  return `${year}-${month}-${day}`;
}

/**
 * Computes calendar day difference (targetDate - currentDate) in JST.
 * E.g., if now is 2026-09-11 (JST) and target is 2026-09-13: returns +2 (day after tomorrow).
 * If now is 2026-09-12 (JST) and target is 2026-09-13: returns +1 (tomorrow).
 * If now is 2026-09-13 (JST) and target is 2026-09-13: returns 0 (today).
 */
export function getCalendarDayDiffJst(targetIsoDate: string, now: Date = new Date()): number {
  const currentIso = getJstIsoDate(now);
  const [cy, cm, cd] = currentIso.split('-').map(Number);
  const [ty, tm, td] = targetIsoDate.split('-').map(Number);
  const currentUtc = Date.UTC(cy, cm - 1, cd);
  const targetUtc = Date.UTC(ty, tm - 1, td);
  return Math.round((targetUtc - currentUtc) / 86_400_000);
}

/**
 * Returns relative day label like "今日", "明日", "明後日".
 */
export function getRelativeDateLabel(dayDiff: number, isEn = false): string {
  if (dayDiff === 0) return isEn ? 'Today' : '今日';
  if (dayDiff === 1) return isEn ? 'Tomorrow' : '明日';
  if (dayDiff === 2) return isEn ? 'Day after tomorrow' : '明後日';
  if (dayDiff === -1) return isEn ? 'Yesterday' : '昨日';
  return '';
}

/**
 * Returns section title for highlights based on relative day distance.
 */
export function getRelativeHighlightsTitle(
  dayDiff: number | null,
  isFinal: boolean,
  t: TFunction,
): string {
  if (isFinal) {
    return t('highlights.finalTitle');
  }
  if (dayDiff === 2) {
    return t('highlights.sectionTitleDayAfterTomorrow');
  }
  if (dayDiff === 1) {
    return t('highlights.sectionTitleTomorrow');
  }
  return t('highlights.sectionTitle');
}

/**
 * Returns musubi title based on relative day distance.
 */
export function getRelativeMusubiTitle(dayDiff: number | null, isEn = false): string {
  if (dayDiff === 2) {
    return isEn ? "Day After Tomorrow's Final Bout" : '明後日の結びの一番';
  }
  if (dayDiff === 1) {
    return isEn ? "Tomorrow's Final Bout" : '明日の結びの一番';
  }
  if (dayDiff === 0) {
    return isEn ? "Today's Final Bout" : '本日の結びの一番';
  }
  return isEn ? 'Final Bout of the Day' : '結びの一番';
}

/**
 * Returns monomosu commentary text based on relative day distance.
 */
export function getRelativeMonomosuText(
  dayDiff: number | null,
  isFinal: boolean,
  t: TFunction,
): string {
  if (isFinal) {
    return t('highlights.monomosuFinalText');
  }
  if (dayDiff === 2) {
    return t('highlights.monomosuDayAfterTomorrowText');
  }
  if (dayDiff === 1) {
    return t('highlights.monomosuTomorrowText');
  }
  return t('highlights.monomosuLiveText');
}

const KANJI_DIGITS = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'] as const;

const KANJI_DIGIT_VALUE: Record<string, number> = {
  〇: 0,
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};

const ENGLISH_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const WEEKDAY_EN: Record<string, string> = {
  日: 'Sun',
  月: 'Mon',
  火: 'Tue',
  水: 'Wed',
  木: 'Thu',
  金: 'Fri',
  土: 'Sat',
};

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})?$/;
const WAREKI_DATE_PATTERN = /令和(元|\d+|[〇一二三四五六七八九十]+)年(\d{1,2}|[〇一二三四五六七八九十]+)月(\d{1,2}|[〇一二三四五六七八九十]+)日(\(([日一月火水木金土])\))?/g;
const GREGORIAN_JA_DATE_PATTERN = /(\d{4})年(\d{1,2})月(\d{1,2})日(\(([日一月火水木金土])\))?/g;

function isEnglish(lang: string | undefined): boolean {
  return (lang ?? 'ja').toLowerCase().startsWith('en');
}

function parseKanjiNumber(token: string): number | null {
  if (token === '元') return 1;
  if (/^\d+$/.test(token)) return Number(token);
  if (token === '十') return 10;
  const tenIndex = token.indexOf('十');
  if (tenIndex >= 0) {
    const tensToken = token.slice(0, tenIndex);
    const onesToken = token.slice(tenIndex + 1);
    const tens = tensToken === '' ? 1 : KANJI_DIGIT_VALUE[tensToken];
    if (tens === undefined || tensToken.length > 1) return null;
    if (onesToken === '') return tens * 10;
    const ones = KANJI_DIGIT_VALUE[onesToken];
    if (ones === undefined || onesToken.length !== 1) return null;
    return tens * 10 + ones;
  }
  if (token.length === 1 && KANJI_DIGIT_VALUE[token] !== undefined) return KANJI_DIGIT_VALUE[token];
  return null;
}

/** 1 → 一, 11 → 十一, 20 → 二十. Used for Reiwa years and basho months. */
export function formatKanjiNumber(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value >= 100) return String(value);
  if (value < 10) return KANJI_DIGITS[value];
  if (value === 10) return '十';
  if (value < 20) return `十${KANJI_DIGITS[value % 10]}`;
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return `${KANJI_DIGITS[tens]}十${ones === 0 ? '' : KANJI_DIGITS[ones]}`;
}

/** Gregorian year and month → 令和八年十一月場所. 2019 is 令和元年. */
export function formatWarekiBashoName(gregorianYear: number, month: number): string {
  const eraYear = gregorianYear - 2018;
  const era = eraYear === 1 ? '令和元年' : `令和${formatKanjiNumber(eraYear)}年`;
  return `${era}${formatKanjiNumber(month)}月場所`;
}

/** Arabic Reiwa year and month digits become kanji. Already-kanji text is left intact. */
export function normalizeWarekiBashoTitle(year: string, bashoName: string): string {
  const normalizedYear = year.replace(/令和(\d+)年/g, (_match, digits: string) => `令和${formatKanjiNumber(Number(digits))}年`);
  const normalizedName = bashoName.replace(/(\d+)月場所/g, (_match, digits: string) => `${formatKanjiNumber(Number(digits))}月場所`);
  return `${normalizedYear}${normalizedName}`;
}

function formatCalendarDate(year: number, month: number, day: number, lang?: string): string {
  if (isEnglish(lang)) {
    const monthName = ENGLISH_MONTHS[month - 1] ?? String(month);
    return `${monthName} ${day}, ${year}`;
  }
  return `${year}年${month}月${day}日`;
}

/** YYYY-MM-DD → 2026年11月9日, or November 9, 2026 in English. */
export function formatDisplayDate(isoDate: string, lang = 'ja'): string {
  const match = DATE_ONLY_PATTERN.exec(isoDate);
  if (!match) return isoDate;
  return formatCalendarDate(Number(match[1]), Number(match[2]), Number(match[3]), lang);
}

function jstParts(date: Date): { year: number; month: number; day: number; hour: number; minute: number } | null {
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  let hour = Number(read('hour'));
  if (hour === 24) hour = 0;
  const year = Number(read('year'));
  const month = Number(read('month'));
  const day = Number(read('day'));
  const minute = Number(read('minute'));
  if (![year, month, day, hour, minute].every((value) => Number.isFinite(value))) return null;
  return { year, month, day, hour, minute };
}

function formatClock(hour: number, minute: number, lang?: string): string {
  const paddedMinute = String(minute).padStart(2, '0');
  if (isEnglish(lang)) {
    const suffix = hour < 12 ? 'a.m.' : 'p.m.';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${paddedMinute} ${suffix} JST`;
  }
  return `${String(hour).padStart(2, '0')}:${paddedMinute} JST`;
}

/**
 * Date-only values stay dates. Instants are converted to JST and labeled JST.
 * Japanese: 2026年11月9日 17:57 JST. English: November 9, 2026, 5:57 p.m. JST.
 */
export function formatDisplayTimestamp(value: string, lang = 'ja'): string {
  if (DATE_ONLY_PATTERN.test(value)) return formatDisplayDate(value, lang);
  const match = DATE_TIME_PATTERN.exec(value);
  if (!match) return value;
  const [, year, month, day, hour, minute, offset] = match;
  const zone = offset && offset.length > 0 ? offset : '+09:00';
  const instant = new Date(`${year}-${month}-${day}T${hour}:${minute}:00${zone === 'Z' ? 'Z' : zone}`);
  const parts = jstParts(instant);
  if (!parts) return value;
  const dateText = formatCalendarDate(parts.year, parts.month, parts.day, lang);
  const timeText = formatClock(parts.hour, parts.minute, lang);
  return isEnglish(lang) ? `${dateText}, ${timeText}` : `${dateText} ${timeText}`;
}

/** Calendar date of an instant, in JST. Publication dates use this without a clock. */
export function formatInstantDate(iso: string, lang = 'ja'): string {
  const parts = jstParts(new Date(iso));
  if (!parts) return iso;
  return formatCalendarDate(parts.year, parts.month, parts.day, lang);
}

function withWeekday(dateText: string, weekday: string | undefined, lang?: string): string {
  if (!weekday) return dateText;
  if (isEnglish(lang)) return `${dateText} (${WEEKDAY_EN[weekday] ?? weekday})`;
  return `${dateText}(${weekday})`;
}

/** Replace an arabic or kanji Reiwa date inside a day heading with 2026年11月9日. */
export function formatDayHead(dayHead: string, lang = 'ja'): string {
  const converted = dayHead.replace(
    WAREKI_DATE_PATTERN,
    (_match, eraRaw: string, monthRaw: string, dayRaw: string, _wrapped: string | undefined, weekday: string | undefined) => {
      const eraYear = parseKanjiNumber(eraRaw);
      const month = parseKanjiNumber(monthRaw);
      const day = parseKanjiNumber(dayRaw);
      if (eraYear === null || month === null || day === null) return _match;
      return withWeekday(formatCalendarDate(2018 + eraYear, month, day, lang), weekday, lang);
    },
  );
  if (!isEnglish(lang)) return converted;
  return converted.replace(
    GREGORIAN_JA_DATE_PATTERN,
    (_match, year: string, month: string, day: string, _wrapped: string | undefined, weekday: string | undefined) =>
      withWeekday(formatCalendarDate(Number(year), Number(month), Number(day), 'en'), weekday, 'en'),
  );
}

/** 16:20 → 16:20 JST. A label that already says JST is unchanged. */
export function formatJstClock(time: string): string {
  const trimmed = time.trim();
  if (!trimmed || /\bJST\b/.test(trimmed)) return trimmed;
  return `${trimmed} JST`;
}
