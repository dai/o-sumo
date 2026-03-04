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
        "name": "大の里",
        "yomi": "おおのさと",
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
        "name": "豊昇龍",
        "yomi": "ほうしょうりゅう",
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
        "name": "朝乃山",
        "yomi": "あさのやま",
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
        "name": "安青錦",
        "yomi": "あおにしき",
        "rank": "大関",
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
