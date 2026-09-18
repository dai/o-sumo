import { describe, expect, it } from 'vitest';
import { resolvePageMeta, type ImageMeta } from './page-meta';

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
    ['/compare/', '力士比較 | o-sumo', '幕内・十両力士の合口、体格、得意決まり手、通算成績を比較できます。'],
    ['/gyoji/', '行司名鑑 | o-sumo', '大相撲の現役行司の階級とプロフィールを一覧で紹介します。'],
    ['/yobidashi/', '呼出名鑑 | o-sumo', '大相撲の現役呼出の階級とプロフィールを一覧で紹介します。'],
    ['/kimarite/', '決まり手一覧 | o-sumo', '大相撲の決まり手を分類別にわかりやすく紹介します。'],
    ['/analytics/', '大相撲データ分析 | o-sumo', '大相撲の取組結果、力士、決まり手のデータを分析します。'],
    ['/about/', '当サイトについて・プライバシーポリシー | o-sumo', 'o-sumoのサイト概要、データ出典、免責事項、プライバシーポリシー、広告配信、運営者情報について。'],
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
