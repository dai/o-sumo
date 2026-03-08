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
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "大の里",
        "yomi": "おおのさと",
        "rank": "横綱",
        "side": "west"
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
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "琴櫻",
        "yomi": "ことざくら",
        "rank": "大関",
        "side": "west"
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
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "高安",
        "yomi": "たかやす",
        "rank": "関脇",
        "side": "west"
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
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "熱海富士",
        "yomi": "あたみふじ",
        "rank": "小結",
        "side": "west"
      }
    ]
  },
  {
    "title": "前頭1",
    "east": [
      {
        "name": "東前頭1",
        "yomi": "ひがし",
        "rank": "前頭1",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西前頭1",
        "yomi": "にし",
        "rank": "前頭1",
        "side": "west"
      }
    ]
  },
  {
    "title": "前頭2",
    "east": [
      {
        "name": "東前頭2",
        "yomi": "ひがし",
        "rank": "前頭2",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西前頭2",
        "yomi": "にし",
        "rank": "前頭2",
        "side": "west"
      }
    ]
  },
  {
    "title": "前頭3",
    "east": [
      {
        "name": "東前頭3",
        "yomi": "ひがし",
        "rank": "前頭3",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西前頭3",
        "yomi": "にし",
        "rank": "前頭3",
        "side": "west"
      }
    ]
  },
  {
    "title": "前頭4",
    "east": [
      {
        "name": "東前頭4",
        "yomi": "ひがし",
        "rank": "前頭4",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西前頭4",
        "yomi": "にし",
        "rank": "前頭4",
        "side": "west"
      }
    ]
  },
  {
    "title": "前頭5",
    "east": [
      {
        "name": "東前頭5",
        "yomi": "ひがし",
        "rank": "前頭5",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西前頭5",
        "yomi": "にし",
        "rank": "前頭5",
        "side": "west"
      }
    ]
  },
  {
    "title": "前頭6",
    "east": [
      {
        "name": "東前頭6",
        "yomi": "ひがし",
        "rank": "前頭6",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西前頭6",
        "yomi": "にし",
        "rank": "前頭6",
        "side": "west"
      }
    ]
  },
  {
    "title": "前頭7",
    "east": [
      {
        "name": "東前頭7",
        "yomi": "ひがし",
        "rank": "前頭7",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西前頭7",
        "yomi": "にし",
        "rank": "前頭7",
        "side": "west"
      }
    ]
  },
  {
    "title": "前頭8",
    "east": [
      {
        "name": "東前頭8",
        "yomi": "ひがし",
        "rank": "前頭8",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西前頭8",
        "yomi": "にし",
        "rank": "前頭8",
        "side": "west"
      }
    ]
  },
  {
    "title": "前頭9",
    "east": [
      {
        "name": "東前頭9",
        "yomi": "ひがし",
        "rank": "前頭9",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西前頭9",
        "yomi": "にし",
        "rank": "前頭9",
        "side": "west"
      }
    ]
  },
  {
    "title": "前頭10",
    "east": [
      {
        "name": "東前頭10",
        "yomi": "ひがし",
        "rank": "前頭10",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西前頭10",
        "yomi": "にし",
        "rank": "前頭10",
        "side": "west"
      }
    ]
  },
  {
    "title": "前頭11",
    "east": [
      {
        "name": "東前頭11",
        "yomi": "ひがし",
        "rank": "前頭11",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西前頭11",
        "yomi": "にし",
        "rank": "前頭11",
        "side": "west"
      }
    ]
  },
  {
    "title": "前頭12",
    "east": [
      {
        "name": "東前頭12",
        "yomi": "ひがし",
        "rank": "前頭12",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西前頭12",
        "yomi": "にし",
        "rank": "前頭12",
        "side": "west"
      }
    ]
  },
  {
    "title": "前頭13",
    "east": [
      {
        "name": "東前頭13",
        "yomi": "ひがし",
        "rank": "前頭13",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西前頭13",
        "yomi": "にし",
        "rank": "前頭13",
        "side": "west"
      }
    ]
  },
  {
    "title": "前頭14",
    "east": [
      {
        "name": "東前頭14",
        "yomi": "ひがし",
        "rank": "前頭14",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西前頭14",
        "yomi": "にし",
        "rank": "前頭14",
        "side": "west"
      }
    ]
  },
  {
    "title": "前頭15",
    "east": [
      {
        "name": "東前頭15",
        "yomi": "ひがし",
        "rank": "前頭15",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西前頭15",
        "yomi": "にし",
        "rank": "前頭15",
        "side": "west"
      }
    ]
  },
  {
    "title": "前頭16",
    "east": [
      {
        "name": "東前頭16",
        "yomi": "ひがし",
        "rank": "前頭16",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西前頭16",
        "yomi": "にし",
        "rank": "前頭16",
        "side": "west"
      }
    ]
  },
  {
    "title": "前頭17",
    "east": [
      {
        "name": "東前頭17",
        "yomi": "ひがし",
        "rank": "前頭17",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西前頭17",
        "yomi": "にし",
        "rank": "前頭17",
        "side": "west"
      }
    ]
  }
];

