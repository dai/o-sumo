import { torikumiArchive, torikumiMonthKey } from './torikumi-data';

const MONTH_NAMES_EN: Record<string, string> = {
  '01': 'January',
  '03': 'March',
  '05': 'May',
  '07': 'July',
  '09': 'September',
  '11': 'November',
  '1': 'January',
  '3': 'March',
  '5': 'May',
  '7': 'July',
  '9': 'September',
};

const BASHO_NAME_TO_MONTH_KEY: Record<string, string> = {
  初場所: '01',
  一月場所: '01',
  春場所: '03',
  三月場所: '03',
  夏場所: '05',
  五月場所: '05',
  名古屋場所: '07',
  七月場所: '07',
  秋場所: '09',
  九月場所: '09',
  九州場所: '11',
  十一月場所: '11',
};

export function formatGregorianBashoLabel(monthKey: string, lang: string = 'ja'): string {
  const year = monthKey.slice(0, 4);
  const rawMonth = monthKey.slice(4, 6);
  const monthNum = String(Number(rawMonth));
  if (lang === 'en') {
    const monthName = MONTH_NAMES_EN[rawMonth] || MONTH_NAMES_EN[monthNum] || `Month ${monthNum}`;
    return `${monthName} ${year} Tournament`;
  }
  return `${year}年${monthNum}月場所`;
}

export function formatBashoTitle(
  info: { year?: string; bashoName?: string; monthKey?: string },
  lang: string = 'ja',
): string {
  if (lang === 'en') {
    if (info.monthKey) {
      return formatGregorianBashoLabel(info.monthKey, 'en');
    }
    if (info.bashoName) {
      const monthKey = BASHO_NAME_TO_MONTH_KEY[info.bashoName];
      if (monthKey) {
        return `${MONTH_NAMES_EN[monthKey]} ${info.year || ''} Tournament`.trim();
      }
    }
    return `${info.year || ''} ${info.bashoName || ''}`.trim();
  }
  return `${info.year || ''}${info.bashoName || ''}`;
}

/**
 * Returns the basho name used in `final` mode hero copy. The legacy copy
 * hardcoded the month ("七月" / "July"), which silently desynchronized once
 * a new basho started. Templates now interpolate `{{bashoName}}` and this
 * helper provides the localized value from the published archive data.
 */
export function getFinalBashoName(
  info: { bashoName?: string; monthKey?: string },
  lang: string = 'ja',
): string {
  if (lang === 'en') {
    const monthKey = (() => {
      if (info.monthKey) return info.monthKey.slice(4, 6);
      if (info.bashoName) return BASHO_NAME_TO_MONTH_KEY[info.bashoName];
      return null;
    })();
    if (monthKey) {
      const monthName = MONTH_NAMES_EN[monthKey] ?? MONTH_NAMES_EN[String(Number(monthKey))];
      if (monthName) return monthName;
    }
    return info.bashoName ?? '';
  }
  return info.bashoName ?? '';
}

export const bashoTitle = `${torikumiArchive.year}${torikumiArchive.bashoName}`;
export const gregorianBashoLabel = formatGregorianBashoLabel(torikumiMonthKey);
