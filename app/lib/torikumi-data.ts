import { JULY2026_TORIKUMI_DATA } from './july2026-data';

export interface TorikumiMatch {
  division: '幕内' | '十両';
  boutNo: number;
  eastName: string;
  eastYomi: string;
  eastEnglish: string;
  eastRank: string;
  eastProfileUrl: string;
  westName: string;
  westYomi: string;
  westEnglish: string;
  westRank: string;
  westProfileUrl: string;
  kimarite: string;
  winner?: 'east' | 'west' | null;
}

export interface TorikumiDivisionDay {
  day: number;
  dayName: string;
  dayHead: string;
  division: '幕内' | '十両';
  absentees?: Array<{
    id: number;
    name: string;
    profileUrl: string;
  }>;
  matches: TorikumiMatch[];
}

export interface TorikumiDailyData {
  makuuchi: TorikumiDivisionDay;
  juryo: TorikumiDivisionDay;
}

export interface TorikumiArchiveDay {
  day: number;
  isoDate: string;
  pathDate: string;
  label: string;
  dayHead: string;
  status: 'published' | 'pending';
  statusMessage?: string | null;
  data: TorikumiDailyData;
}

export interface TorikumiDataSet {
  bashoId?: number;
  bashoName: string;
  year: string;
  updatedAt: string;
  resultUpdatedAt: string;
  scheduleUpdatedAt: string;
  today?: TorikumiDailyData | null;
  tomorrow?: TorikumiDailyData | null;
  resultDays?: TorikumiArchiveDay[];
  scheduleDays?: TorikumiArchiveDay[];
}

export const torikumiData: TorikumiDataSet = JULY2026_TORIKUMI_DATA;

export const torikumiArchive = {
  bashoName: torikumiData.bashoName,
  year: torikumiData.year,
  updatedAt: torikumiData.updatedAt,
  resultUpdatedAt: torikumiData.resultUpdatedAt,
  scheduleUpdatedAt: torikumiData.scheduleUpdatedAt,
  resultDays: torikumiData.resultDays ?? [],
  scheduleDays: torikumiData.scheduleDays ?? [],
};

export const torikumiMonthKey = torikumiArchive.scheduleDays[0]?.pathDate.slice(0, 6)
  ?? torikumiArchive.resultDays[0]?.pathDate.slice(0, 6)
  ?? '202603';

export const banzukePath = `/${torikumiMonthKey}-banzuke`;
