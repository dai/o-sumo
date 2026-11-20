import type { RankGroup } from './sumo-data';
import type { TorikumiArchiveDay, TorikumiDataSet, TorikumiMatch } from './torikumi-data';
import { canonicalShikona } from './rikishi-display';
import { extractRikishiIdFromProfileUrl } from './rikishi-profile';

export interface YushoDayOpponent {
  name: string;
  profileUrl: string;
}

export interface YushoTodaySimulation {
  win: { wins: number; losses: number };
  lose: { wins: number; losses: number };
}

export interface YushoContender {
  profileUrl: string;
  id: number | null;
  name: string;
  wins: number;
  losses: number;
  remainingBouts: number;
  maxPossibleWins: number;
  diffFromLeader: number;
  banzukeOrder: number;
  /** そのページの日の対戦相手。取組がない日は null、相手未定の場合は name が空文字。 */
  dayOpponent: YushoDayOpponent | null;
  /** 対象日の取組が未確定の場合の勝ち/負けシミュレーション。確定済み・取組なしは null。 */
  todaySimulation?: YushoTodaySimulation | null;
}

export interface YushoFeaturedBout {
  boutNo: number;
  isDirectMatchup: boolean;
  eastName: string;
  eastProfileUrl: string;
  eastRecord?: { wins: number; losses: number };
  westName: string;
  westProfileUrl: string;
  westRecord?: { wins: number; losses: number };
  winner: 'east' | 'west' | null;
  kimarite: string;
}

export type YushoConditionDetail =
  | {
      kind: 'leaderClinch';
      /** 他の全員の最大を上回る勝ち数。 */
      clinchTargetWins: number;
      /** その到達に必要なあと何勝か（0 の場合は既に確定圏内）。 */
      clinchWinsNeeded: number;
      /** あと1敗した場合の到達勝ち数（= MAX_i - 1）。 */
      tieFinishWins: number;
      /** 全勝で tieFinishWins に届く他力士（空の場合は2行目を出さない）。 */
      tieTierNames: string[];
    }
  | {
      kind: 'coLeader';
      coLeaderNames: string[];
      directClashNames: string[];
    }
  | { kind: 'chaserSweep' }
  | { kind: 'chaserEqual' }
  | {
      kind: 'chaser';
      /** 同点のために必要な首位の通算敗数。 */
      tieTotalLosses: number;
      /** 同点のために必要な首位のあと何敗か。 */
      tieAdditionalLosses: number;
      belowWins: number;
      belowLosses: number;
    }
  | { kind: 'playoffOnly' }
  | { kind: 'eliminated' };

export interface YushoConditionRow {
  profileUrl: string;
  id: number | null;
  name: string;
  wins: number;
  losses: number;
  remainingBouts: number;
  maxPossibleWins: number;
  maxLosses: number;
  todaySimulation: YushoTodaySimulation | null;
  topName: string;
  leaderWins: number;
  detail: YushoConditionDetail;
}

export interface YushoHeadToHeadCell {
  aProfileUrl: string;
  aName: string;
  bProfileUrl: string;
  bName: string;
  played: {
    winnerProfileUrl: string;
    day: number;
    dayLabel: string;
    kimarite: string;
  } | null;
  /** そのページの日に組まれている未対戦。なければ null。 */
  scheduledDay: number | null;
  scheduledDayLabel: string | null;
}

export interface YushoClashSide {
  name: string;
  profileUrl: string;
  wins: number;
  losses: number;
  remainingBouts: number;
}

export interface YushoClashOutline {
  east: YushoClashSide;
  west: YushoClashSide;
  leaderWins: number;
  othersBestWins: number;
  boutNo: number;
}

export type YushoClashRelation = 'sole' | 'tied' | 'chasing';
export type YushoClashLoserFate = 'playoff-only' | 'eliminated' | null;

export interface YushoClashOutcome {
  winnerName: string;
  winnerWins: number;
  winnerLosses: number;
  loserName: string;
  loserWins: number;
  loserLosses: number;
  relation: YushoClashRelation;
  gap: number;
  loserFate: YushoClashLoserFate;
}

