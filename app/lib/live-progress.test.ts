import { describe, expect, it } from 'vitest';
import type { TorikumiDailyData, TorikumiMatch } from './torikumi-data';
import {
  deriveLiveProgress,
  formatTimeJst,
  isMatchCompleted,
} from './live-progress';

function createMatch(
  division: '幕内' | '十両',
  boutNo: number,
  eastName: string,
  westName: string,
  winner?: 'east' | 'west' | null,
): TorikumiMatch {
  return {
    division,
    boutNo,
    eastName,
    eastYomi: '',
    eastEnglish: '',
    eastRank: `${division}${boutNo}枚目`,
    eastProfileUrl: `/rikishi/${eastName}`,
    westName,
    westYomi: '',
    westEnglish: '',
    westRank: `${division}${boutNo}枚目`,
    westProfileUrl: `/rikishi/${westName}`,
    kimarite: winner ? '寄り切り' : '',
    winner: winner ?? null,
  };
}

function createDailyData(completedJuryo = 0, completedMakuuchi = 0): TorikumiDailyData {
  const juryoMatches: TorikumiMatch[] = [
    createMatch('十両', 1, '東十1', '西十1', completedJuryo >= 1 ? 'east' : null),
    createMatch('十両', 2, '東十2', '西十2', completedJuryo >= 2 ? 'west' : null),
    createMatch('十両', 3, '東十3', '西十3', completedJuryo >= 3 ? 'east' : null),
    createMatch('十両', 4, '東十4', '西十4', completedJuryo >= 4 ? 'west' : null),
  ];

  const makuuchiMatches: TorikumiMatch[] = [
    createMatch('幕内', 1, '東幕1', '西幕1', completedMakuuchi >= 1 ? 'east' : null),
    createMatch('幕内', 2, '東幕2', '西幕2', completedMakuuchi >= 2 ? 'west' : null),
    createMatch('幕内', 3, '東幕3', '西幕3', completedMakuuchi >= 3 ? 'east' : null),
    createMatch('幕内', 4, '東幕4', '西幕4', completedMakuuchi >= 4 ? 'west' : null),
  ];

  return {
    juryo: {
      day: 1,
      dayName: '初日',
      dayHead: '初日',
      division: '十両',
      matches: juryoMatches,
    },
    makuuchi: {
      day: 1,
      dayName: '初日',
      dayHead: '初日',
      division: '幕内',
      matches: makuuchiMatches,
    },
  };
}

