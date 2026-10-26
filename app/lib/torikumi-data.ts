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
  isPlayoff?: true;
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

export const torikumiData: TorikumiDataSet = {
  "bashoId": 638,
  "bashoName": "十一月場所",
  "year": "令和八年",
  "updatedAt": "2026-10-26T15:16:49+09:00",
  "resultUpdatedAt": "2026-10-26T15:16:49+09:00",
  "scheduleUpdatedAt": "2026-10-26T15:16:49+09:00",
  "today": null,
  "tomorrow": null,
  "resultDays": [
    {
      "day": 1,
      "isoDate": "2026-11-08",
      "pathDate": "20261108",
      "label": "初日",
      "dayHead": "初日： 令和8年11月8日(日)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 1,
          "dayName": "取組日 初日",
          "dayHead": "初日： 令和8年11月8日(日)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 1,
          "dayName": "取組日 初日",
          "dayHead": "初日： 令和8年11月8日(日)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 2,
      "isoDate": "2026-11-09",
      "pathDate": "20261109",
      "label": "二日目",
      "dayHead": "二日目： 令和8年11月9日(月)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 2,
          "dayName": "取組日 二日目",
          "dayHead": "二日目： 令和8年11月9日(月)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 2,
          "dayName": "取組日 二日目",
          "dayHead": "二日目： 令和8年11月9日(月)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 3,
      "isoDate": "2026-11-10",
      "pathDate": "20261110",
      "label": "三日目",
      "dayHead": "三日目： 令和8年11月10日(火)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 3,
          "dayName": "取組日 三日目",
          "dayHead": "三日目： 令和8年11月10日(火)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 3,
          "dayName": "取組日 三日目",
          "dayHead": "三日目： 令和8年11月10日(火)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 4,
      "isoDate": "2026-11-11",
      "pathDate": "20261111",
      "label": "四日目",
      "dayHead": "四日目： 令和8年11月11日(水)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 4,
          "dayName": "取組日 四日目",
          "dayHead": "四日目： 令和8年11月11日(水)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 4,
          "dayName": "取組日 四日目",
          "dayHead": "四日目： 令和8年11月11日(水)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 5,
      "isoDate": "2026-11-12",
      "pathDate": "20261112",
      "label": "五日目",
      "dayHead": "五日目： 令和8年11月12日(木)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 5,
          "dayName": "取組日 五日目",
          "dayHead": "五日目： 令和8年11月12日(木)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 5,
          "dayName": "取組日 五日目",
          "dayHead": "五日目： 令和8年11月12日(木)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 6,
      "isoDate": "2026-11-13",
      "pathDate": "20261113",
      "label": "六日目",
      "dayHead": "六日目： 令和8年11月13日(金)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 6,
          "dayName": "取組日 六日目",
          "dayHead": "六日目： 令和8年11月13日(金)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 6,
          "dayName": "取組日 六日目",
          "dayHead": "六日目： 令和8年11月13日(金)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 7,
      "isoDate": "2026-11-14",
      "pathDate": "20261114",
      "label": "七日目",
      "dayHead": "七日目： 令和8年11月14日(土)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 7,
          "dayName": "取組日 七日目",
          "dayHead": "七日目： 令和8年11月14日(土)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 7,
          "dayName": "取組日 七日目",
          "dayHead": "七日目： 令和8年11月14日(土)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 8,
      "isoDate": "2026-11-15",
      "pathDate": "20261115",
      "label": "中日",
      "dayHead": "中日： 令和8年11月15日(日)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 8,
          "dayName": "取組日 中日",
          "dayHead": "中日： 令和8年11月15日(日)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 8,
          "dayName": "取組日 中日",
          "dayHead": "中日： 令和8年11月15日(日)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 9,
      "isoDate": "2026-11-16",
      "pathDate": "20261116",
      "label": "九日目",
      "dayHead": "九日目： 令和8年11月16日(月)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 9,
          "dayName": "取組日 九日目",
          "dayHead": "九日目： 令和8年11月16日(月)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 9,
          "dayName": "取組日 九日目",
          "dayHead": "九日目： 令和8年11月16日(月)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 10,
      "isoDate": "2026-11-17",
      "pathDate": "20261117",
      "label": "十日目",
      "dayHead": "十日目： 令和8年11月17日(火)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 10,
          "dayName": "取組日 十日目",
          "dayHead": "十日目： 令和8年11月17日(火)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 10,
          "dayName": "取組日 十日目",
          "dayHead": "十日目： 令和8年11月17日(火)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 11,
      "isoDate": "2026-11-18",
      "pathDate": "20261118",
      "label": "十一日目",
      "dayHead": "十一日目： 令和8年11月18日(水)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 11,
          "dayName": "取組日 十一日目",
          "dayHead": "十一日目： 令和8年11月18日(水)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 11,
          "dayName": "取組日 十一日目",
          "dayHead": "十一日目： 令和8年11月18日(水)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 12,
      "isoDate": "2026-11-19",
      "pathDate": "20261119",
      "label": "十二日目",
      "dayHead": "十二日目： 令和8年11月19日(木)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 12,
          "dayName": "取組日 十二日目",
          "dayHead": "十二日目： 令和8年11月19日(木)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 12,
          "dayName": "取組日 十二日目",
          "dayHead": "十二日目： 令和8年11月19日(木)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 13,
      "isoDate": "2026-11-20",
      "pathDate": "20261120",
      "label": "十三日目",
      "dayHead": "十三日目： 令和8年11月20日(金)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 13,
          "dayName": "取組日 十三日目",
          "dayHead": "十三日目： 令和8年11月20日(金)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 13,
          "dayName": "取組日 十三日目",
          "dayHead": "十三日目： 令和8年11月20日(金)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 14,
      "isoDate": "2026-11-21",
      "pathDate": "20261121",
      "label": "十四日目",
      "dayHead": "十四日目： 令和8年11月21日(土)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 14,
          "dayName": "取組日 十四日目",
          "dayHead": "十四日目： 令和8年11月21日(土)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 14,
          "dayName": "取組日 十四日目",
          "dayHead": "十四日目： 令和8年11月21日(土)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 15,
      "isoDate": "2026-11-22",
      "pathDate": "20261122",
      "label": "千秋楽",
      "dayHead": "千秋楽： 令和8年11月22日(日)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 15,
          "dayName": "取組日 千秋楽",
          "dayHead": "千秋楽： 令和8年11月22日(日)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 15,
          "dayName": "取組日 千秋楽",
          "dayHead": "千秋楽： 令和8年11月22日(日)",
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
      "isoDate": "2026-11-08",
      "pathDate": "20261108",
      "label": "初日",
      "dayHead": "初日： 令和8年11月8日(日)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 1,
          "dayName": "取組日 初日",
          "dayHead": "初日： 令和8年11月8日(日)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 1,
          "dayName": "取組日 初日",
          "dayHead": "初日： 令和8年11月8日(日)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 2,
      "isoDate": "2026-11-09",
      "pathDate": "20261109",
      "label": "二日目",
      "dayHead": "二日目： 令和8年11月9日(月)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 2,
          "dayName": "取組日 二日目",
          "dayHead": "二日目： 令和8年11月9日(月)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 2,
          "dayName": "取組日 二日目",
          "dayHead": "二日目： 令和8年11月9日(月)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 3,
      "isoDate": "2026-11-10",
      "pathDate": "20261110",
      "label": "三日目",
      "dayHead": "三日目： 令和8年11月10日(火)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 3,
          "dayName": "取組日 三日目",
          "dayHead": "三日目： 令和8年11月10日(火)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 3,
          "dayName": "取組日 三日目",
          "dayHead": "三日目： 令和8年11月10日(火)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 4,
      "isoDate": "2026-11-11",
      "pathDate": "20261111",
      "label": "四日目",
      "dayHead": "四日目： 令和8年11月11日(水)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 4,
          "dayName": "取組日 四日目",
          "dayHead": "四日目： 令和8年11月11日(水)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 4,
          "dayName": "取組日 四日目",
          "dayHead": "四日目： 令和8年11月11日(水)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 5,
      "isoDate": "2026-11-12",
      "pathDate": "20261112",
      "label": "五日目",
      "dayHead": "五日目： 令和8年11月12日(木)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 5,
          "dayName": "取組日 五日目",
          "dayHead": "五日目： 令和8年11月12日(木)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 5,
          "dayName": "取組日 五日目",
          "dayHead": "五日目： 令和8年11月12日(木)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 6,
      "isoDate": "2026-11-13",
      "pathDate": "20261113",
      "label": "六日目",
      "dayHead": "六日目： 令和8年11月13日(金)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 6,
          "dayName": "取組日 六日目",
          "dayHead": "六日目： 令和8年11月13日(金)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 6,
          "dayName": "取組日 六日目",
          "dayHead": "六日目： 令和8年11月13日(金)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 7,
      "isoDate": "2026-11-14",
      "pathDate": "20261114",
      "label": "七日目",
      "dayHead": "七日目： 令和8年11月14日(土)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 7,
          "dayName": "取組日 七日目",
          "dayHead": "七日目： 令和8年11月14日(土)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 7,
          "dayName": "取組日 七日目",
          "dayHead": "七日目： 令和8年11月14日(土)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 8,
      "isoDate": "2026-11-15",
      "pathDate": "20261115",
      "label": "中日",
      "dayHead": "中日： 令和8年11月15日(日)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 8,
          "dayName": "取組日 中日",
          "dayHead": "中日： 令和8年11月15日(日)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 8,
          "dayName": "取組日 中日",
          "dayHead": "中日： 令和8年11月15日(日)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 9,
      "isoDate": "2026-11-16",
      "pathDate": "20261116",
      "label": "九日目",
      "dayHead": "九日目： 令和8年11月16日(月)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 9,
          "dayName": "取組日 九日目",
          "dayHead": "九日目： 令和8年11月16日(月)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 9,
          "dayName": "取組日 九日目",
          "dayHead": "九日目： 令和8年11月16日(月)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 10,
      "isoDate": "2026-11-17",
      "pathDate": "20261117",
      "label": "十日目",
      "dayHead": "十日目： 令和8年11月17日(火)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 10,
          "dayName": "取組日 十日目",
          "dayHead": "十日目： 令和8年11月17日(火)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 10,
          "dayName": "取組日 十日目",
          "dayHead": "十日目： 令和8年11月17日(火)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 11,
      "isoDate": "2026-11-18",
      "pathDate": "20261118",
      "label": "十一日目",
      "dayHead": "十一日目： 令和8年11月18日(水)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 11,
          "dayName": "取組日 十一日目",
          "dayHead": "十一日目： 令和8年11月18日(水)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 11,
          "dayName": "取組日 十一日目",
          "dayHead": "十一日目： 令和8年11月18日(水)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 12,
      "isoDate": "2026-11-19",
      "pathDate": "20261119",
      "label": "十二日目",
      "dayHead": "十二日目： 令和8年11月19日(木)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 12,
          "dayName": "取組日 十二日目",
          "dayHead": "十二日目： 令和8年11月19日(木)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 12,
          "dayName": "取組日 十二日目",
          "dayHead": "十二日目： 令和8年11月19日(木)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 13,
      "isoDate": "2026-11-20",
      "pathDate": "20261120",
      "label": "十三日目",
      "dayHead": "十三日目： 令和8年11月20日(金)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 13,
          "dayName": "取組日 十三日目",
          "dayHead": "十三日目： 令和8年11月20日(金)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 13,
          "dayName": "取組日 十三日目",
          "dayHead": "十三日目： 令和8年11月20日(金)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 14,
      "isoDate": "2026-11-21",
      "pathDate": "20261121",
      "label": "十四日目",
      "dayHead": "十四日目： 令和8年11月21日(土)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 14,
          "dayName": "取組日 十四日目",
          "dayHead": "十四日目： 令和8年11月21日(土)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 14,
          "dayName": "取組日 十四日目",
          "dayHead": "十四日目： 令和8年11月21日(土)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 15,
      "isoDate": "2026-11-22",
      "pathDate": "20261122",
      "label": "千秋楽",
      "dayHead": "千秋楽： 令和8年11月22日(日)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 15,
          "dayName": "取組日 千秋楽",
          "dayHead": "千秋楽： 令和8年11月22日(日)",
          "division": "幕内",
          "matches": [],
          "absentees": []
        },
        "juryo": {
          "day": 15,
          "dayName": "取組日 千秋楽",
          "dayHead": "千秋楽： 令和8年11月22日(日)",
          "division": "十両",
          "matches": [],
          "absentees": []
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

export const banzukePath = `/${torikumiMonthKey}-banzuke`;
