import { describe, expect, it } from 'vitest';
import {
  SHARE_MAX_ENTRIES,
  SHARE_TEXT_MAX_LENGTH,
  X_INTENT_URL,
  buildMyRikishiShareText,
  buildXShareUrl,
  collectMyRikishiShareEntries,
  type MyRikishiShareLabels,
} from './torikumi-share';
import type { TorikumiMatch } from './torikumi-data';

function makeMatch(overrides: Partial<TorikumiMatch> = {}): TorikumiMatch {
  return {
    division: '幕内',
    boutNo: 1,
    eastName: '竜電',
    eastYomi: 'リュウデン',
    eastEnglish: 'Ryutetsu',
    eastRank: '幕内',
    eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/100/',
    westName: '琴櫻',
    westYomi: 'コサクラ',
    westEnglish: 'Kot sakura',
    westRank: '幕内',
    westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/200/',
    kimarite: '押し出し',
    winner: 'east',
    ...overrides,
  };
}

const labels: MyRikishiShareLabels = {
  resultWin: '○ {{name}} {{kimarite}}',
  resultLoss: '● {{name}} {{kimarite}}',
  matchup: '{{name}} − {{opponent}}',
  more: '…ほか{{count}}番',
};

const isSaved = (...ids: number[]) => (id: number) => ids.includes(id);

describe('torikumi-share', () => {
  describe('collectMyRikishiShareEntries', () => {
    it('records the win with the winning technique', () => {
      const entries = collectMyRikishiShareEntries({
        sections: [{ division: '幕内', matches: [makeMatch()] }],
        isSaved: isSaved(100),
        absenteeIds: new Set(),
      });

      expect(entries).toHaveLength(1);
      expect(entries[0]).toMatchObject({ shikona: '竜電', opponent: '琴櫻', outcome: 'win', kimarite: '押し出し' });
    });

    it('records the loss for the saved loser', () => {
      const entries = collectMyRikishiShareEntries({
        sections: [{ division: '幕内', matches: [makeMatch({ winner: 'west' })] }],
        isSaved: isSaved(100),
        absenteeIds: new Set(),
      });

      expect(entries[0].outcome).toBe('loss');
    });

    it('records the matchup when the result is not settled yet', () => {
      const entries = collectMyRikishiShareEntries({
        sections: [{ division: '幕内', matches: [makeMatch({ kimarite: '', winner: null })] }],
        isSaved: isSaved(100),
        absenteeIds: new Set(),
      });

      expect(entries[0]).toMatchObject({ outcome: null, shikona: '竜電', opponent: '琴櫻' });
    });

    it('drops bouts without a saved rikishi', () => {
      const entries = collectMyRikishiShareEntries({
        sections: [{ division: '幕内', matches: [makeMatch()] }],
        isSaved: isSaved(999),
        absenteeIds: new Set(),
      });

      expect(entries).toEqual([]);
    });

    it('drops the saved rikishi when it is absent that day', () => {
      const entries = collectMyRikishiShareEntries({
        sections: [{ division: '幕内', matches: [makeMatch({ kimarite: '', winner: null })] }],
        isSaved: isSaved(100),
        absenteeIds: new Set([100]),
      });

      expect(entries).toEqual([]);
    });

    it('drops a bout whose opponent is absent because the bout never happened', () => {
      const entries = collectMyRikishiShareEntries({
        sections: [{ division: '幕内', matches: [makeMatch({ kimarite: '', winner: null })] }],
        isSaved: isSaved(100),
        absenteeIds: new Set([200]),
      });

      expect(entries).toEqual([]);
    });

    it('keeps the winner of a fusen bout', () => {
      const entries = collectMyRikishiShareEntries({
        sections: [{ division: '幕内', matches: [makeMatch({ kimarite: '不戦', winner: 'east' })] }],
        isSaved: isSaved(100),
        absenteeIds: new Set([200]),
      });

      expect(entries).toHaveLength(1);
      expect(entries[0]).toMatchObject({ outcome: 'win', kimarite: '不戦' });
    });
  });

  describe('buildMyRikishiShareText', () => {
    const oneEntry = [{
      division: '幕内' as const,
      boutNo: 1,
      shikona: '竜電',
      opponent: '琴櫻',
      outcome: 'win' as const,
      kimarite: '押し出し',
    }];

    it('lists the header, the bout and the hashtags', () => {
      const text = buildMyRikishiShareText({
        entries: oneEntry,
        header: '令和八年十一月場所 初日',
        labels,
        hashtagLine: '#大相撲 #十一月場所 #o_sumo',
      });

      expect(text).toBe('令和八年十一月場所 初日\n○ 竜電 押し出し\n#大相撲 #十一月場所 #o_sumo');
    });

    it('lists at most four bouts and reports the rest', () => {
      const entries = Array.from({ length: 6 }, (_, index) => ({
        ...oneEntry[0],
        boutNo: index + 1,
        shikona: `力士${index + 1}`,
      }));

      const text = buildMyRikishiShareText({
        entries,
        header: '令和八年十一月場所 初日',
        labels,
        hashtagLine: '#大相撲 #十一月場所 #o_sumo',
      });

      const lines = text.split('\n');
      expect(lines).toHaveLength(1 + SHARE_MAX_ENTRIES + 2);
      expect(lines).toContain('…ほか2番');
    });

    it('uses the matchup format before the result is published', () => {
      const text = buildMyRikishiShareText({
        entries: [{ ...oneEntry[0], outcome: null, kimarite: '' }],
        header: '令和八年十一月場所 初日',
        labels,
        hashtagLine: '#大相撲',
      });

      expect(text).toContain('竜電 − 琴櫻');
    });

    it('never exceeds the character limit', () => {
      const entries = Array.from({ length: 20 }, (_, index) => ({
        ...oneEntry[0],
        boutNo: index + 1,
        shikona: `長い四股名 Entrypadding${index}`,
        kimarite: '押し出し',
      }));

      const text = buildMyRikishiShareText({
        entries,
        header: '令和八年十一月場所 初日',
        labels,
        hashtagLine: '#大相撲 #十一月場所 #o_sumo',
      });

      expect([...text].length).toBeLessThanOrEqual(SHARE_TEXT_MAX_LENGTH);
    });

    it('returns an empty string when there is nothing to share', () => {
      const text = buildMyRikishiShareText({
        entries: [],
        header: '令和八年十一月場所 初日',
        labels,
        hashtagLine: '#大相撲',
      });

      expect(text).toBe('');
    });
  });

  describe('buildXShareUrl', () => {
    it('targets the X web intent with the encoded text and canonical url', () => {
      const url = buildXShareUrl('竜電 − 琴櫻', 'https://osada.us/20261108-torikumi/');

      expect(url.startsWith(`${X_INTENT_URL}?`)).toBe(true);
      expect(url).toContain('text=%E7%AB%9C%E9%9B%BB%20%E2%88%92%20%E7%90%B4%E6%AB%BB');
      expect(url).toContain('url=https%3A%2F%2Fosada.us%2F20261108-torikumi%2F');
    });
  });
});
