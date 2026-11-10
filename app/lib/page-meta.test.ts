import { describe, expect, it } from 'vitest';
import { buildPageJsonLd, resolvePageMeta, type ImageMeta, type PageMeta } from './page-meta';

const IMAGE_VERSION = '20260913';

const DEFAULT_IMAGE: ImageMeta = {
  primary: `https://osada.us/images/og-default.jpg?v=${IMAGE_VERSION}`,
  width: 1200,
  height: 630,
  alt: 'o-sumo 大相撲情報サイトのOGP画像',
};

const RIKISHI_IMAGE: ImageMeta = {
  primary: `https://osada.us/images/og-rikishi-default.jpg?v=${IMAGE_VERSION}`,
  width: 1200,
  height: 630,
  alt: 'o-sumo 力士プロフィールページのOGP画像',
};

const COMPARE_IMAGE: ImageMeta = {
  primary: `https://osada.us/images/og-compare-default.jpg?v=${IMAGE_VERSION}`,
  width: 1200,
  height: 630,
  alt: 'o-sumo 力士比較ページのOGP画像',
};

function imageFor(pathname: string): ImageMeta {
  if (pathname === '/compare/' || pathname.startsWith('/compare/')) return COMPARE_IMAGE;
  if (/^\/rikishi\/[1-9]\d*\/?$/.test(pathname)) return RIKISHI_IMAGE;
  return DEFAULT_IMAGE;
}

describe('resolvePageMeta', () => {
  it.each([
    ['/', 'o-sumo | 大相撲 番付・星取表', '大相撲の番付・星取表・取組スケジュール・場所結果を網羅したアーカイブ。最新の場所進行中も取組結果をリアルタイムで更新します。'],
    ['/archives/', '大相撲の場所別アーカイブ | o-sumo', '大相撲の過去の場所ごとの番付、取組結果、取組予定を閲覧できます。'],
    ['/rikishi/', '力士一覧 | o-sumo', '大相撲力士のプロフィール、番付、成績を一覧で確認できます。'],
    ['/my-rikishi/', 'マイ力士 | o-sumo', '気になる力士を端末に保存し、ログインすると端末間で同期できます。'],
    ['/compare/', '力士比較 | o-sumo', '幕内・十両力士の合口、体格、得意決まり手、通算成績を比較できます。'],
    ['/gyoji/', '行司名鑑 | o-sumo', '大相撲の現役行司の階級とプロフィールを一覧で紹介します。'],
    ['/yobidashi/', '呼出名鑑 | o-sumo', '大相撲の現役呼出の階級とプロフィールを一覧で紹介します。'],
    ['/kimarite/', '決まり手一覧 | o-sumo', '大相撲の決まり手を分類別にわかりやすく紹介します。'],
    ['/analytics/', '大相撲データ分析 | o-sumo', '大相撲の取組結果、力士、決まり手のデータを分析します。'],
    ['/about/', '当サイトについて・プライバシーポリシー | o-sumo', 'o-sumoのサイト概要、データ出典、免責事項、プライバシーポリシー、利用規約、運営者情報について。'],
    ['/privacy/', 'プライバシーポリシー | o-sumo', 'ウェブサイトと MCP サーバーで扱う情報、任意の Google ログイン、保存と削除について説明します。'],
    ['/terms/', '利用規約 | o-sumo', '縦綱 / o-sumo のウェブサイトと MCP サーバーの利用条件。'],
    ['/202607-banzuke/', '2026年7月場所 番付 | o-sumo', '2026年7月場所の番付を確認できます。'],
    ['/202607-torikumi/', '2026年7月場所 取組・星取表 | o-sumo', '2026年7月場所の取組結果と星取表を確認できます。'],
    ['/202607-yotei/', '2026年7月場所 取組予定 | o-sumo', '2026年7月場所の取組予定を確認できます。'],
    ['/20260712-torikumi/', '2026年7月場所 初日 取組・星取表 | o-sumo', '2026年7月場所初日の取組結果と星取表を確認できます。'],
    ['/20260310-yotei/', '2026年3月場所 三日目 取組予定 | o-sumo', '2026年3月場所三日目の取組予定を確認できます。'],
    ['/20260731-torikumi/', '404 ページが見つかりません | o-sumo', 'お探しのページは見つかりませんでした。o-sumoの最新取組表や番付一覧をご確認ください。', '/404'],
    ['/20260731-yotei/', '404 ページが見つかりません | o-sumo', 'お探しのページは見つかりませんでした。o-sumoの最新取組表や番付一覧をご確認ください。', '/404'],
    ['/209901-banzuke/', '404 ページが見つかりません | o-sumo', 'お探しのページは見つかりませんでした。o-sumoの最新取組表や番付一覧をご確認ください。', '/404'],
    ['/209901-torikumi/', '404 ページが見つかりません | o-sumo', 'お探しのページは見つかりませんでした。o-sumoの最新取組表や番付一覧をご確認ください。', '/404'],
    ['/rikishi/1/', '力士プロフィール | o-sumo', '大相撲力士のプロフィール、番付、成績を確認できます。'],
    ['/gyoji/1986/', '行司プロフィール | o-sumo', '大相撲の行司プロフィールを紹介します。'],
    ['/yobidashi/1935/', '呼出プロフィール | o-sumo', '大相撲の呼出プロフィールを紹介します。'],
    ['/gyoji/not-a-number/', '404 ページが見つかりません | o-sumo', 'お探しのページは見つかりませんでした。o-sumoの最新取組表や番付一覧をご確認ください。', '/404'],
    ['/unknown/', '404 ページが見つかりません | o-sumo', 'お探しのページは見つかりませんでした。o-sumoの最新取組表や番付一覧をご確認ください。', '/404'],
  ])('resolves Japanese metadata for %s', (pathname, title, description, canonicalPath = pathname) => {
    const canonicalForImage = canonicalPath === '/404' ? pathname : canonicalPath;
    const expected: Record<string, unknown> = {
      title,
      description,
      canonicalUrl: `https://osada.us${canonicalPath}`,
      imageUrl: imageFor(canonicalForImage).primary,
      image: imageFor(canonicalForImage),
      type: 'website',
    };
    if (canonicalPath === '/404') {
      expected.isNotFound = true;
    }
    expect(resolvePageMeta(pathname)).toEqual(expected);
  });

  it('normalizes a non-canonical route before creating its canonical URL', () => {
    expect(resolvePageMeta('/202607-torikumi')).toMatchObject({
      canonicalUrl: 'https://osada.us/202607-torikumi/',
    });
  });

  it('picks the rikishi OGP image for /rikishi/{id}/ routes', () => {
    expect(resolvePageMeta('/rikishi/3842/').image).toEqual(RIKISHI_IMAGE);
  });

  it('picks the compare OGP image for /compare/ routes', () => {
    expect(resolvePageMeta('/compare/').image).toEqual(COMPARE_IMAGE);
    expect(resolvePageMeta('/compare/?ids=3842,4227').image).toEqual(COMPARE_IMAGE);
  });
});

