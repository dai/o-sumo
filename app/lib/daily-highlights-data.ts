import { makuuchiData, juryo, type Rikishi } from './sumo-data';
import { torikumiMonthKey, type TorikumiDailyData } from './torikumi-data';
import { analyzeAikuchi, type AikuchiAnalysis } from './rikishi-compare-data';
import { divisionAnchorId } from './rikishi-display';

export interface FeaturedMatchup {
  id: string;
  eastId: number;
  westId: number;
  tagJa?: string;
  tagEn?: string;
  titleJa?: string;
  titleEn?: string;
  descriptionJa: string;
  descriptionEn: string;
  boutAnchor?: string;
}

export interface DailyHighlightsEntry {
  monthKey: string;
  day: number;
  dateTextJa: string;
  dateTextEn: string;
  featured: FeaturedMatchup[];
}

export interface EnrichedFeaturedMatchup {
  id: string;
  east: {
    id: number;
    name: string;
    yomi: string;
    rank: string;
    side: 'east';
    wins?: number;
    losses?: number;
  };
  west: {
    id: number;
    name: string;
    yomi: string;
    rank: string;
    side: 'west';
    wins?: number;
    losses?: number;
  };
  tagJa?: string;
  tagEn?: string;
  titleJa?: string;
  titleEn?: string;
  descriptionJa: string;
  descriptionEn: string;
  aikuchi: AikuchiAnalysis;
  compareHref: string;
  boutAnchor?: string;
}

export interface DailyHighlightsResult {
  monthKey: string;
  day: number;
  dateTextJa: string;
  dateTextEn: string;
  matchups: EnrichedFeaturedMatchup[];
  isFallback: boolean;
}

// -------------------------------------------------------------
// Rikishi Lookup Map
// -------------------------------------------------------------
const ALL_RIKISHI: Rikishi[] = [
  ...makuuchiData.flatMap((group) => [...group.east, ...group.west]),
  ...juryo.flatMap((group) => [...group.east, ...group.west]),
];

const RIKISHI_BY_ID = new Map<number, Rikishi>(
  ALL_RIKISHI.map((wrestler) => [wrestler.id, wrestler]),
);

const RIKISHI_BY_NAME = new Map<string, Rikishi>(
  ALL_RIKISHI.map((wrestler) => [wrestler.name, wrestler]),
);

export function findRikishiById(id: number): Rikishi | undefined {
  return RIKISHI_BY_ID.get(id);
}

export function findRikishiByName(name: string): Rikishi | undefined {
  return RIKISHI_BY_NAME.get(name);
}

// -------------------------------------------------------------
// Matchup Wins Map (Preloaded / Fallback)
// -------------------------------------------------------------
// Common rivalry head-to-head records
const KNOWN_MATCHUPS: Record<string, [number, number]> = {
  '3842,4227': [5, 3], // 豊昇龍 vs 大の里
  '3622,3661': [12, 10], // 霧島 vs 琴櫻
  '4055,3761': [4, 6], // 熱海富士 vs 若隆景
  '3840,4230': [2, 3], // 琴勝峰 vs 安青錦
  '4055,3255': [3, 2], // 熱海富士 vs 輝
  '3842,3661': [11, 9], // 豊昇龍 vs 琴櫻
  '4227,3761': [4, 2], // 大の里 vs 若隆景
};

export function getHeadToHeadRecord(idA: number, idB: number): [number, number] {
  const key1 = `${idA},${idB}`;
  if (KNOWN_MATCHUPS[key1]) return KNOWN_MATCHUPS[key1];
  const key2 = `${idB},${idA}`;
  if (KNOWN_MATCHUPS[key2]) {
    const [b, a] = KNOWN_MATCHUPS[key2];
    return [a, b];
  }
  return [0, 0];
}

