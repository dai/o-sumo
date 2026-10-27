import { describe, expect, it } from 'vitest';
import {
  CURRENT_BASHO_ID,
  getBanzukeDataByMonthKey,
  getTorikumiArchiveByMonthKey,
} from './archive-basho-data';
import { getAllArchiveRouteConfigs } from './torikumi-routes';

/**
 * 月キーの解決は fail-fast で行う。未知の月キーで current のデータを
 * 返すと、別場所の番付・取組を別場所の URL に出してしまうため、
 * 登録漏れは開発時に気付けるよう例外にする。
 */
describe('archive basho data lookup', () => {
  it('resolves every registered route config month key', () => {
    for (const config of getAllArchiveRouteConfigs()) {
      expect(() => getBanzukeDataByMonthKey(config.monthKey)).not.toThrow();
      expect(() => getTorikumiArchiveByMonthKey(config.monthKey)).not.toThrow();
    }
  });

  it('resolves the current basho month key', () => {
    expect(getBanzukeDataByMonthKey(CURRENT_BASHO_ID)).toBeDefined();
    expect(getTorikumiArchiveByMonthKey(CURRENT_BASHO_ID)).toBeDefined();
  });

  it('rejects an unknown month key instead of falling back to the current basho', () => {
    expect(() => getBanzukeDataByMonthKey('209912')).toThrow(/Unknown basho month key/);
    expect(() => getTorikumiArchiveByMonthKey('209912')).toThrow(/Unknown basho month key/);
  });
});
