import { makuuchiData, juryo, type Rikishi } from './sumo-data';
import {
  torikumiMonthKey,
  type TorikumiArchiveDay,
  type TorikumiDataSet,
  type TorikumiMatch,
} from './torikumi-data';
import { analyzeAikuchi, type AikuchiAnalysis } from './rikishi-compare-data';
import { divisionAnchorId } from './rikishi-display';
import type { BashoStatus } from './basho-status';
import { getDayPath, type TorikumiPageMode } from './torikumi-routes';

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
}

export type MatchupWinsMap = Map<string, [number, number]>;

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
  /**
   * Pre-bout aikuchi stats sourced from the official rikishi-matchups JSON.
   * `null` when the JSON has not been fetched yet or the pair is not in it.
   * Callers must hide the aikuchi block (but keep comparison & bout links)
   * when this is null.
   */
  aikuchi: AikuchiAnalysis | null;
  compareHref: string;
  boutHref?: string;
}

export interface DailyHighlightsResult {
  monthKey: string;
  day: number;
  pathDate: string;
  mode: TorikumiPageMode;
  dateTextJa: string;
  dateTextEn: string;
  matchups: EnrichedFeaturedMatchup[];
  isFallback: boolean;
}

export interface DailyHighlightsTarget {
  day: TorikumiArchiveDay;
  mode: TorikumiPageMode;
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

export function findRikishiById(id: number): Rikishi | undefined {
  return RIKISHI_BY_ID.get(id);
}

// -------------------------------------------------------------
// Enricher Function
// -------------------------------------------------------------
export function enrichFeaturedMatchup(
  featured: FeaturedMatchup,
  matchupWinsMap?: MatchupWinsMap,
  boutHref?: string,
): EnrichedFeaturedMatchup | null {
  const eastRikishi = findRikishiById(featured.eastId);
  const westRikishi = findRikishiById(featured.westId);

  if (!eastRikishi || !westRikishi) return null;

  const pair = matchupWinsMap?.get(`${featured.eastId},${featured.westId}`);
  const aikuchi = pair ? analyzeAikuchi(pair[0], pair[1]) : null;

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
    boutHref,
  };
}

// -------------------------------------------------------------
// Day and route resolver
// -------------------------------------------------------------
function hasMatches(day: TorikumiArchiveDay): boolean {
  return day.data.makuuchi.matches.length > 0 || day.data.juryo.matches.length > 0;
}

function sortedDays(days: TorikumiArchiveDay[] | undefined): TorikumiArchiveDay[] {
  return [...(days ?? [])].sort((left, right) => left.day - right.day);
}

export function resolveDailyHighlightsTarget({
  archive,
  bashoStatus,
}: {
  archive: TorikumiDataSet;
  bashoStatus: BashoStatus;
}): DailyHighlightsTarget | null {
  const scheduleDays = sortedDays(archive.scheduleDays);
  const resultDays = sortedDays(archive.resultDays);

  if (bashoStatus.kind === 'upcoming') {
    const day = scheduleDays[0];
    return day ? { day, mode: 'schedule' } : null;
  }

  if (bashoStatus.kind === 'live') {
    if (bashoStatus.day === null) return null;

    const resultDay = resultDays.find((day) => (
      day.day === bashoStatus.day && day.status === 'published' && hasMatches(day)
    ));
    if (resultDay) return { day: resultDay, mode: 'result' };

    const scheduleDay = scheduleDays.find((day) => day.day === bashoStatus.day);
    return scheduleDay ? { day: scheduleDay, mode: 'schedule' } : null;
  }

  const publishedResultDays = resultDays
    .filter((day) => day.status === 'published' && hasMatches(day));
  const finalDay = publishedResultDays[publishedResultDays.length - 1];
  return finalDay ? { day: finalDay, mode: 'result' } : null;
}

function rikishiIdFromProfileUrl(profileUrl: string): number | null {
  const match = profileUrl.match(/\/profile\/(\d+)\/?/);
  return match ? Number(match[1]) : null;
}

function boutHref(day: TorikumiArchiveDay, mode: TorikumiPageMode, match: TorikumiMatch): string {
  return `${getDayPath(day, mode)}#${divisionAnchorId(match.division, match.boutNo)}`;
}

function fallbackFeaturedMatchup(
  target: DailyHighlightsTarget,
): { featured: FeaturedMatchup; match: TorikumiMatch } | null {
  const makuuchiMatches = target.day.data.makuuchi.matches;
  const match = makuuchiMatches[makuuchiMatches.length - 1];
  if (!match) return null;

  const eastId = rikishiIdFromProfileUrl(match.eastProfileUrl);
  const westId = rikishiIdFromProfileUrl(match.westProfileUrl);
  if (eastId === null || westId === null) return null;

  return {
    match,
    featured: {
      id: `${target.day.pathDate}-musubi-auto`,
      eastId,
      westId,
      tagJa: '結びの一番',
      tagEn: 'Final Bout of the Day',
      titleJa: '本日の結びの一番',
      titleEn: 'Final Bout of the Day',
      descriptionJa: '土俵を締めくくる結びの一番。両力士のプロフィールと合口に注目です。',
      descriptionEn: 'The concluding bout of the day; rikishi profiles and head-to-head history will appear once published.',
    },
  };
}

// -------------------------------------------------------------
// Main resolver
// -------------------------------------------------------------
/**
 * Returns the official featured matchup(s) for the resolved day. The contract
 * is: cards are only generated from official bout data — there is no static
 * registry, no hand-written descriptions, and no synthetic previews. When
 * official data is not yet available (a schedule day whose makuuchi bouts are
 * still empty), this returns `null` and the UI shows a neutral "awaiting
 * official bouts" notice instead.
 */
export function getDailyHighlights(options: {
  monthKey?: string;
  target: DailyHighlightsTarget;
  matchupWinsMap?: MatchupWinsMap;
}): DailyHighlightsResult | null {
  const monthKey = options?.monthKey ?? torikumiMonthKey;
  const { target } = options;
  const day = target.day.day;

  const fallback = fallbackFeaturedMatchup(target);
  if (!fallback) return null;

  const enriched = enrichFeaturedMatchup(
    fallback.featured,
    options.matchupWinsMap,
    boutHref(target.day, target.mode, fallback.match),
  );
  if (!enriched) return null;

  return {
    monthKey,
    day,
    pathDate: target.day.pathDate,
    mode: target.mode,
    dateTextJa: target.day.label || `第${day}日目`,
    dateTextEn: day === 15 ? 'Final Day' : `Day ${day}`,
    matchups: [enriched],
    isFallback: true,
  };
}
