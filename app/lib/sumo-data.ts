export interface Rikishi {
  id: number;
  name: string;
  yomi: string;
  rank: string;
  side: 'east' | 'west';
  wins?: number;
  losses?: number;
  draws?: number;
  results?: ('win' | 'loss' | 'draw')[];
  profileUrl: string;
  memo?: string;
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
        "id": 3842,
        "name": "豊昇龍",
        "yomi": "ほうしょうりゅう",
        "rank": "横綱",
        "side": "east",
        "wins": 9,
        "losses": 2,
        "draws": 0,
        "results": [
          "win",
          "win",
          "win",
          "loss",
          "win",
          "win",
          "win",
          "loss",
          "win",
          "win",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 4227,
        "name": "大の里",
        "yomi": "おおのさと",
        "rank": "横綱",
        "side": "west",
        "wins": 0,
        "losses": 4,
        "draws": 8,
        "results": [
          "loss",
          "loss",
          "loss",
          "loss",
          "draw",
          "draw",
          "draw",
          "draw",
          "draw",
          "draw",
          "draw",
          "draw"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4227/",
        "memo": ""
      }
    ]
  },
  {
    "title": "大関",
    "east": [
      {
        "id": 4230,
        "name": "安青錦",
        "yomi": "あおにしき",
        "rank": "大関",
        "side": "east",
        "wins": 5,
        "losses": 6,
        "draws": 0,
        "results": [
          "win",
          "loss",
          "win",
          "loss",
          "win",
          "loss",
          "loss",
          "loss",
          "win",
          "win",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4230/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 3661,
        "name": "琴櫻",
        "yomi": "ことざくら",
        "rank": "大関",
        "side": "west",
        "wins": 7,
        "losses": 4,
        "draws": 0,
        "results": [
          "win",
          "win",
          "win",
          "loss",
          "loss",
          "loss",
          "win",
          "loss",
          "win",
          "win",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3661/",
        "memo": ""
      }
    ]
  },
  {
    "title": "関脇",
    "east": [
      {
        "id": 3622,
        "name": "霧島",
        "yomi": "きりしま",
        "rank": "関脇",
        "side": "east",
        "wins": 10,
        "losses": 1,
        "draws": 0,
        "results": [
          "win",
          "loss",
          "win",
          "win",
          "win",
          "win",
          "win",
          "win",
          "win",
          "win",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3622/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 2775,
        "name": "高安",
        "yomi": "たかやす",
        "rank": "関脇",
        "side": "west",
        "wins": 6,
        "losses": 5,
        "draws": 0,
        "results": [
          "win",
          "win",
          "win",
          "win",
          "win",
          "loss",
          "win",
          "loss",
          "loss",
          "loss",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2775/",
        "memo": ""
      }
    ]
  },
  {
    "title": "小結",
    "east": [
      {
        "id": 3371,
        "name": "若元春",
        "yomi": "わかもとはる",
        "rank": "小結",
        "side": "east",
        "wins": 2,
        "losses": 9,
        "draws": 0,
        "results": [
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "win",
          "win",
          "loss",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3371/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 4055,
        "name": "熱海富士",
        "yomi": "あたみふじ",
        "rank": "小結",
        "side": "west",
        "wins": 7,
        "losses": 4,
        "draws": 0,
        "results": [
          "loss",
          "win",
          "loss",
          "win",
          "loss",
          "win",
          "win",
          "win",
          "loss",
          "win",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4055/",
        "memo": ""
      }
    ]
  },
  {
    "title": "前頭1",
    "east": [
      {
        "id": 3761,
        "name": "若隆景",
        "yomi": "わかたかかげ",
        "rank": "前頭1",
        "side": "east",
        "wins": 6,
        "losses": 5,
        "draws": 0,
        "results": [
          "win",
          "loss",
          "loss",
          "loss",
          "win",
          "win",
          "loss",
          "loss",
          "win",
          "win",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3761/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 4279,
        "name": "義ノ富士",
        "yomi": "よしのふじ",
        "rank": "前頭1",
        "side": "west",
        "wins": 5,
        "losses": 6,
        "draws": 0,
        "results": [
          "loss",
          "win",
          "loss",
          "win",
          "loss",
          "loss",
          "win",
          "win",
          "loss",
          "loss",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4279/",
        "memo": ""
      }
    ]
  },
  {
    "title": "前頭2",
    "east": [
      {
        "id": 4191,
        "name": "藤ノ川",
        "yomi": "ふじのかわ",
        "rank": "前頭2",
        "side": "east",
        "wins": 5,
        "losses": 6,
        "draws": 0,
        "results": [
          "loss",
          "loss",
          "win",
          "win",
          "loss",
          "win",
          "loss",
          "loss",
          "win",
          "loss",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4191/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 3711,
        "name": "美ノ海",
        "yomi": "ちゅらのうみ",
        "rank": "前頭2",
        "side": "west",
        "wins": 3,
        "losses": 8,
        "draws": 0,
        "results": [
          "loss",
          "win",
          "loss",
          "win",
          "loss",
          "loss",
          "win",
          "loss",
          "loss",
          "loss",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3711/",
        "memo": ""
      }
    ]
  },
  {
    "title": "前頭3",
    "east": [
      {
        "id": 3705,
        "name": "平戸海",
        "yomi": "ひらどうみ",
        "rank": "前頭3",
        "side": "east",
        "wins": 5,
        "losses": 6,
        "draws": 0,
        "results": [
          "win",
          "win",
          "loss",
          "win",
          "win",
          "loss",
          "loss",
          "win",
          "loss",
          "loss",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3705/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 3844,
        "name": "王鵬",
        "yomi": "おうほう",
        "rank": "前頭3",
        "side": "west",
        "wins": 5,
        "losses": 6,
        "draws": 0,
        "results": [
          "loss",
          "loss",
          "win",
          "loss",
          "loss",
          "win",
          "loss",
          "win",
          "loss",
          "win",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3844/",
        "memo": ""
      }
    ]
  },
  {
    "title": "前頭4",
    "east": [
      {
        "id": 3376,
        "name": "大栄翔",
        "yomi": "だいえいしょう",
        "rank": "前頭4",
        "side": "east",
        "wins": 4,
        "losses": 7,
        "draws": 0,
        "results": [
          "loss",
          "loss",
          "loss",
          "win",
          "win",
          "win",
          "loss",
          "win",
          "loss",
          "loss",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3376/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 3265,
        "name": "隆の勝",
        "yomi": "たかのしょう",
        "rank": "前頭4",
        "side": "west",
        "wins": 7,
        "losses": 4,
        "draws": 0,
        "results": [
          "win",
          "win",
          "win",
          "win",
          "win",
          "loss",
          "win",
          "win",
          "loss",
          "loss",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3265/",
        "memo": ""
      }
    ]
  },
  {
    "title": "前頭5",
    "east": [
      {
        "id": 3485,
        "name": "阿炎",
        "yomi": "あび",
        "rank": "前頭5",
        "side": "east",
        "wins": 2,
        "losses": 4,
        "draws": 5,
        "results": [
          "loss",
          "loss",
          "loss",
          "draw",
          "draw",
          "draw",
          "draw",
          "draw",
          "win",
          "win",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3485/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 3840,
        "name": "琴勝峰",
        "yomi": "ことしょうほう",
        "rank": "前頭5",
        "side": "west",
        "wins": 9,
        "losses": 2,
        "draws": 0,
        "results": [
          "win",
          "win",
          "win",
          "win",
          "loss",
          "win",
          "win",
          "win",
          "win",
          "loss",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3840/",
        "memo": ""
      }
    ]
  },
  {
    "title": "前頭6",
    "east": [
      {
        "id": 3753,
        "name": "一山本",
        "yomi": "いちやまもと",
        "rank": "前頭6",
        "side": "east",
        "wins": 6,
        "losses": 5,
        "draws": 0,
        "results": [
          "win",
          "win",
          "loss",
          "loss",
          "win",
          "win",
          "loss",
          "loss",
          "loss",
          "win",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3753/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 4231,
        "name": "阿武剋",
        "yomi": "おうのかつ",
        "rank": "前頭6",
        "side": "west",
        "wins": 1,
        "losses": 6,
        "draws": 5,
        "results": [
          "loss",
          "loss",
          "draw",
          "draw",
          "loss",
          "win",
          "loss",
          "loss",
          "loss",
          "draw",
          "draw",
          "draw"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4231/",
        "memo": ""
      }
    ]
  },
  {
    "title": "前頭7",
    "east": [
      {
        "id": 4108,
        "name": "欧勝馬",
        "yomi": "おうしょうま",
        "rank": "前頭7",
        "side": "east",
        "wins": 4,
        "losses": 7,
        "draws": 0,
        "results": [
          "win",
          "loss",
          "win",
          "loss",
          "loss",
          "loss",
          "loss",
          "win",
          "win",
          "loss",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4108/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 4187,
        "name": "伯乃富士",
        "yomi": "はくのふじ",
        "rank": "前頭7",
        "side": "west",
        "wins": 3,
        "losses": 4,
        "draws": 4,
        "results": [
          "loss",
          "loss",
          "draw",
          "draw",
          "draw",
          "draw",
          "win",
          "loss",
          "win",
          "win",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4187/",
        "memo": ""
      }
    ]
  },
  {
    "title": "前頭8",
    "east": [
      {
        "id": 3616,
        "name": "宇良",
        "yomi": "うら",
        "rank": "前頭8",
        "side": "east",
        "wins": 5,
        "losses": 6,
        "draws": 0,
        "results": [
          "win",
          "win",
          "win",
          "loss",
          "loss",
          "loss",
          "loss",
          "win",
          "loss",
          "loss",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3616/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 3521,
        "name": "正代",
        "yomi": "しょうだい",
        "rank": "前頭8",
        "side": "west",
        "wins": 7,
        "losses": 4,
        "draws": 0,
        "results": [
          "loss",
          "win",
          "win",
          "win",
          "win",
          "win",
          "loss",
          "loss",
          "win",
          "win",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3521/",
        "memo": ""
      }
    ]
  },
  {
    "title": "前頭9",
    "east": [
      {
        "id": 3933,
        "name": "時疾風",
        "yomi": "ときはやて",
        "rank": "前頭9",
        "side": "east",
        "wins": 5,
        "losses": 6,
        "draws": 0,
        "results": [
          "win",
          "loss",
          "loss",
          "win",
          "loss",
          "loss",
          "win",
          "win",
          "loss",
          "loss",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3933/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 2629,
        "name": "玉鷲",
        "yomi": "たまわし",
        "rank": "前頭9",
        "side": "west",
        "wins": 3,
        "losses": 8,
        "draws": 0,
        "results": [
          "loss",
          "loss",
          "loss",
          "loss",
          "win",
          "loss",
          "win",
          "loss",
          "loss",
          "win",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2629/",
        "memo": ""
      }
    ]
  },
  {
    "title": "前頭10",
    "east": [
      {
        "id": 4079,
        "name": "豪ノ山",
        "yomi": "ごうのやま",
        "rank": "前頭10",
        "side": "east",
        "wins": 9,
        "losses": 2,
        "draws": 0,
        "results": [
          "win",
          "win",
          "win",
          "loss",
          "win",
          "win",
          "win",
          "win",
          "win",
          "win",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4079/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 3907,
        "name": "狼雅",
        "yomi": "ろうが",
        "rank": "前頭10",
        "side": "west",
        "wins": 4,
        "losses": 7,
        "draws": 0,
        "results": [
          "loss",
          "win",
          "win",
          "loss",
          "loss",
          "loss",
          "win",
          "loss",
          "loss",
          "loss",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3907/",
        "memo": ""
      }
    ]
  },
  {
    "title": "前頭11",
    "east": [
      {
        "id": 3990,
        "name": "獅司",
        "yomi": "しし",
        "rank": "前頭11",
        "side": "east",
        "wins": 5,
        "losses": 6,
        "draws": 0,
        "results": [
          "win",
          "loss",
          "loss",
          "win",
          "win",
          "loss",
          "win",
          "loss",
          "win",
          "loss",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3990/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 4025,
        "name": "欧勝海",
        "yomi": "おうしょううみ",
        "rank": "前頭11",
        "side": "west",
        "wins": 2,
        "losses": 9,
        "draws": 0,
        "results": [
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "win",
          "loss",
          "win",
          "loss",
          "loss",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4025/",
        "memo": ""
      }
    ]
  },
  {
    "title": "前頭12",
    "east": [
      {
        "id": 4101,
        "name": "朝紅龍",
        "yomi": "あさこうりゅう",
        "rank": "前頭12",
        "side": "east",
        "wins": 7,
        "losses": 4,
        "draws": 0,
        "results": [
          "win",
          "win",
          "loss",
          "win",
          "win",
          "loss",
          "loss",
          "win",
          "win",
          "loss",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4101/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 3682,
        "name": "朝乃山",
        "yomi": "あさのやま",
        "rank": "前頭12",
        "side": "west",
        "wins": 7,
        "losses": 4,
        "draws": 0,
        "results": [
          "loss",
          "win",
          "loss",
          "win",
          "win",
          "win",
          "loss",
          "loss",
          "win",
          "win",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3682/",
        "memo": ""
      }
    ]
  },
  {
    "title": "前頭13",
    "east": [
      {
        "id": 3594,
        "name": "翔猿",
        "yomi": "とびざる",
        "rank": "前頭13",
        "side": "east",
        "wins": 4,
        "losses": 7,
        "draws": 0,
        "results": [
          "loss",
          "loss",
          "win",
          "loss",
          "loss",
          "loss",
          "win",
          "loss",
          "win",
          "loss",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3594/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 4093,
        "name": "藤青雲",
        "yomi": "ふじせいうん",
        "rank": "前頭13",
        "side": "west",
        "wins": 8,
        "losses": 3,
        "draws": 0,
        "results": [
          "win",
          "loss",
          "win",
          "win",
          "loss",
          "win",
          "loss",
          "win",
          "win",
          "win",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4093/",
        "memo": ""
      }
    ]
  },
  {
    "title": "前頭14",
    "east": [
      {
        "id": 3207,
        "name": "千代翔馬",
        "yomi": "ちよしょうま",
        "rank": "前頭14",
        "side": "east",
        "wins": 6,
        "losses": 5,
        "draws": 0,
        "results": [
          "loss",
          "win",
          "win",
          "loss",
          "loss",
          "win",
          "win",
          "win",
          "loss",
          "loss",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3207/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 3742,
        "name": "錦富士",
        "yomi": "にしきふじ",
        "rank": "前頭14",
        "side": "west",
        "wins": 5,
        "losses": 6,
        "draws": 0,
        "results": [
          "win",
          "win",
          "loss",
          "win",
          "loss",
          "win",
          "loss",
          "loss",
          "loss",
          "win",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3742/",
        "memo": ""
      }
    ]
  },
  {
    "title": "前頭15",
    "east": [
      {
        "id": 3743,
        "name": "翠富士",
        "yomi": "みどりふじ",
        "rank": "前頭15",
        "side": "east",
        "wins": 0,
        "losses": 0,
        "draws": 12,
        "results": [
          "draw",
          "draw",
          "draw",
          "draw",
          "draw",
          "draw",
          "draw",
          "draw",
          "draw",
          "draw",
          "draw",
          "draw"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3743/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 3620,
        "name": "御嶽海",
        "yomi": "みたけうみ",
        "rank": "前頭15",
        "side": "west",
        "wins": 5,
        "losses": 6,
        "draws": 0,
        "results": [
          "win",
          "win",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "win",
          "win",
          "win",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3620/",
        "memo": ""
      }
    ]
  },
  {
    "title": "前頭16",
    "east": [
      {
        "id": 4175,
        "name": "朝白龍",
        "yomi": "あさはくりゅう",
        "rank": "前頭16",
        "side": "east",
        "wins": 7,
        "losses": 4,
        "draws": 0,
        "results": [
          "loss",
          "win",
          "win",
          "win",
          "win",
          "loss",
          "win",
          "loss",
          "win",
          "win",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4175/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 4112,
        "name": "金峰山",
        "yomi": "きんぼうざん",
        "rank": "前頭16",
        "side": "west",
        "wins": 6,
        "losses": 5,
        "draws": 0,
        "results": [
          "win",
          "loss",
          "win",
          "loss",
          "win",
          "win",
          "loss",
          "loss",
          "loss",
          "win",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4112/",
        "memo": ""
      }
    ]
  },
  {
    "title": "前頭17",
    "east": [
      {
        "id": 4336,
        "name": "藤凌駕",
        "yomi": "ふじりょうが",
        "rank": "前頭17",
        "side": "east",
        "wins": 6,
        "losses": 5,
        "draws": 0,
        "results": [
          "loss",
          "win",
          "win",
          "loss",
          "win",
          "loss",
          "win",
          "win",
          "loss",
          "loss",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4336/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 4120,
        "name": "琴栄峰",
        "yomi": "ことえいほう",
        "rank": "前頭17",
        "side": "west",
        "wins": 7,
        "losses": 4,
        "draws": 0,
        "results": [
          "win",
          "loss",
          "loss",
          "win",
          "win",
          "win",
          "win",
          "win",
          "loss",
          "win",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4120/",
        "memo": ""
      }
    ]
  }
];

export const juryo: RankGroup[] = [
  {
    "title": "十両1",
    "east": [
      {
        "id": 2890,
        "name": "竜電",
        "yomi": "りゅうでん",
        "rank": "十両1",
        "side": "east",
        "wins": 5,
        "losses": 6,
        "draws": 0,
        "results": [
          "loss",
          "loss",
          "win",
          "loss",
          "win",
          "win",
          "loss",
          "loss",
          "loss",
          "win",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2890/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 2565,
        "name": "佐田の海",
        "yomi": "さだのうみ",
        "rank": "十両1",
        "side": "west",
        "wins": 5,
        "losses": 6,
        "draws": 0,
        "results": [
          "win",
          "loss",
          "loss",
          "win",
          "loss",
          "loss",
          "win",
          "win",
          "loss",
          "win",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2565/",
        "memo": ""
      }
    ]
  },
  {
    "title": "十両2",
    "east": [
      {
        "id": 4285,
        "name": "朝翠龍",
        "yomi": "あさすいりゅう",
        "rank": "十両2",
        "side": "east",
        "wins": 5,
        "losses": 6,
        "draws": 0,
        "results": [
          "loss",
          "win",
          "loss",
          "loss",
          "win",
          "loss",
          "win",
          "win",
          "loss",
          "loss",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4285/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 3818,
        "name": "友風",
        "yomi": "ともかぜ",
        "rank": "十両2",
        "side": "west",
        "wins": 4,
        "losses": 7,
        "draws": 0,
        "results": [
          "loss",
          "loss",
          "win",
          "loss",
          "loss",
          "win",
          "loss",
          "loss",
          "win",
          "loss",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3818/",
        "memo": ""
      }
    ]
  },
  {
    "title": "十両3",
    "east": [
      {
        "id": 4116,
        "name": "大青山",
        "yomi": "だいせいざん",
        "rank": "十両3",
        "side": "east",
        "wins": 7,
        "losses": 4,
        "draws": 0,
        "results": [
          "win",
          "loss",
          "loss",
          "win",
          "win",
          "win",
          "win",
          "loss",
          "win",
          "loss",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4116/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 4121,
        "name": "若ノ勝",
        "yomi": "わかのしょう",
        "rank": "十両3",
        "side": "west",
        "wins": 8,
        "losses": 3,
        "draws": 0,
        "results": [
          "win",
          "win",
          "win",
          "win",
          "win",
          "win",
          "win",
          "loss",
          "win",
          "loss",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4121/",
        "memo": ""
      }
    ]
  },
  {
    "title": "十両4",
    "east": [
      {
        "id": 3914,
        "name": "西ノ龍",
        "yomi": "にしのりゅう",
        "rank": "十両4",
        "side": "east",
        "wins": 4,
        "losses": 7,
        "draws": 0,
        "results": [
          "loss",
          "win",
          "loss",
          "win",
          "loss",
          "loss",
          "win",
          "loss",
          "win",
          "loss",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3914/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 4171,
        "name": "尊富士",
        "yomi": "たけるふじ",
        "rank": "十両4",
        "side": "west",
        "wins": 5,
        "losses": 6,
        "draws": 0,
        "results": [
          "loss",
          "win",
          "win",
          "loss",
          "loss",
          "loss",
          "loss",
          "win",
          "loss",
          "win",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4171/",
        "memo": ""
      }
    ]
  },
  {
    "title": "十両5",
    "east": [
      {
        "id": 3255,
        "name": "輝",
        "yomi": "かがやき",
        "rank": "十両5",
        "side": "east",
        "wins": 4,
        "losses": 7,
        "draws": 0,
        "results": [
          "win",
          "loss",
          "win",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "win",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3255/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 4164,
        "name": "白熊",
        "yomi": "しろくま",
        "rank": "十両5",
        "side": "west",
        "wins": 4,
        "losses": 7,
        "draws": 0,
        "results": [
          "win",
          "loss",
          "loss",
          "loss",
          "loss",
          "win",
          "loss",
          "win",
          "win",
          "loss",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4164/",
        "memo": ""
      }
    ]
  },
  {
    "title": "十両6",
    "east": [
      {
        "id": 4095,
        "name": "日翔志",
        "yomi": "ひとし",
        "rank": "十両6",
        "side": "east",
        "wins": 3,
        "losses": 8,
        "draws": 0,
        "results": [
          "loss",
          "win",
          "loss",
          "loss",
          "loss",
          "win",
          "loss",
          "loss",
          "win",
          "loss",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4095/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 4165,
        "name": "嘉陽",
        "yomi": "かよう",
        "rank": "十両6",
        "side": "west",
        "wins": 6,
        "losses": 5,
        "draws": 0,
        "results": [
          "win",
          "loss",
          "loss",
          "win",
          "win",
          "loss",
          "win",
          "win",
          "loss",
          "win",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4165/",
        "memo": ""
      }
    ]
  },
  {
    "title": "十両7",
    "east": [
      {
        "id": 3337,
        "name": "明生",
        "yomi": "めいせい",
        "rank": "十両7",
        "side": "east",
        "wins": 6,
        "losses": 5,
        "draws": 0,
        "results": [
          "loss",
          "loss",
          "loss",
          "win",
          "win",
          "win",
          "loss",
          "win",
          "win",
          "loss",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3337/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 4232,
        "name": "旭海雄",
        "yomi": "きょくかいゆう",
        "rank": "十両7",
        "side": "west",
        "wins": 7,
        "losses": 4,
        "draws": 0,
        "results": [
          "win",
          "win",
          "win",
          "win",
          "loss",
          "loss",
          "win",
          "win",
          "loss",
          "win",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4232/",
        "memo": ""
      }
    ]
  },
  {
    "title": "十両8",
    "east": [
      {
        "id": 3553,
        "name": "湘南乃海",
        "yomi": "しょうなんのうみ",
        "rank": "十両8",
        "side": "east",
        "wins": 7,
        "losses": 4,
        "draws": 0,
        "results": [
          "loss",
          "win",
          "win",
          "loss",
          "win",
          "loss",
          "win",
          "win",
          "win",
          "loss",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3553/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 3939,
        "name": "北の若",
        "yomi": "きたのわか",
        "rank": "十両8",
        "side": "west",
        "wins": 7,
        "losses": 4,
        "draws": 0,
        "results": [
          "loss",
          "win",
          "win",
          "win",
          "win",
          "win",
          "loss",
          "win",
          "loss",
          "loss",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3939/",
        "memo": ""
      }
    ]
  },
  {
    "title": "十両9",
    "east": [
      {
        "id": 3367,
        "name": "玉正鳳",
        "yomi": "たましょうほう",
        "rank": "十両9",
        "side": "east",
        "wins": 3,
        "losses": 8,
        "draws": 0,
        "results": [
          "win",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "win",
          "win",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3367/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 4124,
        "name": "羽出山",
        "yomi": "はつやま",
        "rank": "十両9",
        "side": "west",
        "wins": 6,
        "losses": 5,
        "draws": 0,
        "results": [
          "win",
          "loss",
          "win",
          "loss",
          "win",
          "win",
          "win",
          "loss",
          "loss",
          "win",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4124/",
        "memo": ""
      }
    ]
  },
  {
    "title": "十両10",
    "east": [
      {
        "id": 3983,
        "name": "出羽ノ龍",
        "yomi": "でわのりゅう",
        "rank": "十両10",
        "side": "east",
        "wins": 9,
        "losses": 2,
        "draws": 0,
        "results": [
          "loss",
          "win",
          "loss",
          "win",
          "win",
          "win",
          "win",
          "win",
          "win",
          "win",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3983/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 3969,
        "name": "東白龍",
        "yomi": "とうはくりゅう",
        "rank": "十両10",
        "side": "west",
        "wins": 6,
        "losses": 5,
        "draws": 0,
        "results": [
          "loss",
          "loss",
          "win",
          "win",
          "loss",
          "win",
          "win",
          "loss",
          "win",
          "loss",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3969/",
        "memo": ""
      }
    ]
  },
  {
    "title": "十両11",
    "east": [
      {
        "id": 4287,
        "name": "一意",
        "yomi": "かずま",
        "rank": "十両11",
        "side": "east",
        "wins": 9,
        "losses": 2,
        "draws": 0,
        "results": [
          "win",
          "win",
          "win",
          "win",
          "win",
          "loss",
          "win",
          "win",
          "win",
          "win",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4287/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 4243,
        "name": "寿之富士",
        "yomi": "としのふじ",
        "rank": "十両11",
        "side": "west",
        "wins": 8,
        "losses": 3,
        "draws": 0,
        "results": [
          "win",
          "win",
          "win",
          "loss",
          "loss",
          "win",
          "loss",
          "win",
          "win",
          "win",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4243/",
        "memo": ""
      }
    ]
  },
  {
    "title": "十両12",
    "east": [
      {
        "id": 2892,
        "name": "錦木",
        "yomi": "にしきぎ",
        "rank": "十両12",
        "side": "east",
        "wins": 4,
        "losses": 7,
        "draws": 0,
        "results": [
          "loss",
          "loss",
          "loss",
          "win",
          "win",
          "loss",
          "loss",
          "loss",
          "win",
          "loss",
          "win"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2892/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 3504,
        "name": "剣翔",
        "yomi": "つるぎしょう",
        "rank": "十両12",
        "side": "west",
        "wins": 0,
        "losses": 11,
        "draws": 0,
        "results": [
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3504/",
        "memo": ""
      }
    ]
  },
  {
    "title": "十両13",
    "east": [
      {
        "id": 3404,
        "name": "島津海",
        "yomi": "しまづうみ",
        "rank": "十両13",
        "side": "east",
        "wins": 2,
        "losses": 9,
        "draws": 1,
        "results": [
          "win",
          "win",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "draw"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3404/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 4337,
        "name": "藤天晴",
        "yomi": "ふじてんせい",
        "rank": "十両13",
        "side": "west",
        "wins": 4,
        "losses": 7,
        "draws": 0,
        "results": [
          "win",
          "win",
          "win",
          "win",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4337/",
        "memo": ""
      }
    ]
  },
  {
    "title": "十両14",
    "east": [
      {
        "id": 4158,
        "name": "風賢央",
        "yomi": "かぜけんおう",
        "rank": "十両14",
        "side": "east",
        "wins": 8,
        "losses": 3,
        "draws": 0,
        "results": [
          "loss",
          "win",
          "win",
          "win",
          "win",
          "win",
          "win",
          "win",
          "loss",
          "win",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4158/",
        "memo": ""
      }
    ],
    "west": [
      {
        "id": 3218,
        "name": "荒篤山",
        "yomi": "こうとくざん",
        "rank": "十両14",
        "side": "west",
        "wins": 3,
        "losses": 8,
        "draws": 0,
        "results": [
          "loss",
          "loss",
          "loss",
          "loss",
          "win",
          "win",
          "loss",
          "loss",
          "loss",
          "win",
          "loss"
        ],
        "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3218/",
        "memo": ""
      }
    ]
  }
];
