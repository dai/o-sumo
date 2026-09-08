import { describe, expect, it } from 'vitest';
import jaCommon from '../../src/locales/ja/common.json';
import enCommon from '../../src/locales/en/common.json';

describe('global release notice', () => {
  it('announces the September basho banzuke update in Japanese', () => {
    expect(jaCommon.global.officialDirectoryReleaseNotice).toBe(
      '平成八年九月場所の準備が整いました、謹んで開幕を待機中。',
    );
  });

  it('announces the September basho banzuke update in English', () => {
    expect(enCommon.global.officialDirectoryReleaseNotice).toBe(
      'The Heisei 8 September basho is ready; we respectfully await its opening.',
    );
  });
});
