import { describe, expect, it } from 'vitest';
import jaCommon from '../../src/locales/ja/common.json';
import enCommon from '../../src/locales/en/common.json';

describe('global release notice', () => {
  it('announces the September basho banzuke update in Japanese', () => {
    expect(jaCommon.global.officialDirectoryReleaseNotice).toBe(
      '2026年8月31日: 令和八年九月場所番付を更新しました。',
    );
  });

  it('announces the September basho banzuke update in English', () => {
    expect(enCommon.global.officialDirectoryReleaseNotice).toBe(
      'August 31, 2026: Updated banzuke for the September 2026 tournament.',
    );
  });
});
