import { describe, expect, it } from 'vitest';
import { buildSeoNoscriptHtml, type SeoNoscriptContext } from './seo-noscript';

function makeContext(payloads: Record<string, unknown>): SeoNoscriptContext & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    fetchJson: async (path: string) => {
      calls.push(path);
      if (path in payloads) return payloads[path];
      return null;
    },
  };
}

const baseBanzuke = {
  bashoName: '九月場所',
  year: '令和八年',
  updatedAt: '2026-09-13T18:08:17+09:00',
  makuuchi: [
    {
      title: '横綱',
      east: [{ id: 4227, name: '大の里', yomi: 'おおのさと', rank: '横綱', side: 'east' }],
      west: [{ id: 3842, name: '豊昇龍', yomi: 'ほうしょうりゅう', rank: '横綱', side: 'west' }],
    },
  ],
  juryo: [],
};

const baseRikishi = {
  updatedAt: '2026-08-31T07:40:28+09:00',
  rikishi: [
    { id: 4227, name: '大の里', yomi: 'おおのさと', currentRank: '横綱' },
    { id: 3842, name: '豊昇龍', yomi: 'ほうしょうりゅう', currentRank: '横綱' },
  ],
};

const baseOfficials = {
  retrievedAt: '2026-08-12T00:27:59Z',
  officials: [{ id: 1986, name: '木村 庄之助', yomi: 'きむら しょうのすけ', rank: '立行司' }],
};

describe('buildSeoNoscriptHtml', () => {
  it('returns null for the homepage', async () => {
    const ctx = makeContext({});
    expect(await buildSeoNoscriptHtml('/', 'o-sumo | 大相撲 番付・星取表', ctx)).toBeNull();
  });

  it('renders a kimarite list for /kimarite/', async () => {
    const ctx = makeContext({});
    const html = await buildSeoNoscriptHtml('/kimarite/', '決まり手一覧 | o-sumo', ctx);
    expect(html).not.toBeNull();
    expect(html).toContain('<noscript');
    expect(html).toContain('寄り切り');
    expect(html).toContain('<h1>決まり手一覧 | o-sumo</h1>');
    // Sanity-check a few category headings.
    expect(html).toContain('基本');
    expect(html).toContain('投げ');
  });

  it('renders an archives list from the archive route configs', async () => {
    const ctx = makeContext({});
    const html = await buildSeoNoscriptHtml('/archives/', '大相撲の場所別アーカイブ | o-sumo', ctx);
    expect(html).toContain('2026年9月場所');
    expect(html).toContain('2026年7月場所');
    expect(html).toContain('/202609-banzuke/');
  });

  it('renders the rikishi index for /rikishi/', async () => {
    const ctx = makeContext({ '/api/v1/rikishi.json': baseRikishi });
    const html = await buildSeoNoscriptHtml('/rikishi/', '力士一覧 | o-sumo', ctx);
    expect(html).toContain('横綱');
    expect(html).toContain('大の里');
    expect(html).toContain('/rikishi/4227/');
    expect(ctx.calls).toContain('/api/v1/rikishi.json');
  });

  it('renders the gyoji list for /gyoji/', async () => {
    const ctx = makeContext({ '/api/v1/gyoji.json': baseOfficials });
    const html = await buildSeoNoscriptHtml('/gyoji/', '行司名鑑 | o-sumo', ctx);
    expect(html).toContain('木村 庄之助');
    expect(html).toContain('/gyoji/1986/');
  });

  it('renders the yobidashi list for /yobidashi/', async () => {
    const ctx = makeContext({ '/api/v1/yobidashi.json': baseOfficials });
    const html = await buildSeoNoscriptHtml('/yobidashi/', '呼出名鑑 | o-sumo', ctx);
    expect(html).toContain('木村 庄之助');
    expect(html).toContain('/yobidashi/1986/');
  });

  it('renders a minimal message for an archived banzuke without JSON data', async () => {
    const ctx = makeContext({}); // no JSON payloads
    const html = await buildSeoNoscriptHtml('/202603-banzuke/', '2026年3月場所 番付 | o-sumo', ctx);
    expect(html).toContain('2026年3月場所 番付 | o-sumo');
    expect(html).toContain('公式情報');
  });

  it('renders the current basho banzuke for /202609-banzuke/', async () => {
    const ctx = makeContext({ '/api/v1/banzuke.json': baseBanzuke });
    const html = await buildSeoNoscriptHtml('/202609-banzuke/', '2026年9月場所 番付 | o-sumo', ctx);
    expect(html).toContain('横綱');
    expect(html).toContain('大の里');
    expect(html).toContain('/rikishi/4227/');
    expect(html).toContain('更新');
  });

  it('renders the month hub day list for /202609-yotei/', async () => {
    const ctx = makeContext({});
    const html = await buildSeoNoscriptHtml('/202609-yotei/', '2026年9月場所 取組予定 | o-sumo', ctx);
    expect(html).toContain('<h1>2026年9月場所 取組予定 | o-sumo</h1>');
    expect(html).toContain('/20260913-yotei/');
    expect(html).toContain('初日');
  });

  it('renders the day route with kanji names from banzuke.json for /20260913-yotei/', async () => {
    const ctx = makeContext({ '/api/v1/banzuke.json': baseBanzuke });
    // We need a torikumi.json with a day entry for 20260913. The simplest way
    // is to point fetchJson at banzuke.json for both calls — the buildSeoNoscriptHtml
    // day route only reads banzuke.json for the live basho, and the day itself
    // comes from the bundled fixture (202609 scheduleDays[0]).
    const html = await buildSeoNoscriptHtml('/20260913-yotei/', '2026年9月場所 初日 取組予定 | o-sumo', ctx);
    expect(html).toContain('<h1>2026年9月場所 初日 取組予定 | o-sumo</h1>');
    // The bundled fixture has actual matches for 初日; verify the day table renders.
    expect(html).toContain('幕内');
  });

  it('renders profile H1 with name for /rikishi/{id}/ when the payload is reused', async () => {
    const payload = { rikishi: [{ id: 4227, name: '大の里', yomi: 'おおのさと', currentRank: '横綱' }] };
    // Simulate the share-collection path passing its already-loaded payload.
    const profileCtx: SeoNoscriptContext = {
      fetchJson: async (path: string) => (path === '/api/v1/rikishi.json' ? payload : null),
    };
    const html = await buildSeoNoscriptHtml('/rikishi/4227/', '大の里 | 力士プロフィール | o-sumo', profileCtx);
    expect(html).toContain('大の里');
    expect(html).toContain('横綱');
    expect(html).toContain('力士プロフィール');
  });

  it('escapes HTML in profile names so a name like "<bad>" is safe', async () => {
    const payload = { rikishi: [{ id: 1, name: '<script>alert(1)</script>', yomi: 'test', currentRank: '前頭' }] };
    const ctx: SeoNoscriptContext = {
      fetchJson: async (path: string) => (path === '/api/v1/rikishi.json' ? payload : null),
    };
    const html = await buildSeoNoscriptHtml('/rikishi/1/', '<bad>', ctx);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('returns null for unknown routes', async () => {
    const ctx = makeContext({});
    expect(await buildSeoNoscriptHtml('/this-does-not-exist/', '404 ページが見つかりません | o-sumo', ctx)).toBeNull();
  });

  it('returns null for /rikishi/{not-a-number}/', async () => {
    const ctx = makeContext({});
    expect(await buildSeoNoscriptHtml('/rikishi/abc/', '...', ctx)).toBeNull();
  });
});
