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

export const torikumiData: TorikumiDataSet = {
  "bashoName": "七月場所",
  "year": "令和八年",
  "updatedAt": "2026-07-07T20:59:06+09:00",
  "resultUpdatedAt": "2026-06-29T16:26:01+09:00",
  "scheduleUpdatedAt": "2026-07-07T20:59:06+09:00",
  "today": null,
  "tomorrow": {
    "makuuchi": {
      "day": 1,
      "dayName": "取組日 初日",
      "dayHead": "初日： 令和8年7月12日(日)",
      "division": "幕内",
      "matches": [],
      "absentees": [
        {
          "id": 4227,
          "name": "大の里",
          "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4227/"
        },
        {
          "id": 4230,
          "name": "安青錦",
          "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4230/"
        }
      ]
    },
    "juryo": {
      "day": 1,
      "dayName": "取組日 初日",
      "dayHead": "初日： 令和8年7月12日(日)",
      "division": "十両",
      "matches": [],
      "absentees": [
        {
          "id": 4267,
          "name": "嵐富士",
          "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4267/"
        }
      ]
    }
  },
  "resultDays": [
    {
      "day": 1,
      "isoDate": "2026-07-12",
      "pathDate": "20260712",
      "label": "初日",
      "dayHead": "初日： 令和8年7月12日(日)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 1,
          "dayName": "取組日 初日",
          "dayHead": "初日： 令和8年7月12日(日)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 1,
          "dayName": "取組日 初日",
          "dayHead": "初日： 令和8年7月12日(日)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 2,
      "isoDate": "2026-07-13",
      "pathDate": "20260713",
      "label": "二日目",
      "dayHead": "二日目： 令和8年7月13日(月)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 2,
          "dayName": "取組日 二日目",
          "dayHead": "二日目： 令和8年7月13日(月)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 2,
          "dayName": "取組日 二日目",
          "dayHead": "二日目： 令和8年7月13日(月)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 3,
      "isoDate": "2026-07-14",
      "pathDate": "20260714",
      "label": "三日目",
      "dayHead": "三日目： 令和8年7月14日(火)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 3,
          "dayName": "取組日 三日目",
          "dayHead": "三日目： 令和8年7月14日(火)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 3,
          "dayName": "取組日 三日目",
          "dayHead": "三日目： 令和8年7月14日(火)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 4,
      "isoDate": "2026-07-15",
      "pathDate": "20260715",
      "label": "四日目",
      "dayHead": "四日目： 令和8年7月15日(水)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 4,
          "dayName": "取組日 四日目",
          "dayHead": "四日目： 令和8年7月15日(水)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 4,
          "dayName": "取組日 四日目",
          "dayHead": "四日目： 令和8年7月15日(水)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 5,
      "isoDate": "2026-07-16",
      "pathDate": "20260716",
      "label": "五日目",
      "dayHead": "五日目： 令和8年7月16日(木)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 5,
          "dayName": "取組日 五日目",
          "dayHead": "五日目： 令和8年7月16日(木)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 5,
          "dayName": "取組日 五日目",
          "dayHead": "五日目： 令和8年7月16日(木)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 6,
      "isoDate": "2026-07-17",
      "pathDate": "20260717",
      "label": "六日目",
      "dayHead": "六日目： 令和8年7月17日(金)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 6,
          "dayName": "取組日 六日目",
          "dayHead": "六日目： 令和8年7月17日(金)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 6,
          "dayName": "取組日 六日目",
          "dayHead": "六日目： 令和8年7月17日(金)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 7,
      "isoDate": "2026-07-18",
      "pathDate": "20260718",
      "label": "七日目",
      "dayHead": "七日目： 令和8年7月18日(土)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 7,
          "dayName": "取組日 七日目",
          "dayHead": "七日目： 令和8年7月18日(土)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 7,
          "dayName": "取組日 七日目",
          "dayHead": "七日目： 令和8年7月18日(土)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 8,
      "isoDate": "2026-07-19",
      "pathDate": "20260719",
      "label": "中日",
      "dayHead": "中日： 令和8年7月19日(日)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 8,
          "dayName": "取組日 中日",
          "dayHead": "中日： 令和8年7月19日(日)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 8,
          "dayName": "取組日 中日",
          "dayHead": "中日： 令和8年7月19日(日)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 9,
      "isoDate": "2026-07-20",
      "pathDate": "20260720",
      "label": "九日目",
      "dayHead": "九日目： 令和8年7月20日(月)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 9,
          "dayName": "取組日 九日目",
          "dayHead": "九日目： 令和8年7月20日(月)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 9,
          "dayName": "取組日 九日目",
          "dayHead": "九日目： 令和8年7月20日(月)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 10,
      "isoDate": "2026-07-21",
      "pathDate": "20260721",
      "label": "十日目",
      "dayHead": "十日目： 令和8年7月21日(火)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 10,
          "dayName": "取組日 十日目",
          "dayHead": "十日目： 令和8年7月21日(火)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 10,
          "dayName": "取組日 十日目",
          "dayHead": "十日目： 令和8年7月21日(火)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 11,
      "isoDate": "2026-07-22",
      "pathDate": "20260722",
      "label": "十一日目",
      "dayHead": "十一日目： 令和8年7月22日(水)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 11,
          "dayName": "取組日 十一日目",
          "dayHead": "十一日目： 令和8年7月22日(水)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 11,
          "dayName": "取組日 十一日目",
          "dayHead": "十一日目： 令和8年7月22日(水)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 12,
      "isoDate": "2026-07-23",
      "pathDate": "20260723",
      "label": "十二日目",
      "dayHead": "十二日目： 令和8年7月23日(木)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 12,
          "dayName": "取組日 十二日目",
          "dayHead": "十二日目： 令和8年7月23日(木)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 12,
          "dayName": "取組日 十二日目",
          "dayHead": "十二日目： 令和8年7月23日(木)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 13,
      "isoDate": "2026-07-24",
      "pathDate": "20260724",
      "label": "十三日目",
      "dayHead": "十三日目： 令和8年7月24日(金)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 13,
          "dayName": "取組日 十三日目",
          "dayHead": "十三日目： 令和8年7月24日(金)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 13,
          "dayName": "取組日 十三日目",
          "dayHead": "十三日目： 令和8年7月24日(金)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 14,
      "isoDate": "2026-07-25",
      "pathDate": "20260725",
      "label": "十四日目",
      "dayHead": "十四日目： 令和8年7月25日(土)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 14,
          "dayName": "取組日 十四日目",
          "dayHead": "十四日目： 令和8年7月25日(土)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 14,
          "dayName": "取組日 十四日目",
          "dayHead": "十四日目： 令和8年7月25日(土)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 15,
      "isoDate": "2026-07-26",
      "pathDate": "20260726",
      "label": "千秋楽",
      "dayHead": "千秋楽： 令和8年7月26日(日)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 15,
          "dayName": "取組日 千秋楽",
          "dayHead": "千秋楽： 令和8年7月26日(日)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 15,
          "dayName": "取組日 千秋楽",
          "dayHead": "千秋楽： 令和8年7月26日(日)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    }
  ],
  "scheduleDays": [
    {
      "day": 1,
      "isoDate": "2026-07-12",
      "pathDate": "20260712",
      "label": "初日",
      "dayHead": "初日： 令和8年7月12日(日)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 1,
          "dayName": "取組日 初日",
          "dayHead": "初日： 令和8年7月12日(日)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 4227,
              "name": "大の里",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4227/"
            },
            {
              "id": 4230,
              "name": "安青錦",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4230/"
            }
          ]
        },
        "juryo": {
          "day": 1,
          "dayName": "取組日 初日",
          "dayHead": "初日： 令和8年7月12日(日)",
          "division": "十両",
          "matches": [],
          "absentees": [
            {
              "id": 4267,
              "name": "嵐富士",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4267/"
            }
          ]
        }
      }
    },
    {
      "day": 2,
      "isoDate": "2026-07-13",
      "pathDate": "20260713",
      "label": "二日目",
      "dayHead": "二日目： 令和8年7月13日(月)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 2,
          "dayName": "取組日 二日目",
          "dayHead": "二日目： 令和8年7月13日(月)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 4227,
              "name": "大の里",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4227/"
            },
            {
              "id": 4230,
              "name": "安青錦",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4230/"
            }
          ]
        },
        "juryo": {
          "day": 2,
          "dayName": "取組日 二日目",
          "dayHead": "二日目： 令和8年7月13日(月)",
          "division": "十両",
          "matches": [],
          "absentees": [
            {
              "id": 4267,
              "name": "嵐富士",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4267/"
            }
          ]
        }
      }
    },
    {
      "day": 3,
      "isoDate": "2026-07-14",
      "pathDate": "20260714",
      "label": "三日目",
      "dayHead": "三日目： 令和8年7月14日(火)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 3,
          "dayName": "取組日 三日目",
          "dayHead": "三日目： 令和8年7月14日(火)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 4227,
              "name": "大の里",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4227/"
            },
            {
              "id": 4230,
              "name": "安青錦",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4230/"
            }
          ]
        },
        "juryo": {
          "day": 3,
          "dayName": "取組日 三日目",
          "dayHead": "三日目： 令和8年7月14日(火)",
          "division": "十両",
          "matches": [],
          "absentees": [
            {
              "id": 4267,
              "name": "嵐富士",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4267/"
            }
          ]
        }
      }
    },
    {
      "day": 4,
      "isoDate": "2026-07-15",
      "pathDate": "20260715",
      "label": "四日目",
      "dayHead": "四日目： 令和8年7月15日(水)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 4,
          "dayName": "取組日 四日目",
          "dayHead": "四日目： 令和8年7月15日(水)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 4227,
              "name": "大の里",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4227/"
            },
            {
              "id": 4230,
              "name": "安青錦",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4230/"
            }
          ]
        },
        "juryo": {
          "day": 4,
          "dayName": "取組日 四日目",
          "dayHead": "四日目： 令和8年7月15日(水)",
          "division": "十両",
          "matches": [],
          "absentees": [
            {
              "id": 4267,
              "name": "嵐富士",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4267/"
            }
          ]
        }
      }
    },
    {
      "day": 5,
      "isoDate": "2026-07-16",
      "pathDate": "20260716",
      "label": "五日目",
      "dayHead": "五日目： 令和8年7月16日(木)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 5,
          "dayName": "取組日 五日目",
          "dayHead": "五日目： 令和8年7月16日(木)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 4227,
              "name": "大の里",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4227/"
            },
            {
              "id": 4230,
              "name": "安青錦",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4230/"
            }
          ]
        },
        "juryo": {
          "day": 5,
          "dayName": "取組日 五日目",
          "dayHead": "五日目： 令和8年7月16日(木)",
          "division": "十両",
          "matches": [],
          "absentees": [
            {
              "id": 4267,
              "name": "嵐富士",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4267/"
            }
          ]
        }
      }
    },
    {
      "day": 6,
      "isoDate": "2026-07-17",
      "pathDate": "20260717",
      "label": "六日目",
      "dayHead": "六日目： 令和8年7月17日(金)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 6,
          "dayName": "取組日 六日目",
          "dayHead": "六日目： 令和8年7月17日(金)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 4227,
              "name": "大の里",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4227/"
            },
            {
              "id": 4230,
              "name": "安青錦",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4230/"
            }
          ]
        },
        "juryo": {
          "day": 6,
          "dayName": "取組日 六日目",
          "dayHead": "六日目： 令和8年7月17日(金)",
          "division": "十両",
          "matches": [],
          "absentees": [
            {
              "id": 4267,
              "name": "嵐富士",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4267/"
            }
          ]
        }
      }
    },
    {
      "day": 7,
      "isoDate": "2026-07-18",
      "pathDate": "20260718",
      "label": "七日目",
      "dayHead": "七日目： 令和8年7月18日(土)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 7,
          "dayName": "取組日 七日目",
          "dayHead": "七日目： 令和8年7月18日(土)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 4227,
              "name": "大の里",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4227/"
            },
            {
              "id": 4230,
              "name": "安青錦",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4230/"
            }
          ]
        },
        "juryo": {
          "day": 7,
          "dayName": "取組日 七日目",
          "dayHead": "七日目： 令和8年7月18日(土)",
          "division": "十両",
          "matches": [],
          "absentees": [
            {
              "id": 4267,
              "name": "嵐富士",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4267/"
            }
          ]
        }
      }
    },
    {
      "day": 8,
      "isoDate": "2026-07-19",
      "pathDate": "20260719",
      "label": "中日",
      "dayHead": "中日： 令和8年7月19日(日)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 8,
          "dayName": "取組日 中日",
          "dayHead": "中日： 令和8年7月19日(日)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 4227,
              "name": "大の里",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4227/"
            },
            {
              "id": 4230,
              "name": "安青錦",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4230/"
            }
          ]
        },
        "juryo": {
          "day": 8,
          "dayName": "取組日 中日",
          "dayHead": "中日： 令和8年7月19日(日)",
          "division": "十両",
          "matches": [],
          "absentees": [
            {
              "id": 4267,
              "name": "嵐富士",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4267/"
            }
          ]
        }
      }
    },
    {
      "day": 9,
      "isoDate": "2026-07-20",
      "pathDate": "20260720",
      "label": "九日目",
      "dayHead": "九日目： 令和8年7月20日(月)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 9,
          "dayName": "取組日 九日目",
          "dayHead": "九日目： 令和8年7月20日(月)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 4227,
              "name": "大の里",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4227/"
            },
            {
              "id": 4230,
              "name": "安青錦",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4230/"
            }
          ]
        },
        "juryo": {
          "day": 9,
          "dayName": "取組日 九日目",
          "dayHead": "九日目： 令和8年7月20日(月)",
          "division": "十両",
          "matches": [],
          "absentees": [
            {
              "id": 4267,
              "name": "嵐富士",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4267/"
            }
          ]
        }
      }
    },
    {
      "day": 10,
      "isoDate": "2026-07-21",
      "pathDate": "20260721",
      "label": "十日目",
      "dayHead": "十日目： 令和8年7月21日(火)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 10,
          "dayName": "取組日 十日目",
          "dayHead": "十日目： 令和8年7月21日(火)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 4227,
              "name": "大の里",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4227/"
            },
            {
              "id": 4230,
              "name": "安青錦",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4230/"
            }
          ]
        },
        "juryo": {
          "day": 10,
          "dayName": "取組日 十日目",
          "dayHead": "十日目： 令和8年7月21日(火)",
          "division": "十両",
          "matches": [],
          "absentees": [
            {
              "id": 4267,
              "name": "嵐富士",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4267/"
            }
          ]
        }
      }
    },
    {
      "day": 11,
      "isoDate": "2026-07-22",
      "pathDate": "20260722",
      "label": "十一日目",
      "dayHead": "十一日目： 令和8年7月22日(水)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 11,
          "dayName": "取組日 十一日目",
          "dayHead": "十一日目： 令和8年7月22日(水)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 4227,
              "name": "大の里",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4227/"
            },
            {
              "id": 4230,
              "name": "安青錦",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4230/"
            }
          ]
        },
        "juryo": {
          "day": 11,
          "dayName": "取組日 十一日目",
          "dayHead": "十一日目： 令和8年7月22日(水)",
          "division": "十両",
          "matches": [],
          "absentees": [
            {
              "id": 4267,
              "name": "嵐富士",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4267/"
            }
          ]
        }
      }
    },
    {
      "day": 12,
      "isoDate": "2026-07-23",
      "pathDate": "20260723",
      "label": "十二日目",
      "dayHead": "十二日目： 令和8年7月23日(木)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 12,
          "dayName": "取組日 十二日目",
          "dayHead": "十二日目： 令和8年7月23日(木)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 4227,
              "name": "大の里",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4227/"
            },
            {
              "id": 4230,
              "name": "安青錦",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4230/"
            }
          ]
        },
        "juryo": {
          "day": 12,
          "dayName": "取組日 十二日目",
          "dayHead": "十二日目： 令和8年7月23日(木)",
          "division": "十両",
          "matches": [],
          "absentees": [
            {
              "id": 4267,
              "name": "嵐富士",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4267/"
            }
          ]
        }
      }
    },
    {
      "day": 13,
      "isoDate": "2026-07-24",
      "pathDate": "20260724",
      "label": "十三日目",
      "dayHead": "十三日目： 令和8年7月24日(金)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 13,
          "dayName": "取組日 十三日目",
          "dayHead": "十三日目： 令和8年7月24日(金)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 4227,
              "name": "大の里",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4227/"
            },
            {
              "id": 4230,
              "name": "安青錦",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4230/"
            }
          ]
        },
        "juryo": {
          "day": 13,
          "dayName": "取組日 十三日目",
          "dayHead": "十三日目： 令和8年7月24日(金)",
          "division": "十両",
          "matches": [],
          "absentees": [
            {
              "id": 4267,
              "name": "嵐富士",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4267/"
            }
          ]
        }
      }
    },
    {
      "day": 14,
      "isoDate": "2026-07-25",
      "pathDate": "20260725",
      "label": "十四日目",
      "dayHead": "十四日目： 令和8年7月25日(土)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 14,
          "dayName": "取組日 十四日目",
          "dayHead": "十四日目： 令和8年7月25日(土)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 4227,
              "name": "大の里",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4227/"
            },
            {
              "id": 4230,
              "name": "安青錦",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4230/"
            }
          ]
        },
        "juryo": {
          "day": 14,
          "dayName": "取組日 十四日目",
          "dayHead": "十四日目： 令和8年7月25日(土)",
          "division": "十両",
          "matches": [],
          "absentees": [
            {
              "id": 4267,
              "name": "嵐富士",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4267/"
            }
          ]
        }
      }
    },
    {
      "day": 15,
      "isoDate": "2026-07-26",
      "pathDate": "20260726",
      "label": "千秋楽",
      "dayHead": "千秋楽： 令和8年7月26日(日)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 15,
          "dayName": "取組日 千秋楽",
          "dayHead": "千秋楽： 令和8年7月26日(日)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 4227,
              "name": "大の里",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4227/"
            },
            {
              "id": 4230,
              "name": "安青錦",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4230/"
            }
          ]
        },
        "juryo": {
          "day": 15,
          "dayName": "取組日 千秋楽",
          "dayHead": "千秋楽： 令和8年7月26日(日)",
          "division": "十両",
          "matches": [],
          "absentees": [
            {
              "id": 4267,
              "name": "嵐富士",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4267/"
            }
          ]
        }
      }
    }
  ]
};

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

export const banzukePath = `/${torikumiMonthKey}-banduke`;