const JSON_LD_ROUTES = [
  '/',
  '/archives/',
  '/rikishi/',
  '/rikishi/4227/',
  '/my-rikishi/',
  '/compare/',
  '/gyoji/',
  '/gyoji/1987/',
  '/yobidashi/',
  '/yobidashi/1935/',
  '/kimarite/',
  '/analytics/',
  '/about/',
  '/privacy/',
  '/terms/',
  '/202603-banzuke/',
  '/202603-torikumi/',
  '/202603-yotei/',
  '/20260310-yotei/',
  '/20260712-torikumi/',
  '/20261109-torikumi/',
  '/20261109-yotei/',
  '/unknown/',
] as const;

type JsonLdNode = Record<string, unknown>;

function jsonLdFor(pathname: string, override?: Partial<Pick<PageMeta, 'title' | 'description'>>) {
  const meta = { ...resolvePageMeta(pathname), ...override };
  const serialized = JSON.stringify(buildPageJsonLd(pathname, meta));
  return JSON.parse(serialized) as { '@context': string; '@graph': JsonLdNode[] };
}

function nodesOfType(doc: { '@graph': JsonLdNode[] }, type: string): JsonLdNode[] {
  return doc['@graph'].filter((node) => node['@type'] === type);
}

function crumbNames(doc: { '@graph': JsonLdNode[] }): string[] {
  const list = nodesOfType(doc, 'BreadcrumbList')[0];
  const items = list?.itemListElement as Array<{ name: string; position: number; item: string }>;
  return items.map((item) => item.name);
}