// -------------------------------------------------------------
// Registry of Featured Matchups for Days
// -------------------------------------------------------------
export const DAILY_HIGHLIGHTS_REGISTRY: DailyHighlightsEntry[] = [
  {
    monthKey: '202609',
    day: 1,
    dateTextJa: '九月場所 初日',
    dateTextEn: 'September Basho Day 1',
    featured: [
      {
        id: '202609-day1-musubi',
        eastId: 3842, // 豊昇龍
        westId: 4227, // 大の里
        tagJa: '結びの一番・横綱決戦',
        tagEn: 'Final Bout: Yokozuna Clash',
        titleJa: '豊昇龍 vs 大の里：初日頂上決戦',
        titleEn: 'Hoshoryu vs Onosato: Day 1 Summit Clash',
        descriptionJa: '先場所優勝の豊昇龍と新横綱・大の里が初日の結びで激突。過去の対戦成績は豊昇龍リードも、直近の対戦では互角の激闘が続く大一番です。',
        descriptionEn: 'July champion Hoshoryu faces new Yokozuna Onosato in the opening day finale. Hoshoryu leads the historical record, but their recent bouts have been fiercely contested.',
        boutAnchor: divisionAnchorId('幕内', 21),
      },
      {
        id: '202609-day1-sekiwake',
        eastId: 4055, // 熱海富士
        westId: 3761, // 若隆景
        tagJa: '注目三役対決',
        tagEn: 'Featured Sanyaku Matchup',
        titleJa: '熱海富士 vs 若隆景：推進力と技巧の激突',
        titleEn: 'Atamifuji vs Wakatakakage: Power Meets Technique',
        descriptionJa: '大型の押し相撲で圧倒する関脇・熱海富士に対し、卓越したおっつけとスピードを誇る若隆景。初日の土俵を熱く沸かせる注目の好取組です。',
        descriptionEn: 'Sekiwake Atamifuji brings massive thrusting power against the masterful technique and agility of Wakatakakage in an electrifying opening bout.',
        boutAnchor: divisionAnchorId('幕内', 20),
      },
    ],
  },
  {
    monthKey: '202607',
    day: 15,
    dateTextJa: '七月場所 千秋楽',
    dateTextEn: 'July Basho Final Day',
    featured: [
      {
        id: '202607-day15-musubi',
        eastId: 3842, // 豊昇龍
        westId: 3661, // 琴櫻
        tagJa: '千秋楽結びの一番',
        tagEn: 'Final Day Musubi Bout',
        titleJa: '豊昇龍 vs 琴櫻：賜杯を懸けた結びの大一番',
        titleEn: 'Hoshoryu vs Kotozakura: Championship Finale',
        descriptionJa: '大相撲七月場所の千秋楽を締めくくる結びの一番。通算対戦成績11勝9敗と鎬を削る両雄が、賜杯争いの頂点で激突しました。',
        descriptionEn: 'The climactic final bout of the July tournament. With an 11-9 career record, both titans clash in a high-stakes championship finale.',
        boutAnchor: divisionAnchorId('幕内', 21),
      },
    ],
  },
];

// -------------------------------------------------------------
// Enricher Function
// -------------------------------------------------------------
export function enrichFeaturedMatchup(
  featured: FeaturedMatchup,
  matchupWinsMap?: Map<string, [number, number]>,
): EnrichedFeaturedMatchup | null {
  const eastRikishi = findRikishiById(featured.eastId);
  const westRikishi = findRikishiById(featured.westId);

  if (!eastRikishi || !westRikishi) return null;

  let winsA = 0;
  let winsB = 0;

  if (matchupWinsMap) {
    const pair = matchupWinsMap.get(`${featured.eastId},${featured.westId}`);
    if (pair) {
      winsA = pair[0];
      winsB = pair[1];
    } else {
      [winsA, winsB] = getHeadToHeadRecord(featured.eastId, featured.westId);
    }
  } else {
    [winsA, winsB] = getHeadToHeadRecord(featured.eastId, featured.westId);
  }

  const aikuchi = analyzeAikuchi(winsA, winsB);

  return {
    id: featured.id,
    east: {
      id: eastRikishi.id,
      name: eastRikishi.name,
      yomi: eastRikishi.yomi,
      rank: eastRikishi.rank,
      side: 'east',
      wins: eastRikishi.wins,
      losses: eastRikishi.losses,
    },
    west: {
      id: westRikishi.id,
      name: westRikishi.name,
      yomi: westRikishi.yomi,
      rank: westRikishi.rank,
      side: 'west',
      wins: westRikishi.wins,
      losses: westRikishi.losses,
    },
    tagJa: featured.tagJa,
    tagEn: featured.tagEn,
    titleJa: featured.titleJa,
    titleEn: featured.titleEn,
    descriptionJa: featured.descriptionJa,
    descriptionEn: featured.descriptionEn,
    aikuchi,
    compareHref: `/compare/?ids=${featured.eastId},${featured.westId}`,
    boutAnchor: featured.boutAnchor,
  };
}

