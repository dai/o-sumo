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
    status: 'pending',
    announcementNote: '本日千秋楽の全取組終了後、表彰決定次第掲載します。',
    winners: [
      // 発表後に以下形式で記入:
      // { id: 'makuuchi-yusho', category: 'makuuchiYusho', rikishi: '力士名', record: '○勝○敗' },
      // { id: 'juryo-yusho', category: 'juryoYusho', rikishi: '力士名', record: '○勝○敗' },
      // { id: 'shukun', category: 'shukun', rikishi: '力士名', record: '○勝○敗' },
      // { id: 'kanto', category: 'kanto', rikishi: '力士名', record: '○勝○敗' },
      // { id: 'gino', category: 'gino', rikishi: '力士名', record: '○勝○敗' },
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
