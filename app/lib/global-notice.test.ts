import { describe, expect, it } from 'vitest';
import jaCommon from '../../src/locales/ja/common.json';
import enCommon from '../../src/locales/en/common.json';

describe('global release notice', () => {
  it('announces My Rikishi and directory usability improvements in Japanese', () => {
    expect(jaCommon.global.officialDirectoryReleaseNotice).toBe(
      '20260817 更新: マイ力士機能の追加と使いやすさ向上。力士、行司、呼出が探しやすくなりました！',
    );
  });

  it('announces the same release in English', () => {
    expect(enCommon.global.officialDirectoryReleaseNotice).toBe(
      '20260812 Update: Gyoji and yobidashi directories released, with APIs now available.',
    );
  });
});
