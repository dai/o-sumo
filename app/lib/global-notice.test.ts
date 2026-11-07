import { describe, expect, it } from 'vitest';
import jaCommon from '../../src/locales/ja/common.json';
import enCommon from '../../src/locales/en/common.json';

describe('global release notice', () => {
  it('announces the November 2026 Day 1 and Day 2 torikumi update in Japanese', () => {
    expect(jaCommon.global.agentGuideNotice).toBe(
      '令和八年十一月場所の初日・二日目取組を更新しました',
    );
  });

  it('announces the November 2026 Day 1 and Day 2 torikumi update in English', () => {
    expect(enCommon.global.agentGuideNotice).toBe(
      'Updated the Day 1 and Day 2 torikumi schedule for the November 2026 basho.',
    );
  });
});
