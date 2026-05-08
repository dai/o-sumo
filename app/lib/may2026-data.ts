import { makuuchiData, juryo, type Rikishi } from './sumo-data';
import type { TorikumiDailyData, TorikumiDataSet, TorikumiMatch } from './torikumi-data';

const MAY_DATES = [
  { day: 1, isoDate: '2026-05-10', pathDate: '20260510', label: '初日', dayHead: '初日： 令和8年5月10日(日)' },
  { day: 2, isoDate: '2026-05-11', pathDate: '20260511', label: '二日目', dayHead: '二日目： 令和8年5月11日(月)' },
  { day: 3, isoDate: '2026-05-12', pathDate: '20260512', label: '三日目', dayHead: '三日目： 令和8年5月12日(火)' },
  { day: 4, isoDate: '2026-05-13', pathDate: '20260513', label: '四日目', dayHead: '四日目： 令和8年5月13日(水)' },
  { day: 5, isoDate: '2026-05-14', pathDate: '20260514', label: '五日目', dayHead: '五日目： 令和8年5月14日(木)' },
  { day: 6, isoDate: '2026-05-15', pathDate: '20260515', label: '六日目', dayHead: '六日目： 令和8年5月15日(金)' },
  { day: 7, isoDate: '2026-05-16', pathDate: '20260516', label: '七日目', dayHead: '七日目： 令和8年5月16日(土)' },
  { day: 8, isoDate: '2026-05-17', pathDate: '20260517', label: '中日', dayHead: '中日： 令和8年5月17日(日)' },
  { day: 9, isoDate: '2026-05-18', pathDate: '20260518', label: '九日目', dayHead: '九日目： 令和8年5月18日(月)' },
  { day: 10, isoDate: '2026-05-19', pathDate: '20260519', label: '十日目', dayHead: '十日目： 令和8年5月19日(火)' },
  { day: 11, isoDate: '2026-05-20', pathDate: '20260520', label: '十一日目', dayHead: '十一日目： 令和8年5月20日(水)' },
  { day: 12, isoDate: '2026-05-21', pathDate: '20260521', label: '十二日目', dayHead: '十二日目： 令和8年5月21日(木)' },
  { day: 13, isoDate: '2026-05-22', pathDate: '20260522', label: '十三日目', dayHead: '十三日目： 令和8年5月22日(金)' },
  { day: 14, isoDate: '2026-05-23', pathDate: '20260523', label: '十四日目', dayHead: '十四日目： 令和8年5月23日(土)' },
  { day: 15, isoDate: '2026-05-24', pathDate: '20260524', label: '千秋楽', dayHead: '千秋楽： 令和8年5月24日(日)' },
] as const;


const RIKISHI_BY_NAME = [...makuuchiData, ...juryo]
  .flatMap((rankGroup) => [...rankGroup.east, ...rankGroup.west])
  .reduce<Record<string, Rikishi>>((rikishiByName, rikishi) => ({
    ...rikishiByName,
    [rikishi.name]: rikishi,
  }), {});

function getRikishi(name: string): Rikishi {
  const rikishi = RIKISHI_BY_NAME[name];
  if (!rikishi) {
    throw new Error(`Unknown rikishi in May 2026 torikumi: ${name}`);
  }
  return rikishi;
}

function buildMatch(division: '幕内' | '十両', boutNo: number, eastName: string, westName: string): TorikumiMatch {
  const east = getRikishi(eastName);
  const west = getRikishi(westName);

  return {
    division,
    boutNo,
    eastName: east.name,
    eastYomi: east.yomi,
    eastEnglish: '',
    eastRank: east.rank,
    eastProfileUrl: east.profileUrl,
    westName: west.name,
    westYomi: west.yomi,
    westEnglish: '',
    westRank: west.rank,
    westProfileUrl: west.profileUrl,
    kimarite: '未定',
    winner: null,
  };
}

const DAY1_MAKUUCHI_MATCHES = [
  ['藤凌駕', '竜電'],
  ['若ノ勝', '欧勝海'],
  ['翔猿', '狼雅'],
  ['御嶽海', '玉鷲'],
  ['琴栄峰', '時疾風'],
  ['獅司', '金峰山'],
  ['宇良', '伯乃富士'],
  ['朝乃山', '錦富士'],
  ['阿炎', '朝白龍'],
  ['欧勝馬', '朝紅龍'],
  ['千代翔馬', '藤青雲'],
  ['美ノ海', '正代'],
  ['若元春', '豪ノ山'],
  ['大栄翔', '王鵬'],
  ['若隆景', '平戸海'],
  ['義ノ富士', '琴勝峰'],
  ['熱海富士', '一山本'],
  ['霧島', '隆の勝'],
  ['琴櫻', '藤ノ川'],
  ['豊昇龍', '高安'],
] as const;

const DAY1_JURYO_MATCHES = [
  ['栃大海', '炎鵬'],
  ['大花竜', '白鷹山'],
  ['日翔志', '玉正鳳'],
  ['風賢央', '錦木'],
  ['東白龍', '翠富士'],
  ['西ノ龍', '嘉陽'],
  ['湘南乃海', '白熊'],
  ['輝', '寿之富士'],
  ['一意', '明生'],
  ['友風', '北の若'],
  ['旭海雄', '朝翠龍'],
  ['出羽ノ龍', '羽出山'],
  ['佐田の海', '尊富士'],
  ['阿武剋', '大青山'],
] as const;

function buildDay1Data(): TorikumiDailyData {
  const day = MAY_DATES[0];

  return {
    makuuchi: {
      day: day.day,
      dayName: `取組日 ${day.label}`,
      dayHead: day.dayHead,
      division: '幕内',
      absentees: [
        {
          id: 4227,
          name: '大の里',
          profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4227/',
        },
        {
          id: 4230,
          name: '安青錦',
          profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4230/',
        },
      ],
      matches: DAY1_MAKUUCHI_MATCHES.map(([eastName, westName], index) => (
        buildMatch('幕内', index + 1, eastName, westName)
      )),
    },
    juryo: {
      day: day.day,
      dayName: `取組日 ${day.label}`,
      dayHead: day.dayHead,
      division: '十両',
      matches: DAY1_JURYO_MATCHES.map(([eastName, westName], index) => (
        buildMatch('十両', index + 1, eastName, westName)
      )),
    },
  };
}

const DAY1_DATA = buildDay1Data();

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
  updatedAt: '2026-05-08',
  resultUpdatedAt: '2026-05-08',
  scheduleUpdatedAt: '2026-05-08',
  resultDays: MAY_DATES.map((d) => ({
    day: d.day,
    isoDate: d.isoDate,
    pathDate: d.pathDate,
    label: d.label,
    dayHead: d.dayHead,
    status: 'pending' as const,
    statusMessage: '結果未更新' as const,
    data: buildEmptyDayData(d.day, d.label, d.dayHead),
  })),
  scheduleDays: MAY_DATES.map((d) => {
    const isDay1 = d.day === 1;

    return {
      day: d.day,
      isoDate: d.isoDate,
      pathDate: d.pathDate,
      label: d.label,
      dayHead: d.dayHead,
      status: isDay1 ? 'published' as const : 'pending' as const,
      statusMessage: isDay1 ? null : '取組予定未更新' as const,
      data: isDay1 ? DAY1_DATA : buildEmptyDayData(d.day, d.label, d.dayHead),
    };
  }),
};
