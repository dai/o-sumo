export interface Rikishi {
  name: string;
  yomi: string;
  rank: string;
  side: 'east' | 'west';
  wins?: number;
  losses?: number;
  draws?: number;
  results?: ('win' | 'loss' | 'draw')[];
}

export interface RankGroup {
  title: string;
  east: Rikishi[];
  west: Rikishi[];
}

export const makuuchiData: RankGroup[] = [
  {
    "title": "横綱",
    "east": [{ "name": "豊昇龍", "yomi": "ほうしょうりゅう", "rank": "横綱", "side": "east" }],
    "west": [{ "name": "大の里", "yomi": "おおのさと", "rank": "横綱", "side": "west" }]
  },
  {
    "title": "大関",
    "east": [{ "name": "安青錦", "yomi": "あおにしき", "rank": "大関", "side": "east" }],
    "west": [{ "name": "琴櫻", "yomi": "ことざくら", "rank": "大関", "side": "west" }]
  },
  {
    "title": "関脇",
    "east": [{ "name": "霧島", "yomi": "きりしま", "rank": "関脇", "side": "east" }],
    "west": [{ "name": "高安", "yomi": "たかやす", "rank": "関脇", "side": "west" }]
  },
  {
    "title": "小結",
    "east": [{ "name": "若元春", "yomi": "わかもとはる", "rank": "小結", "side": "east" }],
    "west": [{ "name": "熱海富士", "yomi": "あたみふじ", "rank": "小結", "side": "west" }]
  },
  {
    "title": "前頭1",
    "east": [{ "name": "若隆景", "yomi": "わかたかかげ", "rank": "前頭1", "side": "east" }],
    "west": [{ "name": "義ノ富士", "yomi": "よしのふじ", "rank": "前頭1", "side": "west" }]
  },
  {
    "title": "前頭2",
    "east": [{ "name": "藤ノ川", "yomi": "ふじのかわ", "rank": "前頭2", "side": "east" }],
    "west": [{ "name": "美ノ海", "yomi": "ちゅらのうみ", "rank": "前頭2", "side": "west" }]
  },
  {
    "title": "前頭3",
    "east": [{ "name": "平戸海", "yomi": "ひらどうみ", "rank": "前頭3", "side": "east" }],
    "west": [{ "name": "王鵬", "yomi": "おうほう", "rank": "前頭3", "side": "west" }]
  },
  {
    "title": "前頭4",
    "east": [{ "name": "大栄翔", "yomi": "だいえいしょう", "rank": "前頭4", "side": "east" }],
    "west": [{ "name": "隆の勝", "yomi": "たかのしょう", "rank": "前頭4", "side": "west" }]
  },
  {
    "title": "前頭5",
    "east": [{ "name": "阿炎", "yomi": "あび", "rank": "前頭5", "side": "east" }],
    "west": [{ "name": "琴勝峰", "yomi": "ことしょうほう", "rank": "前頭5", "side": "west" }]
  },
  {
    "title": "前頭6",
    "east": [{ "name": "一山本", "yomi": "いちやまもと", "rank": "前頭6", "side": "east" }],
    "west": [{ "name": "阿武剋", "yomi": "おうのかつ", "rank": "前頭6", "side": "west" }]
  },
  {
    "title": "前頭7",
    "east": [{ "name": "欧勝馬", "yomi": "おうしょうま", "rank": "前頭7", "side": "east" }],
    "west": [{ "name": "伯乃富士", "yomi": "はくのふじ", "rank": "前頭7", "side": "west" }]
  },
  {
    "title": "前頭8",
    "east": [{ "name": "宇良", "yomi": "うら", "rank": "前頭8", "side": "east" }],
    "west": [{ "name": "正代", "yomi": "しょうだい", "rank": "前頭8", "side": "west" }]
  },
  {
    "title": "前頭9",
    "east": [{ "name": "時疾風", "yomi": "ときはやて", "rank": "前頭9", "side": "east" }],
    "west": [{ "name": "玉鷲", "yomi": "たまわし", "rank": "前頭9", "side": "west" }]
  },
  {
    "title": "前頭10",
    "east": [{ "name": "豪ノ山", "yomi": "ごうのやま", "rank": "前頭10", "side": "east" }],
    "west": [{ "name": "狼雅", "yomi": "ろうが", "rank": "前頭10", "side": "west" }]
  },
  {
    "title": "前頭11",
    "east": [{ "name": "獅司", "yomi": "しし", "rank": "前頭11", "side": "east" }],
    "west": [{ "name": "欧勝海", "yomi": "おうしょううみ", "rank": "前頭11", "side": "west" }]
  },
  {
    "title": "前頭12",
    "east": [{ "name": "朝紅龍", "yomi": "あさこうりゅう", "rank": "前頭12", "side": "east" }],
    "west": [{ "name": "朝乃山", "yomi": "あさのやま", "rank": "前頭12", "side": "west" }]
  },
  {
    "title": "前頭13",
    "east": [{ "name": "翔猿", "yomi": "とびざる", "rank": "前頭13", "side": "east" }],
    "west": [{ "name": "藤青雲", "yomi": "ふじせいうん", "rank": "前頭13", "side": "west" }]
  },
  {
    "title": "前頭14",
    "east": [{ "name": "千代翔馬", "yomi": "ちよしょうま", "rank": "前頭14", "side": "east" }],
    "west": [{ "name": "錦富士", "yomi": "にしきふじ", "rank": "前頭14", "side": "west" }]
  },
  {
    "title": "前頭15",
    "east": [{ "name": "翠富士", "yomi": "みどりふじ", "rank": "前頭15", "side": "east" }],
    "west": [{ "name": "御嶽海", "yomi": "みたけうみ", "rank": "前頭15", "side": "west" }]
  },
  {
    "title": "前頭16",
    "east": [{ "name": "朝白龍", "yomi": "あさはくりゅう", "rank": "前頭16", "side": "east" }],
    "west": [{ "name": "金峰山", "yomi": "きんぼうざん", "rank": "前頭16", "side": "west" }]
  },
  {
    "title": "前頭17",
    "east": [{ "name": "藤凌駕", "yomi": "ふじりょうが", "rank": "前頭17", "side": "east" }],
    "west": [{ "name": "琴栄峰", "yomi": "ことえいほう", "rank": "前頭17", "side": "west" }]
  }
];

