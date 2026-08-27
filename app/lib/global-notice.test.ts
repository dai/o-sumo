import { describe, expect, it } from 'vitest';
import jaCommon from '../../src/locales/ja/common.json';
import enCommon from '../../src/locales/en/common.json';

describe('global release notice', () => {
  it('announces the September basho opening in Japanese', () => {
    expect(jaCommon.global.officialDirectoryReleaseNotice).toBe(
      'このサイトは20260831の番付発表とともに九月場所の幕を開けます。',
    );
  });

  it('announces the September basho opening in English', () => {
    expect(enCommon.global.officialDirectoryReleaseNotice).toBe(
      'This site will open the September basho together with the banzuke release on 20260831.',
    );
  });
});
