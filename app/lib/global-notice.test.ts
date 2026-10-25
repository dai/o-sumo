import { describe, expect, it } from 'vitest';
import jaCommon from '../../src/locales/ja/common.json';
import enCommon from '../../src/locales/en/common.json';

describe('global release notice', () => {
  it('announces the agent guide update in Japanese', () => {
    expect(jaCommon.global.agentGuideNotice).toBe(
      '20261025: エージェント向けにサイトを整理しました。',
    );
  });

  it('announces the agent guide update in English', () => {
    expect(enCommon.global.agentGuideNotice).toBe(
      '20261025: We have organized the site for AI agents.',
    );
  });
});
