import { describe, expect, it } from 'vitest';
import { torikumiData, type TorikumiArchiveDay, type TorikumiDataSet } from './torikumi-data';
import { makuuchiData } from './sumo-data';
import {
  buildConditionRows,
  computeYushoArasoi,
  describeClashOutcome,
  formatMonthDay,
  getFeaturedHeadingRel,
  shouldShowYushoArasoi,
  type YushoContender,
} from './yusho-arasoi';

function buildDay10SnapshotWithDay11Schedule(): TorikumiDataSet {
  const daysUpTo10 = (torikumiData.resultDays ?? []).filter((d) => d.day <= 10);
  const day11 = (torikumiData.resultDays ?? []).find((d) => d.day === 11);
  if (!day11) {
    throw new Error('Day 11 not found in torikumiData');
  }

  // 11日目の取組結果を未確定状態（取組発表直後）に戻したスナップショットを作成
  const pendingDay11 = {
    ...day11,
    status: 'pending' as const,
    data: {
      ...day11.data,
      makuuchi: {
        ...day11.data.makuuchi,
        matches: day11.data.makuuchi.matches.map((m) => ({
          ...m,
          kimarite: '未定',
          winner: null,
        })),
      },
    },
  };

  return {
    ...torikumiData,
    resultDays: [...daysUpTo10, pendingDay11],
  };
}

const DAY12_WINNERS: Array<{ url: string; kimarite: string }> = [
  { url: 'https://www.sumo.or.jp/ResultRikishiData/profile/3371/', kimarite: '寄り切り' },
  { url: 'https://www.sumo.or.jp/ResultRikishiData/profile/4227/', kimarite: '押し出し' },
  { url: 'https://www.sumo.or.jp/ResultRikishiData/profile/4055/', kimarite: '押し出し' },
  { url: 'https://www.sumo.or.jp/ResultRikishiData/profile/4112/', kimarite: '下手出し投げ' },
];

/**
 * 十二日目終了時点のスナップショット。公開済みの十二日目途中経過に残り4番の
 * 結果（若元春○―義ノ富士、大の里○―霧島、熱海富士○―安青錦、金峰山○―出羽ノ龍）を
 * 適用し、十三日目の公開済み取組を可視データとして渡す。
 */
function buildDay12FinalSnapshot(): { archive: TorikumiDataSet; day13Data: TorikumiArchiveDay['data'] } {
  const resultDays = (torikumiData.resultDays ?? []).map((d) => {
    if (d.day !== 12) return d;
    return {
      ...d,
      status: 'published' as const,
      data: {
        ...d.data,
        makuuchi: {
          ...d.data.makuuchi,
          matches: d.data.makuuchi.matches.map((m) => {
            if (m.winner) return m;
            const decided = DAY12_WINNERS.find(
              (w) => w.url === m.eastProfileUrl || w.url === m.westProfileUrl,
            );
            if (!decided) return m;
            return {
              ...m,
              winner: (decided.url === m.eastProfileUrl ? 'east' : 'west') as 'east' | 'west',
              kimarite: decided.kimarite,
            };
          }),
        },
      },
    };
  });
  const day13 = (torikumiData.scheduleDays ?? []).find((d) => d.day === 13);
  if (!day13) {
    throw new Error('Day 13 schedule not found in torikumiData');
  }
  return { archive: { ...torikumiData, resultDays }, day13Data: day13.data };
}

function makeContender(
  url: string,
  name: string,
  wins: number,
  losses: number,
  remainingBouts: number,
): YushoContender {
  return {
    profileUrl: url,
    id: null,
    name,
    wins,
    losses,
    remainingBouts,
    maxPossibleWins: wins + remainingBouts,
    diffFromLeader: 0,
    banzukeOrder: 0,
    dayOpponent: null,
  };
}

