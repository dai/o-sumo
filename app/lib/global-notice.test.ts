import { describe, expect, it } from 'vitest';
import jaCommon from '../../src/locales/ja/common.json';
import enCommon from '../../src/locales/en/common.json';

describe('global release notice', () => {
  it('announces the end of the September basho in Japanese', () => {
    expect(jaCommon.global.officialDirectoryReleaseNotice).toBe(
      '令和八年九月場所は終了しました。九州場所でお会いしましょう。',
    );
  });

  it('announces the end of the September basho in English', () => {
    expect(enCommon.global.officialDirectoryReleaseNotice).toBe(
      'The Reiwa 8 September basho has concluded. See you at the Kyushu basho.',
    );
  });
});
