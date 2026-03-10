import { torikumiArchive, torikumiMonthKey } from './torikumi-data';

function formatGregorianBashoLabel(monthKey: string): string {
  const year = monthKey.slice(0, 4);
  const month = String(Number(monthKey.slice(4, 6)));
  return `${year}年${month}月場所`;
}

export const bashoTitle = `${torikumiArchive.year}${torikumiArchive.bashoName}`;
export const gregorianBashoLabel = formatGregorianBashoLabel(torikumiMonthKey);