describe('shouldShowYushoArasoi', () => {
  it('returns false on day 10 and earlier in a 15-day basho', () => {
    expect(shouldShowYushoArasoi(torikumiData, 1)).toBe(false);
    expect(shouldShowYushoArasoi(torikumiData, 10)).toBe(false);
  });

  it('returns true on day 11 through day 15 when makuuchi bouts exist', () => {
    expect(shouldShowYushoArasoi(torikumiData, 11)).toBe(true);
    expect(shouldShowYushoArasoi(torikumiData, 15)).toBe(true);
  });
});

describe('computeYushoArasoi', () => {
  it('matches the day-10 snapshot standings, featured bouts, and head-to-head on day 11 before results', () => {
    const snapshot = buildDay10SnapshotWithDay11Schedule();
    const summary = computeYushoArasoi({
      archive: snapshot,
      targetDay: 11,
      makuuchiBanzuke: makuuchiData,
    });

    expect(summary).not.toBeNull();
    expect(summary!.isDecided).toBe(false);

    // 首位グループ（9勝1敗が2人、8勝2敗が4人、計6人）
    expect(summary!.contenders.map((c) => `${c.name}:${c.wins}-${c.losses}:${c.diffFromLeader}`)).toEqual([
      '熱海富士:9-1:0',
      '若元春:9-1:0',
      '大の里:8-2:1',
      '霧島:8-2:1',
      '金峰山:8-2:1',
      '出羽ノ龍:8-2:1',
    ]);

    // 十一日目の注目対戦（首位グループの直接対決 若元春 vs 出羽ノ龍 が先頭）
    expect(summary!.featuredBouts.length).toBe(5);
    expect(summary!.featuredBouts[0].isDirectMatchup).toBe(true);
    expect(summary!.featuredBouts[0].eastName).toBe('若元春');
    expect(summary!.featuredBouts[0].westName).toBe('出羽ノ龍');

    // 対戦済み直接対決（四日目 若元春○―金峰山、十日目 熱海富士○―大の里）
    const playedCells = summary!.headToHead.filter((c) => c.played !== null);
    expect(playedCells).toHaveLength(2);
    const wakaKin = summary!.headToHead.find(
      (c) =>
        (c.aName === '若元春' && c.bName === '金峰山') || (c.aName === '金峰山' && c.bName === '若元春'),
    );
    expect(wakaKin!.played).toMatchObject({
      day: 4,
      dayLabel: '4日目',
      winnerProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3371/',
      kimarite: '突き落とし',
    });
    const atamiOno = summary!.headToHead.find(
      (c) =>
        (c.aName === '熱海富士' && c.bName === '大の里') || (c.aName === '大の里' && c.bName === '熱海富士'),
    );
    expect(atamiOno!.played).toMatchObject({
      day: 10,
      dayLabel: '10日目',
      winnerProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4055/',
      kimarite: '押し出し',
    });

    // 未対戦は 15 - 2 = 13 組、うち首位同士（若元春―熱海富士）を含む
    expect(summary!.headToHead).toHaveLength(15);
    const wakaAtami = summary!.headToHead.find(
      (c) =>
        (c.aName === '若元春' && c.bName === '熱海富士') || (c.aName === '熱海富士' && c.bName === '若元春'),
    );
    expect(wakaAtami!.played).toBeNull();
    expect(wakaAtami!.scheduledDay).toBeNull();

    // 優勝条件（首位2人の並走＋追う側の決定戦条件）
    const rows = summary!.conditionRows;
    expect(rows[0]).toMatchObject({
      name: '熱海富士',
      detail: { kind: 'coLeader', coLeaderNames: ['若元春'], directClashNames: ['若元春'] },
    });
    expect(rows[1]).toMatchObject({
      name: '若元春',
      detail: { kind: 'coLeader', coLeaderNames: ['熱海富士'], directClashNames: ['熱海富士'] },
    });
    const ono = rows.find((r) => r.name === '大の里');
    expect(ono).toMatchObject({
      wins: 8,
      losses: 2,
      maxPossibleWins: 13,
      detail: { kind: 'chaser', tieTotalLosses: 2, tieAdditionalLosses: 1, belowWins: 12, belowLosses: 3 },
    });
  });

  it('automatically updates standings and conditions after day 11 results are published', () => {
    const summary = computeYushoArasoi({
      archive: torikumiData,
      targetDay: 11,
      makuuchiBanzuke: makuuchiData,
    });

    expect(summary).not.toBeNull();
    expect(summary!.isDecided).toBe(false);
    // 11日目結果更新後：若元春が10勝1敗で単独首位
    expect(summary!.contenders[0]).toMatchObject({
      name: '若元春',
      wins: 10,
      losses: 1,
      diffFromLeader: 0,
    });
    expect(summary!.conditionRows[0]).toMatchObject({
      name: '若元春',
      maxPossibleWins: 14,
      detail: { kind: 'leaderClinch', clinchTargetWins: 14, clinchWinsNeeded: 4, tieFinishWins: 13 },
    });
  });

  it('matches the day-12 final snapshot on the day-13 page before bouts', () => {
    const { archive, day13Data } = buildDay12FinalSnapshot();
    const summary = computeYushoArasoi({
      archive,
      targetDay: 13,
      makuuchiBanzuke: makuuchiData,
      visibleDayData: day13Data,
    });

    expect(summary).not.toBeNull();
    expect(summary!.isDecided).toBe(false);

    // 集計時点は十二日目終了時点（十三日目開始前）
    expect(summary!.basisDay).toBe(12);
    expect(summary!.basisDayLabel).toBe('十二日目');
    expect(summary!.targetDayLabel).toBe('十三日目');
    expect(summary!.pageIsoDate).toBe('2026-11-20');
    expect(summary!.basisIsoDate).toBe('2026-11-19');

    // 首位グループの表（差・力士・成績・残り・最大）
    const top4 = summary!.contenders.slice(0, 4);
    expect(top4[0]).toMatchObject({ name: '若元春', wins: 11, losses: 1, diffFromLeader: 0, remainingBouts: 3, maxPossibleWins: 14 });
    const rest = new Map(top4.slice(1).map((c) => [c.name, c]));
    expect([...rest.keys()].sort()).toEqual(['大の里', '熱海富士', '金峰山']);
    for (const name of ['大の里', '熱海富士', '金峰山'] as const) {
      expect(rest.get(name)).toMatchObject({ wins: 10, losses: 2, diffFromLeader: 1, remainingBouts: 3, maxPossibleWins: 13 });
    }

    // その日の相手（十三日目の対戦）
    const opponentOf = (name: string) => top4.find((c) => c.name === name)!.dayOpponent;
    expect(opponentOf('若元春')).toMatchObject({ name: '大の里' });
    expect(opponentOf('大の里')).toMatchObject({ name: '若元春' });
    expect(opponentOf('熱海富士')).toMatchObject({
      profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3907/',
    });
    expect(opponentOf('熱海富士')!.name.length).toBeGreaterThan(0);
    expect(opponentOf('金峰山')).toMatchObject({
      profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3622/',
    });
    expect(opponentOf('金峰山')!.name.length).toBeGreaterThan(0);

    // 注目対戦は十三日目の3番、直接対決（若元春―大の里）が先頭
    expect(summary!.featuredBouts.length).toBe(3);
    expect(summary!.featuredBouts[0].isDirectMatchup).toBe(true);
    expect(new Set([summary!.featuredBouts[0].eastName, summary!.featuredBouts[0].westName])).toEqual(
      new Set(['若元春', '大の里']),
    );
    expect(summary!.featuredBouts[0].winner).toBeNull();

    // 直接対決マトリクス（上位4人の6組）
    const cellOf = (a: string, b: string) =>
      summary!.headToHead.find(
        (c) => (c.aName === a && c.bName === b) || (c.aName === b && c.bName === a),
      )!;
    expect(cellOf('若元春', '金峰山').played).toMatchObject({
      day: 4,
      winnerProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3371/',
    });
    expect(cellOf('熱海富士', '大の里').played).toMatchObject({
      day: 10,
      winnerProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4055/',
    });
    expect(cellOf('若元春', '大の里').played).toBeNull();
    expect(cellOf('若元春', '大の里').scheduledDay).toBe(13);
    expect(cellOf('若元春', '熱海富士').played).toBeNull();
    expect(cellOf('若元春', '熱海富士').scheduledDay).toBeNull();
    expect(cellOf('大の里', '金峰山').played).toBeNull();
    expect(cellOf('大の里', '金峰山').scheduledDay).toBeNull();
    expect(cellOf('熱海富士', '金峰山').played).toBeNull();
    expect(cellOf('熱海富士', '金峰山').scheduledDay).toBeNull();

    // 優勝条件表の行
    const rowOf = (name: string) => summary!.conditionRows.find((r) => r.name === name)!;
    expect(rowOf('若元春').detail).toMatchObject({
      kind: 'leaderClinch',
      clinchTargetWins: 14,
      clinchWinsNeeded: 3,
      tieFinishWins: 13,
    });
    const leaderDetail = rowOf('若元春').detail;
    expect(leaderDetail.kind === 'leaderClinch' && [...leaderDetail.tieTierNames].sort()).toEqual([
      '大の里',
      '熱海富士',
      '金峰山',
    ]);
    for (const name of ['大の里', '熱海富士', '金峰山'] as const) {
      expect(rowOf(name).detail).toMatchObject({
        kind: 'chaser',
        tieTotalLosses: 2,
        tieAdditionalLosses: 1,
        belowWins: 12,
        belowLosses: 3,
      });
    }

    // 十三日目の直接対決の追加行（残り3日以下・勝敗未定のみ）
    expect(summary!.clashOutlines).toHaveLength(1);
    const [outline] = summary!.clashOutlines;
    expect(outline.east).toMatchObject({ name: '大の里', wins: 10, losses: 2, remainingBouts: 3 });
    expect(outline.west).toMatchObject({ name: '若元春', wins: 11, losses: 1, remainingBouts: 3 });
    expect(describeClashOutcome(outline.west, outline.east, outline.othersBestWins)).toMatchObject({
      winnerName: '若元春',
      winnerWins: 12,
      winnerLosses: 1,
      loserName: '大の里',
      loserWins: 10,
      loserLosses: 3,
      relation: 'sole',
      loserFate: 'playoff-only',
    });
    expect(describeClashOutcome(outline.east, outline.west, outline.othersBestWins)).toMatchObject({
      winnerName: '大の里',
      winnerWins: 11,
      winnerLosses: 2,
      loserName: '若元春',
      loserWins: 11,
      loserLosses: 2,
      relation: 'tied',
      loserFate: null,
    });
  });

  it('marks completed featured bouts with winners on the day-12 result page', () => {
    const { archive } = buildDay12FinalSnapshot();
    const summary = computeYushoArasoi({
      archive,
      targetDay: 12,
      makuuchiBanzuke: makuuchiData,
    });

    expect(summary).not.toBeNull();
    expect(summary!.basisDay).toBe(12);
    expect(summary!.featuredBouts.length).toBeGreaterThan(0);
    for (const bout of summary!.featuredBouts) {
      expect(bout.winner).not.toBeNull();
      expect(bout.kimarite.length).toBeGreaterThan(0);
    }
    // 十二日目の相手（当日の対戦相手）
    const waka = summary!.contenders.find((c) => c.name === '若元春')!;
    expect(waka.dayOpponent).toMatchObject({
      profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4279/',
    });
  });

  it('marks championship as decided when the leader cannot be caught', () => {
    const baseDays = (torikumiData.resultDays ?? []).slice(0, 10);
    // 13日目終了時点で東力士Aが13勝0敗、他全員が9勝4敗以下のモックを作成
    const extraDays = [11, 12, 13].map((day) => ({
      day,
      isoDate: `2026-11-${10 + day}`,
      pathDate: `202611${10 + day}`,
      label: `${day}日目`,
      dayHead: `${day}日目`,
      status: 'published' as const,
      data: {
        makuuchi: {
          day,
          dayName: `取組日 ${day}日目`,
          dayHead: `${day}日目`,
          division: '幕内' as const,
          matches: [
            {
              division: '幕内' as const,
              boutNo: 1,
              eastName: '若元春',
              eastYomi: 'わかもとはる',
              eastEnglish: 'Wakamotoharu',
              eastRank: '前頭七枚目',
              eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3371/',
              westName: '熱海富士',
              westYomi: 'あたみふじ',
              westEnglish: 'Atamifuji',
              westRank: '関脇',
              westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4055/',
              kimarite: '寄り切り',
              winner: 'east' as const,
            },
          ],
        },
        juryo: {
          day,
          dayName: `取組日 ${day}日目`,
          dayHead: `${day}日目`,
          division: '十両' as const,
          matches: [],
        },
      },
    }));

    // 13日目時点で 若元春 12勝1敗 vs 他最大11勝4敗（12 > 11 で優勝決定）
    const mockArchive: TorikumiDataSet = {
      ...torikumiData,
      resultDays: [...baseDays, ...extraDays],
    };

    const summary = computeYushoArasoi({
      archive: mockArchive,
      targetDay: 13,
      makuuchiBanzuke: makuuchiData,
    });

    expect(summary).not.toBeNull();
    expect(summary!.isDecided).toBe(true);
    expect(summary!.champion).toMatchObject({
      name: '若元春',
      wins: 12,
      losses: 1,
      viaPlayoff: false,
    });
  });

  it('recognizes senshuraku playoff winner as decided champion', () => {
    const baseDays = (torikumiData.resultDays ?? []).slice(0, 10);
    const senshuraku = {
      day: 15,
      isoDate: '2026-11-22',
      pathDate: '20261122',
      label: '千秋楽',
      dayHead: '千秋楽',
      status: 'published' as const,
      data: {
        makuuchi: {
          day: 15,
          dayName: '取組日 千秋楽',
          dayHead: '千秋楽',
          division: '幕内' as const,
          matches: [
            {
              division: '幕内' as const,
              boutNo: 22,
              eastName: '若元春',
              eastYomi: 'わかもとはる',
              eastEnglish: 'Wakamotoharu',
              eastRank: '前頭七枚目',
              eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3371/',
              westName: '熱海富士',
              westYomi: 'あたみふじ',
              westEnglish: 'Atamifuji',
              westRank: '関脇',
              westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4055/',
              kimarite: '寄り切り',
              winner: 'west' as const,
              isPlayoff: true as const,
            },
          ],
        },
        juryo: {
          day: 15,
          dayName: '取組日 千秋楽',
          dayHead: '千秋楽',
          division: '十両' as const,
          matches: [],
        },
      },
    };

    const mockArchive: TorikumiDataSet = {
      ...torikumiData,
      resultDays: [...baseDays, senshuraku],
    };

    const summary = computeYushoArasoi({
      archive: mockArchive,
      targetDay: 15,
      makuuchiBanzuke: makuuchiData,
    });

    expect(summary).not.toBeNull();
    expect(summary!.isDecided).toBe(true);
    expect(summary!.champion).toMatchObject({
      name: '熱海富士',
      viaPlayoff: true,
    });
  });
});

