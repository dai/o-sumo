import { describe, expect, it } from 'vitest';
import { torikumiData, type TorikumiDataSet } from './torikumi-data';
import { makuuchiData } from './sumo-data';
import { computeYushoArasoi, shouldShowYushoArasoi } from './yusho-arasoi';

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
  it('matches the day-10 snapshot standings, featured bouts, and head-to-head matchups on day 11 before results', () => {
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
    expect(summary!.playedMatchups).toHaveLength(2);
    expect(summary!.playedMatchups[0]).toMatchObject({
      day: 4,
      dayLabel: '4日目',
      winnerName: '若元春',
      loserName: '金峰山',
      kimarite: '突き落とし',
    });
    expect(summary!.playedMatchups[1]).toMatchObject({
      day: 10,
      dayLabel: '10日目',
      winnerName: '熱海富士',
      loserName: '大の里',
      kimarite: '押し出し',
    });

    // 未対戦は 15 - 2 = 13 組、うち首位同士（若元春―熱海富士）を含む
    expect(summary!.unplayedMatchups).toHaveLength(13);
    expect(
      summary!.unplayedMatchups.some(
        (u) =>
          u.isLeaderClash &&
          ((u.rikishiA.name === '若元春' && u.rikishiB.name === '熱海富士') ||
            (u.rikishiA.name === '熱海富士' && u.rikishiB.name === '若元春')),
      ),
    ).toBe(true);

    // 優勝条件
    expect(summary!.conditions[0]).toMatchObject({
      kind: 'leaderTied',
      names: ['熱海富士', '若元春'],
      wins: 9,
      losses: 1,
      maxWins: 14,
      hasUnplayedDirectClash: true,
    });
    expect(summary!.conditions[1]).toMatchObject({
      kind: 'chaserGroup',
      wins: 8,
      losses: 2,
      maxWins: 13,
      needLeaderTotalLosses: 2,
      needLeaderAdditionalLosses: 1,
      playoffAtMaxWins: true,
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
    expect(summary!.conditions[0]).toMatchObject({
      kind: 'leaderSingle',
      name: '若元春',
      maxWins: 14,
      isSelfDetermined: true,
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