export const juryo: RankGroup[] = [
  {
    "title": "十両1",
    "east": [{ "name": "竜電", "yomi": "りゅうでん", "rank": "十両1", "side": "east" }],
    "west": [{ "name": "佐田の海", "yomi": "さだのうみ", "rank": "十両1", "side": "west" }]
  },
  {
    "title": "十両2",
    "east": [{ "name": "朝翠龍", "yomi": "あさすいりゅう", "rank": "十両2", "side": "east" }],
    "west": [{ "name": "友風", "yomi": "ともかぜ", "rank": "十両2", "side": "west" }]
  },
  {
    "title": "十両3",
    "east": [{ "name": "大青山", "yomi": "だいせいざん", "rank": "十両3", "side": "east" }],
    "west": [{ "name": "若ノ勝", "yomi": "わかのかつ", "rank": "十両3", "side": "west" }]
  },
  {
    "title": "十両4",
    "east": [{ "name": "西ノ龍", "yomi": "にしのりゅう", "rank": "十両4", "side": "east" }],
    "west": [{ "name": "尊富士", "yomi": "たけるふじ", "rank": "十両4", "side": "west" }]
  },
  {
    "title": "十両5",
    "east": [{ "name": "輝", "yomi": "かがやき", "rank": "十両5", "side": "east" }],
    "west": [{ "name": "白熊", "yomi": "しろくま", "rank": "十両5", "side": "west" }]
  },
  {
    "title": "十両6",
    "east": [{ "name": "日翔志", "yomi": "ひよし", "rank": "十両6", "side": "east" }],
    "west": [{ "name": "嘉陽", "yomi": "かよう", "rank": "十両6", "side": "west" }]
  },
  {
    "title": "十両7",
    "east": [{ "name": "明生", "yomi": "めいせい", "rank": "十両7", "side": "east" }],
    "west": [{ "name": "旭海雄", "yomi": "あきみゆう", "rank": "十両7", "side": "west" }]
  },
  {
    "title": "十両8",
    "east": [{ "name": "水戸龍", "yomi": "みとりゅう", "rank": "十両8", "side": "east" }],
    "west": [{ "name": "志摩ノ海", "yomi": "しまのうみ", "rank": "十両8", "side": "west" }]
  },
  {
    "title": "十両9",
    "east": [{ "name": "白旺灘", "yomi": "はくおうなだ", "rank": "十両9", "side": "east" }],
    "west": [{ "name": "玉正鳳", "yomi": "たましょうほう", "rank": "十両9", "side": "west" }]
  },
  {
    "title": "十両10",
    "east": [{ "name": "大翔鵬", "yomi": "だいしょうほう", "rank": "十両10", "side": "east" }],
    "west": [{ "name": "北の若", "yomi": "きたのわか", "rank": "十両10", "side": "west" }]
  },
  {
    "title": "十両11",
    "east": [{ "name": "一意", "yomi": "かずい", "rank": "十両11", "side": "east" }],
    "west": [{ "name": "寿之富士", "yomi": "としのふじ", "rank": "十両11", "side": "west" }]
  },
  {
    "title": "十両12",
    "east": [{ "name": "錦木", "yomi": "にしきぎ", "rank": "十両12", "side": "east" }],
    "west": [{ "name": "剣翔", "yomi": "つるぎしょう", "rank": "十両12", "side": "west" }]
  },
  {
    "title": "十両13",
    "east": [{ "name": "島津海", "yomi": "しまづうみ", "rank": "十両13", "side": "east" }],
    "west": [{ "name": "藤天晴", "yomi": "ふじあきら", "rank": "十両13", "side": "west" }]
  },
  {
    "title": "十両14",
    "east": [{ "name": "風賢央", "yomi": "かぜけんおう", "rank": "十両14", "side": "east" }],
    "west": [{ "name": "荒篤山", "yomi": "こうとくざん", "rank": "十両14", "side": "west" }]
  }
];