export interface YushoArasoiSummary {
  targetDay: number;
  totalDays: number;
  remainingDaysAfterTarget: number;
  isDecided: boolean;
  champion: {
    name: string;
    profileUrl: string;
    wins: number;
    losses: number;
    viaPlayoff: boolean;
  } | null;
  /** 集計が依拠する最新結果の日。そのページの日に結果があればその日、なければ直前の結果日。 */
  basisDay: number;
  basisDayLabel: string;
  targetDayLabel: string;
  basisIsoDate: string | null;
  /** そのページの日（カレンダー日付つき見出し用）。 */
  pageIsoDate: string | null;
  contenders: YushoContender[];
  featuredBouts: YushoFeaturedBout[];
  headToHead: YushoHeadToHeadCell[];
  conditionRows: YushoConditionRow[];
  clashOutlines: YushoClashOutline[];
}

const DEFAULT_TOTAL_DAYS = 15;
const MAX_CONTENDERS = 6;
const SHOW_WITHIN_REMAINING_DAYS = 6;

function buildBanzukeOrderMap(makuuchiGroups?: RankGroup[]): Map<string, number> {
  const order = new Map<string, number>();
  if (!makuuchiGroups) return order;
  let index = 0;
  for (const group of makuuchiGroups) {
    for (const rikishi of group.east) {
      if (!order.has(rikishi.profileUrl)) {
        order.set(rikishi.profileUrl, index++);
      }
    }
    for (const rikishi of group.west) {
      if (!order.has(rikishi.profileUrl)) {
        order.set(rikishi.profileUrl, index++);
      }
    }
  }
  return order;
}

function formatDayLabelJa(day: number): string {
  if (day === 1) return '初日';
  if (day === 15) return '千秋楽';
  return `${day}日目`;
}

export type FeaturedHeadingRel = 'today' | 'yesterday' | 'tomorrow' | 'past' | 'future';