describe('buildPageJsonLd', () => {
  it.each(JSON_LD_ROUTES)('emits JSON-LD that JSON.parse accepts for %s', (pathname) => {
    const doc = jsonLdFor(pathname);

    expect(doc['@context']).toBe('https://schema.org');
    expect(nodesOfType(doc, 'WebSite')).toHaveLength(1);
    expect(nodesOfType(doc, 'BreadcrumbList')).toHaveLength(1);
    expect(JSON.stringify(doc)).not.toContain('SearchAction');
    const website = nodesOfType(doc, 'WebSite')[0];
    expect(website).toMatchObject({
      name: 'o-sumo',
      url: 'https://osada.us/',
    });
    expect(website).not.toHaveProperty('potentialAction');
  });

  it('adds SearchAction only when a search URL template is supplied', () => {
    const doc = JSON.parse(JSON.stringify(buildPageJsonLd('/', resolvePageMeta('/'), {
      searchUrl: 'https://osada.us/search/?q={search_term_string}',
    }))) as { '@graph': JsonLdNode[] };
    const website = nodesOfType(doc, 'WebSite')[0];

    expect(website.potentialAction).toEqual({
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://osada.us/search/?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    });
  });

  it('matches the visible breadcrumb hierarchy on fixed and basho pages', () => {
    expect(crumbNames(jsonLdFor('/archives/'))).toEqual(['ホーム', 'アーカイブ']);
    expect(crumbNames(jsonLdFor('/kimarite/'))).toEqual(['ホーム', '決まり手']);
    expect(crumbNames(jsonLdFor('/analytics/'))).toEqual(['ホーム', '大相撲アナリティクス']);
    expect(crumbNames(jsonLdFor('/compare/'))).toEqual(['ホーム', '力士プロフィール', '力士比較']);
    expect(crumbNames(jsonLdFor('/202603-banzuke/'))).toEqual(['ホーム', '番付', '令和八年三月場所']);
    expect(crumbNames(jsonLdFor('/202603-torikumi/'))).toEqual(['ホーム', '取組', '令和八年三月場所']);
    expect(crumbNames(jsonLdFor('/20261109-torikumi/'))).toEqual([
      'ホーム',
      '令和八年十一月場所',
      '二日目： 令和8年11月9日(月)',
    ]);

    const banzuke = nodesOfType(jsonLdFor('/202603-banzuke/'), 'BreadcrumbList')[0];
    const items = banzuke.itemListElement as Array<{ position: number; item: string }>;
    expect(items.map((item) => item.item)).toEqual([
      'https://osada.us/',
      'https://osada.us/archives/',
      'https://osada.us/202603-banzuke/',
    ]);
    expect(items.map((item) => item.position)).toEqual([1, 2, 3]);
  });

  it('describes a November day as a SportsEvent at 福岡国際センター', () => {
    const doc = jsonLdFor('/20261109-torikumi/');
    const event = nodesOfType(doc, 'SportsEvent')[0];

    expect(nodesOfType(doc, 'Person')).toHaveLength(0);
    expect(event).toMatchObject({
      name: '2026年11月場所 二日目 取組・星取表',
      startDate: '2026-11-09',
      url: 'https://osada.us/20261109-torikumi/',
      location: {
        '@type': 'Place',
        name: '福岡国際センター',
        address: {
          '@type': 'PostalAddress',
          addressLocality: '福岡市',
          addressCountry: 'JP',
        },
      },
    });
  });

  it('uses the March basho venue for a March day page', () => {
    const doc = jsonLdFor('/20260310-yotei/');
    expect(nodesOfType(doc, 'SportsEvent')[0]).toMatchObject({
      name: '2026年3月場所 三日目 取組予定',
      startDate: '2026-03-10',
      location: { '@type': 'Place', name: 'エディオンアリーナ大阪' },
    });
    expect(nodesOfType(jsonLdFor('/202603-torikumi/'), 'SportsEvent')).toHaveLength(0);
  });

  it('describes a loaded rikishi profile as a Person and keeps the list page as a trail only', () => {
    const generic = jsonLdFor('/rikishi/4227/');
    expect(nodesOfType(generic, 'Person')[0]).toMatchObject({
      name: '力士',
      jobTitle: '力士',
      url: 'https://osada.us/rikishi/4227/',
    });
    expect(crumbNames(generic)).toEqual(['ホーム', '力士プロフィール', '力士プロフィール']);

    const loaded = jsonLdFor('/rikishi/4227/', {
      title: '大の里 | 力士プロフィール | o-sumo',
      description: '大の里の大相撲力士プロフィール。番付、成績、出身地などを紹介します。',
    });
    expect(nodesOfType(loaded, 'Person')[0]).toMatchObject({
      name: '大の里',
      description: '大の里の大相撲力士プロフィール。番付、成績、出身地などを紹介します。',
      url: 'https://osada.us/rikishi/4227/',
    });
    expect(crumbNames(loaded)).toEqual(['ホーム', '力士プロフィール', '大の里']);
    expect(nodesOfType(jsonLdFor('/rikishi/'), 'Person')).toHaveLength(0);
  });
});
