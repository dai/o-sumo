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
  today?: TorikumiDailyData;
  tomorrow?: TorikumiDailyData;
  resultDays?: TorikumiArchiveDay[];
  scheduleDays?: TorikumiArchiveDay[];
}

export const torikumiData: TorikumiDataSet = {
  "bashoName": "五月場所",
  "year": "令和八年",
  "updatedAt": "2026-05-11T10:57:39+09:00",
  "resultUpdatedAt": "2026-05-11T10:57:39+09:00",
  "scheduleUpdatedAt": "2026-05-11T10:57:39+09:00",
  "today": {
    "makuuchi": {
      "day": 2,
      "dayName": "取組日 二日目",
      "dayHead": "二日目： 令和8年5月11日(月)",
      "division": "幕内",
      "matches": [
        {
          "division": "幕内",
          "boutNo": 1,
          "eastName": "わかのしょう",
          "eastYomi": "わかのしょう",
          "eastEnglish": "Wakanosho",
          "eastRank": "前頭十六枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4121/",
          "westName": "ふじりょうが",
          "westYomi": "ふじりょうが",
          "westEnglish": "Fujiryoga",
          "westRank": "前頭十七枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4336/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "幕内",
          "boutNo": 2,
          "eastName": "りゅうでん",
          "eastYomi": "りゅうでん",
          "eastEnglish": "Ryuden",
          "eastRank": "前頭十六枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2890/",
          "westName": "おうしょううみ",
          "westYomi": "おうしょううみ",
          "westEnglish": "Oshoumi",
          "westRank": "前頭十五枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4025/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "幕内",
          "boutNo": 3,
          "eastName": "みたけうみ",
          "eastYomi": "みたけうみ",
          "eastEnglish": "Mitakeumi",
          "eastRank": "前頭十四枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3620/",
          "westName": "とびざる",
          "westYomi": "とびざる",
          "westEnglish": "Tobizaru",
          "westRank": "前頭十五枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3594/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "幕内",
          "boutNo": 4,
          "eastName": "ろうが",
          "eastYomi": "ろうが",
          "eastEnglish": "Roga",
          "eastRank": "前頭十四枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3907/",
          "westName": "たまわし",
          "westYomi": "たまわし",
          "westEnglish": "Tamawashi",
          "westRank": "前頭十三枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2629/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "幕内",
          "boutNo": 5,
          "eastName": "しし",
          "eastYomi": "しし",
          "eastEnglish": "Shishi",
          "eastRank": "前頭十二枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3990/",
          "westName": "ことえいほう",
          "westYomi": "ことえいほう",
          "westEnglish": "Kotoeiho",
          "westRank": "前頭十三枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4120/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "幕内",
          "boutNo": 6,
          "eastName": "ときはやて",
          "eastYomi": "ときはやて",
          "eastEnglish": "Tokihayate",
          "eastRank": "前頭十二枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3933/",
          "westName": "きんぼうざん",
          "westYomi": "きんぼうざん",
          "westEnglish": "Kinbozan",
          "westRank": "前頭十一枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4112/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "幕内",
          "boutNo": 7,
          "eastName": "あさのやま",
          "eastYomi": "あさのやま",
          "eastEnglish": "Asanoyama",
          "eastRank": "前頭十枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3682/",
          "westName": "はくのふじ",
          "westYomi": "はくのふじ",
          "westEnglish": "Hakunofuji",
          "westRank": "前頭十枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4187/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "幕内",
          "boutNo": 8,
          "eastName": "うら",
          "eastYomi": "うら",
          "eastEnglish": "Ura",
          "eastRank": "前頭十一枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3616/",
          "westName": "にしきふじ",
          "westYomi": "にしきふじ",
          "westEnglish": "Nishikifuji",
          "westRank": "前頭九枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3742/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "幕内",
          "boutNo": 9,
          "eastName": "おうしょうま",
          "eastYomi": "おうしょうま",
          "eastEnglish": "Oshoma",
          "eastRank": "前頭八枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4108/",
          "westName": "あさはくりゅう",
          "westYomi": "あさはくりゅう",
          "westEnglish": "Asahakuryu",
          "westRank": "前頭八枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4175/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "幕内",
          "boutNo": 10,
          "eastName": "あび",
          "eastYomi": "あび",
          "eastEnglish": "Abi",
          "eastRank": "前頭九枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3485/",
          "westName": "あさこうりゅう",
          "westYomi": "あさこうりゅう",
          "westEnglish": "Asakoryu",
          "westRank": "前頭七枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4101/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "幕内",
          "boutNo": 11,
          "eastName": "ちゅらのうみ",
          "eastYomi": "ちゅらのうみ",
          "eastEnglish": "Churanoumi",
          "eastRank": "前頭六枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3711/",
          "westName": "ちよしょうま",
          "westYomi": "ちよしょうま",
          "westEnglish": "Chiyoshoma",
          "westRank": "前頭七枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3207/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "幕内",
          "boutNo": 12,
          "eastName": "ふじせいうん",
          "eastYomi": "ふじせいうん",
          "eastEnglish": "Fujiseiun",
          "eastRank": "前頭六枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4093/",
          "westName": "しょうだい",
          "westYomi": "しょうだい",
          "westEnglish": "Shodai",
          "westRank": "前頭五枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3521/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "幕内",
          "boutNo": 13,
          "eastName": "だいえいしょう",
          "eastYomi": "だいえいしょう",
          "eastEnglish": "Daieisho",
          "eastRank": "前頭四枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3376/",
          "westName": "わかもとはる",
          "westYomi": "わかもとはる",
          "westEnglish": "Wakamotoharu",
          "westRank": "前頭五枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3371/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "幕内",
          "boutNo": 14,
          "eastName": "ごうのやま",
          "eastYomi": "ごうのやま",
          "eastEnglish": "Gonoyama",
          "eastRank": "前頭四枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4079/",
          "westName": "おうほう",
          "westYomi": "おうほう",
          "westEnglish": "Oho",
          "westRank": "前頭三枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3844/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "幕内",
          "boutNo": 15,
          "eastName": "いちやまもと",
          "eastYomi": "いちやまもと",
          "eastEnglish": "Ichiyamamoto",
          "eastRank": "前頭二枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3753/",
          "westName": "たかやす",
          "westYomi": "たかやす",
          "westEnglish": "Takayasu",
          "westRank": "小結",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2775/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "幕内",
          "boutNo": 16,
          "eastName": "あたみふじ",
          "eastYomi": "あたみふじ",
          "eastEnglish": "Atamifuji",
          "eastRank": "関脇",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4055/",
          "westName": "ひらどうみ",
          "westYomi": "ひらどうみ",
          "westEnglish": "Hiradoumi",
          "westRank": "前頭三枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3705/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "幕内",
          "boutNo": 17,
          "eastName": "たかのしょう",
          "eastYomi": "たかのしょう",
          "eastEnglish": "Takanosho",
          "eastRank": "前頭筆頭",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3265/",
          "westName": "ことしょうほう",
          "westYomi": "ことしょうほう",
          "westEnglish": "Kotoshoho",
          "westRank": "関脇",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3840/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "幕内",
          "boutNo": 18,
          "eastName": "ことざくら",
          "eastYomi": "ことざくら",
          "eastEnglish": "Kotozakura",
          "eastRank": "大関",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3661/",
          "westName": "わかたかかげ",
          "westYomi": "わかたかかげ",
          "westEnglish": "Wakatakakage",
          "westRank": "小結",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3761/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "幕内",
          "boutNo": 19,
          "eastName": "きりしま",
          "eastYomi": "きりしま",
          "eastEnglish": "Kirishima",
          "eastRank": "大関",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3622/",
          "westName": "よしのふじ",
          "westYomi": "よしのふじ",
          "westEnglish": "Yoshinofuji",
          "westRank": "前頭二枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4279/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "幕内",
          "boutNo": 20,
          "eastName": "ほうしょうりゅう",
          "eastYomi": "ほうしょうりゅう",
          "eastEnglish": "Hoshoryu",
          "eastRank": "横綱",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/",
          "westName": "ふじのかわ",
          "westYomi": "ふじのかわ",
          "westEnglish": "Fujinokawa",
          "westRank": "前頭筆頭",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4191/",
          "kimarite": "不戦",
          "winner": "west"
        }
      ],
      "absentees": [
        {
          "id": 3842,
          "name": "豊昇龍",
          "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
        },
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
      "dayHead": "二日目： 令和8年5月11日(月)",
      "division": "十両",
      "matches": [
        {
          "division": "十両",
          "boutNo": 1,
          "eastName": "おおかりゅう",
          "eastYomi": "おおかりゅう",
          "eastEnglish": "Okaryu",
          "eastRank": "十両十三枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4275/",
          "westName": "とちたいかい",
          "westYomi": "とちたいかい",
          "westEnglish": "Tochitaikai",
          "westRank": "十両十四枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3839/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "十両",
          "boutNo": 2,
          "eastName": "えんほう",
          "eastYomi": "えんほう",
          "eastEnglish": "Enho",
          "eastRank": "十両十四枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3803/",
          "westName": "はくようざん",
          "westYomi": "はくようざん",
          "westEnglish": "Hakuyozan",
          "westRank": "十両十三枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3334/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "十両",
          "boutNo": 3,
          "eastName": "かぜけんおう",
          "eastYomi": "かぜけんおう",
          "eastEnglish": "Kazekeno",
          "eastRank": "十両十一枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4158/",
          "westName": "ひとし",
          "westYomi": "ひとし",
          "westEnglish": "Hitoshi",
          "westRank": "十両十二枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4095/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "十両",
          "boutNo": 4,
          "eastName": "たましょうほう",
          "eastYomi": "たましょうほう",
          "eastEnglish": "Tamashoho",
          "eastRank": "十両十二枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3367/",
          "westName": "にしきぎ",
          "westYomi": "にしきぎ",
          "westEnglish": "Nishikigi",
          "westRank": "十両十一枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2892/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "十両",
          "boutNo": 5,
          "eastName": "にしのりゅう",
          "eastYomi": "にしのりゅう",
          "eastEnglish": "Nishinoryu",
          "eastRank": "十両九枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3914/",
          "westName": "とうはくりゅう",
          "westYomi": "とうはくりゅう",
          "westEnglish": "Tohakuryu",
          "westRank": "十両十枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3969/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "十両",
          "boutNo": 6,
          "eastName": "みどりふじ",
          "eastYomi": "みどりふじ",
          "eastEnglish": "Midorifuji",
          "eastRank": "十両十枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3743/",
          "westName": "かよう",
          "westYomi": "かよう",
          "westEnglish": "Kayo",
          "westRank": "十両九枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4165/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "十両",
          "boutNo": 7,
          "eastName": "かがやき",
          "eastYomi": "かがやき",
          "eastEnglish": "Kagayaki",
          "eastRank": "十両七枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3255/",
          "westName": "しろくま",
          "westYomi": "しろくま",
          "westEnglish": "Shirokuma",
          "westRank": "十両八枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4164/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "十両",
          "boutNo": 8,
          "eastName": "しょうなんのうみ",
          "eastYomi": "しょうなんのうみ",
          "eastEnglish": "Shonannoumi",
          "eastRank": "十両八枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3553/",
          "westName": "としのふじ",
          "westYomi": "としのふじ",
          "westEnglish": "Toshinofuji",
          "westRank": "十両七枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4243/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "十両",
          "boutNo": 9,
          "eastName": "ともかぜ",
          "eastYomi": "ともかぜ",
          "eastEnglish": "Tomokaze",
          "eastRank": "十両五枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3818/",
          "westName": "かずま",
          "westYomi": "かずま",
          "westEnglish": "Kazuma",
          "westRank": "十両六枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4287/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "十両",
          "boutNo": 10,
          "eastName": "めいせい",
          "eastYomi": "めいせい",
          "eastEnglish": "Meisei",
          "eastRank": "十両六枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3337/",
          "westName": "きたのわか",
          "westYomi": "きたのわか",
          "westEnglish": "Kitanowaka",
          "westRank": "十両五枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3939/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "十両",
          "boutNo": 11,
          "eastName": "でわのりゅう",
          "eastYomi": "でわのりゅう",
          "eastEnglish": "Dewanoryu",
          "eastRank": "十両三枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3983/",
          "westName": "きょくかいゆう",
          "westYomi": "きょくかいゆう",
          "westEnglish": "Kyokukaiyu",
          "westRank": "十両四枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4232/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "十両",
          "boutNo": 12,
          "eastName": "あさすいりゅう",
          "eastYomi": "あさすいりゅう",
          "eastEnglish": "Asasuiryu",
          "eastRank": "十両四枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4285/",
          "westName": "はつやま",
          "westYomi": "はつやま",
          "westEnglish": "Hatsuyama",
          "westRank": "十両三枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4124/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "十両",
          "boutNo": 13,
          "eastName": "おうのかつ",
          "eastYomi": "おうのかつ",
          "eastEnglish": "Onokatsu",
          "eastRank": "十両筆頭",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4231/",
          "westName": "さだのうみ",
          "westYomi": "さだのうみ",
          "westEnglish": "Sadanoumi",
          "westRank": "十両二枚目",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2565/",
          "kimarite": "未定",
          "winner": null
        },
        {
          "division": "十両",
          "boutNo": 14,
          "eastName": "たけるふじ",
          "eastYomi": "たけるふじ",
          "eastEnglish": "Takerufuji",
          "eastRank": "十両二枚目",
          "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4171/",
          "westName": "だいせいざん",
          "westYomi": "だいせいざん",
          "westEnglish": "Daiseizan",
          "westRank": "十両筆頭",
          "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4116/",
          "kimarite": "未定",
          "winner": null
        }
      ],
      "absentees": []
    }
  },
  "tomorrow": {
    "makuuchi": {
      "day": 3,
      "dayName": "取組日 三日目",
      "dayHead": "三日目： 令和8年5月12日(火)",
      "division": "幕内",
      "matches": [],
      "absentees": [
        {
          "id": 3842,
          "name": "豊昇龍",
          "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
        },
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
      "dayHead": "三日目： 令和8年5月12日(火)",
      "division": "十両",
      "matches": [],
      "absentees": []
    }
  },
  "resultDays": [
    {
      "day": 1,
      "isoDate": "2026-05-10",
      "pathDate": "20260510",
      "label": "初日",
      "dayHead": "初日： 令和8年5月10日(日)",
      "status": "published",
      "statusMessage": null,
      "data": {
        "makuuchi": {
          "day": 1,
          "dayName": "取組日 初日",
          "dayHead": "初日： 令和8年5月10日(日)",
          "division": "幕内",
          "matches": [
            {
              "division": "幕内",
              "boutNo": 1,
              "eastName": "ふじりょうが",
              "eastYomi": "ふじりょうが",
              "eastEnglish": "Fujiryoga",
              "eastRank": "前頭十七枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4336/",
              "westName": "りゅうでん",
              "westYomi": "りゅうでん",
              "westEnglish": "Ryuden",
              "westRank": "前頭十六枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2890/",
              "kimarite": "寄り切り",
              "winner": "east"
            },
            {
              "division": "幕内",
              "boutNo": 2,
              "eastName": "わかのしょう",
              "eastYomi": "わかのしょう",
              "eastEnglish": "Wakanosho",
              "eastRank": "前頭十六枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4121/",
              "westName": "おうしょううみ",
              "westYomi": "おうしょううみ",
              "westEnglish": "Oshoumi",
              "westRank": "前頭十五枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4025/",
              "kimarite": "突き出し",
              "winner": "east"
            },
            {
              "division": "幕内",
              "boutNo": 3,
              "eastName": "とびざる",
              "eastYomi": "とびざる",
              "eastEnglish": "Tobizaru",
              "eastRank": "前頭十五枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3594/",
              "westName": "ろうが",
              "westYomi": "ろうが",
              "westEnglish": "Roga",
              "westRank": "前頭十四枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3907/",
              "kimarite": "押し出し",
              "winner": "east"
            },
            {
              "division": "幕内",
              "boutNo": 4,
              "eastName": "みたけうみ",
              "eastYomi": "みたけうみ",
              "eastEnglish": "Mitakeumi",
              "eastRank": "前頭十四枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3620/",
              "westName": "たまわし",
              "westYomi": "たまわし",
              "westEnglish": "Tamawashi",
              "westRank": "前頭十三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2629/",
              "kimarite": "押し出し",
              "winner": "east"
            },
            {
              "division": "幕内",
              "boutNo": 5,
              "eastName": "ことえいほう",
              "eastYomi": "ことえいほう",
              "eastEnglish": "Kotoeiho",
              "eastRank": "前頭十三枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4120/",
              "westName": "ときはやて",
              "westYomi": "ときはやて",
              "westEnglish": "Tokihayate",
              "westRank": "前頭十二枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3933/",
              "kimarite": "上手投げ",
              "winner": "east"
            },
            {
              "division": "幕内",
              "boutNo": 6,
              "eastName": "しし",
              "eastYomi": "しし",
              "eastEnglish": "Shishi",
              "eastRank": "前頭十二枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3990/",
              "westName": "きんぼうざん",
              "westYomi": "きんぼうざん",
              "westEnglish": "Kinbozan",
              "westRank": "前頭十一枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4112/",
              "kimarite": "浴せ倒し",
              "winner": "west"
            },
            {
              "division": "幕内",
              "boutNo": 7,
              "eastName": "うら",
              "eastYomi": "うら",
              "eastEnglish": "Ura",
              "eastRank": "前頭十一枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3616/",
              "westName": "はくのふじ",
              "westYomi": "はくのふじ",
              "westEnglish": "Hakunofuji",
              "westRank": "前頭十枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4187/",
              "kimarite": "押し出し",
              "winner": "east"
            },
            {
              "division": "幕内",
              "boutNo": 8,
              "eastName": "あさのやま",
              "eastYomi": "あさのやま",
              "eastEnglish": "Asanoyama",
              "eastRank": "前頭十枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3682/",
              "westName": "にしきふじ",
              "westYomi": "にしきふじ",
              "westEnglish": "Nishikifuji",
              "westRank": "前頭九枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3742/",
              "kimarite": "寄り切り",
              "winner": "east"
            },
            {
              "division": "幕内",
              "boutNo": 9,
              "eastName": "あび",
              "eastYomi": "あび",
              "eastEnglish": "Abi",
              "eastRank": "前頭九枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3485/",
              "westName": "あさはくりゅう",
              "westYomi": "あさはくりゅう",
              "westEnglish": "Asahakuryu",
              "westRank": "前頭八枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4175/",
              "kimarite": "押し出し",
              "winner": "east"
            },
            {
              "division": "幕内",
              "boutNo": 10,
              "eastName": "おうしょうま",
              "eastYomi": "おうしょうま",
              "eastEnglish": "Oshoma",
              "eastRank": "前頭八枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4108/",
              "westName": "あさこうりゅう",
              "westYomi": "あさこうりゅう",
              "westEnglish": "Asakoryu",
              "westRank": "前頭七枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4101/",
              "kimarite": "押し出し",
              "winner": "west"
            },
            {
              "division": "幕内",
              "boutNo": 11,
              "eastName": "ちよしょうま",
              "eastYomi": "ちよしょうま",
              "eastEnglish": "Chiyoshoma",
              "eastRank": "前頭七枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3207/",
              "westName": "ふじせいうん",
              "westYomi": "ふじせいうん",
              "westEnglish": "Fujiseiun",
              "westRank": "前頭六枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4093/",
              "kimarite": "寄り切り",
              "winner": "west"
            },
            {
              "division": "幕内",
              "boutNo": 12,
              "eastName": "ちゅらのうみ",
              "eastYomi": "ちゅらのうみ",
              "eastEnglish": "Churanoumi",
              "eastRank": "前頭六枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3711/",
              "westName": "しょうだい",
              "westYomi": "しょうだい",
              "westEnglish": "Shodai",
              "westRank": "前頭五枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3521/",
              "kimarite": "押し出し",
              "winner": "east"
            },
            {
              "division": "幕内",
              "boutNo": 13,
              "eastName": "わかもとはる",
              "eastYomi": "わかもとはる",
              "eastEnglish": "Wakamotoharu",
              "eastRank": "前頭五枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3371/",
              "westName": "ごうのやま",
              "westYomi": "ごうのやま",
              "westEnglish": "Gonoyama",
              "westRank": "前頭四枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4079/",
              "kimarite": "押し出し",
              "winner": "west"
            },
            {
              "division": "幕内",
              "boutNo": 14,
              "eastName": "だいえいしょう",
              "eastYomi": "だいえいしょう",
              "eastEnglish": "Daieisho",
              "eastRank": "前頭四枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3376/",
              "westName": "おうほう",
              "westYomi": "おうほう",
              "westEnglish": "Oho",
              "westRank": "前頭三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3844/",
              "kimarite": "押し出し",
              "winner": "east"
            },
            {
              "division": "幕内",
              "boutNo": 15,
              "eastName": "わかたかかげ",
              "eastYomi": "わかたかかげ",
              "eastEnglish": "Wakatakakage",
              "eastRank": "小結",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3761/",
              "westName": "ひらどうみ",
              "westYomi": "ひらどうみ",
              "westEnglish": "Hiradoumi",
              "westRank": "前頭三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3705/",
              "kimarite": "突き落とし",
              "winner": "east"
            },
            {
              "division": "幕内",
              "boutNo": 16,
              "eastName": "よしのふじ",
              "eastYomi": "よしのふじ",
              "eastEnglish": "Yoshinofuji",
              "eastRank": "前頭二枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4279/",
              "westName": "ことしょうほう",
              "westYomi": "ことしょうほう",
              "westEnglish": "Kotoshoho",
              "westRank": "関脇",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3840/",
              "kimarite": "掬い投げ",
              "winner": "east"
            },
            {
              "division": "幕内",
              "boutNo": 17,
              "eastName": "あたみふじ",
              "eastYomi": "あたみふじ",
              "eastEnglish": "Atamifuji",
              "eastRank": "関脇",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4055/",
              "westName": "いちやまもと",
              "westYomi": "いちやまもと",
              "westEnglish": "Ichiyamamoto",
              "westRank": "前頭二枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3753/",
              "kimarite": "叩き込み",
              "winner": "west"
            },
            {
              "division": "幕内",
              "boutNo": 18,
              "eastName": "きりしま",
              "eastYomi": "きりしま",
              "eastEnglish": "Kirishima",
              "eastRank": "大関",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3622/",
              "westName": "たかのしょう",
              "westYomi": "たかのしょう",
              "westEnglish": "Takanosho",
              "westRank": "前頭筆頭",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3265/",
              "kimarite": "叩き込み",
              "winner": "east"
            },
            {
              "division": "幕内",
              "boutNo": 19,
              "eastName": "ことざくら",
              "eastYomi": "ことざくら",
              "eastEnglish": "Kotozakura",
              "eastRank": "大関",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3661/",
              "westName": "ふじのかわ",
              "westYomi": "ふじのかわ",
              "westEnglish": "Fujinokawa",
              "westRank": "前頭筆頭",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4191/",
              "kimarite": "突き出し",
              "winner": "west"
            },
            {
              "division": "幕内",
              "boutNo": 20,
              "eastName": "ほうしょうりゅう",
              "eastYomi": "ほうしょうりゅう",
              "eastEnglish": "Hoshoryu",
              "eastRank": "横綱",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/",
              "westName": "たかやす",
              "westYomi": "たかやす",
              "westEnglish": "Takayasu",
              "westRank": "小結",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2775/",
              "kimarite": "上手投げ",
              "winner": "west"
            }
          ],
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
          "dayHead": "初日： 令和8年5月10日(日)",
          "division": "十両",
          "matches": [
            {
              "division": "十両",
              "boutNo": 1,
              "eastName": "とちたいかい",
              "eastYomi": "とちたいかい",
              "eastEnglish": "Tochitaikai",
              "eastRank": "十両十四枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3839/",
              "westName": "えんほう",
              "westYomi": "えんほう",
              "westEnglish": "Enho",
              "westRank": "十両十四枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3803/",
              "kimarite": "押し出し",
              "winner": "west"
            },
            {
              "division": "十両",
              "boutNo": 2,
              "eastName": "おおかりゅう",
              "eastYomi": "おおかりゅう",
              "eastEnglish": "Okaryu",
              "eastRank": "十両十三枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4275/",
              "westName": "はくようざん",
              "westYomi": "はくようざん",
              "westEnglish": "Hakuyozan",
              "westRank": "十両十三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3334/",
              "kimarite": "押し出し",
              "winner": "east"
            },
            {
              "division": "十両",
              "boutNo": 3,
              "eastName": "ひとし",
              "eastYomi": "ひとし",
              "eastEnglish": "Hitoshi",
              "eastRank": "十両十二枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4095/",
              "westName": "たましょうほう",
              "westYomi": "たましょうほう",
              "westEnglish": "Tamashoho",
              "westRank": "十両十二枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3367/",
              "kimarite": "突き落とし",
              "winner": "west"
            },
            {
              "division": "十両",
              "boutNo": 4,
              "eastName": "かぜけんおう",
              "eastYomi": "かぜけんおう",
              "eastEnglish": "Kazekeno",
              "eastRank": "十両十一枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4158/",
              "westName": "にしきぎ",
              "westYomi": "にしきぎ",
              "westEnglish": "Nishikigi",
              "westRank": "十両十一枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2892/",
              "kimarite": "押し出し",
              "winner": "east"
            },
            {
              "division": "十両",
              "boutNo": 5,
              "eastName": "とうはくりゅう",
              "eastYomi": "とうはくりゅう",
              "eastEnglish": "Tohakuryu",
              "eastRank": "十両十枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3969/",
              "westName": "みどりふじ",
              "westYomi": "みどりふじ",
              "westEnglish": "Midorifuji",
              "westRank": "十両十枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3743/",
              "kimarite": "叩き込み",
              "winner": "east"
            },
            {
              "division": "十両",
              "boutNo": 6,
              "eastName": "にしのりゅう",
              "eastYomi": "にしのりゅう",
              "eastEnglish": "Nishinoryu",
              "eastRank": "十両九枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3914/",
              "westName": "かよう",
              "westYomi": "かよう",
              "westEnglish": "Kayo",
              "westRank": "十両九枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4165/",
              "kimarite": "寄り切り",
              "winner": "east"
            },
            {
              "division": "十両",
              "boutNo": 7,
              "eastName": "しょうなんのうみ",
              "eastYomi": "しょうなんのうみ",
              "eastEnglish": "Shonannoumi",
              "eastRank": "十両八枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3553/",
              "westName": "しろくま",
              "westYomi": "しろくま",
              "westEnglish": "Shirokuma",
              "westRank": "十両八枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4164/",
              "kimarite": "寄り切り",
              "winner": "west"
            },
            {
              "division": "十両",
              "boutNo": 8,
              "eastName": "かがやき",
              "eastYomi": "かがやき",
              "eastEnglish": "Kagayaki",
              "eastRank": "十両七枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3255/",
              "westName": "としのふじ",
              "westYomi": "としのふじ",
              "westEnglish": "Toshinofuji",
              "westRank": "十両七枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4243/",
              "kimarite": "寄り切り",
              "winner": "west"
            },
            {
              "division": "十両",
              "boutNo": 9,
              "eastName": "かずま",
              "eastYomi": "かずま",
              "eastEnglish": "Kazuma",
              "eastRank": "十両六枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4287/",
              "westName": "めいせい",
              "westYomi": "めいせい",
              "westEnglish": "Meisei",
              "westRank": "十両六枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3337/",
              "kimarite": "寄り切り",
              "winner": "east"
            },
            {
              "division": "十両",
              "boutNo": 10,
              "eastName": "ともかぜ",
              "eastYomi": "ともかぜ",
              "eastEnglish": "Tomokaze",
              "eastRank": "十両五枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3818/",
              "westName": "きたのわか",
              "westYomi": "きたのわか",
              "westEnglish": "Kitanowaka",
              "westRank": "十両五枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3939/",
              "kimarite": "つき手",
              "winner": "west"
            },
            {
              "division": "十両",
              "boutNo": 11,
              "eastName": "きょくかいゆう",
              "eastYomi": "きょくかいゆう",
              "eastEnglish": "Kyokukaiyu",
              "eastRank": "十両四枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4232/",
              "westName": "あさすいりゅう",
              "westYomi": "あさすいりゅう",
              "westEnglish": "Asasuiryu",
              "westRank": "十両四枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4285/",
              "kimarite": "寄り切り",
              "winner": "east"
            },
            {
              "division": "十両",
              "boutNo": 12,
              "eastName": "でわのりゅう",
              "eastYomi": "でわのりゅう",
              "eastEnglish": "Dewanoryu",
              "eastRank": "十両三枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3983/",
              "westName": "はつやま",
              "westYomi": "はつやま",
              "westEnglish": "Hatsuyama",
              "westRank": "十両三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4124/",
              "kimarite": "叩き込み",
              "winner": "west"
            },
            {
              "division": "十両",
              "boutNo": 13,
              "eastName": "さだのうみ",
              "eastYomi": "さだのうみ",
              "eastEnglish": "Sadanoumi",
              "eastRank": "十両二枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2565/",
              "westName": "たけるふじ",
              "westYomi": "たけるふじ",
              "westEnglish": "Takerufuji",
              "westRank": "十両二枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4171/",
              "kimarite": "寄り切り",
              "winner": "west"
            },
            {
              "division": "十両",
              "boutNo": 14,
              "eastName": "おうのかつ",
              "eastYomi": "おうのかつ",
              "eastEnglish": "Onokatsu",
              "eastRank": "十両筆頭",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4231/",
              "westName": "だいせいざん",
              "westYomi": "だいせいざん",
              "westEnglish": "Daiseizan",
              "westRank": "十両筆頭",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4116/",
              "kimarite": "寄り切り",
              "winner": "west"
            }
          ],
          "absentees": []
        }
      }
    },
    {
      "day": 2,
      "isoDate": "2026-05-11",
      "pathDate": "20260511",
      "label": "二日目",
      "dayHead": "二日目： 令和8年5月11日(月)",
      "status": "published",
      "statusMessage": null,
      "data": {
        "makuuchi": {
          "day": 2,
          "dayName": "取組日 二日目",
          "dayHead": "二日目： 令和8年5月11日(月)",
          "division": "幕内",
          "matches": [
            {
              "division": "幕内",
              "boutNo": 1,
              "eastName": "わかのしょう",
              "eastYomi": "わかのしょう",
              "eastEnglish": "Wakanosho",
              "eastRank": "前頭十六枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4121/",
              "westName": "ふじりょうが",
              "westYomi": "ふじりょうが",
              "westEnglish": "Fujiryoga",
              "westRank": "前頭十七枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4336/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 2,
              "eastName": "りゅうでん",
              "eastYomi": "りゅうでん",
              "eastEnglish": "Ryuden",
              "eastRank": "前頭十六枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2890/",
              "westName": "おうしょううみ",
              "westYomi": "おうしょううみ",
              "westEnglish": "Oshoumi",
              "westRank": "前頭十五枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4025/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 3,
              "eastName": "みたけうみ",
              "eastYomi": "みたけうみ",
              "eastEnglish": "Mitakeumi",
              "eastRank": "前頭十四枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3620/",
              "westName": "とびざる",
              "westYomi": "とびざる",
              "westEnglish": "Tobizaru",
              "westRank": "前頭十五枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3594/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 4,
              "eastName": "ろうが",
              "eastYomi": "ろうが",
              "eastEnglish": "Roga",
              "eastRank": "前頭十四枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3907/",
              "westName": "たまわし",
              "westYomi": "たまわし",
              "westEnglish": "Tamawashi",
              "westRank": "前頭十三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2629/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 5,
              "eastName": "しし",
              "eastYomi": "しし",
              "eastEnglish": "Shishi",
              "eastRank": "前頭十二枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3990/",
              "westName": "ことえいほう",
              "westYomi": "ことえいほう",
              "westEnglish": "Kotoeiho",
              "westRank": "前頭十三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4120/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 6,
              "eastName": "ときはやて",
              "eastYomi": "ときはやて",
              "eastEnglish": "Tokihayate",
              "eastRank": "前頭十二枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3933/",
              "westName": "きんぼうざん",
              "westYomi": "きんぼうざん",
              "westEnglish": "Kinbozan",
              "westRank": "前頭十一枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4112/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 7,
              "eastName": "あさのやま",
              "eastYomi": "あさのやま",
              "eastEnglish": "Asanoyama",
              "eastRank": "前頭十枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3682/",
              "westName": "はくのふじ",
              "westYomi": "はくのふじ",
              "westEnglish": "Hakunofuji",
              "westRank": "前頭十枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4187/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 8,
              "eastName": "うら",
              "eastYomi": "うら",
              "eastEnglish": "Ura",
              "eastRank": "前頭十一枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3616/",
              "westName": "にしきふじ",
              "westYomi": "にしきふじ",
              "westEnglish": "Nishikifuji",
              "westRank": "前頭九枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3742/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 9,
              "eastName": "おうしょうま",
              "eastYomi": "おうしょうま",
              "eastEnglish": "Oshoma",
              "eastRank": "前頭八枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4108/",
              "westName": "あさはくりゅう",
              "westYomi": "あさはくりゅう",
              "westEnglish": "Asahakuryu",
              "westRank": "前頭八枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4175/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 10,
              "eastName": "あび",
              "eastYomi": "あび",
              "eastEnglish": "Abi",
              "eastRank": "前頭九枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3485/",
              "westName": "あさこうりゅう",
              "westYomi": "あさこうりゅう",
              "westEnglish": "Asakoryu",
              "westRank": "前頭七枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4101/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 11,
              "eastName": "ちゅらのうみ",
              "eastYomi": "ちゅらのうみ",
              "eastEnglish": "Churanoumi",
              "eastRank": "前頭六枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3711/",
              "westName": "ちよしょうま",
              "westYomi": "ちよしょうま",
              "westEnglish": "Chiyoshoma",
              "westRank": "前頭七枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3207/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 12,
              "eastName": "ふじせいうん",
              "eastYomi": "ふじせいうん",
              "eastEnglish": "Fujiseiun",
              "eastRank": "前頭六枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4093/",
              "westName": "しょうだい",
              "westYomi": "しょうだい",
              "westEnglish": "Shodai",
              "westRank": "前頭五枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3521/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 13,
              "eastName": "だいえいしょう",
              "eastYomi": "だいえいしょう",
              "eastEnglish": "Daieisho",
              "eastRank": "前頭四枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3376/",
              "westName": "わかもとはる",
              "westYomi": "わかもとはる",
              "westEnglish": "Wakamotoharu",
              "westRank": "前頭五枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3371/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 14,
              "eastName": "ごうのやま",
              "eastYomi": "ごうのやま",
              "eastEnglish": "Gonoyama",
              "eastRank": "前頭四枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4079/",
              "westName": "おうほう",
              "westYomi": "おうほう",
              "westEnglish": "Oho",
              "westRank": "前頭三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3844/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 15,
              "eastName": "いちやまもと",
              "eastYomi": "いちやまもと",
              "eastEnglish": "Ichiyamamoto",
              "eastRank": "前頭二枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3753/",
              "westName": "たかやす",
              "westYomi": "たかやす",
              "westEnglish": "Takayasu",
              "westRank": "小結",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2775/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 16,
              "eastName": "あたみふじ",
              "eastYomi": "あたみふじ",
              "eastEnglish": "Atamifuji",
              "eastRank": "関脇",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4055/",
              "westName": "ひらどうみ",
              "westYomi": "ひらどうみ",
              "westEnglish": "Hiradoumi",
              "westRank": "前頭三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3705/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 17,
              "eastName": "たかのしょう",
              "eastYomi": "たかのしょう",
              "eastEnglish": "Takanosho",
              "eastRank": "前頭筆頭",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3265/",
              "westName": "ことしょうほう",
              "westYomi": "ことしょうほう",
              "westEnglish": "Kotoshoho",
              "westRank": "関脇",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3840/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 18,
              "eastName": "ことざくら",
              "eastYomi": "ことざくら",
              "eastEnglish": "Kotozakura",
              "eastRank": "大関",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3661/",
              "westName": "わかたかかげ",
              "westYomi": "わかたかかげ",
              "westEnglish": "Wakatakakage",
              "westRank": "小結",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3761/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 19,
              "eastName": "きりしま",
              "eastYomi": "きりしま",
              "eastEnglish": "Kirishima",
              "eastRank": "大関",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3622/",
              "westName": "よしのふじ",
              "westYomi": "よしのふじ",
              "westEnglish": "Yoshinofuji",
              "westRank": "前頭二枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4279/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 20,
              "eastName": "ほうしょうりゅう",
              "eastYomi": "ほうしょうりゅう",
              "eastEnglish": "Hoshoryu",
              "eastRank": "横綱",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/",
              "westName": "ふじのかわ",
              "westYomi": "ふじのかわ",
              "westEnglish": "Fujinokawa",
              "westRank": "前頭筆頭",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4191/",
              "kimarite": "不戦",
              "winner": "west"
            }
          ],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "二日目： 令和8年5月11日(月)",
          "division": "十両",
          "matches": [
            {
              "division": "十両",
              "boutNo": 1,
              "eastName": "おおかりゅう",
              "eastYomi": "おおかりゅう",
              "eastEnglish": "Okaryu",
              "eastRank": "十両十三枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4275/",
              "westName": "とちたいかい",
              "westYomi": "とちたいかい",
              "westEnglish": "Tochitaikai",
              "westRank": "十両十四枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3839/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 2,
              "eastName": "えんほう",
              "eastYomi": "えんほう",
              "eastEnglish": "Enho",
              "eastRank": "十両十四枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3803/",
              "westName": "はくようざん",
              "westYomi": "はくようざん",
              "westEnglish": "Hakuyozan",
              "westRank": "十両十三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3334/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 3,
              "eastName": "かぜけんおう",
              "eastYomi": "かぜけんおう",
              "eastEnglish": "Kazekeno",
              "eastRank": "十両十一枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4158/",
              "westName": "ひとし",
              "westYomi": "ひとし",
              "westEnglish": "Hitoshi",
              "westRank": "十両十二枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4095/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 4,
              "eastName": "たましょうほう",
              "eastYomi": "たましょうほう",
              "eastEnglish": "Tamashoho",
              "eastRank": "十両十二枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3367/",
              "westName": "にしきぎ",
              "westYomi": "にしきぎ",
              "westEnglish": "Nishikigi",
              "westRank": "十両十一枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2892/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 5,
              "eastName": "にしのりゅう",
              "eastYomi": "にしのりゅう",
              "eastEnglish": "Nishinoryu",
              "eastRank": "十両九枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3914/",
              "westName": "とうはくりゅう",
              "westYomi": "とうはくりゅう",
              "westEnglish": "Tohakuryu",
              "westRank": "十両十枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3969/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 6,
              "eastName": "みどりふじ",
              "eastYomi": "みどりふじ",
              "eastEnglish": "Midorifuji",
              "eastRank": "十両十枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3743/",
              "westName": "かよう",
              "westYomi": "かよう",
              "westEnglish": "Kayo",
              "westRank": "十両九枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4165/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 7,
              "eastName": "かがやき",
              "eastYomi": "かがやき",
              "eastEnglish": "Kagayaki",
              "eastRank": "十両七枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3255/",
              "westName": "しろくま",
              "westYomi": "しろくま",
              "westEnglish": "Shirokuma",
              "westRank": "十両八枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4164/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 8,
              "eastName": "しょうなんのうみ",
              "eastYomi": "しょうなんのうみ",
              "eastEnglish": "Shonannoumi",
              "eastRank": "十両八枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3553/",
              "westName": "としのふじ",
              "westYomi": "としのふじ",
              "westEnglish": "Toshinofuji",
              "westRank": "十両七枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4243/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 9,
              "eastName": "ともかぜ",
              "eastYomi": "ともかぜ",
              "eastEnglish": "Tomokaze",
              "eastRank": "十両五枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3818/",
              "westName": "かずま",
              "westYomi": "かずま",
              "westEnglish": "Kazuma",
              "westRank": "十両六枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4287/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 10,
              "eastName": "めいせい",
              "eastYomi": "めいせい",
              "eastEnglish": "Meisei",
              "eastRank": "十両六枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3337/",
              "westName": "きたのわか",
              "westYomi": "きたのわか",
              "westEnglish": "Kitanowaka",
              "westRank": "十両五枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3939/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 11,
              "eastName": "でわのりゅう",
              "eastYomi": "でわのりゅう",
              "eastEnglish": "Dewanoryu",
              "eastRank": "十両三枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3983/",
              "westName": "きょくかいゆう",
              "westYomi": "きょくかいゆう",
              "westEnglish": "Kyokukaiyu",
              "westRank": "十両四枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4232/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 12,
              "eastName": "あさすいりゅう",
              "eastYomi": "あさすいりゅう",
              "eastEnglish": "Asasuiryu",
              "eastRank": "十両四枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4285/",
              "westName": "はつやま",
              "westYomi": "はつやま",
              "westEnglish": "Hatsuyama",
              "westRank": "十両三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4124/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 13,
              "eastName": "おうのかつ",
              "eastYomi": "おうのかつ",
              "eastEnglish": "Onokatsu",
              "eastRank": "十両筆頭",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4231/",
              "westName": "さだのうみ",
              "westYomi": "さだのうみ",
              "westEnglish": "Sadanoumi",
              "westRank": "十両二枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2565/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 14,
              "eastName": "たけるふじ",
              "eastYomi": "たけるふじ",
              "eastEnglish": "Takerufuji",
              "eastRank": "十両二枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4171/",
              "westName": "だいせいざん",
              "westYomi": "だいせいざん",
              "westEnglish": "Daiseizan",
              "westRank": "十両筆頭",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4116/",
              "kimarite": "未定",
              "winner": null
            }
          ],
          "absentees": []
        }
      }
    },
    {
      "day": 3,
      "isoDate": "2026-05-12",
      "pathDate": "20260512",
      "label": "三日目",
      "dayHead": "三日目： 令和8年5月12日(火)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 3,
          "dayName": "取組日 三日目",
          "dayHead": "三日目： 令和8年5月12日(火)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "三日目： 令和8年5月12日(火)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 4,
      "isoDate": "2026-05-13",
      "pathDate": "20260513",
      "label": "四日目",
      "dayHead": "四日目： 令和8年5月13日(水)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 4,
          "dayName": "取組日 四日目",
          "dayHead": "四日目： 令和8年5月13日(水)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "四日目： 令和8年5月13日(水)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 5,
      "isoDate": "2026-05-14",
      "pathDate": "20260514",
      "label": "五日目",
      "dayHead": "五日目： 令和8年5月14日(木)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 5,
          "dayName": "取組日 五日目",
          "dayHead": "五日目： 令和8年5月14日(木)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "五日目： 令和8年5月14日(木)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 6,
      "isoDate": "2026-05-15",
      "pathDate": "20260515",
      "label": "六日目",
      "dayHead": "六日目： 令和8年5月15日(金)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 6,
          "dayName": "取組日 六日目",
          "dayHead": "六日目： 令和8年5月15日(金)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "六日目： 令和8年5月15日(金)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 7,
      "isoDate": "2026-05-16",
      "pathDate": "20260516",
      "label": "七日目",
      "dayHead": "七日目： 令和8年5月16日(土)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 7,
          "dayName": "取組日 七日目",
          "dayHead": "七日目： 令和8年5月16日(土)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "七日目： 令和8年5月16日(土)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 8,
      "isoDate": "2026-05-17",
      "pathDate": "20260517",
      "label": "中日",
      "dayHead": "中日： 令和8年5月17日(日)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 8,
          "dayName": "取組日 中日",
          "dayHead": "中日： 令和8年5月17日(日)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "中日： 令和8年5月17日(日)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 9,
      "isoDate": "2026-05-18",
      "pathDate": "20260518",
      "label": "九日目",
      "dayHead": "九日目： 令和8年5月18日(月)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 9,
          "dayName": "取組日 九日目",
          "dayHead": "九日目： 令和8年5月18日(月)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "九日目： 令和8年5月18日(月)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 10,
      "isoDate": "2026-05-19",
      "pathDate": "20260519",
      "label": "十日目",
      "dayHead": "十日目： 令和8年5月19日(火)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 10,
          "dayName": "取組日 十日目",
          "dayHead": "十日目： 令和8年5月19日(火)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "十日目： 令和8年5月19日(火)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 11,
      "isoDate": "2026-05-20",
      "pathDate": "20260520",
      "label": "十一日目",
      "dayHead": "十一日目： 令和8年5月20日(水)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 11,
          "dayName": "取組日 十一日目",
          "dayHead": "十一日目： 令和8年5月20日(水)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "十一日目： 令和8年5月20日(水)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 12,
      "isoDate": "2026-05-21",
      "pathDate": "20260521",
      "label": "十二日目",
      "dayHead": "十二日目： 令和8年5月21日(木)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 12,
          "dayName": "取組日 十二日目",
          "dayHead": "十二日目： 令和8年5月21日(木)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "十二日目： 令和8年5月21日(木)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 13,
      "isoDate": "2026-05-22",
      "pathDate": "20260522",
      "label": "十三日目",
      "dayHead": "十三日目： 令和8年5月22日(金)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 13,
          "dayName": "取組日 十三日目",
          "dayHead": "十三日目： 令和8年5月22日(金)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "十三日目： 令和8年5月22日(金)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 14,
      "isoDate": "2026-05-23",
      "pathDate": "20260523",
      "label": "十四日目",
      "dayHead": "十四日目： 令和8年5月23日(土)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 14,
          "dayName": "取組日 十四日目",
          "dayHead": "十四日目： 令和8年5月23日(土)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "十四日目： 令和8年5月23日(土)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 15,
      "isoDate": "2026-05-24",
      "pathDate": "20260524",
      "label": "千秋楽",
      "dayHead": "千秋楽： 令和8年5月24日(日)",
      "status": "pending",
      "statusMessage": "結果未更新",
      "data": {
        "makuuchi": {
          "day": 15,
          "dayName": "取組日 千秋楽",
          "dayHead": "千秋楽： 令和8年5月24日(日)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "千秋楽： 令和8年5月24日(日)",
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
      "isoDate": "2026-05-10",
      "pathDate": "20260510",
      "label": "初日",
      "dayHead": "初日： 令和8年5月10日(日)",
      "status": "published",
      "statusMessage": null,
      "data": {
        "makuuchi": {
          "day": 1,
          "dayName": "取組日 初日",
          "dayHead": "初日： 令和8年5月10日(日)",
          "division": "幕内",
          "matches": [
            {
              "division": "幕内",
              "boutNo": 1,
              "eastName": "ふじりょうが",
              "eastYomi": "ふじりょうが",
              "eastEnglish": "Fujiryoga",
              "eastRank": "前頭十七枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4336/",
              "westName": "りゅうでん",
              "westYomi": "りゅうでん",
              "westEnglish": "Ryuden",
              "westRank": "前頭十六枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2890/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 2,
              "eastName": "わかのしょう",
              "eastYomi": "わかのしょう",
              "eastEnglish": "Wakanosho",
              "eastRank": "前頭十六枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4121/",
              "westName": "おうしょううみ",
              "westYomi": "おうしょううみ",
              "westEnglish": "Oshoumi",
              "westRank": "前頭十五枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4025/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 3,
              "eastName": "とびざる",
              "eastYomi": "とびざる",
              "eastEnglish": "Tobizaru",
              "eastRank": "前頭十五枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3594/",
              "westName": "ろうが",
              "westYomi": "ろうが",
              "westEnglish": "Roga",
              "westRank": "前頭十四枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3907/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 4,
              "eastName": "みたけうみ",
              "eastYomi": "みたけうみ",
              "eastEnglish": "Mitakeumi",
              "eastRank": "前頭十四枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3620/",
              "westName": "たまわし",
              "westYomi": "たまわし",
              "westEnglish": "Tamawashi",
              "westRank": "前頭十三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2629/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 5,
              "eastName": "ことえいほう",
              "eastYomi": "ことえいほう",
              "eastEnglish": "Kotoeiho",
              "eastRank": "前頭十三枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4120/",
              "westName": "ときはやて",
              "westYomi": "ときはやて",
              "westEnglish": "Tokihayate",
              "westRank": "前頭十二枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3933/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 6,
              "eastName": "しし",
              "eastYomi": "しし",
              "eastEnglish": "Shishi",
              "eastRank": "前頭十二枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3990/",
              "westName": "きんぼうざん",
              "westYomi": "きんぼうざん",
              "westEnglish": "Kinbozan",
              "westRank": "前頭十一枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4112/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 7,
              "eastName": "うら",
              "eastYomi": "うら",
              "eastEnglish": "Ura",
              "eastRank": "前頭十一枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3616/",
              "westName": "はくのふじ",
              "westYomi": "はくのふじ",
              "westEnglish": "Hakunofuji",
              "westRank": "前頭十枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4187/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 8,
              "eastName": "あさのやま",
              "eastYomi": "あさのやま",
              "eastEnglish": "Asanoyama",
              "eastRank": "前頭十枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3682/",
              "westName": "にしきふじ",
              "westYomi": "にしきふじ",
              "westEnglish": "Nishikifuji",
              "westRank": "前頭九枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3742/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 9,
              "eastName": "あび",
              "eastYomi": "あび",
              "eastEnglish": "Abi",
              "eastRank": "前頭九枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3485/",
              "westName": "あさはくりゅう",
              "westYomi": "あさはくりゅう",
              "westEnglish": "Asahakuryu",
              "westRank": "前頭八枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4175/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 10,
              "eastName": "おうしょうま",
              "eastYomi": "おうしょうま",
              "eastEnglish": "Oshoma",
              "eastRank": "前頭八枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4108/",
              "westName": "あさこうりゅう",
              "westYomi": "あさこうりゅう",
              "westEnglish": "Asakoryu",
              "westRank": "前頭七枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4101/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 11,
              "eastName": "ちよしょうま",
              "eastYomi": "ちよしょうま",
              "eastEnglish": "Chiyoshoma",
              "eastRank": "前頭七枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3207/",
              "westName": "ふじせいうん",
              "westYomi": "ふじせいうん",
              "westEnglish": "Fujiseiun",
              "westRank": "前頭六枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4093/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 12,
              "eastName": "ちゅらのうみ",
              "eastYomi": "ちゅらのうみ",
              "eastEnglish": "Churanoumi",
              "eastRank": "前頭六枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3711/",
              "westName": "しょうだい",
              "westYomi": "しょうだい",
              "westEnglish": "Shodai",
              "westRank": "前頭五枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3521/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 13,
              "eastName": "わかもとはる",
              "eastYomi": "わかもとはる",
              "eastEnglish": "Wakamotoharu",
              "eastRank": "前頭五枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3371/",
              "westName": "ごうのやま",
              "westYomi": "ごうのやま",
              "westEnglish": "Gonoyama",
              "westRank": "前頭四枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4079/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 14,
              "eastName": "だいえいしょう",
              "eastYomi": "だいえいしょう",
              "eastEnglish": "Daieisho",
              "eastRank": "前頭四枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3376/",
              "westName": "おうほう",
              "westYomi": "おうほう",
              "westEnglish": "Oho",
              "westRank": "前頭三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3844/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 15,
              "eastName": "わかたかかげ",
              "eastYomi": "わかたかかげ",
              "eastEnglish": "Wakatakakage",
              "eastRank": "小結",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3761/",
              "westName": "ひらどうみ",
              "westYomi": "ひらどうみ",
              "westEnglish": "Hiradoumi",
              "westRank": "前頭三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3705/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 16,
              "eastName": "よしのふじ",
              "eastYomi": "よしのふじ",
              "eastEnglish": "Yoshinofuji",
              "eastRank": "前頭二枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4279/",
              "westName": "ことしょうほう",
              "westYomi": "ことしょうほう",
              "westEnglish": "Kotoshoho",
              "westRank": "関脇",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3840/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 17,
              "eastName": "あたみふじ",
              "eastYomi": "あたみふじ",
              "eastEnglish": "Atamifuji",
              "eastRank": "関脇",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4055/",
              "westName": "いちやまもと",
              "westYomi": "いちやまもと",
              "westEnglish": "Ichiyamamoto",
              "westRank": "前頭二枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3753/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 18,
              "eastName": "きりしま",
              "eastYomi": "きりしま",
              "eastEnglish": "Kirishima",
              "eastRank": "大関",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3622/",
              "westName": "たかのしょう",
              "westYomi": "たかのしょう",
              "westEnglish": "Takanosho",
              "westRank": "前頭筆頭",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3265/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 19,
              "eastName": "ことざくら",
              "eastYomi": "ことざくら",
              "eastEnglish": "Kotozakura",
              "eastRank": "大関",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3661/",
              "westName": "ふじのかわ",
              "westYomi": "ふじのかわ",
              "westEnglish": "Fujinokawa",
              "westRank": "前頭筆頭",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4191/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 20,
              "eastName": "ほうしょうりゅう",
              "eastYomi": "ほうしょうりゅう",
              "eastEnglish": "Hoshoryu",
              "eastRank": "横綱",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/",
              "westName": "たかやす",
              "westYomi": "たかやす",
              "westEnglish": "Takayasu",
              "westRank": "小結",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2775/",
              "kimarite": "未定",
              "winner": null
            }
          ],
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
          "dayHead": "初日： 令和8年5月10日(日)",
          "division": "十両",
          "matches": [
            {
              "division": "十両",
              "boutNo": 1,
              "eastName": "とちたいかい",
              "eastYomi": "とちたいかい",
              "eastEnglish": "Tochitaikai",
              "eastRank": "十両十四枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3839/",
              "westName": "えんほう",
              "westYomi": "えんほう",
              "westEnglish": "Enho",
              "westRank": "十両十四枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3803/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 2,
              "eastName": "おおかりゅう",
              "eastYomi": "おおかりゅう",
              "eastEnglish": "Okaryu",
              "eastRank": "十両十三枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4275/",
              "westName": "はくようざん",
              "westYomi": "はくようざん",
              "westEnglish": "Hakuyozan",
              "westRank": "十両十三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3334/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 3,
              "eastName": "ひとし",
              "eastYomi": "ひとし",
              "eastEnglish": "Hitoshi",
              "eastRank": "十両十二枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4095/",
              "westName": "たましょうほう",
              "westYomi": "たましょうほう",
              "westEnglish": "Tamashoho",
              "westRank": "十両十二枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3367/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 4,
              "eastName": "かぜけんおう",
              "eastYomi": "かぜけんおう",
              "eastEnglish": "Kazekeno",
              "eastRank": "十両十一枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4158/",
              "westName": "にしきぎ",
              "westYomi": "にしきぎ",
              "westEnglish": "Nishikigi",
              "westRank": "十両十一枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2892/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 5,
              "eastName": "とうはくりゅう",
              "eastYomi": "とうはくりゅう",
              "eastEnglish": "Tohakuryu",
              "eastRank": "十両十枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3969/",
              "westName": "みどりふじ",
              "westYomi": "みどりふじ",
              "westEnglish": "Midorifuji",
              "westRank": "十両十枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3743/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 6,
              "eastName": "にしのりゅう",
              "eastYomi": "にしのりゅう",
              "eastEnglish": "Nishinoryu",
              "eastRank": "十両九枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3914/",
              "westName": "かよう",
              "westYomi": "かよう",
              "westEnglish": "Kayo",
              "westRank": "十両九枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4165/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 7,
              "eastName": "しょうなんのうみ",
              "eastYomi": "しょうなんのうみ",
              "eastEnglish": "Shonannoumi",
              "eastRank": "十両八枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3553/",
              "westName": "しろくま",
              "westYomi": "しろくま",
              "westEnglish": "Shirokuma",
              "westRank": "十両八枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4164/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 8,
              "eastName": "かがやき",
              "eastYomi": "かがやき",
              "eastEnglish": "Kagayaki",
              "eastRank": "十両七枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3255/",
              "westName": "としのふじ",
              "westYomi": "としのふじ",
              "westEnglish": "Toshinofuji",
              "westRank": "十両七枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4243/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 9,
              "eastName": "かずま",
              "eastYomi": "かずま",
              "eastEnglish": "Kazuma",
              "eastRank": "十両六枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4287/",
              "westName": "めいせい",
              "westYomi": "めいせい",
              "westEnglish": "Meisei",
              "westRank": "十両六枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3337/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 10,
              "eastName": "ともかぜ",
              "eastYomi": "ともかぜ",
              "eastEnglish": "Tomokaze",
              "eastRank": "十両五枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3818/",
              "westName": "きたのわか",
              "westYomi": "きたのわか",
              "westEnglish": "Kitanowaka",
              "westRank": "十両五枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3939/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 11,
              "eastName": "きょくかいゆう",
              "eastYomi": "きょくかいゆう",
              "eastEnglish": "Kyokukaiyu",
              "eastRank": "十両四枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4232/",
              "westName": "あさすいりゅう",
              "westYomi": "あさすいりゅう",
              "westEnglish": "Asasuiryu",
              "westRank": "十両四枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4285/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 12,
              "eastName": "でわのりゅう",
              "eastYomi": "でわのりゅう",
              "eastEnglish": "Dewanoryu",
              "eastRank": "十両三枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3983/",
              "westName": "はつやま",
              "westYomi": "はつやま",
              "westEnglish": "Hatsuyama",
              "westRank": "十両三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4124/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 13,
              "eastName": "さだのうみ",
              "eastYomi": "さだのうみ",
              "eastEnglish": "Sadanoumi",
              "eastRank": "十両二枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2565/",
              "westName": "たけるふじ",
              "westYomi": "たけるふじ",
              "westEnglish": "Takerufuji",
              "westRank": "十両二枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4171/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 14,
              "eastName": "おうのかつ",
              "eastYomi": "おうのかつ",
              "eastEnglish": "Onokatsu",
              "eastRank": "十両筆頭",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4231/",
              "westName": "だいせいざん",
              "westYomi": "だいせいざん",
              "westEnglish": "Daiseizan",
              "westRank": "十両筆頭",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4116/",
              "kimarite": "未定",
              "winner": null
            }
          ],
          "absentees": []
        }
      }
    },
    {
      "day": 2,
      "isoDate": "2026-05-11",
      "pathDate": "20260511",
      "label": "二日目",
      "dayHead": "二日目： 令和8年5月11日(月)",
      "status": "published",
      "statusMessage": null,
      "data": {
        "makuuchi": {
          "day": 2,
          "dayName": "取組日 二日目",
          "dayHead": "二日目： 令和8年5月11日(月)",
          "division": "幕内",
          "matches": [
            {
              "division": "幕内",
              "boutNo": 1,
              "eastName": "わかのしょう",
              "eastYomi": "わかのしょう",
              "eastEnglish": "Wakanosho",
              "eastRank": "前頭十六枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4121/",
              "westName": "ふじりょうが",
              "westYomi": "ふじりょうが",
              "westEnglish": "Fujiryoga",
              "westRank": "前頭十七枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4336/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 2,
              "eastName": "りゅうでん",
              "eastYomi": "りゅうでん",
              "eastEnglish": "Ryuden",
              "eastRank": "前頭十六枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2890/",
              "westName": "おうしょううみ",
              "westYomi": "おうしょううみ",
              "westEnglish": "Oshoumi",
              "westRank": "前頭十五枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4025/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 3,
              "eastName": "みたけうみ",
              "eastYomi": "みたけうみ",
              "eastEnglish": "Mitakeumi",
              "eastRank": "前頭十四枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3620/",
              "westName": "とびざる",
              "westYomi": "とびざる",
              "westEnglish": "Tobizaru",
              "westRank": "前頭十五枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3594/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 4,
              "eastName": "ろうが",
              "eastYomi": "ろうが",
              "eastEnglish": "Roga",
              "eastRank": "前頭十四枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3907/",
              "westName": "たまわし",
              "westYomi": "たまわし",
              "westEnglish": "Tamawashi",
              "westRank": "前頭十三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2629/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 5,
              "eastName": "しし",
              "eastYomi": "しし",
              "eastEnglish": "Shishi",
              "eastRank": "前頭十二枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3990/",
              "westName": "ことえいほう",
              "westYomi": "ことえいほう",
              "westEnglish": "Kotoeiho",
              "westRank": "前頭十三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4120/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 6,
              "eastName": "ときはやて",
              "eastYomi": "ときはやて",
              "eastEnglish": "Tokihayate",
              "eastRank": "前頭十二枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3933/",
              "westName": "きんぼうざん",
              "westYomi": "きんぼうざん",
              "westEnglish": "Kinbozan",
              "westRank": "前頭十一枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4112/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 7,
              "eastName": "あさのやま",
              "eastYomi": "あさのやま",
              "eastEnglish": "Asanoyama",
              "eastRank": "前頭十枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3682/",
              "westName": "はくのふじ",
              "westYomi": "はくのふじ",
              "westEnglish": "Hakunofuji",
              "westRank": "前頭十枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4187/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 8,
              "eastName": "うら",
              "eastYomi": "うら",
              "eastEnglish": "Ura",
              "eastRank": "前頭十一枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3616/",
              "westName": "にしきふじ",
              "westYomi": "にしきふじ",
              "westEnglish": "Nishikifuji",
              "westRank": "前頭九枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3742/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 9,
              "eastName": "おうしょうま",
              "eastYomi": "おうしょうま",
              "eastEnglish": "Oshoma",
              "eastRank": "前頭八枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4108/",
              "westName": "あさはくりゅう",
              "westYomi": "あさはくりゅう",
              "westEnglish": "Asahakuryu",
              "westRank": "前頭八枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4175/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 10,
              "eastName": "あび",
              "eastYomi": "あび",
              "eastEnglish": "Abi",
              "eastRank": "前頭九枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3485/",
              "westName": "あさこうりゅう",
              "westYomi": "あさこうりゅう",
              "westEnglish": "Asakoryu",
              "westRank": "前頭七枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4101/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 11,
              "eastName": "ちゅらのうみ",
              "eastYomi": "ちゅらのうみ",
              "eastEnglish": "Churanoumi",
              "eastRank": "前頭六枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3711/",
              "westName": "ちよしょうま",
              "westYomi": "ちよしょうま",
              "westEnglish": "Chiyoshoma",
              "westRank": "前頭七枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3207/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 12,
              "eastName": "ふじせいうん",
              "eastYomi": "ふじせいうん",
              "eastEnglish": "Fujiseiun",
              "eastRank": "前頭六枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4093/",
              "westName": "しょうだい",
              "westYomi": "しょうだい",
              "westEnglish": "Shodai",
              "westRank": "前頭五枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3521/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 13,
              "eastName": "だいえいしょう",
              "eastYomi": "だいえいしょう",
              "eastEnglish": "Daieisho",
              "eastRank": "前頭四枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3376/",
              "westName": "わかもとはる",
              "westYomi": "わかもとはる",
              "westEnglish": "Wakamotoharu",
              "westRank": "前頭五枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3371/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 14,
              "eastName": "ごうのやま",
              "eastYomi": "ごうのやま",
              "eastEnglish": "Gonoyama",
              "eastRank": "前頭四枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4079/",
              "westName": "おうほう",
              "westYomi": "おうほう",
              "westEnglish": "Oho",
              "westRank": "前頭三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3844/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 15,
              "eastName": "いちやまもと",
              "eastYomi": "いちやまもと",
              "eastEnglish": "Ichiyamamoto",
              "eastRank": "前頭二枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3753/",
              "westName": "たかやす",
              "westYomi": "たかやす",
              "westEnglish": "Takayasu",
              "westRank": "小結",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2775/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 16,
              "eastName": "あたみふじ",
              "eastYomi": "あたみふじ",
              "eastEnglish": "Atamifuji",
              "eastRank": "関脇",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4055/",
              "westName": "ひらどうみ",
              "westYomi": "ひらどうみ",
              "westEnglish": "Hiradoumi",
              "westRank": "前頭三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3705/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 17,
              "eastName": "たかのしょう",
              "eastYomi": "たかのしょう",
              "eastEnglish": "Takanosho",
              "eastRank": "前頭筆頭",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3265/",
              "westName": "ことしょうほう",
              "westYomi": "ことしょうほう",
              "westEnglish": "Kotoshoho",
              "westRank": "関脇",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3840/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 18,
              "eastName": "ことざくら",
              "eastYomi": "ことざくら",
              "eastEnglish": "Kotozakura",
              "eastRank": "大関",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3661/",
              "westName": "わかたかかげ",
              "westYomi": "わかたかかげ",
              "westEnglish": "Wakatakakage",
              "westRank": "小結",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3761/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 19,
              "eastName": "きりしま",
              "eastYomi": "きりしま",
              "eastEnglish": "Kirishima",
              "eastRank": "大関",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3622/",
              "westName": "よしのふじ",
              "westYomi": "よしのふじ",
              "westEnglish": "Yoshinofuji",
              "westRank": "前頭二枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4279/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "幕内",
              "boutNo": 20,
              "eastName": "ほうしょうりゅう",
              "eastYomi": "ほうしょうりゅう",
              "eastEnglish": "Hoshoryu",
              "eastRank": "横綱",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/",
              "westName": "ふじのかわ",
              "westYomi": "ふじのかわ",
              "westEnglish": "Fujinokawa",
              "westRank": "前頭筆頭",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4191/",
              "kimarite": "不戦",
              "winner": "west"
            }
          ],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "二日目： 令和8年5月11日(月)",
          "division": "十両",
          "matches": [
            {
              "division": "十両",
              "boutNo": 1,
              "eastName": "おおかりゅう",
              "eastYomi": "おおかりゅう",
              "eastEnglish": "Okaryu",
              "eastRank": "十両十三枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4275/",
              "westName": "とちたいかい",
              "westYomi": "とちたいかい",
              "westEnglish": "Tochitaikai",
              "westRank": "十両十四枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3839/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 2,
              "eastName": "えんほう",
              "eastYomi": "えんほう",
              "eastEnglish": "Enho",
              "eastRank": "十両十四枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3803/",
              "westName": "はくようざん",
              "westYomi": "はくようざん",
              "westEnglish": "Hakuyozan",
              "westRank": "十両十三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3334/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 3,
              "eastName": "かぜけんおう",
              "eastYomi": "かぜけんおう",
              "eastEnglish": "Kazekeno",
              "eastRank": "十両十一枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4158/",
              "westName": "ひとし",
              "westYomi": "ひとし",
              "westEnglish": "Hitoshi",
              "westRank": "十両十二枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4095/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 4,
              "eastName": "たましょうほう",
              "eastYomi": "たましょうほう",
              "eastEnglish": "Tamashoho",
              "eastRank": "十両十二枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3367/",
              "westName": "にしきぎ",
              "westYomi": "にしきぎ",
              "westEnglish": "Nishikigi",
              "westRank": "十両十一枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2892/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 5,
              "eastName": "にしのりゅう",
              "eastYomi": "にしのりゅう",
              "eastEnglish": "Nishinoryu",
              "eastRank": "十両九枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3914/",
              "westName": "とうはくりゅう",
              "westYomi": "とうはくりゅう",
              "westEnglish": "Tohakuryu",
              "westRank": "十両十枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3969/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 6,
              "eastName": "みどりふじ",
              "eastYomi": "みどりふじ",
              "eastEnglish": "Midorifuji",
              "eastRank": "十両十枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3743/",
              "westName": "かよう",
              "westYomi": "かよう",
              "westEnglish": "Kayo",
              "westRank": "十両九枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4165/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 7,
              "eastName": "かがやき",
              "eastYomi": "かがやき",
              "eastEnglish": "Kagayaki",
              "eastRank": "十両七枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3255/",
              "westName": "しろくま",
              "westYomi": "しろくま",
              "westEnglish": "Shirokuma",
              "westRank": "十両八枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4164/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 8,
              "eastName": "しょうなんのうみ",
              "eastYomi": "しょうなんのうみ",
              "eastEnglish": "Shonannoumi",
              "eastRank": "十両八枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3553/",
              "westName": "としのふじ",
              "westYomi": "としのふじ",
              "westEnglish": "Toshinofuji",
              "westRank": "十両七枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4243/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 9,
              "eastName": "ともかぜ",
              "eastYomi": "ともかぜ",
              "eastEnglish": "Tomokaze",
              "eastRank": "十両五枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3818/",
              "westName": "かずま",
              "westYomi": "かずま",
              "westEnglish": "Kazuma",
              "westRank": "十両六枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4287/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 10,
              "eastName": "めいせい",
              "eastYomi": "めいせい",
              "eastEnglish": "Meisei",
              "eastRank": "十両六枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3337/",
              "westName": "きたのわか",
              "westYomi": "きたのわか",
              "westEnglish": "Kitanowaka",
              "westRank": "十両五枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3939/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 11,
              "eastName": "でわのりゅう",
              "eastYomi": "でわのりゅう",
              "eastEnglish": "Dewanoryu",
              "eastRank": "十両三枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3983/",
              "westName": "きょくかいゆう",
              "westYomi": "きょくかいゆう",
              "westEnglish": "Kyokukaiyu",
              "westRank": "十両四枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4232/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 12,
              "eastName": "あさすいりゅう",
              "eastYomi": "あさすいりゅう",
              "eastEnglish": "Asasuiryu",
              "eastRank": "十両四枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4285/",
              "westName": "はつやま",
              "westYomi": "はつやま",
              "westEnglish": "Hatsuyama",
              "westRank": "十両三枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4124/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 13,
              "eastName": "おうのかつ",
              "eastYomi": "おうのかつ",
              "eastEnglish": "Onokatsu",
              "eastRank": "十両筆頭",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4231/",
              "westName": "さだのうみ",
              "westYomi": "さだのうみ",
              "westEnglish": "Sadanoumi",
              "westRank": "十両二枚目",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/2565/",
              "kimarite": "未定",
              "winner": null
            },
            {
              "division": "十両",
              "boutNo": 14,
              "eastName": "たけるふじ",
              "eastYomi": "たけるふじ",
              "eastEnglish": "Takerufuji",
              "eastRank": "十両二枚目",
              "eastProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4171/",
              "westName": "だいせいざん",
              "westYomi": "だいせいざん",
              "westEnglish": "Daiseizan",
              "westRank": "十両筆頭",
              "westProfileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/4116/",
              "kimarite": "未定",
              "winner": null
            }
          ],
          "absentees": []
        }
      }
    },
    {
      "day": 3,
      "isoDate": "2026-05-12",
      "pathDate": "20260512",
      "label": "三日目",
      "dayHead": "三日目： 令和8年5月12日(火)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 3,
          "dayName": "取組日 三日目",
          "dayHead": "三日目： 令和8年5月12日(火)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "三日目： 令和8年5月12日(火)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 4,
      "isoDate": "2026-05-13",
      "pathDate": "20260513",
      "label": "四日目",
      "dayHead": "四日目： 令和8年5月13日(水)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 4,
          "dayName": "取組日 四日目",
          "dayHead": "四日目： 令和8年5月13日(水)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "四日目： 令和8年5月13日(水)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 5,
      "isoDate": "2026-05-14",
      "pathDate": "20260514",
      "label": "五日目",
      "dayHead": "五日目： 令和8年5月14日(木)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 5,
          "dayName": "取組日 五日目",
          "dayHead": "五日目： 令和8年5月14日(木)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "五日目： 令和8年5月14日(木)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 6,
      "isoDate": "2026-05-15",
      "pathDate": "20260515",
      "label": "六日目",
      "dayHead": "六日目： 令和8年5月15日(金)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 6,
          "dayName": "取組日 六日目",
          "dayHead": "六日目： 令和8年5月15日(金)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "六日目： 令和8年5月15日(金)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 7,
      "isoDate": "2026-05-16",
      "pathDate": "20260516",
      "label": "七日目",
      "dayHead": "七日目： 令和8年5月16日(土)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 7,
          "dayName": "取組日 七日目",
          "dayHead": "七日目： 令和8年5月16日(土)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "七日目： 令和8年5月16日(土)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 8,
      "isoDate": "2026-05-17",
      "pathDate": "20260517",
      "label": "中日",
      "dayHead": "中日： 令和8年5月17日(日)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 8,
          "dayName": "取組日 中日",
          "dayHead": "中日： 令和8年5月17日(日)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "中日： 令和8年5月17日(日)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 9,
      "isoDate": "2026-05-18",
      "pathDate": "20260518",
      "label": "九日目",
      "dayHead": "九日目： 令和8年5月18日(月)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 9,
          "dayName": "取組日 九日目",
          "dayHead": "九日目： 令和8年5月18日(月)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "九日目： 令和8年5月18日(月)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 10,
      "isoDate": "2026-05-19",
      "pathDate": "20260519",
      "label": "十日目",
      "dayHead": "十日目： 令和8年5月19日(火)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 10,
          "dayName": "取組日 十日目",
          "dayHead": "十日目： 令和8年5月19日(火)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "十日目： 令和8年5月19日(火)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 11,
      "isoDate": "2026-05-20",
      "pathDate": "20260520",
      "label": "十一日目",
      "dayHead": "十一日目： 令和8年5月20日(水)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 11,
          "dayName": "取組日 十一日目",
          "dayHead": "十一日目： 令和8年5月20日(水)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "十一日目： 令和8年5月20日(水)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 12,
      "isoDate": "2026-05-21",
      "pathDate": "20260521",
      "label": "十二日目",
      "dayHead": "十二日目： 令和8年5月21日(木)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 12,
          "dayName": "取組日 十二日目",
          "dayHead": "十二日目： 令和8年5月21日(木)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "十二日目： 令和8年5月21日(木)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 13,
      "isoDate": "2026-05-22",
      "pathDate": "20260522",
      "label": "十三日目",
      "dayHead": "十三日目： 令和8年5月22日(金)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 13,
          "dayName": "取組日 十三日目",
          "dayHead": "十三日目： 令和8年5月22日(金)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "十三日目： 令和8年5月22日(金)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 14,
      "isoDate": "2026-05-23",
      "pathDate": "20260523",
      "label": "十四日目",
      "dayHead": "十四日目： 令和8年5月23日(土)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 14,
          "dayName": "取組日 十四日目",
          "dayHead": "十四日目： 令和8年5月23日(土)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "十四日目： 令和8年5月23日(土)",
          "division": "十両",
          "matches": [],
          "absentees": []
        }
      }
    },
    {
      "day": 15,
      "isoDate": "2026-05-24",
      "pathDate": "20260524",
      "label": "千秋楽",
      "dayHead": "千秋楽： 令和8年5月24日(日)",
      "status": "pending",
      "statusMessage": "取組予定未更新",
      "data": {
        "makuuchi": {
          "day": 15,
          "dayName": "取組日 千秋楽",
          "dayHead": "千秋楽： 令和8年5月24日(日)",
          "division": "幕内",
          "matches": [],
          "absentees": [
            {
              "id": 3842,
              "name": "豊昇龍",
              "profileUrl": "https://www.sumo.or.jp/ResultRikishiData/profile/3842/"
            },
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
          "dayHead": "千秋楽： 令和8年5月24日(日)",
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

export const torikumiMonthKey = torikumiArchive.resultDays[0]?.pathDate.slice(0, 6)
  ?? torikumiArchive.scheduleDays[0]?.pathDate.slice(0, 6)
  ?? '202603';

export const banzukePath = `/${torikumiMonthKey}-banduke`;
