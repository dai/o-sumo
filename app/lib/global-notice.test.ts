import { describe, expect, it } from 'vitest';
import jaCommon from '../../src/locales/ja/common.json';
import enCommon from '../../src/locales/en/common.json';

describe('global release notice', () => {
  it('announces the gyoji and yobidashi directory release in Japanese', () => {
    expect(jaCommon.global.officialDirectoryReleaseNotice).toBe(
      '20260812 更新: 行司名鑑と呼出名鑑をリリース、APIも公開しました。',
    );
  });

  it('announces the same release in English', () => {
    expect(enCommon.global.officialDirectoryReleaseNotice).toBe(
      '20260812 Update: Gyoji and yobidashi directories released, with APIs now available.',
    );
  });
});