export const juryo: RankGroup[] = [
  {
    "title": "十両1",
    "east": [
      {
        "name": "東十両1",
        "yomi": "ひがし",
        "rank": "十両1",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西十両1",
        "yomi": "にし",
        "rank": "十両1",
        "side": "west"
      }
    ]
  },
  {
    "title": "十両2",
    "east": [
      {
        "name": "東十両2",
        "yomi": "ひがし",
        "rank": "十両2",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西十両2",
        "yomi": "にし",
        "rank": "十両2",
        "side": "west"
      }
    ]
  },
  {
    "title": "十両3",
    "east": [
      {
        "name": "東十両3",
        "yomi": "ひがし",
        "rank": "十両3",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西十両3",
        "yomi": "にし",
        "rank": "十両3",
        "side": "west"
      }
    ]
  },
  {
    "title": "十両4",
    "east": [
      {
        "name": "東十両4",
        "yomi": "ひがし",
        "rank": "十両4",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西十両4",
        "yomi": "にし",
        "rank": "十両4",
        "side": "west"
      }
    ]
  },
  {
    "title": "十両5",
    "east": [
      {
        "name": "東十両5",
        "yomi": "ひがし",
        "rank": "十両5",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西十両5",
        "yomi": "にし",
        "rank": "十両5",
        "side": "west"
      }
    ]
  },
  {
    "title": "十両6",
    "east": [
      {
        "name": "東十両6",
        "yomi": "ひがし",
        "rank": "十両6",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西十両6",
        "yomi": "にし",
        "rank": "十両6",
        "side": "west"
      }
    ]
  },
  {
    "title": "十両7",
    "east": [
      {
        "name": "東十両7",
        "yomi": "ひがし",
        "rank": "十両7",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西十両7",
        "yomi": "にし",
        "rank": "十両7",
        "side": "west"
      }
    ]
  },
  {
    "title": "十両8",
    "east": [
      {
        "name": "東十両8",
        "yomi": "ひがし",
        "rank": "十両8",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西十両8",
        "yomi": "にし",
        "rank": "十両8",
        "side": "west"
      }
    ]
  },
  {
    "title": "十両9",
    "east": [
      {
        "name": "東十両9",
        "yomi": "ひがし",
        "rank": "十両9",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西十両9",
        "yomi": "にし",
        "rank": "十両9",
        "side": "west"
      }
    ]
  },
  {
    "title": "十両10",
    "east": [
      {
        "name": "東十両10",
        "yomi": "ひがし",
        "rank": "十両10",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西十両10",
        "yomi": "にし",
        "rank": "十両10",
        "side": "west"
      }
    ]
  },
  {
    "title": "十両11",
    "east": [
      {
        "name": "東十両11",
        "yomi": "ひがし",
        "rank": "十両11",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西十両11",
        "yomi": "にし",
        "rank": "十両11",
        "side": "west"
      }
    ]
  },
  {
    "title": "十両12",
    "east": [
      {
        "name": "東十両12",
        "yomi": "ひがし",
        "rank": "十両12",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西十両12",
        "yomi": "にし",
        "rank": "十両12",
        "side": "west"
      }
    ]
  },
  {
    "title": "十両13",
    "east": [
      {
        "name": "東十両13",
        "yomi": "ひがし",
        "rank": "十両13",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西十両13",
        "yomi": "にし",
        "rank": "十両13",
        "side": "west"
      }
    ]
  },
  {
    "title": "十両14",
    "east": [
      {
        "name": "東十両14",
        "yomi": "ひがし",
        "rank": "十両14",
        "side": "east"
      }
    ],
    "west": [
      {
        "name": "西十両14",
        "yomi": "にし",
        "rank": "十両14",
        "side": "west"
      }
    ]
  }
];
