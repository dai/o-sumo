import { makuuchiData } from './sumo-data';
import { toRomaji } from './romaji';

export interface TorikumiMatch {
  division: string;
  eastName: string;
  eastYomi: string;
  eastEnglish: string;
  westName: string;
  westYomi: string;
  westEnglish: string;
  kimarite?: string;
}

const TORIKUMI_URL = 'https://www.sumo.or.jp/ResultData/torikumi/1/1/';

const parsePair = (value: string): { name: string; yomi: string; english: string } => {
  const normalized = value.replace(/\s+/g, ' ').trim();
  const m = normalized.match(/(.+?)\s*\(([^)]+)\)$/);
  if (!m) {
    return { name: normalized, yomi: '', english: '' };
  }
  const yomi = m[2].trim();
  return { name: m[1].trim(), yomi, english: toRomaji(yomi) };
};

const normalizeDivision = (raw: string): string => {
  if (raw.includes('幕内')) return '幕内';
  if (raw.includes('十両')) return '十両';
  if (raw.includes('幕下')) return '幕下';
  return raw;
};

export const fallbackTorikumi = (): TorikumiMatch[] =>
  makuuchiData
    .slice(0, 10)
    .filter((group) => group.east[0] && group.west[0])
    .map((group) => ({
      division: '幕内',
      eastName: group.east[0].name,
      eastYomi: group.east[0].yomi,
      eastEnglish: toRomaji(group.east[0].yomi),
      westName: group.west[0].name,
      westYomi: group.west[0].yomi,
      westEnglish: toRomaji(group.west[0].yomi),
      kimarite: '未定'
    }));

export const fetchTorikumiData = async (): Promise<TorikumiMatch[]> => {
  const res = await fetch(TORIKUMI_URL);
  if (!res.ok) {
    throw new Error(`取組表の取得に失敗しました: ${res.status}`);
  }

  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const matches: TorikumiMatch[] = [];
  const rows = Array.from(doc.querySelectorAll('table tr'));

  rows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent?.trim() ?? '');
    if (cells.length < 4) return;

    const [divisionRaw, eastRaw, kimariteRaw, westRaw] = cells;
    if (!divisionRaw || !eastRaw || !westRaw) return;

    const east = parsePair(eastRaw);
    const west = parsePair(westRaw);

    matches.push({
      division: normalizeDivision(divisionRaw),
      eastName: east.name,
      eastYomi: east.yomi,
      eastEnglish: east.english,
      westName: west.name,
      westYomi: west.yomi,
      westEnglish: west.english,
      kimarite: kimariteRaw || undefined
    });
  });

  return matches;
};