// -------------------------------------------------------------
// Main Resolver with Smart Fallback
// -------------------------------------------------------------
export function getDailyHighlights(options?: {
  monthKey?: string;
  day?: number;
  dailyData?: TorikumiDailyData | null;
  matchupWinsMap?: Map<string, [number, number]>;
}): DailyHighlightsResult {
  const monthKey = options?.monthKey ?? torikumiMonthKey;
  const day = options?.day ?? 1;

  // 1. Look up from static registry
  const exactEntry = DAILY_HIGHLIGHTS_REGISTRY.find(
    (e) => e.monthKey === monthKey && e.day === day,
  );

  if (exactEntry) {
    const enriched = exactEntry.featured
      .map((f) => enrichFeaturedMatchup(f, options?.matchupWinsMap))
      .filter((m): m is EnrichedFeaturedMatchup => m !== null);

    if (enriched.length > 0) {
      return {
        monthKey: exactEntry.monthKey,
        day: exactEntry.day,
        dateTextJa: exactEntry.dateTextJa,
        dateTextEn: exactEntry.dateTextEn,
        matchups: enriched,
        isFallback: false,
      };
    }
  }

  // 2. Smart Fallback from dailyData (e.g. musubi no ichiban from makuuchi)
  if (options?.dailyData && options.dailyData.makuuchi.matches.length > 0) {
    const matches = options.dailyData.makuuchi.matches;
    const musubiMatch = matches[matches.length - 1]; // last bout is musubi
    const eastRikishi = findRikishiByName(musubiMatch.eastName);
    const westRikishi = findRikishiByName(musubiMatch.westName);

    if (eastRikishi && westRikishi) {
      const fallbackFeatured: FeaturedMatchup = {
        id: `${monthKey}-day${day}-musubi-auto`,
        eastId: eastRikishi.id,
        westId: westRikishi.id,
        tagJa: '本日の結びの一番',
        tagEn: 'Final Bout of the Day',
        titleJa: `${eastRikishi.name} vs ${westRikishi.name}`,
        titleEn: `${eastRikishi.name} vs ${westRikishi.name}`,
        descriptionJa: '本日の土俵を締めくくる結びの大一番。両力士の合口と直接対決に注目です。',
        descriptionEn: 'The final concluding bout of today. Watch the clash between both top-ranking rikishi.',
        boutAnchor: divisionAnchorId('幕内', musubiMatch.boutNo),
      };

      const enriched = enrichFeaturedMatchup(fallbackFeatured, options.matchupWinsMap);
      if (enriched) {
        return {
          monthKey,
          day,
          dateTextJa: `第${day}日目`,
          dateTextEn: `Day ${day}`,
          matchups: [enriched],
          isFallback: true,
        };
      }
    }
  }

  // 3. Ultimate Fallback (Default Hoshoryu vs Onosato)
  const defaultEntry = DAILY_HIGHLIGHTS_REGISTRY[0];
  const defaultEnriched = defaultEntry.featured
    .map((f) => enrichFeaturedMatchup(f, options?.matchupWinsMap))
    .filter((m): m is EnrichedFeaturedMatchup => m !== null);

  return {
    monthKey: defaultEntry.monthKey,
    day: defaultEntry.day,
    dateTextJa: defaultEntry.dateTextJa,
    dateTextEn: defaultEntry.dateTextEn,
    matchups: defaultEnriched,
    isFallback: true,
  };
}
