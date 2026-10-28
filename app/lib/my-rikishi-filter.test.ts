import { describe, expect, it } from 'vitest';
import {
  MY_RIKISHI_FILTER_STORAGE_KEY,
  countMyRikishiMatches,
  filterMatchesByMyRikishi,
  filterSectionsByMyRikishi,
  loadMyRikishiFilterEnabled,
  matchInvolvesAbsent,
  matchInvolvesMyRikishi,
  saveMyRikishiFilterEnabled,
} from './my-rikishi-filter';
import type { TorikumiMatch } from './torikumi-data';

function makeMatch(overrides: Partial<TorikumiMatch> = {}): TorikumiMatch {
  return {
    division: '幕内',
    boutNo: 1,
    eastName: '東の力士',
    eastYomi: 'ヒガシのリキシ',
    eastEnglish: 'Higashi no Rikishi',
    eastRank: '幕内',
    eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/100/',
    westName: '西の力士',
    westYomi: 'ニシのリキシ',
    westEnglish: 'Nishi no Rikishi',
    westRank: '幕内',
    westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/200/',
    kimarite: '押し出し',
    winner: 'east',
    ...overrides,
  };
}

const isSaved = (...ids: number[]) => (id: number) => ids.includes(id);

describe('my-rikishi-filter', () => {
  describe('matchInvolvesMyRikishi', () => {
    it('matches when the east rikishi is saved', () => {
      expect(matchInvolvesMyRikishi(makeMatch(), isSaved(100))).toBe(true);
    });

    it('matches when the west rikishi is saved', () => {
      expect(matchInvolvesMyRikishi(makeMatch(), isSaved(200))).toBe(true);
    });

    it('does not match when neither rikishi is saved', () => {
      expect(matchInvolvesMyRikishi(makeMatch(), isSaved(999))).toBe(false);
    });

    it('does not match when the profile url carries no rikishi id', () => {
      const match = makeMatch({ eastProfileUrl: 'https://example.com/unknown', westProfileUrl: 'https://example.com/unknown' });
      expect(matchInvolvesMyRikishi(match, isSaved(100, 200))).toBe(false);
    });
  });

  describe('filterMatchesByMyRikishi', () => {
    it('keeps only the bouts a saved rikishi takes part in', () => {
      const mine = makeMatch({ boutNo: 1 });
      const other = makeMatch({ boutNo: 2, eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/300/', westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/400/' });

      expect(filterMatchesByMyRikishi([mine, other], isSaved(100))).toEqual([mine]);
    });

    it('returns an empty list when nothing matches', () => {
      expect(filterMatchesByMyRikishi([makeMatch()], isSaved())).toEqual([]);
    });
  });

  describe('filterSectionsByMyRikishi', () => {
    it('filters both divisions and drops divisions without any saved rikishi', () => {
      const juryo = {
        division: '十両' as const,
        matches: [makeMatch({
          division: '十両',
          boutNo: 1,
          eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/100/',
          westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/200/',
        })],
      };
      const makuuchi = {
        division: '幕内' as const,
        matches: [makeMatch({
          division: '幕内',
          boutNo: 1,
          eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/300/',
          westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/400/',
        })],
      };

      const filtered = filterSectionsByMyRikishi([juryo, makuuchi], isSaved(400));

      expect(filtered).toHaveLength(1);
      expect(filtered[0].division).toBe('幕内');
      expect(filtered[0].matches).toHaveLength(1);
    });

    it('keeps the absent bout row of a saved rikishi', () => {
      const absentBout = makeMatch({ kimarite: '', winner: null });
      const sections = [{ division: '幕内' as const, matches: [absentBout] }];

      expect(filterSectionsByMyRikishi(sections, isSaved(100))).toHaveLength(1);
    });

    it('returns an empty list when no saved rikishi appears', () => {
      const sections = [{ division: '幕内' as const, matches: [makeMatch()] }];

      expect(filterSectionsByMyRikishi(sections, isSaved(999))).toEqual([]);
    });
  });

  describe('countMyRikishiMatches', () => {
    it('counts the saved rikishi bouts across both divisions', () => {
      const sections = [
        { division: '十両' as const, matches: [makeMatch({ division: '十両', boutNo: 1 })] },
        {
          division: '幕内' as const,
          matches: [
            makeMatch({
              division: '幕内',
              boutNo: 1,
              eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/300/',
              westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/400/',
            }),
            makeMatch({
              division: '幕内',
              boutNo: 2,
              eastProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/300/',
              westProfileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/500/',
            }),
          ],
        },
      ];

      expect(countMyRikishiMatches(sections, isSaved(100))).toBe(1);
      expect(countMyRikishiMatches(sections, isSaved(300))).toBe(2);
    });

    it('counts zero when nothing matches', () => {
      const sections = [{ division: '幕内' as const, matches: [makeMatch()] }];

      expect(countMyRikishiMatches(sections, isSaved())).toBe(0);
    });
  });

  describe('matchInvolvesAbsent', () => {
    it('is true when a participant is listed as absent', () => {
      expect(matchInvolvesAbsent(makeMatch(), new Set([100]))).toBe(true);
    });

    it('is false for a fusen bout because the result is settled', () => {
      const fusen = makeMatch({ kimarite: '不戦', winner: 'west' });
      expect(matchInvolvesAbsent(fusen, new Set([100]))).toBe(false);
    });

    it('is false when nobody is absent', () => {
      expect(matchInvolvesAbsent(makeMatch(), new Set())).toBe(false);
    });
  });

  describe('filter preference storage', () => {
    it('defaults to off when nothing is stored', () => {
      localStorage.removeItem(MY_RIKISHI_FILTER_STORAGE_KEY);

      expect(loadMyRikishiFilterEnabled()).toBe(false);
    });

    it('keeps the on state across reads', () => {
      saveMyRikishiFilterEnabled(true);
      expect(loadMyRikishiFilterEnabled()).toBe(true);

      saveMyRikishiFilterEnabled(false);
      expect(loadMyRikishiFilterEnabled()).toBe(false);
    });
  });
});
