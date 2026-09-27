export type AwardCategory = 'makuuchiYusho' | 'shukun' | 'kanto' | 'gino' | 'juryoYusho';

export interface BashoAwardWinner {
  id: string;
  category: AwardCategory;
  rikishi: string;
  record: string;
  note?: string;
}

export interface BashoResultsData {
  bashoId: string;
  bashoName: string;
  status: 'pending' | 'announced';
  announcementNote?: string;
  winners: BashoAwardWinner[];
}

/**
 * 歴代場所の優勝・三賞データ。
 * 千秋楽の表彰発表時は、対象場所の status を 'announced' に変更し、
 * winners 配列に受賞者と成績を記入します。
 */
export const BASHO_RESULTS_ARCHIVE: Record<string, BashoResultsData> = {
  '202609': {
    bashoId: '202609',
    bashoName: '令和八年九月場所',
    status: 'announced',
    winners: [
      { id: 'makuuchi-yusho-oonosato', category: 'makuuchiYusho', rikishi: '大の里', record: '12勝3敗' },
      { id: 'shukun-none', category: 'shukun', rikishi: '該当なし', record: '—' },
      { id: 'kanto-fujinokawa', category: 'kanto', rikishi: '藤ノ川', record: '11勝4敗' },
      { id: 'kanto-churanoumi', category: 'kanto', rikishi: '美ノ海', record: '10勝5敗' },
      { id: 'gino-none', category: 'gino', rikishi: '該当なし', record: '—' },
      { id: 'juryo-yusho-kitanowaka', category: 'juryoYusho', rikishi: '北の若', record: '11勝4敗' },
    ],
  },
  '202607': {
    bashoId: '202607',
    bashoName: '令和八年七月場所',
    status: 'announced',
    winners: [
      { id: 'makuuchi-yusho-aonishiki', category: 'makuuchiYusho', rikishi: '安青錦', record: '12勝3敗' },
      { id: 'shukun-fujinokawa', category: 'shukun', rikishi: '藤ノ川', record: '8勝7敗' },
      { id: 'kanto-atamifuji', category: 'kanto', rikishi: '熱海富士', record: '12勝3敗' },
      { id: 'kanto-kotoeiho', category: 'kanto', rikishi: '琴栄峰', record: '11勝4敗' },
      { id: 'kanto-takayasu', category: 'kanto', rikishi: '高安', record: '11勝4敗' },
      { id: 'gino-aonishiki', category: 'gino', rikishi: '安青錦', record: '12勝3敗' },
      { id: 'juryo-yusho-shonannoumi', category: 'juryoYusho', rikishi: '湘南乃海', record: '11勝4敗' },
    ],
  },
};

export function getBashoResults(monthKey: string): BashoResultsData | null {
  return BASHO_RESULTS_ARCHIVE[monthKey] ?? null;
}