function parseIsoDateParts(iso: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

/**
 * 注目対戦見出しの相対区分を純粋に判定する。pageIsoDate がページの日、
 * todayIsoDate が閲覧日（JST の YYYY-MM-DD）。テストでは両方を固定できる。
 */
export function getFeaturedHeadingRel(pageIsoDate: string, todayIsoDate: string): FeaturedHeadingRel {
  const page = parseIsoDateParts(pageIsoDate);
  const today = parseIsoDateParts(todayIsoDate);
  if (!page || !today) return 'past';
  const diffDays = Math.round(
    (Date.UTC(page.year, page.month - 1, page.day) - Date.UTC(today.year, today.month - 1, today.day)) / 86_400_000,
  );
  if (diffDays === 0) return 'today';
  if (diffDays === -1) return 'yesterday';
  if (diffDays === 1) return 'tomorrow';
  return diffDays < 0 ? 'past' : 'future';
}

const EN_MONTH_NAMES = [
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

/** YYYY-MM-DD → 11月19日 / November 19。見出しの日付部分用。 */
export function formatMonthDay(isoDate: string, lang = 'ja'): string {
  const parts = parseIsoDateParts(isoDate);
  if (!parts) return isoDate;
  if (lang.toLowerCase().startsWith('en')) {
    return `${EN_MONTH_NAMES[parts.month - 1] ?? parts.month} ${parts.day}`;
  }
  return `${parts.month}月${parts.day}日`;
}

/**
 * 優勝条件表の行を集計値から機械的に作る。各力士について到達・前提・脱落を判定する。
 * standings は勝ち星降順（首位が先頭）を想定するが、先頭以外でも動作する。
 */
export function buildConditionRows(standings: YushoContender[], totalDays: number): YushoConditionRow[] {
  if (standings.length === 0) return [];
  const leaderWins = Math.max(...standings.map((s) => s.wins));
  const leaders = standings.filter((s) => s.wins === leaderWins);
  const leaderMaxWins = Math.max(...leaders.map((s) => s.maxPossibleWins));
  const topName = leaders[0].name;
  const leaderLosses = leaders[0].losses;

  return standings.map((item) => {
    const base = {
      profileUrl: item.profileUrl,
      id: item.id,
      name: item.name,
      wins: item.wins,
      losses: item.losses,
      remainingBouts: item.remainingBouts,
      maxPossibleWins: item.maxPossibleWins,
      maxLosses: totalDays - item.maxPossibleWins,
      todaySimulation: item.todaySimulation ?? null,
      topName,
      leaderWins,
    };

    if (item.wins === leaderWins && leaders.length === 1) {
      const maxOtherMax = Math.max(...standings.filter((s) => s !== item).map((s) => s.maxPossibleWins), -1);
      const clinchTargetWins = maxOtherMax + 1;
      const tieFinishWins = item.maxPossibleWins - 1;
      const tieTierNames =
        tieFinishWins >= item.wins
          ? standings
              .filter((s) => s !== item && s.maxPossibleWins === tieFinishWins)
              .map((s) => s.name)
          : [];
      return {
        ...base,
        detail: {
          kind: 'leaderClinch',
          clinchTargetWins,
          clinchWinsNeeded: Math.max(0, clinchTargetWins - item.wins),
          tieFinishWins,
          tieTierNames,
        } as YushoConditionDetail,
      };
    }

    if (item.wins === leaderWins) {
      const coLeaderNames = leaders.filter((s) => s !== item).map((s) => s.name);
      return {
        ...base,
        detail: { kind: 'coLeader', coLeaderNames, directClashNames: [] } as YushoConditionDetail,
      };
    }

    if (item.maxPossibleWins < leaderWins) {
      return { ...base, detail: { kind: 'eliminated' } as YushoConditionDetail };
    }
    if (item.maxPossibleWins === leaderWins) {
      return { ...base, detail: { kind: 'playoffOnly' } as YushoConditionDetail };
    }
    if (item.maxPossibleWins > leaderMaxWins) {
      return { ...base, detail: { kind: 'chaserSweep' } as YushoConditionDetail };
    }
    if (item.maxPossibleWins === leaderMaxWins) {
      return { ...base, detail: { kind: 'chaserEqual' } as YushoConditionDetail };
    }
    const tieTotalLosses = totalDays - item.maxPossibleWins;
    return {
      ...base,
      detail: {
        kind: 'chaser',
        tieTotalLosses,
        tieAdditionalLosses: tieTotalLosses - leaderLosses,
        belowWins: item.maxPossibleWins - 1,
        belowLosses: totalDays - (item.maxPossibleWins - 1),
      } as YushoConditionDetail,
    };
  });
}

/**
 * 直接対決の片側が勝った場合の両者の成績と首位関係を計算する。
 * othersBestWins は対戦2人以外の最高勝ち星。
 */
export function describeClashOutcome(
  side: YushoClashSide,
  other: YushoClashSide,
  othersBestWins: number,
): YushoClashOutcome {
  const winnerWins = side.wins + 1;
  const winnerLosses = side.losses;
  const loserWins = other.wins;
  const loserLosses = other.losses + 1;
  const topExcludingWinner = Math.max(loserWins, othersBestWins);
  const relation: YushoClashRelation =
    winnerWins > topExcludingWinner ? 'sole' : winnerWins === topExcludingWinner ? 'tied' : 'chasing';
  const gap = Math.max(0, topExcludingWinner - winnerWins);
  const loserMaxAfter = loserWins + Math.max(0, other.remainingBouts - 1);
  const newTop = Math.max(winnerWins, othersBestWins);
  const loserFate: YushoClashLoserFate =
    loserMaxAfter < newTop ? 'eliminated' : loserMaxAfter === newTop ? 'playoff-only' : null;
  return {
    winnerName: side.name,
    winnerWins,
    winnerLosses,
    loserName: other.name,
    loserWins,
    loserLosses,
    relation,
    gap,
    loserFate,
  };
}

function getTargetDayObject(
  archive: TorikumiDataSet,
  targetDay: number,
  overrideDayData?: TorikumiArchiveDay['data'],
): TorikumiArchiveDay | undefined {
  const resultDay = (archive.resultDays ?? []).find((d) => d.day === targetDay);
  if (resultDay) {
    if (overrideDayData) {
      return { ...resultDay, data: overrideDayData };
    }
    return resultDay;
  }
  const scheduleDay = (archive.scheduleDays ?? []).find((d) => d.day === targetDay);
  if (scheduleDay && overrideDayData) {
    return { ...scheduleDay, data: overrideDayData };
  }
  return scheduleDay;
}

function isAbsentMatch(match: TorikumiMatch, absenteeIds: Set<number>): boolean {
  if (match.winner) return false;
  const eastId = extractRikishiIdFromProfileUrl(match.eastProfileUrl);
  const westId = extractRikishiIdFromProfileUrl(match.westProfileUrl);
  return (eastId !== null && absenteeIds.has(eastId)) || (westId !== null && absenteeIds.has(westId));
}

export function shouldShowYushoArasoi(
  archive: TorikumiDataSet,
  targetDay: number,
): boolean {
  const totalDays = Math.max(
    DEFAULT_TOTAL_DAYS,
    archive.resultDays?.length ?? 0,
    archive.scheduleDays?.length ?? 0,
  );
  // 15日制で「残り日数が6日以下（十一月場所では十一日目から）」を表示条件とする。
  // 10日目終了時点での残り5日（11〜15日目）＝ 十一日目以降。
  const remainingFromDay = totalDays - targetDay + 1;
  if (remainingFromDay > SHOW_WITHIN_REMAINING_DAYS - 1) {
    // remainingFromDay <= 5 => targetDay >= 11 (in a 15-day basho)
    return false;
  }
  const days = archive.resultDays ?? [];
  const hasAnyMakuuchiMatch = days.some(
    (d) => d.day <= targetDay && d.data.makuuchi.matches.length > 0,
  );
  return hasAnyMakuuchiMatch;
}

export function computeYushoArasoi({
  archive,
  targetDay,
  makuuchiBanzuke,
  visibleDayData,
}: {
  archive: TorikumiDataSet;
  targetDay: number;
  makuuchiBanzuke?: RankGroup[];
  visibleDayData?: TorikumiArchiveDay['data'];
}): YushoArasoiSummary | null {
  if (!shouldShowYushoArasoi(archive, targetDay)) {
    return null;
  }

  const totalDays = Math.max(
    DEFAULT_TOTAL_DAYS,
    archive.resultDays?.length ?? 0,
    archive.scheduleDays?.length ?? 0,
  );
  const banzukeOrderMap = buildBanzukeOrderMap(makuuchiBanzuke);

  const records = new Map<string, { name: string; wins: number; losses: number }>();
  const ensureRikishi = (profileUrl: string, fallbackName: string) => {
    const existing = records.get(profileUrl);
    if (existing) return existing;
    const entry = {
      name: canonicalShikona(profileUrl, fallbackName),
      wins: 0,
      losses: 0,
    };
    records.set(profileUrl, entry);
    return entry;
  };

  // 1日目〜targetDay までの幕内本割の勝敗を集計する
  const resultDays = [...(archive.resultDays ?? [])]
    .filter((d) => d.day <= targetDay)
    .sort((a, b) => a.day - b.day);

  let playoffWinner: { name: string; profileUrl: string } | null = null;
  const playedMap = new Map<
    string,
    { day: number; dayLabel: string; winnerProfileUrl: string; kimarite: string }
  >();

  for (const dayItem of resultDays) {
    const matches = dayItem.day === targetDay && visibleDayData
      ? visibleDayData.makuuchi.matches
      : dayItem.data.makuuchi.matches;

    for (const match of matches) {
      if (match.isPlayoff) {
        if (match.winner === 'east') {
          playoffWinner = {
            name: canonicalShikona(match.eastProfileUrl, match.eastName),
            profileUrl: match.eastProfileUrl,
          };
        } else if (match.winner === 'west') {
          playoffWinner = {
            name: canonicalShikona(match.westProfileUrl, match.westName),
            profileUrl: match.westProfileUrl,
          };
        }
        continue;
      }

      const east = ensureRikishi(match.eastProfileUrl, match.eastName);
      const west = ensureRikishi(match.westProfileUrl, match.westName);

      if (match.winner === 'east') {
        east.wins += 1;
        west.losses += 1;
      } else if (match.winner === 'west') {
        west.wins += 1;
        east.losses += 1;
      }

      if (match.winner === 'east' || match.winner === 'west') {
        const pairKey = [match.eastProfileUrl, match.westProfileUrl].sort().join('|');
        const winnerIsEast = match.winner === 'east';
        playedMap.set(pairKey, {
          day: dayItem.day,
          dayLabel: formatDayLabelJa(dayItem.day),
          winnerProfileUrl: winnerIsEast ? match.eastProfileUrl : match.westProfileUrl,
          kimarite: match.kimarite,
        });
      }
    }
  }

  if (records.size === 0) {
    return null;
  }

  // 当日（targetDay）に未確定の本割がある力士を特定する
  const currentDayObj = getTargetDayObject(archive, targetDay, visibleDayData);
  const currentMatches = currentDayObj?.data.makuuchi.matches ?? [];
  const currentAbsenteeIds = new Set<number>(
    (currentDayObj?.data.makuuchi.absentees ?? []).map((a) => a.id),
  );
  const hasPendingBoutToday = new Set<string>();
  for (const match of currentMatches) {
    if (match.isPlayoff) continue;
    if (!match.winner && !isAbsentMatch(match, currentAbsenteeIds)) {
      hasPendingBoutToday.add(match.eastProfileUrl);
      hasPendingBoutToday.add(match.westProfileUrl);
    }
  }

  const remainingDaysAfterTarget = Math.max(0, totalDays - targetDay);

  // そのページの日の対戦相手（両側から引けるよう両方向に登録）
  const dayOpponentMap = new Map<string, YushoDayOpponent>();
  for (const match of currentMatches) {
    if (match.isPlayoff) continue;
    if (isAbsentMatch(match, currentAbsenteeIds)) continue;
    dayOpponentMap.set(match.eastProfileUrl, {
      name: match.westName ? canonicalShikona(match.westProfileUrl, match.westName) : '',
      profileUrl: match.westProfileUrl,
    });
    dayOpponentMap.set(match.westProfileUrl, {
      name: match.eastName ? canonicalShikona(match.eastProfileUrl, match.eastName) : '',
      profileUrl: match.eastProfileUrl,
    });
  }

  const allStandings: YushoContender[] = Array.from(records.entries()).map(([profileUrl, rec]) => {
    const pendingToday = hasPendingBoutToday.has(profileUrl);
    const remainingBouts = remainingDaysAfterTarget + (pendingToday ? 1 : 0);
    const todaySimulation: YushoTodaySimulation | null = pendingToday
      ? {
          win: { wins: rec.wins + 1, losses: rec.losses },
          lose: { wins: rec.wins, losses: rec.losses + 1 },
        }
      : null;
    return {
      profileUrl,
      id: extractRikishiIdFromProfileUrl(profileUrl),
      name: rec.name,
      wins: rec.wins,
      losses: rec.losses,
      remainingBouts,
      maxPossibleWins: rec.wins + remainingBouts,
      diffFromLeader: 0,
      banzukeOrder: banzukeOrderMap.get(profileUrl) ?? Number.MAX_SAFE_INTEGER,
      dayOpponent: dayOpponentMap.get(profileUrl) ?? null,
      todaySimulation,
    };
  });

  // 勝ち星降順 → 同数の場合は番付順
  allStandings.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (a.losses !== b.losses) return a.losses - b.losses;
    if (a.banzukeOrder !== b.banzukeOrder) return a.banzukeOrder - b.banzukeOrder;
    return a.name.localeCompare(b.name, 'ja');
  });

  const leaderWins = allStandings[0].wins;
  for (const item of allStandings) {
    item.diffFromLeader = leaderWins - item.wins;
  }

  // 優勝確定判定
  let isDecided = false;
  let champion: YushoArasoiSummary['champion'] = null;

  if (playoffWinner) {
    const champRec = records.get(playoffWinner.profileUrl);
    isDecided = true;
    champion = {
      name: playoffWinner.name,
      profileUrl: playoffWinner.profileUrl,
      wins: champRec?.wins ?? leaderWins,
      losses: champRec?.losses ?? 0,
      viaPlayoff: true,
    };
  } else {
    const leaders = allStandings.filter((s) => s.wins === leaderWins);
    if (leaders.length === 1) {
      const top = leaders[0];
      const others = allStandings.slice(1);
      const maxOtherPossibleWins = others.reduce((max, s) => Math.max(max, s.maxPossibleWins), -1);
      if (top.wins > maxOtherPossibleWins) {
        isDecided = true;
        champion = {
          name: top.name,
          profileUrl: top.profileUrl,
          wins: top.wins,
          losses: top.losses,
          viaPlayoff: false,
        };
      }
    }
  }

  // 優勝可能性が残っている力士のみから首位グループ（最大6人程度）を選出
  const eligible = allStandings.filter((s) => s.maxPossibleWins >= leaderWins);
  const contenders: YushoContender[] = [];
  if (eligible.length <= MAX_CONTENDERS) {
    contenders.push(...eligible);
  } else {
    // 勝ち星グループ単位で含め、6人以内を基本とする（首位グループだけは全員含める）
    const winGroups = new Map<number, YushoContender[]>();
    for (const s of eligible) {
      const list = winGroups.get(s.wins) ?? [];
      list.push(s);
      winGroups.set(s.wins, list);
    }
    const sortedWinLevels = Array.from(winGroups.keys()).sort((a, b) => b - a);
    for (const w of sortedWinLevels) {
      const group = winGroups.get(w) ?? [];
      if (contenders.length === 0 || contenders.length + group.length <= MAX_CONTENDERS) {
        contenders.push(...group);
      } else {
        break;
      }
    }
  }

  const contenderSet = new Set(contenders.map((c) => c.profileUrl));
  const contenderMap = new Map(contenders.map((c) => [c.profileUrl, c]));

  // 本日の注目対戦
  const featuredBouts: YushoFeaturedBout[] = [];
  for (const match of currentMatches) {
    if (match.isPlayoff) continue;
    if (isAbsentMatch(match, currentAbsenteeIds)) continue;
    const eastIn = contenderSet.has(match.eastProfileUrl);
    const westIn = contenderSet.has(match.westProfileUrl);
    if (!eastIn && !westIn) continue;

    const eastRec = records.get(match.eastProfileUrl);
    const westRec = records.get(match.westProfileUrl);

    featuredBouts.push({
      boutNo: match.boutNo,
      isDirectMatchup: eastIn && westIn,
      eastName: canonicalShikona(match.eastProfileUrl, match.eastName),
      eastProfileUrl: match.eastProfileUrl,
      eastRecord: eastRec ? { wins: eastRec.wins, losses: eastRec.losses } : undefined,
      westName: canonicalShikona(match.westProfileUrl, match.westName),
      westProfileUrl: match.westProfileUrl,
      westRecord: westRec ? { wins: westRec.wins, losses: westRec.losses } : undefined,
      winner: match.winner ?? null,
      kimarite: match.kimarite,
    });
  }

  // 直接対決を先頭に、あとは取組順
  featuredBouts.sort((a, b) => {
    if (a.isDirectMatchup !== b.isDirectMatchup) {
      return a.isDirectMatchup ? -1 : 1;
    }
    return a.boutNo - b.boutNo;
  });

  // そのページの日に組まれている首位グループ同士の対戦キー
  const scheduledPairKeys = new Set<string>();
  for (const match of currentMatches) {
    if (match.isPlayoff) continue;
    if (isAbsentMatch(match, currentAbsenteeIds)) continue;
    if (match.winner) continue;
    scheduledPairKeys.add([match.eastProfileUrl, match.westProfileUrl].sort().join('|'));
  }

  // 首位グループ内の直接対決を正方マトリクス用のセル列に変換
  const headToHead: YushoHeadToHeadCell[] = [];
  for (let i = 0; i < contenders.length; i++) {
    for (let j = i + 1; j < contenders.length; j++) {
      const a = contenders[i];
      const b = contenders[j];
      const pairKey = [a.profileUrl, b.profileUrl].sort().join('|');
      const played = playedMap.get(pairKey);
      headToHead.push({
        aProfileUrl: a.profileUrl,
        aName: a.name,
        bProfileUrl: b.profileUrl,
        bName: b.name,
        played: played
          ? {
              winnerProfileUrl: played.winnerProfileUrl,
              day: played.day,
              dayLabel: played.dayLabel,
              kimarite: played.kimarite,
            }
          : null,
        scheduledDay: !played && scheduledPairKeys.has(pairKey) ? targetDay : null,
        scheduledDayLabel: !played && scheduledPairKeys.has(pairKey) ? formatDayLabelJa(targetDay) : null,
      });
    }
  }

  // 優勝条件表の行を機械的に構築（首位の複数人並走時は未対戦の直接対決名を補う）
  const conditionRows = buildConditionRows(contenders, totalDays);
  const leaderProfiles = new Set(contenders.filter((c) => c.wins === leaderWins).map((c) => c.profileUrl));
  if (leaderProfiles.size > 1) {
    for (const row of conditionRows) {
      if (row.detail.kind !== 'coLeader') continue;
      const names: string[] = [];
      for (const cell of headToHead) {
        if (cell.played) continue;
        const involvesRow =
          cell.aProfileUrl === row.profileUrl || cell.bProfileUrl === row.profileUrl;
        if (!involvesRow) continue;
        const otherUrl = cell.aProfileUrl === row.profileUrl ? cell.bProfileUrl : cell.aProfileUrl;
        if (!leaderProfiles.has(otherUrl)) continue;
        names.push(cell.aProfileUrl === row.profileUrl ? cell.bName : cell.aName);
      }
      row.detail.directClashNames = names;
    }
  }

  // 直接対決がある日の追加行（残り3日以下 = 終盤のみ）。勝敗未定の直接対決が対象。
  const clashOutlines: YushoClashOutline[] = [];
  if (totalDays - targetDay <= 2) {
    for (const bout of featuredBouts) {
      if (!bout.isDirectMatchup || bout.winner) continue;
      const east = contenderMap.get(bout.eastProfileUrl);
      const west = contenderMap.get(bout.westProfileUrl);
      if (!east || !west) continue;
      const othersBestWins = contenders
        .filter((c) => c.profileUrl !== east.profileUrl && c.profileUrl !== west.profileUrl)
        .reduce((max, c) => Math.max(max, c.wins), 0);
      clashOutlines.push({
        east: {
          name: east.name,
          profileUrl: east.profileUrl,
          wins: east.wins,
          losses: east.losses,
          remainingBouts: east.remainingBouts,
        },
        west: {
          name: west.name,
          profileUrl: west.profileUrl,
          wins: west.wins,
          losses: west.losses,
          remainingBouts: west.remainingBouts,
        },
        leaderWins,
        othersBestWins,
        boutNo: bout.boutNo,
      });
    }
    clashOutlines.sort((a, b) => a.boutNo - b.boutNo);
  }

  // 集計時点：そのページの日に結果があればその日、なければ直前の結果日
  const currentDecidedCount = currentMatches.filter((m) => !m.isPlayoff && m.winner).length;
  const latestPublishedBelow = (archive.resultDays ?? [])
    .filter((d) => d.day < targetDay && d.status === 'published')
    .reduce((max, d) => Math.max(max, d.day), -1);
  const basisDay =
    currentDecidedCount > 0 || latestPublishedBelow < 0 ? targetDay : latestPublishedBelow;
  const isoOfDay = (day: number): string | null => {
    const found =
      (archive.resultDays ?? []).find((d) => d.day === day) ??
      (archive.scheduleDays ?? []).find((d) => d.day === day);
    return found?.isoDate ?? null;
  };
  // 見出し・時点表示の日付はページと揃えるためアーカイブの日ラベルを使う
  const labelOfDay = (day: number): string => {
    const found =
      (archive.resultDays ?? []).find((d) => d.day === day) ??
      (archive.scheduleDays ?? []).find((d) => d.day === day);
    return found?.label ?? formatDayLabelJa(day);
  };

  return {
    targetDay,
    totalDays,
    remainingDaysAfterTarget,
    isDecided,
    champion,
    basisDay,
    basisDayLabel: labelOfDay(basisDay),
    targetDayLabel: labelOfDay(targetDay),
    basisIsoDate: isoOfDay(basisDay),
    pageIsoDate: isoOfDay(targetDay),
    contenders,
    featuredBouts,
    headToHead,
    conditionRows,
    clashOutlines,
  };
}
