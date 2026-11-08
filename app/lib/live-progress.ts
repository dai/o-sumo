import type { TorikumiDailyData, TorikumiDataSet, TorikumiMatch } from './torikumi-data';
import { canonicalShikona } from './rikishi-display';

export const METER_JURYO_START_MINUTES = 14 * 60 + 15; // 14:15 = 855
export const METER_MAKUUCHI_START_MINUTES = 15 * 60 + 40; // 15:40 = 940 (v6: 協会公式スケジュール十一月場所に統一)
export const METER_END_MINUTES = 18 * 60; // 18:00 = 1080

// 初日（Day 1）例外定数（v6: 初日のみ協会公式も早い）
export const METER_DAY1_JURYO_START_MINUTES = 14 * 60 + 5; // 14:05 = 845
export const METER_DAY1_MAKUUCHI_START_MINUTES = 15 * 60 + 30; // 15:30 = 930

export const MAKUSHITA_RATIO_PERCENT = 20;
export const JURYO_RATIO_PERCENT = 32;
export const MAKUUCHI_RATIO_PERCENT = 48;

// 初日（Day 1）例外按分（v6: 初日は十両 14:05〜15:30 (85分) / 幕内 15:30〜18:00 (150分) で按分追従）
export const DAY1_MAKUSHITA_RATIO_PERCENT = 20;
export const DAY1_JURYO_RATIO_PERCENT = 29;
export const DAY1_MAKUUCHI_RATIO_PERCENT = 51;

export function getMeterRatios(isOpeningDay = false): {
  makushitaRatio: number;
  juryoRatio: number;
  makuuchiRatio: number;
} {
  return {
    makushitaRatio: isOpeningDay ? DAY1_MAKUSHITA_RATIO_PERCENT : MAKUSHITA_RATIO_PERCENT,
    juryoRatio: isOpeningDay ? DAY1_JURYO_RATIO_PERCENT : JURYO_RATIO_PERCENT,
    makuuchiRatio: isOpeningDay ? DAY1_MAKUUCHI_RATIO_PERCENT : MAKUUCHI_RATIO_PERCENT,
  };
}

export function getMeterSchedule(isOpeningDay = false): {
  juryoStartMinutes: number;
  makuuchiStartMinutes: number;
  endMinutes: number;
} {
  return {
    juryoStartMinutes: isOpeningDay ? METER_DAY1_JURYO_START_MINUTES : METER_JURYO_START_MINUTES,
    makuuchiStartMinutes: isOpeningDay ? METER_DAY1_MAKUUCHI_START_MINUTES : METER_MAKUUCHI_START_MINUTES,
    endMinutes: METER_END_MINUTES,
  };
}

export function jstMinutesOfDay(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tokyo',
  }).formatToParts(now);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');
  return hour * 60 + minute;
}

export function jstIsoDateOfDay(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Tokyo',
  }).formatToParts(now);
  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  return `${year}-${month}-${day}`;
}

export function dayOfDailyData(d: TorikumiDailyData | null | undefined): number | null {
  if (!d) return null;
  const makuuchiDay = d.makuuchi?.day;
  return typeof makuuchiDay === 'number' ? makuuchiDay : null;
}

export function hasAnyMatches(d: TorikumiDailyData | null | undefined): boolean {
  return Boolean(d && ((d.makuuchi?.matches?.length ?? 0) > 0 || (d.juryo?.matches?.length ?? 0) > 0));
}

export function resolveLiveDailyData(
  archive: TorikumiDataSet,
  data: TorikumiDataSet,
  currentIsoDate?: string,
): TorikumiDailyData | null {
  const isoDate = currentIsoDate ?? jstIsoDateOfDay();
  const upcomingScheduleDay = [...(archive.scheduleDays ?? [])]
    .sort((left, right) => left.isoDate.localeCompare(right.isoDate))
    .find((day) => day.isoDate >= isoDate);

  if (!upcomingScheduleDay) {
    return null;
  }

  const resultDay = archive.resultDays?.find((day) => day.pathDate === upcomingScheduleDay.pathDate);
  const candidates = [
    resultDay?.data,
    upcomingScheduleDay.data,
    data.today,
    data.tomorrow,
  ];

  return (
    candidates.find((candidate) => (
      dayOfDailyData(candidate) === upcomingScheduleDay.day && hasAnyMatches(candidate)
    )) ?? null
  );
}

export type LiveProgressState =
  | 'prestart'
  | 'before_juryo'
  | 'juryo'
  | 'makuuchi'
  | 'finished';

