import type { RankGroup } from './sumo-data';
import type { TorikumiArchiveDay, TorikumiDataSet, TorikumiMatch } from './torikumi-data';
import { canonicalShikona } from './rikishi-display';
import { extractRikishiIdFromProfileUrl } from './rikishi-profile';

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

export interface YushoPlayedMatchup {
  day: number;
  dayLabel: string;
  winnerName: string;
  winnerProfileUrl: string;
  loserName: string;
  loserProfileUrl: string;
  kimarite: string;
}

export interface YushoUnplayedMatchup {
  rikishiA: { name: string; profileUrl: string };
  rikishiB: { name: string; profileUrl: string };
  isLeaderClash: boolean;
}

export type YushoConditionLine =
  | {
      kind: 'decided';
      championName: string;
      wins: number;
      losses: number;
      viaPlayoff: boolean;
    }
  | {
      kind: 'leaderSingle';
      name: string;
      wins: number;
      losses: number;
      maxWins: number;
      isSelfDetermined: boolean;
      hasUnplayedWithChasers: boolean;
    }
  | {
      kind: 'leaderTied';
      names: string[];
      wins: number;
      losses: number;
      maxWins: number;
      hasUnplayedDirectClash: boolean;
    }
  | {
      kind: 'chaserGroup';
      names: string[];
      wins: number;
      losses: number;
      maxWins: number;
      needLeaderTotalLosses: number;
      needLeaderAdditionalLosses: number;
      playoffAtMaxWins: boolean;
    };

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
  contenders: YushoContender[];
  featuredBouts: YushoFeaturedBout[];
  unplayedMatchups: YushoUnplayedMatchup[];
  playedMatchups: YushoPlayedMatchup[];
  conditions: YushoConditionLine[];
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
  const playedMap = new Map<string, YushoPlayedMatchup>();

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
          winnerName: winnerIsEast ? east.name : west.name,
          winnerProfileUrl: winnerIsEast ? match.eastProfileUrl : match.westProfileUrl,
          loserName: winnerIsEast ? west.name : east.name,
          loserProfileUrl: winnerIsEast ? match.westProfileUrl : match.eastProfileUrl,
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

  const allStandings: YushoContender[] = Array.from(records.entries()).map(([profileUrl, rec]) => {
    const remainingBouts = remainingDaysAfterTarget + (hasPendingBoutToday.has(profileUrl) ? 1 : 0);
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

  // 首位グループ内の直接対決（対戦済み / 未対戦）
  const playedMatchups: YushoPlayedMatchup[] = [];
  const unplayedMatchups: YushoUnplayedMatchup[] = [];

  for (let i = 0; i < contenders.length; i++) {
    for (let j = i + 1; j < contenders.length; j++) {
      const a = contenders[i];
      const b = contenders[j];
      const pairKey = [a.profileUrl, b.profileUrl].sort().join('|');
      const played = playedMap.get(pairKey);
      if (played) {
        playedMatchups.push(played);
      } else {
        unplayedMatchups.push({
          rikishiA: { name: a.name, profileUrl: a.profileUrl },
          rikishiB: { name: b.name, profileUrl: b.profileUrl },
          isLeaderClash: a.wins === leaderWins && b.wins === leaderWins,
        });
      }
    }
  }
  playedMatchups.sort((a, b) => a.day - b.day);

  // 優勝条件の短文を機械的に構築
  const conditions: YushoConditionLine[] = [];
  if (isDecided && champion) {
    conditions.push({
      kind: 'decided',
      championName: champion.name,
      wins: champion.wins,
      losses: champion.losses,
      viaPlayoff: champion.viaPlayoff,
    });
  } else {
    const leaders = contenders.filter((c) => c.wins === leaderWins);
    const chasers = contenders.filter((c) => c.wins < leaderWins);
    const leaderMaxWins = leaders[0]?.maxPossibleWins ?? leaderWins;
    const maxChaserPossibleWins = chasers.reduce((max, c) => Math.max(max, c.maxPossibleWins), -1);

    if (leaders.length === 1) {
      const leader = leaders[0];
      const isSelfDetermined = leader.maxPossibleWins > maxChaserPossibleWins;
      const hasUnplayedWithChasers = chasers.some((c) =>
        unplayedMatchups.some(
          (u) =>
            (u.rikishiA.profileUrl === leader.profileUrl && u.rikishiB.profileUrl === c.profileUrl) ||
            (u.rikishiB.profileUrl === leader.profileUrl && u.rikishiA.profileUrl === c.profileUrl),
        ),
      );
      conditions.push({
        kind: 'leaderSingle',
        name: leader.name,
        wins: leader.wins,
        losses: leader.losses,
        maxWins: leader.maxPossibleWins,
        isSelfDetermined,
        hasUnplayedWithChasers,
      });
    } else if (leaders.length > 1) {
      const hasUnplayedDirectClash = unplayedMatchups.some((u) => u.isLeaderClash);
      conditions.push({
        kind: 'leaderTied',
        names: leaders.map((l) => l.name),
        wins: leaders[0].wins,
        losses: leaders[0].losses,
        maxWins: leaderMaxWins,
        hasUnplayedDirectClash,
      });
    }

    // 追う側を勝ち星ごとにグルーピング
    const chaserWinLevels = Array.from(new Set(chasers.map((c) => c.wins))).sort((a, b) => b - a);
    const leaderCurrentLosses = leaders[0]?.losses ?? 0;
    for (const w of chaserWinLevels) {
      const group = chasers.filter((c) => c.wins === w);
      const rep = group[0];
      const chaserMaxWins = rep.maxPossibleWins;
      if (chaserMaxWins < leaderWins) continue;

      const needAdditionalLossesForTie = Math.max(0, leaderMaxWins - chaserMaxWins);
      const needTotalLossesForTie = leaderCurrentLosses + needAdditionalLossesForTie;
      conditions.push({
        kind: 'chaserGroup',
        names: group.map((g) => g.name),
        wins: rep.wins,
        losses: rep.losses,
        maxWins: chaserMaxWins,
        needLeaderTotalLosses: needTotalLossesForTie,
        needLeaderAdditionalLosses: needAdditionalLossesForTie,
        playoffAtMaxWins: chaserMaxWins <= leaderMaxWins,
      });
    }
  }

  // 未使用警告回避のため contenderMap 参照が必要なら使う（不要なら削除）
  void contenderMap;

  return {
    targetDay,
    totalDays,
    remainingDaysAfterTarget,
    isDecided,
    champion,
    contenders,
    featuredBouts,
    unplayedMatchups,
    playedMatchups,
    conditions,
  };
}
