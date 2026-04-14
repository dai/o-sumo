import type { TorikumiDailyData, TorikumiDataSet } from './torikumi-data';

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
  { day: 15, iso: '20260524', label: '千秋楽', dayHead: '千秋楽： 令和8年5月24日(日)' },
] as const;

function buildEmptyDayData(day: number, label: string, dayHead: string): TorikumiDailyData {
  return {
    makuuchi: {
      day,
      dayName: `取組日 ${label}`,
      dayHead,
      division: '幕内',
      matches: [],
    },
    juryo: {
      day,
      dayName: `取組日 ${label}`,
      dayHead,
      division: '十両',
      matches: [],
    },
  };
}

export const MAY2026_TORIKUMI_DATA: TorikumiDataSet = {
  bashoName: '五月場所',
  year: '令和八年',
  updatedAt: '2026-04-14',
  resultUpdatedAt: '2026-04-14',
  scheduleUpdatedAt: '2026-04-14',
  resultDays: MAY_DATES.map((d) => ({
    day: d.day,
    isoDate: d.iso,
    pathDate: d.iso,
    label: d.label,
    dayHead: d.dayHead,
    status: 'pending' as const,
    statusMessage: '結果未更新' as const,
    data: buildEmptyDayData(d.day, d.label, d.dayHead),
  })),
  scheduleDays: MAY_DATES.map((d) => ({
    day: d.day,
    isoDate: d.iso,
    pathDate: d.iso,
    label: d.label,
    dayHead: d.dayHead,
    status: 'pending' as const,
    statusMessage: '取組予定未更新' as const,
    data: buildEmptyDayData(d.day, d.label, d.dayHead),
  })),
};
