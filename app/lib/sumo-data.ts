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
    "title": "前頭筆頭",
    "east": [
      {
        "name": "若隆景",
        "yomi": "わかたかかげ",
        "rank": "前頭筆頭",
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
        "rank": "前頭筆頭",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭二",
    "east": [
      {
        "name": "藤ノ川",
        "yomi": "ふじのかわ",
        "rank": "前頭二",
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
        "rank": "前頭二",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭三",
    "east": [
      {
        "name": "平戸海",
        "yomi": "ひらどうみ",
        "rank": "前頭三",
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
        "rank": "前頭三",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭四",
    "east": [
      {
        "name": "大栄翔",
        "yomi": "だいえいしょう",
        "rank": "前頭四",
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
        "rank": "前頭四",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭五",
    "east": [
      {
        "name": "阿炎",
        "yomi": "あび",
        "rank": "前頭五",
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
        "rank": "前頭五",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭六",
    "east": [
      {
        "name": "一山本",
        "yomi": "いちやまもと",
        "rank": "前頭六",
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
        "rank": "前頭六",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭七",
    "east": [
      {
        "name": "欧勝馬",
        "yomi": "おうしょうま",
        "rank": "前頭七",
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
        "rank": "前頭七",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭八",
    "east": [
      {
        "name": "宇良",
        "yomi": "うら",
        "rank": "前頭八",
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
        "rank": "前頭八",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭九",
    "east": [
      {
        "name": "時疾風",
        "yomi": "ときはやて",
        "rank": "前頭九",
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
        "rank": "前頭九",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭十",
    "east": [
      {
        "name": "豪ノ山",
        "yomi": "ごうのやま",
        "rank": "前頭十",
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
        "rank": "前頭十",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭十一",
    "east": [
      {
        "name": "獅司",
        "yomi": "しし",
        "rank": "前頭十一",
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
        "rank": "前頭十一",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭十二",
    "east": [
      {
        "name": "朝紅龍",
        "yomi": "あさこうりゅう",
        "rank": "前頭十二",
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
        "rank": "前頭十二",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭十三",
    "east": [
      {
        "name": "翔猿",
        "yomi": "とびざる",
        "rank": "前頭十三",
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
        "rank": "前頭十三",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭十四",
    "east": [
      {
        "name": "千代翔馬",
        "yomi": "ちよしょうま",
        "rank": "前頭十四",
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
        "rank": "前頭十四",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭十五",
    "east": [
      {
        "name": "翠富士",
        "yomi": "みどりふじ",
        "rank": "前頭十五",
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
        "rank": "前頭十五",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭十六",
    "east": [
      {
        "name": "朝白龍",
        "yomi": "あさはくりゅう",
        "rank": "前頭十六",
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
        "rank": "前頭十六",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  },
  {
    "title": "前頭十七",
    "east": [
      {
        "name": "藤凌駕",
        "yomi": "ふじりょうが",
        "rank": "前頭十七",
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
        "rank": "前頭十七",
        "side": "west",
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "results": []
      }
    ]
  }
];

export const juryo: RankGroup[] = [];
