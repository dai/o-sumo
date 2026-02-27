export interface Rikishi {
  name: string;
  yomi: string;
  rank: string;
  side: 'east' | 'west';
  wins?: number;
  losses?: number;
  draws?: number;
  results?: ('win' | 'loss' | 'draw')[]; // 15日間の星取
}

export interface RankGroup {
  title: string;
  east: Rikishi[];
  west: Rikishi[];
}

// 令和8年3月場所（2026年3月）の番付・星取データ
// 注: 2026年3月時点の仮想データとして生成
export const makuuchiData: RankGroup[] = [
  {
    title: '横綱',
    east: [
      { 
        name: '豊昇龍', yomi: 'ほうしょうりゅう', rank: '横綱', side: 'east', 
        wins: 12, losses: 3, draws: 0,
        results: ['win', 'win', 'win', 'loss', 'win', 'win', 'win', 'win', 'loss', 'win', 'win', 'win', 'win', 'loss', 'win']
      }
    ],
    west: [
      { 
        name: '大の里', yomi: 'おおのさと', rank: '横綱', side: 'west', 
        wins: 13, losses: 2, draws: 0,
        results: ['win', 'win', 'win', 'win', 'win', 'loss', 'win', 'win', 'win', 'win', 'win', 'win', 'win', 'loss', 'win']
      }
    ]
  },
  {
    title: '大関',
    east: [
      { 
        name: '安青錦', yomi: 'あおにしき', rank: '大関', side: 'east', 
        wins: 10, losses: 5, draws: 0,
        results: ['win', 'loss', 'win', 'win', 'loss', 'win', 'win', 'loss', 'win', 'win', 'loss', 'win', 'win', 'loss', 'win']
      }
    ],
    west: [
      { 
        name: '朝乃山', yomi: 'あさのやま', rank: '大関', side: 'west', 
        wins: 11, losses: 4, draws: 0,
        results: ['win', 'win', 'loss', 'win', 'win', 'win', 'loss', 'win', 'win', 'loss', 'win', 'win', 'win', 'loss', 'win']
      }
    ]
  },
  {
    title: '関脇',
    east: [
      { 
        name: '霧島', yomi: 'きりしま', rank: '関脇', side: 'east', 
        wins: 9, losses: 6, draws: 0,
        results: ['win', 'loss', 'win', 'loss', 'win', 'win', 'loss', 'win', 'loss', 'win', 'win', 'loss', 'win', 'win', 'loss']
      }
    ],
    west: [
      { 
        name: '高安', yomi: 'たかやす', rank: '関脇', side: 'west', 
        wins: 8, losses: 7, draws: 0,
        results: ['loss', 'win', 'loss', 'win', 'win', 'loss', 'win', 'loss', 'win', 'loss', 'win', 'win', 'loss', 'win', 'loss']
      }
    ]
  },
  {
    title: '小結',
    east: [
      { 
        name: '若元春', yomi: 'わかもとはる', rank: '小結', side: 'east', 
        wins: 7, losses: 8, draws: 0,
        results: ['loss', 'loss', 'win', 'win', 'loss', 'win', 'loss', 'win', 'loss', 'win', 'loss', 'win', 'loss', 'loss', 'win']
      }
    ],
    west: [
      { 
        name: '熱海富士', yomi: 'あたみふじ', rank: '小結', side: 'west', 
        wins: 8, losses: 7, draws: 0,
        results: ['win', 'win', 'loss', 'loss', 'win', 'loss', 'win', 'win', 'loss', 'win', 'loss', 'win', 'loss', 'win', 'loss']
      }
    ]
  },
  {
    title: '前頭筆頭',
    east: [
      { 
        name: '若隆景', yomi: 'わかたかかげ', rank: '前頭筆頭', side: 'east', 
        wins: 9, losses: 6, draws: 0,
        results: ['win', 'win', 'loss', 'win', 'loss', 'win', 'win', 'loss', 'win', 'loss', 'win', 'win', 'loss', 'win', 'loss']
      }
    ],
    west: [
      { 
        name: '義ノ富士', yomi: 'よしのふじ', rank: '前頭筆頭', side: 'west', 
        wins: 6, losses: 9, draws: 0,
        results: ['loss', 'loss', 'win', 'loss', 'win', 'loss', 'loss', 'win', 'loss', 'win', 'loss', 'win', 'loss', 'win', 'loss']
      }
    ]
  }
];

export const juryo: RankGroup[] = [
  {
    title: '十両一枚目',
    east: [
      { 
        name: '朝翠龍', yomi: 'あさすいりゅう', rank: '十両一枚目', side: 'east', 
        wins: 10, losses: 5, draws: 0,
        results: ['win', 'win', 'win', 'loss', 'win', 'win', 'loss', 'win', 'win', 'loss', 'win', 'win', 'loss', 'win', 'loss']
      }
    ],
    west: [
      { 
        name: '朝玉勢', yomi: 'あさぎょくせい', rank: '十両一枚目', side: 'west', 
        wins: 8, losses: 7, draws: 0,
        results: ['loss', 'win', 'loss', 'win', 'win', 'loss', 'win', 'loss', 'win', 'loss', 'win', 'win', 'loss', 'win', 'loss']
      }
    ]
  }
];
