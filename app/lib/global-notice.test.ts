import { describe, expect, it } from 'vitest';
import jaCommon from '../../src/locales/ja/common.json';
import enCommon from '../../src/locales/en/common.json';

describe('global release notice', () => {
  it('announces the November 2026 banzuke update in Japanese', () => {
    expect(jaCommon.global.agentGuideNotice).toBe(
      '20261026: 令和8年11月場所の番付を更新しました。',
    );
  });

  it('announces the November 2026 banzuke update in English', () => {
    expect(enCommon.global.agentGuideNotice).toBe(
      '20261026: Updated the banzuke for the November 2026 basho.',
    );
  });
});
