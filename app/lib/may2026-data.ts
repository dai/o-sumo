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

const DAY2_MAKUUCHI_MATCHES = [
  ['若ノ勝', '藤凌駕'],
  ['竜電', '欧勝海'],
  ['御嶽海', '翔猿'],
  ['狼雅', '玉鷲'],
  ['獅司', '琴栄峰'],
  ['時疾風', '金峰山'],
  ['朝乃山', '伯乃富士'],
  ['宇良', '錦富士'],
  ['欧勝馬', '朝白龍'],
  ['阿炎', '朝紅龍'],
  ['美ノ海', '千代翔馬'],
  ['藤青雲', '正代'],
  ['大栄翔', '若元春'],
  ['豪ノ山', '王鵬'],
  ['一山本', '高安'],
  ['熱海富士', '平戸海'],
  ['隆の勝', '琴勝峰'],
  ['琴櫻', '若隆景'],
  ['霧島', '義ノ富士'],
  ['豊昇龍', '藤ノ川'],
] as const;

const DAY2_DATA: TorikumiDailyData = {
  makuuchi: {
    day: 2,
    dayName: '取組日 二日目',
    dayHead: '二日目： 令和8年5月11日(月)',
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
    matches: DAY2_MAKUUCHI_MATCHES.map(([eastName, westName], index) => (
      buildMatch('幕内', index + 1, eastName, westName)
    )),
  },
  juryo: {
    day: 2,
    dayName: '取組日 二日目',
    dayHead: '二日目： 令和8年5月11日(月)',
    division: '十両',
    matches: [
      {
        division: '十両',
        boutNo: 1,
        eastName: '風賢央',
        eastYomi: 'かぜけんおう',
        eastEnglish: 'Kazekeno',
        eastRank: '十両十四枚目',
        eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4158/',
        westName: '栃大海',
        westYomi: 'とちたいかい',
        westEnglish: 'Tochitaikai',
        westRank: '幕下筆頭',
        westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3839/',
        kimarite: '未定',
        winner: null,
      },
      {
        division: '十両',
        boutNo: 2,
        eastName: '島津海',
        eastYomi: 'しまづうみ',
        eastEnglish: 'Shimazuumi',
        eastRank: '十両十三枚目',
        eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3404/',
        westName: '荒篤山',
        westYomi: 'こうとくざん',
        westEnglish: 'Kotokuzan',
        westRank: '十両十四枚目',
        westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3218/',
        kimarite: '未定',
        winner: null,
      },
      {
        division: '十両',
        boutNo: 3,
        eastName: '藤天成',
        eastYomi: 'ふじてんせい',
        eastEnglish: 'Fujitensei',
        eastRank: '十両十三枚目',
        eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4337/',
        westName: '剣翔',
        westYomi: 'つるぎしょう',
        westEnglish: 'Tsurugisho',
        westRank: '十両十二枚目',
        westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3504/',
        kimarite: '未定',
        winner: null,
      },
      {
        division: '十両',
        boutNo: 4,
        eastName: '一意',
        eastYomi: 'かずま',
        eastEnglish: 'Kazuma',
        eastRank: '十両十一枚目',
        eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4287/',
        westName: '錦木',
        westYomi: 'にしきぎ',
        westEnglish: 'Nishikigi',
        westRank: '十両十二枚目',
        westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/2892/',
        kimarite: '未定',
        winner: null,
      },
      {
        division: '十両',
        boutNo: 5,
        eastName: '寿之富士',
        eastYomi: 'としのふじ',
        eastEnglish: 'Toshinofuji',
        eastRank: '十両十一枚目',
        eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4243/',
        westName: '東白龍',
        westYomi: 'とうはくりゅう',
        westEnglish: 'Tohakuryu',
        westRank: '十両十枚目',
        westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3969/',
        kimarite: '未定',
        winner: null,
      },
      {
        division: '十両',
        boutNo: 6,
        eastName: '玉正鳳',
        eastYomi: 'たましょうほう',
        eastEnglish: 'Tamashoho',
        eastRank: '十両九枚目',
        eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3367/',
        westName: '出羽ノ龍',
        westYomi: 'でわのりゅう',
        westEnglish: 'Dewanoryu',
        westRank: '十両十枚目',
        westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3983/',
        kimarite: '未定',
        winner: null,
      },
      {
        division: '十両',
        boutNo: 7,
        eastName: '羽出山',
        eastYomi: 'はつやま',
        eastEnglish: 'Hatsuyama',
        eastRank: '十両九枚目',
        eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4124/',
        westName: '北の若',
        westYomi: 'きたのわか',
        westEnglish: 'Kitanowaka',
        westRank: '十両八枚目',
        westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3939/',
        kimarite: '未定',
        winner: null,
      },
      {
        division: '十両',
        boutNo: 8,
        eastName: '明生',
        eastYomi: 'めいせい',
        eastEnglish: 'Meisei',
        eastRank: '十両七枚目',
        eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3337/',
        westName: '湘南乃海',
        westYomi: 'しょうなんのうみ',
        westEnglish: 'Shonannoumi',
        westRank: '十両八枚目',
        westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3553/',
        kimarite: '未定',
        winner: null,
      },
      {
        division: '十両',
        boutNo: 9,
        eastName: '旭海雄',
        eastYomi: 'きょくかいゆう',
        eastEnglish: 'Kyokukaiyu',
        eastRank: '十両七枚目',
        eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4232/',
        westName: '嘉陽',
        westYomi: 'かよう',
        westEnglish: 'Kayo',
        westRank: '十両六枚目',
        westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4165/',
        kimarite: '未定',
        winner: null,
      },
      {
        division: '十両',
        boutNo: 10,
        eastName: '輝',
        eastYomi: 'かがやき',
        eastEnglish: 'Kagayaki',
        eastRank: '十両五枚目',
        eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3255/',
        westName: '日翔志',
        westYomi: 'ひとし',
        westEnglish: 'Hitoshi',
        westRank: '十両六枚目',
        westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4095/',
        kimarite: '未定',
        winner: null,
      },
      {
        division: '十両',
        boutNo: 11,
        eastName: '白熊',
        eastYomi: 'しろくま',
        eastEnglish: 'Shirokuma',
        eastRank: '十両五枚目',
        eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4164/',
        westName: '尊富士',
        westYomi: 'たけるふじ',
        westEnglish: 'Takerufuji',
        westRank: '十両四枚目',
        westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4171/',
        kimarite: '未定',
        winner: null,
      },
      {
        division: '十両',
        boutNo: 12,
        eastName: '大青山',
        eastYomi: 'だいせいざん',
        eastEnglish: 'Daiseizan',
        eastRank: '十両三枚目',
        eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4116/',
        westName: '西ノ龍',
        westYomi: 'にしのりゅう',
        westEnglish: 'Nishinoryu',
        westRank: '十両四枚目',
        westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3914/',
        kimarite: '未定',
        winner: null,
      },
      {
        division: '十両',
        boutNo: 13,
        eastName: '若ノ勝',
        eastYomi: 'わかのしょう',
        eastEnglish: 'Wakanosho',
        eastRank: '十両三枚目',
        eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4121/',
        westName: '友風',
        westYomi: 'ともかぜ',
        westEnglish: 'Tomokaze',
        westRank: '十両二枚目',
        westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3818/',
        kimarite: '未定',
        winner: null,
      },
      {
        division: '十両',
        boutNo: 14,
        eastName: '竜電',
        eastYomi: 'りゅうでん',
        eastEnglish: 'Ryuden',
        eastRank: '十両筆頭',
        eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/2890/',
        westName: '朝翠龍',
        westYomi: 'あさすいりゅう',
        westEnglish: 'Asasuiryu',
        westRank: '十両二枚目',
        westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4285/',
        kimarite: '未定',
        winner: null,
      },
    ],
    absentees: [
      {
        id: 2565,
        name: '佐田の海',
        profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/2565/',
      },
      {
        id: 3334,
        name: '白鷹山',
        profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3334/',
      },
      {
        id: 3743,
        name: '翠富士',
        profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3743/',
      },
      {
        id: 3803,
        name: '炎鵬',
        profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/3803/',
      },
      {
        id: 4231,
        name: '阿武剋',
        profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4231/',
      },
      {
        id: 4275,
        name: '大花竜',
        profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/4275/',
      },
    ],
  },
};

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
  updatedAt: '2026-05-09',
  resultUpdatedAt: '2026-05-09',
  scheduleUpdatedAt: '2026-05-09',
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
    const publishedDayData = d.day === 1 ? DAY1_DATA : d.day === 2 ? DAY2_DATA : null;

    return {
      day: d.day,
      isoDate: d.isoDate,
      pathDate: d.pathDate,
      label: d.label,
      dayHead: d.dayHead,
      status: publishedDayData ? 'published' as const : 'pending' as const,
      statusMessage: publishedDayData ? null : '取組予定未更新' as const,
      data: publishedDayData ?? buildEmptyDayData(d.day, d.label, d.dayHead),
    };
  }),
};
