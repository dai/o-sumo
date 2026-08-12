import { describe, expect, it } from 'vitest';
import { resolvePageMeta } from './page-meta';

describe('resolvePageMeta', () => {
  it.each([
    ['/', 'o-sumo | 大相撲 番付・星取表', '大相撲の番付・星取表・取組スケジュール・場所結果を網羅したアーカイブ。最新の場所進行中も取組結果をリアルタイムで更新します。'],
    ['/archives/', '大相撲の場所別アーカイブ | o-sumo', '大相撲の過去の場所ごとの番付、取組結果、取組予定を閲覧できます。'],
    ['/rikishi/', '力士一覧 | o-sumo', '大相撲力士のプロフィール、番付、成績を一覧で確認できます。'],
    ['/gyoji/', '行司名鑑 | o-sumo', '大相撲の現役行司の階級とプロフィールを一覧で紹介します。'],
    ['/yobidashi/', '呼出名鑑 | o-sumo', '大相撲の現役呼出の階級とプロフィールを一覧で紹介します。'],
    ['/kimarite/', '決まり手一覧 | o-sumo', '大相撲の決まり手を分類別にわかりやすく紹介します。'],
    ['/analytics/', '大相撲データ分析 | o-sumo', '大相撲の取組結果、力士、決まり手のデータを分析します。'],
    ['/202607-banzuke/', '2026年7月場所 番付 | o-sumo', '2026年7月場所の番付を確認できます。'],
    ['/202607-torikumi/', '2026年7月場所 取組・星取表 | o-sumo', '2026年7月場所の取組結果と星取表を確認できます。'],
    ['/202607-yotei/', '2026年7月場所 取組予定 | o-sumo', '2026年7月場所の取組予定を確認できます。'],
    ['/20260712-torikumi/', '2026年7月場所 初日 取組・星取表 | o-sumo', '2026年7月場所初日の取組結果と星取表を確認できます。'],
    ['/20260310-yotei/', '2026年3月場所 三日目 取組予定 | o-sumo', '2026年3月場所三日目の取組予定を確認できます。'],
    ['/20260731-torikumi/', 'o-sumo | 大相撲 番付・星取表', '大相撲の番付・星取表・取組スケジュール・場所結果を網羅したアーカイブ。最新の場所進行中も取組結果をリアルタイムで更新します。', '/'],
    ['/20260731-yotei/', 'o-sumo | 大相撲 番付・星取表', '大相撲の番付・星取表・取組スケジュール・場所結果を網羅したアーカイブ。最新の場所進行中も取組結果をリアルタイムで更新します。', '/'],
    ['/209901-banzuke/', 'o-sumo | 大相撲 番付・星取表', '大相撲の番付・星取表・取組スケジュール・場所結果を網羅したアーカイブ。最新の場所進行中も取組結果をリアルタイムで更新します。', '/'],
    ['/209901-torikumi/', 'o-sumo | 大相撲 番付・星取表', '大相撲の番付・星取表・取組スケジュール・場所結果を網羅したアーカイブ。最新の場所進行中も取組結果をリアルタイムで更新します。', '/'],
    ['/rikishi/1/', '力士プロフィール | o-sumo', '大相撲力士のプロフィール、番付、成績を確認できます。'],
    ['/gyoji/1986/', '行司プロフィール | o-sumo', '大相撲の行司プロフィールを紹介します。'],
    ['/yobidashi/1935/', '呼出プロフィール | o-sumo', '大相撲の呼出プロフィールを紹介します。'],
    ['/gyoji/not-a-number/', 'o-sumo | 大相撲 番付・星取表', '大相撲の番付・星取表・取組スケジュール・場所結果を網羅したアーカイブ。最新の場所進行中も取組結果をリアルタイムで更新します。', '/'],
    ['/unknown/', 'o-sumo | 大相撲 番付・星取表', '大相撲の番付・星取表・取組スケジュール・場所結果を網羅したアーカイブ。最新の場所進行中も取組結果をリアルタイムで更新します。', '/'],
  ])('resolves Japanese metadata for %s', (pathname, title, description, canonicalPath = pathname) => {
    expect(resolvePageMeta(pathname)).toEqual({
      title,
      description,
      canonicalUrl: `https://osada.us${canonicalPath}`,
      imageUrl: 'https://osada.us/og-default.jpg',
      type: 'website',
    });
  });

  it('normalizes a non-canonical route before creating its canonical URL', () => {
    expect(resolvePageMeta('/202607-torikumi')).toMatchObject({
      canonicalUrl: 'https://osada.us/202607-torikumi/',
    });
  });
});
