import { describe, expect, it } from 'vitest';
import jaCommon from '../../src/locales/ja/common.json';
import enCommon from '../../src/locales/en/common.json';

describe('global release notice', () => {
  it('announces Senshuraku in Japanese', () => {
    expect(jaCommon.global.officialDirectoryReleaseNotice).toBe(
      '千秋楽です、みなさま、おつかれまさでした。',
    );
  });

  it('announces Senshuraku in English', () => {
    expect(enCommon.global.officialDirectoryReleaseNotice).toBe(
      "It's Senshuraku (the final day)! Thank you everyone for following the basho.",
    );
  });
});
