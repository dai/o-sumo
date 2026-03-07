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
    "east": [
      {
        "name": "豊昇龍",
        "yomi": "ほうしょうりゅう",
        "rank": "横綱",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "大の里",
        "yomi": "おおのさと",
        "rank": "横綱",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "大関",
    "east": [
      {
        "name": "安青錦",
        "yomi": "あおにしき",
        "rank": "大関",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "琴櫻",
        "yomi": "ことざくら",
        "rank": "大関",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "関脇",
    "east": [
      {
        "name": "霧島",
        "yomi": "きりしま",
        "rank": "関脇",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "高安",
        "yomi": "たかやす",
        "rank": "関脇",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "小結",
    "east": [
      {
        "name": "若元春",
        "yomi": "わかもとはる",
        "rank": "小結",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "熱海富士",
        "yomi": "あたみふじ",
        "rank": "小結",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭1",
    "east": [
      {
        "name": "若隆景",
        "yomi": "わかたかかげ",
        "rank": "前頭1",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "義ノ富士",
        "yomi": "よしのふじ",
        "rank": "前頭1",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭2",
    "east": [
      {
        "name": "藤ノ川",
        "yomi": "ふじのかわ",
        "rank": "前頭2",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "美ノ海",
        "yomi": "ちゅらのうみ",
        "rank": "前頭2",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭3",
    "east": [
      {
        "name": "平戸海",
        "yomi": "ひらどうみ",
        "rank": "前頭3",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "王鵬",
        "yomi": "おうほう",
        "rank": "前頭3",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭4",
    "east": [
      {
        "name": "大栄翔",
        "yomi": "だいえいしょう",
        "rank": "前頭4",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "隆の勝",
        "yomi": "たかのしょう",
        "rank": "前頭4",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭5",
    "east": [
      {
        "name": "阿炎",
        "yomi": "あび",
        "rank": "前頭5",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "琴勝峰",
        "yomi": "ことしょうほう",
        "rank": "前頭5",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭6",
    "east": [
      {
        "name": "一山本",
        "yomi": "いちやまもと",
        "rank": "前頭6",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "阿武剋",
        "yomi": "おうのかつ",
        "rank": "前頭6",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭7",
    "east": [
      {
        "name": "欧勝馬",
        "yomi": "おうしょうま",
        "rank": "前頭7",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "伯乃富士",
        "yomi": "はくのふじ",
        "rank": "前頭7",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭8",
    "east": [
      {
        "name": "宇良",
        "yomi": "うら",
        "rank": "前頭8",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "正代",
        "yomi": "しょうだい",
        "rank": "前頭8",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭9",
    "east": [
      {
        "name": "時疾風",
        "yomi": "ときはやて",
        "rank": "前頭9",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "玉鷲",
        "yomi": "たまわし",
        "rank": "前頭9",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭10",
    "east": [
      {
        "name": "豪ノ山",
        "yomi": "ごうのやま",
        "rank": "前頭10",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "狼雅",
        "yomi": "ろうが",
        "rank": "前頭10",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭11",
    "east": [
      {
        "name": "獅司",
        "yomi": "しし",
        "rank": "前頭11",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "欧勝海",
        "yomi": "おうしょううみ",
        "rank": "前頭11",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭12",
    "east": [
      {
        "name": "朝紅龍",
        "yomi": "あさこうりゅう",
        "rank": "前頭12",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "朝乃山",
        "yomi": "あさのやま",
        "rank": "前頭12",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭13",
    "east": [
      {
        "name": "翔猿",
        "yomi": "とびざる",
        "rank": "前頭13",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "藤青雲",
        "yomi": "ふじせいうん",
        "rank": "前頭13",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭14",
    "east": [
      {
        "name": "千代翔馬",
        "yomi": "ちよしょうま",
        "rank": "前頭14",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "錦富士",
        "yomi": "にしきふじ",
        "rank": "前頭14",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭15",
    "east": [
      {
        "name": "翠富士",
        "yomi": "みどりふじ",
        "rank": "前頭15",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "御嶽海",
        "yomi": "みたけうみ",
        "rank": "前頭15",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭16",
    "east": [
      {
        "name": "朝白龍",
        "yomi": "あさはくりゅう",
        "rank": "前頭16",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "金峰山",
        "yomi": "きんぼうざん",
        "rank": "前頭16",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭17",
    "east": [
      {
        "name": "藤凌駕",
        "yomi": "ふじりょうが",
        "rank": "前頭17",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "琴栄峰",
        "yomi": "ことえいほう",
        "rank": "前頭17",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  }
];

export const juryo: RankGroup[] = [
  {
    "title": "十両1",
    "east": [
      {
        "name": "竜電",
        "yomi": "りゅうでん",
        "rank": "十両1",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "佐田の海",
        "yomi": "さだのうみ",
        "rank": "十両1",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "十両2",
    "east": [
      {
        "name": "朝翠龍",
        "yomi": "あさすいりゅう",
        "rank": "十両2",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "友風",
        "yomi": "ともかぜ",
        "rank": "十両2",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "十両3",
    "east": [
      {
        "name": "大青山",
        "yomi": "だいせいざん",
        "rank": "十両3",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "若ノ勝",
        "yomi": "わかのしょう",
        "rank": "十両3",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "十両4",
    "east": [
      {
        "name": "西ノ龍",
        "yomi": "にしのりゅう",
        "rank": "十両4",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "尊富士",
        "yomi": "たけるふじ",
        "rank": "十両4",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "十両5",
    "east": [
      {
        "name": "輝",
        "yomi": "かがやき",
        "rank": "十両5",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "白熊",
        "yomi": "しろくま",
        "rank": "十両5",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "十両6",
    "east": [
      {
        "name": "日翔志",
        "yomi": "ひとし",
        "rank": "十両6",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "嘉陽",
        "yomi": "かよう",
        "rank": "十両6",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "十両7",
    "east": [
      {
        "name": "明生",
        "yomi": "めいせい",
        "rank": "十両7",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "旭海雄",
        "yomi": "きょくかいゆう",
        "rank": "十両7",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "十両8",
    "east": [
      {
        "name": "湘南乃海",
        "yomi": "しょうなんのうみ",
        "rank": "十両8",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "北の若",
        "yomi": "きたのわか",
        "rank": "十両8",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "十両9",
    "east": [
      {
        "name": "玉正鳳",
        "yomi": "たましょうほう",
        "rank": "十両9",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "羽出山",
        "yomi": "はつやま",
        "rank": "十両9",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "十両10",
    "east": [
      {
        "name": "出羽ノ龍",
        "yomi": "でわのりゅう",
        "rank": "十両10",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "東白龍",
        "yomi": "とうはくりゅう",
        "rank": "十両10",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "十両11",
    "east": [
      {
        "name": "一意",
        "yomi": "かずま",
        "rank": "十両11",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "寿之富士",
        "yomi": "としのふじ",
        "rank": "十両11",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "十両12",
    "east": [
      {
        "name": "錦木",
        "yomi": "にしきぎ",
        "rank": "十両12",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "剣翔",
        "yomi": "つるぎしょう",
        "rank": "十両12",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "十両13",
    "east": [
      {
        "name": "島津海",
        "yomi": "しまづうみ",
        "rank": "十両13",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "藤天晴",
        "yomi": "ふじてんせい",
        "rank": "十両13",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "十両14",
    "east": [
      {
        "name": "風賢央",
        "yomi": "かぜけんおう",
        "rank": "十両14",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "荒篤山",
        "yomi": "こうとくざん",
        "rank": "十両14",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  }
];

export const makushita: RankGroup[] = [
  {
    "title": "幕下1",
    "east": [
      {
        "name": "日向丸",
        "yomi": "ひむかまる",
        "rank": "幕下1",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "栃大海",
        "yomi": "とちたいかい",
        "rank": "幕下1",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下2",
    "east": [
      {
        "name": "白鷹山",
        "yomi": "はくようざん",
        "rank": "幕下2",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": []
  },
  {
    "title": "幕下3",
    "east": [
      {
        "name": "貴健斗",
        "yomi": "たかけんと",
        "rank": "幕下3",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "英乃海",
        "yomi": "ひでのうみ",
        "rank": "幕下3",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下4",
    "east": [
      {
        "name": "炎鵬",
        "yomi": "えんほう",
        "rank": "幕下4",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "大辻",
        "yomi": "おおつじ",
        "rank": "幕下4",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下5",
    "east": [
      {
        "name": "志摩ノ海",
        "yomi": "しまのうみ",
        "rank": "幕下5",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": []
  },
  {
    "title": "幕下6",
    "east": [],
    "west": [
      {
        "name": "栃丸",
        "yomi": "とちまる",
        "rank": "幕下6",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下7",
    "east": [],
    "west": [
      {
        "name": "伊波",
        "yomi": "いなみ",
        "rank": "幕下7",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下8",
    "east": [
      {
        "name": "吉井",
        "yomi": "よしい",
        "rank": "幕下8",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": []
  },
  {
    "title": "幕下9",
    "east": [],
    "west": [
      {
        "name": "栃武蔵",
        "yomi": "とちむさし",
        "rank": "幕下9",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下10",
    "east": [
      {
        "name": "豪刃雄",
        "yomi": "ごうじんゆう",
        "rank": "幕下10",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "夢道鵬",
        "yomi": "むどうほう",
        "rank": "幕下10",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下11",
    "east": [
      {
        "name": "三重ノ富士",
        "yomi": "みえのふじ",
        "rank": "幕下11",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": []
  },
  {
    "title": "幕下12",
    "east": [
      {
        "name": "北天海",
        "yomi": "ほくてんかい",
        "rank": "幕下12",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": []
  },
  {
    "title": "幕下13",
    "east": [
      {
        "name": "峰刃",
        "yomi": "みねやいば",
        "rank": "幕下13",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": []
  },
  {
    "title": "幕下14",
    "east": [],
    "west": [
      {
        "name": "大喜翔",
        "yomi": "だいきしょう",
        "rank": "幕下14",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下15",
    "east": [
      {
        "name": "花の富士",
        "yomi": "はなのふじ",
        "rank": "幕下15",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "竜翔",
        "yomi": "りゅうしょう",
        "rank": "幕下15",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下16",
    "east": [
      {
        "name": "一翔",
        "yomi": "かずと",
        "rank": "幕下16",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": []
  },
  {
    "title": "幕下17",
    "east": [
      {
        "name": "春山",
        "yomi": "はるやま",
        "rank": "幕下17",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "大皇翔",
        "yomi": "だいこうしょう",
        "rank": "幕下17",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下18",
    "east": [
      {
        "name": "安房乃国",
        "yomi": "あわのくに",
        "rank": "幕下18",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "千代虎",
        "yomi": "ちよとら",
        "rank": "幕下18",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下19",
    "east": [
      {
        "name": "栃幸大",
        "yomi": "とちこうだい",
        "rank": "幕下19",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "魁清城",
        "yomi": "かいせいじょう",
        "rank": "幕下19",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下20",
    "east": [
      {
        "name": "天道山",
        "yomi": "てんどうざん",
        "rank": "幕下20",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "北大地",
        "yomi": "きただいち",
        "rank": "幕下20",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下21",
    "east": [
      {
        "name": "紫雷",
        "yomi": "しでん",
        "rank": "幕下21",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "将豊竜",
        "yomi": "しょうほうりゅう",
        "rank": "幕下21",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下22",
    "east": [],
    "west": [
      {
        "name": "深井",
        "yomi": "ふかい",
        "rank": "幕下22",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下23",
    "east": [
      {
        "name": "黒姫山",
        "yomi": "くろひめやま",
        "rank": "幕下23",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "徳之武藏",
        "yomi": "とくのむさし",
        "rank": "幕下23",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下24",
    "east": [
      {
        "name": "勇磨",
        "yomi": "ゆうま",
        "rank": "幕下24",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "肥後ノ海",
        "yomi": "ひごのうみ",
        "rank": "幕下24",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下25",
    "east": [],
    "west": [
      {
        "name": "御雷山",
        "yomi": "みかづちやま",
        "rank": "幕下25",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下26",
    "east": [
      {
        "name": "若隆元",
        "yomi": "わかたかもと",
        "rank": "幕下26",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "聖富士",
        "yomi": "さとるふじ",
        "rank": "幕下26",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下27",
    "east": [],
    "west": [
      {
        "name": "新隆山",
        "yomi": "あらたかやま",
        "rank": "幕下27",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下28",
    "east": [],
    "west": [
      {
        "name": "東誠竜",
        "yomi": "とうせいりゅう",
        "rank": "幕下28",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下29",
    "east": [
      {
        "name": "大雄翔",
        "yomi": "だいゆうしょう",
        "rank": "幕下29",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "小原",
        "yomi": "おばら",
        "rank": "幕下29",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下30",
    "east": [
      {
        "name": "上戸",
        "yomi": "かみと",
        "rank": "幕下30",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "宮乃風",
        "yomi": "みやのかぜ",
        "rank": "幕下30",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下31",
    "east": [],
    "west": [
      {
        "name": "北はり磨",
        "yomi": "きたはりま",
        "rank": "幕下31",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下32",
    "east": [
      {
        "name": "武将山",
        "yomi": "ぶしょうざん",
        "rank": "幕下32",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "長内",
        "yomi": "おさない",
        "rank": "幕下32",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下33",
    "east": [
      {
        "name": "欧山田",
        "yomi": "おうやまだ",
        "rank": "幕下33",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "出羽大海",
        "yomi": "でわたいかい",
        "rank": "幕下33",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下34",
    "east": [
      {
        "name": "魁郷",
        "yomi": "かいごう",
        "rank": "幕下34",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "若雅",
        "yomi": "わかみやび",
        "rank": "幕下34",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下35",
    "east": [
      {
        "name": "碇潟",
        "yomi": "いかりがた",
        "rank": "幕下35",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": []
  },
  {
    "title": "幕下36",
    "east": [
      {
        "name": "朝玉勢",
        "yomi": "あさぎょくせい",
        "rank": "幕下36",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "時天嵐",
        "yomi": "ときてんらん",
        "rank": "幕下36",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下37",
    "east": [
      {
        "name": "清水海",
        "yomi": "しみずうみ",
        "rank": "幕下37",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "城間",
        "yomi": "しろま",
        "rank": "幕下37",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下38",
    "east": [
      {
        "name": "矢後",
        "yomi": "やご",
        "rank": "幕下38",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "佐田ノ輝",
        "yomi": "さだのひかり",
        "rank": "幕下38",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下39",
    "east": [
      {
        "name": "天空海",
        "yomi": "あくあ",
        "rank": "幕下39",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "花の海",
        "yomi": "はなのうみ",
        "rank": "幕下39",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下40",
    "east": [
      {
        "name": "玉欧山",
        "yomi": "ぎょくおうざん",
        "rank": "幕下40",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": []
  },
  {
    "title": "幕下41",
    "east": [
      {
        "name": "栃登",
        "yomi": "とちのぼり",
        "rank": "幕下41",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "三田",
        "yomi": "みた",
        "rank": "幕下41",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下42",
    "east": [],
    "west": [
      {
        "name": "大昇龍",
        "yomi": "だいしょうりゅう",
        "rank": "幕下42",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下43",
    "east": [
      {
        "name": "清田",
        "yomi": "きよた",
        "rank": "幕下43",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "春雷",
        "yomi": "しゅんらい",
        "rank": "幕下43",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下44",
    "east": [
      {
        "name": "麒麟龍",
        "yomi": "きりんりゅう",
        "rank": "幕下44",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "對馬洋",
        "yomi": "つしまなだ",
        "rank": "幕下44",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下45",
    "east": [
      {
        "name": "欧勝竜",
        "yomi": "おうしょうりゅう",
        "rank": "幕下45",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": []
  },
  {
    "title": "幕下46",
    "east": [
      {
        "name": "二本柳",
        "yomi": "にほんやなぎ",
        "rank": "幕下46",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "琴挙龍",
        "yomi": "ことけんりゅう",
        "rank": "幕下46",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下47",
    "east": [
      {
        "name": "土佐緑",
        "yomi": "とさみどり",
        "rank": "幕下47",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "安響",
        "yomi": "あんひびき",
        "rank": "幕下47",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下48",
    "east": [],
    "west": [
      {
        "name": "富士の山",
        "yomi": "ふじのやま",
        "rank": "幕下48",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下49",
    "east": [],
    "west": [
      {
        "name": "千代の勝",
        "yomi": "ちよのかつ",
        "rank": "幕下49",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下50",
    "east": [
      {
        "name": "安大翔",
        "yomi": "あんおおしょう",
        "rank": "幕下50",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "つる林",
        "yomi": "つるばやし",
        "rank": "幕下50",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下51",
    "east": [
      {
        "name": "肥後ノ丸",
        "yomi": "ひごのまる",
        "rank": "幕下51",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "日向龍",
        "yomi": "ひなたりゅう",
        "rank": "幕下51",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下52",
    "east": [
      {
        "name": "和気乃風",
        "yomi": "わけのかぜ",
        "rank": "幕下52",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "千代大豪",
        "yomi": "ちよだいごう",
        "rank": "幕下52",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下53",
    "east": [
      {
        "name": "栃清龍",
        "yomi": "とちせいりゅう",
        "rank": "幕下53",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "大畑",
        "yomi": "おおはた",
        "rank": "幕下53",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下54",
    "east": [],
    "west": [
      {
        "name": "隆志",
        "yomi": "りゅうじ",
        "rank": "幕下54",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下56",
    "east": [],
    "west": [
      {
        "name": "立王尚",
        "yomi": "たつおうしょう",
        "rank": "幕下56",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下57",
    "east": [
      {
        "name": "魁勝",
        "yomi": "かいしょう",
        "rank": "幕下57",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "山藤",
        "yomi": "やまとう",
        "rank": "幕下57",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下58",
    "east": [
      {
        "name": "峰洲山",
        "yomi": "ほうしゅうざん",
        "rank": "幕下58",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "安芸乃山",
        "yomi": "あきのやま",
        "rank": "幕下58",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下59",
    "east": [
      {
        "name": "雷道",
        "yomi": "いかずちどう",
        "rank": "幕下59",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": [
      {
        "name": "朝志雄",
        "yomi": "あさしゆう",
        "rank": "幕下59",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "幕下60",
    "east": [
      {
        "name": "相馬",
        "yomi": "そうま",
        "rank": "幕下60",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ],
    "west": []
  }
];
