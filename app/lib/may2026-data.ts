import type { TorikumiDataSet, TorikumiMatch } from './torikumi-data';
import { makuuchiData, juryo } from './sumo-data';

// May 2026 dates: May 10-25 (15 days)
const MAY_DATES = [
  { day: 1, iso: '20260510', label: '初日', dayHead: '初日： 令和8年5月10日(日)' },
  { day: 2, iso: '20260511', label: '二日目', dayHead: '二日目： 令和8年5月11日(月)' },
  { day: 3, iso: '20260512', label: '三日目', dayHead: '三日目： 令和8年5月12日(火)' },
  { day: 4, iso: '20260513', label: '四日目', dayHead: '四日目： 令和8年5月13日(水)' },
  { day: 5, iso: '20260514', label: '五日目', dayHead: '五日目： 令和8年5月14日(木)' },
  { day: 6, iso: '20260515', label: '六日目', dayHead: '六日目： 令和8年5月15日(金)' },
  { day: 7, iso: '20260516', label: '七日目', dayHead: '七日目： 令和8年5月16日(土)' },
  { day: 8, iso: '20260517', label: '中日', dayHead: '中日： 令和8年5月17日(日)' },
  { day: 9, iso: '20260518', label: '九日目', dayHead: '九日目： 令和8年5月18日(月)' },
  { day: 10, iso: '20260519', label: '十日目', dayHead: '十日目： 令和8年5月19日(火)' },
  { day: 11, iso: '20260520', label: '十一日目', dayHead: '十一日目： 令和8年5月20日(水)' },
  { day: 12, iso: '20260521', label: '十二日目', dayHead: '十二日目： 令和8年5月21日(木)' },
  { day: 13, iso: '20260522', label: '十三日目', dayHead: '十三日目： 令和8年5月22日(金)' },
  { day: 14, iso: '20260523', label: '十四日目', dayHead: '十四日目： 令和8年5月23日(土)' },
  { day: 15, iso: '20260525', label: '千秋楽', dayHead: '千秋楽： 令和8年5月25日(月)' },
];

// Common kimarite for dummy data
const KIMARITE = [
  '押し出し', '寄り切り', '吊り出し', '叩き込み', '送り出し',
  '出し投げ', '小手投げ', '足取り', '突き落とし', '鉈引き',
];

function createDummyMatch(
  division: '幕内' | '十両',
  boutNo: number,
  eastName: string,
  eastYomi: string,
  eastRank: string,
  westName: string,
  westYomi: string,
  westRank: string,
  winner?: 'east' | 'west' | null
): TorikumiMatch {
  return {
    division,
    boutNo,
    eastName,
    eastYomi,
    eastEnglish: eastName,
    eastRank,
    eastProfileUrl: '#',
    westName,
    westYomi,
    westEnglish: westName,
    westRank,
    westProfileUrl: '#',
    kimarite: winner ? KIMARITE[Math.floor(Math.random() * KIMARITE.length)] : '',
    winner: winner ?? null,
  };
}

// Extract names from rank groups for matching
function extractRikishi(rankGroup: typeof makuuchiData[number], side: 'east' | 'west') {
  const r = side === 'east' ? rankGroup.east[0] : rankGroup.west[0];
  return r ? { name: r.name, yomi: r.yomi, rank: r.rank } : null;
}

function buildDayData(dayInfo: typeof MAY_DATES[number], isResult: boolean) {
  // Build makuuchi matches (top 10 bouts)
  const makuuchiMatches: TorikumiMatch[] = [];
  const boutCount = Math.min(6 + Math.floor(dayInfo.day / 3), 15);

  for (let i = 0; i < boutCount; i++) {
    const eastGroup = makuuchiData[Math.min(i * 2, makuuchiData.length - 1)];
    const westGroup = makuuchiData[Math.min(i * 2 + 1, makuuchiData.length - 1)];

    const east = extractRikishi(eastGroup, 'east');
    const west = extractRikishi(westGroup, 'west');

    if (east && west) {
      // For results, determine winner (alternating for variety)
      const winner = isResult
        ? (i % 2 === 0 ? 'east' : 'west')
        : null;

      makuuchiMatches.push(createDummyMatch(
        '幕内',
        i + 1,
        east.name,
        east.yomi,
        east.rank,
        west.name,
        west.yomi,
        west.rank,
        winner
      ));
    }
  }

  // Build juryo matches
  const juryoMatches: TorikumiMatch[] = [];
  const juryoCount = Math.min(4 + Math.floor(dayInfo.day / 4), 10);

  for (let i = 0; i < juryoCount; i++) {
    const eastGroup = juryo[Math.min(i * 2, juryo.length - 1)];
    const westGroup = juryo[Math.min(i * 2 + 1, juryo.length - 1)];

    const east = extractRikishi(eastGroup, 'east');
    const west = extractRikishi(westGroup, 'west');

    if (east && west) {
      const winner = isResult
        ? (i % 3 === 0 ? 'east' : 'west')
        : null;

      juryoMatches.push(createDummyMatch(
        '十両',
        i + 1,
        east.name,
        east.yomi,
        east.rank,
        west.name,
        west.yomi,
        west.rank,
        winner
      ));
    }
  }

  return {
    makuuchi: {
      day: dayInfo.day,
      dayName: `中日 ${dayInfo.day}日目`,
      dayHead: dayInfo.dayHead,
      division: '幕内' as const,
      matches: makuuchiMatches,
    },
    juryo: {
      day: dayInfo.day,
      dayName: `中日 ${dayInfo.day}日目`,
      dayHead: dayInfo.dayHead,
      division: '十両' as const,
      matches: juryoMatches,
    },
  };
}

export const MAY2026_TORIKUMI_DATA: TorikumiDataSet = {
  bashoName: '五月場所',
  year: '令和八年',
  updatedAt: '2026-05-01',
  resultUpdatedAt: '2026-05-01',
  scheduleUpdatedAt: '2026-05-01',
  resultDays: MAY_DATES.map((d) => ({
    day: d.day,
    isoDate: d.iso,
    pathDate: d.iso,
    label: d.label,
    dayHead: d.dayHead,
    status: 'published' as const,
    statusMessage: null,
    data: buildDayData(d, true),
  })),
  scheduleDays: MAY_DATES.map((d) => ({
    day: d.day,
    isoDate: d.iso,
    pathDate: d.iso,
    label: d.label,
    dayHead: d.dayHead,
    status: d.day <= 3 ? 'published' as const : 'pending' as const,
    statusMessage: d.day <= 3 ? null : '更新待ち' as const,
    data: buildDayData(d, false),
  })),
};