export interface MeterSegmentProgress {
  key: 'makushita' | 'juryo' | 'makuuchi';
  progress: number; // 0.0 ~ 1.0
  ratioPercent: number;
}

export interface CurrentBoutInfo {
  division: '幕内' | '十両';
  boutNo: number;
  eastName: string;
  westName: string;
}

export interface LiveProgressResult {
  state: LiveProgressState;
  segments: MeterSegmentProgress[];
  currentBout: CurrentBoutInfo | null;
  nowMinutes: number;
  formattedTime: string;
  pinPositionPercent: number; // 0 ~ 100
  pinLabelDesktop: string;
  pinLabelMobile: string;
  activeDivision: 'makushita' | 'juryo' | 'makuuchi' | null;
  isOpeningDay: boolean;
  schedule: {
    juryoStartMinutes: number;
    makuuchiStartMinutes: number;
    endMinutes: number;
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function formatTimeJst(minutesOfDay: number): string {
  const normalized = ((minutesOfDay % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function isMatchCompleted(match: TorikumiMatch): boolean {
  return Boolean(match.winner || (match.kimarite && match.kimarite !== '未定'));
}

function estimateBoutIndex(matchCount: number, elapsedMinutes: number, windowMinutes: number): number {
  if (matchCount <= 0) return 0;
  const ratio = clamp(elapsedMinutes / windowMinutes, 0, 0.999);
  return Math.floor(ratio * matchCount);
}

export function deriveLiveProgress(
  dailyData: TorikumiDailyData | null | undefined,
  nowMinutes: number,
  options?: { isOpeningDay?: boolean },
): LiveProgressResult {
  const formattedTime = formatTimeJst(nowMinutes);

  const dayNumber = dailyData?.makuuchi?.day ?? dailyData?.juryo?.day;
  const isOpeningDay = options?.isOpeningDay ?? (dayNumber === 1);
  const schedule = getMeterSchedule(isOpeningDay);
  const { juryoStartMinutes, makuuchiStartMinutes, endMinutes } = schedule;

  const juryoMatches = dailyData?.juryo?.matches ?? [];
  const makuuchiMatches = dailyData?.makuuchi?.matches ?? [];

  const completedJuryo = juryoMatches.filter(isMatchCompleted).length;
  const totalJuryo = juryoMatches.length;

  const completedMakuuchi = makuuchiMatches.filter(isMatchCompleted).length;
  const totalMakuuchi = makuuchiMatches.length;

  const allMakuuchiFinished = totalMakuuchi > 0 && completedMakuuchi >= totalMakuuchi;
  const isPastClosingTime = nowMinutes >= endMinutes;

  const ratios = getMeterRatios(isOpeningDay);
  const { makushitaRatio, juryoRatio, makuuchiRatio } = ratios;

  // 1. 状態判定
  let state: LiveProgressState = 'prestart';

  if (allMakuuchiFinished || isPastClosingTime) {
    state = 'finished';
  } else if (
    nowMinutes >= makuuchiStartMinutes ||
    (totalJuryo > 0 && completedJuryo >= totalJuryo && completedMakuuchi > 0)
  ) {
    state = 'makuuchi';
  } else if (nowMinutes >= juryoStartMinutes || completedJuryo > 0) {
    state = 'juryo';
  } else {
    state = 'prestart';
  }

  // 2. セグメント進捗とピン位置の計算
  let makushitaProgress = 0;
  let juryoProgress = 0;
  let makuuchiProgress = 0;
  let pinPercent = 0;
  let currentBout: CurrentBoutInfo | null = null;
  let activeDivision: 'makushita' | 'juryo' | 'makuuchi' | null = null;

  if (state === 'finished') {
    makushitaProgress = 1;
    juryoProgress = 1;
    makuuchiProgress = 1;
    pinPercent = 100;
    activeDivision = null;
    currentBout = null;
  } else if (state === 'makuuchi') {
    makushitaProgress = 1;
    juryoProgress = 1;
    activeDivision = 'makuuchi';

    // 実績優先：未完了の一番がある時間帯は実績（確定番数 ÷ 総番数）を基準とする。
    // まだ実績が無い時間帯（0番完了）のみ時刻線形按分で代替。
    // 実績がある場合は時刻推定でピンを先に進めず、実績の進行に揃える（進行が遅い日でもピンが先行しない）。
    const resultRatio = totalMakuuchi > 0 ? completedMakuuchi / totalMakuuchi : 0;
    const timeRatio = clamp(
      (nowMinutes - makuuchiStartMinutes) / (endMinutes - makuuchiStartMinutes),
      0,
      1,
    );
    makuuchiProgress = completedMakuuchi > 0
      ? clamp(resultRatio, 0, 0.99)
      : clamp(timeRatio, 0, 0.99);

    pinPercent = makushitaRatio + juryoRatio + makuuchiProgress * makuuchiRatio;

    // 現在の一番の選定: 未完了の最初の試合、なければ推定
    const pendingMatch = makuuchiMatches.find((m) => !isMatchCompleted(m));
    if (pendingMatch) {
      currentBout = {
        division: '幕内',
        boutNo: pendingMatch.boutNo,
        eastName: canonicalShikona(pendingMatch.eastProfileUrl, pendingMatch.eastName),
        westName: canonicalShikona(pendingMatch.westProfileUrl, pendingMatch.westName),
      };
    } else if (totalMakuuchi > 0) {
      const idx = estimateBoutIndex(
        totalMakuuchi,
        nowMinutes - makuuchiStartMinutes,
        endMinutes - makuuchiStartMinutes,
      );
      const match = makuuchiMatches[idx] ?? makuuchiMatches[totalMakuuchi - 1];
      currentBout = {
        division: '幕内',
        boutNo: match.boutNo,
        eastName: canonicalShikona(match.eastProfileUrl, match.eastName),
        westName: canonicalShikona(match.westProfileUrl, match.westName),
      };
    }
  } else if (state === 'juryo') {
    makushitaProgress = 1;
    makuuchiProgress = 0;
    activeDivision = 'juryo';

    const resultRatio = totalJuryo > 0 ? completedJuryo / totalJuryo : 0;
    const timeRatio = clamp(
      (nowMinutes - juryoStartMinutes) / (makuuchiStartMinutes - juryoStartMinutes),
      0,
      1,
    );
    juryoProgress = completedJuryo > 0
      ? clamp(resultRatio, 0, 0.99)
      : clamp(timeRatio, 0, 0.99);

    pinPercent = makushitaRatio + juryoProgress * juryoRatio;

    const pendingMatch = juryoMatches.find((m) => !isMatchCompleted(m));
    if (pendingMatch) {
      currentBout = {
        division: '十両',
        boutNo: pendingMatch.boutNo,
        eastName: canonicalShikona(pendingMatch.eastProfileUrl, pendingMatch.eastName),
        westName: canonicalShikona(pendingMatch.westProfileUrl, pendingMatch.westName),
      };
    } else if (totalJuryo > 0) {
      const idx = estimateBoutIndex(
        totalJuryo,
        nowMinutes - juryoStartMinutes,
        makuuchiStartMinutes - juryoStartMinutes,
      );
      const match = juryoMatches[idx] ?? juryoMatches[totalJuryo - 1];
      currentBout = {
        division: '十両',
        boutNo: match.boutNo,
        eastName: canonicalShikona(match.eastProfileUrl, match.eastName),
        westName: canonicalShikona(match.westProfileUrl, match.westName),
      };
    }
  } else {
    // prestart / before_juryo: 開始前はピンを 0%（一番左）に固定し、バーは無地
    activeDivision = null;
    makushitaProgress = 0;
    juryoProgress = 0;
    makuuchiProgress = 0;
    pinPercent = 0;
    currentBout = null;
  }

  // 3. ピンラベル生成
  let pinLabelDesktop: string;
  let pinLabelMobile: string;

  if (state === 'finished') {
    pinLabelDesktop = '本日の取組は終了しました';
    pinLabelMobile = '本日の取組は終了しました';
  } else if (state === 'prestart' || !currentBout) {
    pinLabelDesktop = '取組前';
    pinLabelMobile = '取組前';
  } else {
    pinLabelDesktop = `イマココ（🌅 ${currentBout.eastName} 対 🌇 ${currentBout.westName}）`;
    pinLabelMobile = 'イマココ';
  }

  return {
    state,
    segments: [
      { key: 'makushita', progress: makushitaProgress, ratioPercent: makushitaRatio },
      { key: 'juryo', progress: juryoProgress, ratioPercent: juryoRatio },
      { key: 'makuuchi', progress: makuuchiProgress, ratioPercent: makuuchiRatio },
    ],
    currentBout,
    nowMinutes,
    formattedTime,
    pinPositionPercent: clamp(pinPercent, 0, 100),
    pinLabelDesktop,
    pinLabelMobile,
    activeDivision,
    isOpeningDay,
    schedule,
  };
}