describe('getFeaturedHeadingRel', () => {
  it('classifies the page date against the viewing date in five patterns', () => {
    expect(getFeaturedHeadingRel('2026-11-19', '2026-11-19')).toBe('today');
    expect(getFeaturedHeadingRel('2026-11-19', '2026-11-20')).toBe('yesterday');
    expect(getFeaturedHeadingRel('2026-11-21', '2026-11-20')).toBe('tomorrow');
    expect(getFeaturedHeadingRel('2026-11-17', '2026-11-20')).toBe('past');
    expect(getFeaturedHeadingRel('2026-11-22', '2026-11-20')).toBe('future');
  });
});

describe('formatMonthDay', () => {
  it('formats an ISO date without the year', () => {
    expect(formatMonthDay('2026-11-19', 'ja')).toBe('11月19日');
    expect(formatMonthDay('2026-11-19', 'en')).toBe('November 19');
  });
});

describe('buildConditionRows', () => {
  const leader = () => makeContender('https://example.com/a', '首位力士', 11, 1, 3);
  const chaser = (name: string, wins: number, losses: number, remaining: number) =>
    makeContender(`https://example.com/${name}`, name, wins, losses, remaining);

  it('computes the sole-leader clinch line', () => {
    const rows = buildConditionRows(
      [leader(), chaser('追A', 10, 2, 3), chaser('追B', 10, 2, 3), chaser('追C', 10, 2, 3)],
      15,
    );
    expect(rows[0].detail).toMatchObject({
      kind: 'leaderClinch',
      clinchTargetWins: 14,
      clinchWinsNeeded: 3,
      tieFinishWins: 13,
      tieTierNames: ['追A', '追B', '追C'],
    });
  });

  it('marks a chaser tied at the top maximum as playoff-only', () => {
    const rows = buildConditionRows([leader(), chaser('追A', 8, 4, 3)], 15);
    // 追A の MAX 11 は首位の 11 勝に並ぶのが精いっぱい（単独優勝なし）
    expect(rows[1].detail).toEqual({ kind: 'playoffOnly' });
  });

  it('marks a chaser below the top wins as eliminated', () => {
    const rows = buildConditionRows([leader(), chaser('追A', 7, 5, 3)], 15);
    // 追A の MAX 10 は首位の 11 勝に届かない
    expect(rows[1].detail).toEqual({ kind: 'eliminated' });
  });

  it('computes the chaser tie and takeover numbers', () => {
    const rows = buildConditionRows([leader(), chaser('追A', 10, 2, 3)], 15);
    expect(rows[1].detail).toMatchObject({
      kind: 'chaser',
      tieTotalLosses: 2,
      tieAdditionalLosses: 1,
      belowWins: 12,
      belowLosses: 3,
    });
  });

  it('handles a sweep and an equal-maximum chaser', () => {
    const top = makeContender('https://example.com/top', '首位力士', 11, 2, 2);
    const sweep = makeContender('https://example.com/sweep', '全勝逆転', 10, 1, 4);
    const equal = makeContender('https://example.com/equal', '並走', 9, 2, 4);
    const rows = buildConditionRows([top, sweep, equal], 15);
    expect(rows[1].detail).toEqual({ kind: 'chaserSweep' });
    expect(rows[2].detail).toEqual({ kind: 'chaserEqual' });
  });

  it('describes tied leaders as co-leaders', () => {
    const rows = buildConditionRows(
      [makeContender('https://example.com/x', '力士X', 10, 1, 4), makeContender('https://example.com/y', '力士Y', 10, 1, 4)],
      15,
    );
    expect(rows[0].detail).toMatchObject({ kind: 'coLeader', coLeaderNames: ['力士Y'] });
    expect(rows[1].detail).toMatchObject({ kind: 'coLeader', coLeaderNames: ['力士X'] });
  });
});

describe('describeClashOutcome', () => {
  it('evaluates both sides of a leader clash', () => {
    const waka = { name: '若元春', profileUrl: 'w', wins: 11, losses: 1, remainingBouts: 3 };
    const ono = { name: '大の里', profileUrl: 'o', wins: 10, losses: 2, remainingBouts: 3 };
    expect(describeClashOutcome(waka, ono, 10)).toMatchObject({
      winnerWins: 12,
      relation: 'sole',
      loserFate: 'playoff-only',
    });
    expect(describeClashOutcome(ono, waka, 10)).toMatchObject({
      winnerWins: 11,
      loserWins: 11,
      loserLosses: 2,
      relation: 'tied',
      loserFate: null,
    });
  });

  it('detects a chasing outcome and elimination', () => {
    const side = { name: '力士A', profileUrl: 'a', wins: 8, losses: 4, remainingBouts: 3 };
    const other = { name: '力士B', profileUrl: 'b', wins: 8, losses: 4, remainingBouts: 3 };
    expect(describeClashOutcome(side, other, 11)).toMatchObject({
      relation: 'chasing',
      gap: 2,
      loserFate: 'eliminated',
    });
  });
});