describe('live-progress', () => {
  it('formats JST minutes into HH:MM string', () => {
    expect(formatTimeJst(0)).toBe('00:00');
    expect(formatTimeJst(9 * 60 + 5)).toBe('09:05');
    expect(formatTimeJst(16 * 60 + 20)).toBe('16:20');
    expect(formatTimeJst(18 * 60)).toBe('18:00');
  });

  it('does not treat kimarite "未定" as a completed match', () => {
    const pendingMatch = createMatch('十両', 1, '東十1', '西十1');
    pendingMatch.kimarite = '未定';
    expect(isMatchCompleted(pendingMatch)).toBe(false);

    const wonMatch = createMatch('十両', 1, '東十1', '西十1', 'east');
    expect(isMatchCompleted(wonMatch)).toBe(true);

    const decidedKimariteMatch = createMatch('十両', 1, '東十1', '西十1');
    decidedKimariteMatch.kimarite = '寄り切り';
    expect(isMatchCompleted(decidedKimariteMatch)).toBe(true);
  });

  it('handles morning time before juryo as prestart (10:00 JST)', () => {
    const data = createDailyData();
    const result = deriveLiveProgress(data, 10 * 60);

    expect(result.state).toBe('prestart');
    expect(result.formattedTime).toBe('10:00');
    expect(result.activeDivision).toBeNull();
    expect(result.currentBout).toBeNull();
    expect(result.pinPositionPercent).toBe(0);
    expect(result.pinLabelDesktop).toBe('取組前');
    expect(result.pinLabelMobile).toBe('取組前');

    const [makushita, juryo, makuuchi] = result.segments;
    expect(makushita.progress).toBe(0);
    expect(juryo.progress).toBe(0);
    expect(makuuchi.progress).toBe(0);
  });

  it('keeps prestart state, 0% pin, and empty progress with schedule data where all bouts have kimarite="未定"', () => {
    const data = createDailyData();
    data.juryo.matches.forEach((m) => {
      m.kimarite = '未定';
      m.winner = null;
    });
    data.makuuchi.matches.forEach((m) => {
      m.kimarite = '未定';
      m.winner = null;
    });

    const result = deriveLiveProgress(data, 9 * 60 + 9); // 09:09 JST on Day 1
    expect(result.state).toBe('prestart');
    expect(result.pinPositionPercent).toBe(0);
    expect(result.pinLabelDesktop).toBe('取組前');
    expect(result.pinLabelMobile).toBe('取組前');
    expect(result.activeDivision).toBeNull();
    expect(result.segments.every((s) => s.progress === 0)).toBe(true);
  });

  it('pins at 0% and stays prestart before juryo start time (14:07 JST on regular day)', () => {
    const data = createDailyData();
    data.makuuchi.day = 2;
    data.juryo.day = 2;
    const result = deriveLiveProgress(data, 14 * 60 + 7);

    expect(result.state).toBe('prestart');
    expect(result.activeDivision).toBeNull();
    expect(result.pinPositionPercent).toBe(0);
    expect(result.pinLabelDesktop).toBe('取組前');
    expect(result.segments.every((s) => s.progress === 0)).toBe(true);
  });

  it('handles juryo window (14:30 JST)', () => {
    // day: 2 (通常日: 14:15 - 15:40)
    const data = createDailyData(0, 0);
    data.makuuchi.day = 2;
    data.juryo.day = 2;
    const result = deriveLiveProgress(data, 14 * 60 + 30); // 15 min into juryo (14:15 - 15:40)

    expect(result.state).toBe('juryo');
    expect(result.activeDivision).toBe('juryo');
    expect(result.isOpeningDay).toBe(false);
    expect(result.segments[0].progress).toBe(1);
    expect(result.segments[1].progress).toBeGreaterThan(0);
    expect(result.segments[2].progress).toBe(0);
    expect(result.currentBout).toEqual({
      division: '十両',
      boutNo: 1,
      eastName: '東十1',
      westName: '西十1',
    });
    expect(result.pinLabelDesktop).toBe('イマココ（🌅 東十1 対 🌇 西十1）');
    expect(result.pinLabelMobile).toBe('イマココ');
  });

  it('prioritizes completed results over time-based estimate (both faster and slower pacing)', () => {
    // 進行が早い場合: 14:20 JST (時刻はまだ始まったばかり) だが 3番終了
    const fastData = createDailyData(3, 0);
    const fastResult = deriveLiveProgress(fastData, 14 * 60 + 20);

    expect(fastResult.state).toBe('juryo');
    // 3 out of 4 matches completed = 0.75 progress
    expect(fastResult.segments[1].progress).toBe(0.75);
    expect(fastResult.currentBout?.boutNo).toBe(4);
    expect(fastResult.currentBout?.eastName).toBe('東十4');

    // 進行が遅い場合: 15:00 JST (時刻推定なら 45/85 ≈ 53%) だが 1番しか終了していない
    const slowData = createDailyData(1, 0);
    slowData.juryo.day = 2;
    slowData.makuuchi.day = 2;
    const slowResult = deriveLiveProgress(slowData, 15 * 60);

    expect(slowResult.state).toBe('juryo');
    // 実績優先なので時刻推定で先行せず、実績の 1/4 = 0.25 に留まる
    expect(slowResult.segments[1].progress).toBe(0.25);
    expect(slowResult.currentBout?.boutNo).toBe(2);
  });

  it('handles makuuchi window (16:30 JST)', () => {
    const data = createDailyData(4, 1);
    const result = deriveLiveProgress(data, 16 * 60 + 30);

    expect(result.state).toBe('makuuchi');
    expect(result.activeDivision).toBe('makuuchi');
    expect(result.segments[0].progress).toBe(1);
    expect(result.segments[1].progress).toBe(1);
    expect(result.segments[2].progress).toBeGreaterThan(0);
    // pending match is boutNo 2
    expect(result.currentBout?.division).toBe('幕内');
    expect(result.currentBout?.boutNo).toBe(2);
    expect(result.currentBout?.eastName).toBe('東幕2');
    expect(result.pinLabelDesktop).toBe('イマココ（🌅 東幕2 対 🌇 西幕2）');
    expect(result.pinLabelMobile).toBe('イマココ');
  });

  it('handles opening day (day 1) exception schedule (14:05 / 15:30) and dynamic ratios (20/29/51)', () => {
    const data = createDailyData(0, 0); // day: 1 (初日)
    const result = deriveLiveProgress(data, 14 * 60 + 10); // 14:10 JST (十両開始後)

    expect(result.isOpeningDay).toBe(true);
    expect(result.schedule.juryoStartMinutes).toBe(14 * 60 + 5);
    expect(result.schedule.makuuchiStartMinutes).toBe(15 * 60 + 30);
    expect(result.state).toBe('juryo');
    // 初日の動的按分 (20/29/51)
    expect(result.segments[0].ratioPercent).toBe(20);
    expect(result.segments[1].ratioPercent).toBe(29);
    expect(result.segments[2].ratioPercent).toBe(51);

    // 通常日は 20/32/48
    const regularData = createDailyData(0, 0);
    regularData.juryo.day = 2;
    regularData.makuuchi.day = 2;
    const regularResult = deriveLiveProgress(regularData, 14 * 60 + 20);
    expect(regularResult.segments[0].ratioPercent).toBe(20);
    expect(regularResult.segments[1].ratioPercent).toBe(32);
    expect(regularResult.segments[2].ratioPercent).toBe(48);
  });

  it('handles finished state when all makuuchi bouts completed', () => {
    const data = createDailyData(4, 4); // all completed
    const result = deriveLiveProgress(data, 17 * 60);

    expect(result.state).toBe('finished');
    expect(result.activeDivision).toBeNull();
    expect(result.currentBout).toBeNull();
    expect(result.pinPositionPercent).toBe(100);
    expect(result.pinLabelDesktop).toBe('本日の取組は終了しました');
    expect(result.pinLabelMobile).toBe('本日の取組は終了しました');
    expect(result.segments.every((s) => s.progress === 1)).toBe(true);
  });

  it('handles finished state when time is past 18:00', () => {
    const data = createDailyData(4, 2);
    const result = deriveLiveProgress(data, 18 * 60 + 5);

    expect(result.state).toBe('finished');
    expect(result.pinPositionPercent).toBe(100);
    expect(result.segments.every((s) => s.progress === 1)).toBe(true);
  });
});
