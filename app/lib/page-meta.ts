import { normalizeCanonicalPath, SITE_ORIGIN, toCanonicalUrl } from './site-url';
import { findArchiveDay, getArchiveRouteConfigByMonthKey } from './torikumi-routes';

export type PageMeta = {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl: string;
  type: 'website';
};

const IMAGE_URL = `${SITE_ORIGIN}/og-default.jpg`;

const HOME_META = {
  title: 'o-sumo | 大相撲 番付・星取表',
  description: '大相撲の番付・星取表・取組スケジュール・場所結果を網羅したアーカイブ。最新の場所進行中も取組結果をリアルタイムで更新します。',
} as const;

function homeMeta(): PageMeta {
  return pageMeta('/', HOME_META.title, HOME_META.description);
}

function bashoLabel(year: string, month: string): string {
  return `${year}年${Number(month)}月場所`;
}

function pageMeta(pathname: string, title: string, description: string): PageMeta {
  return {
    title,
    description,
    canonicalUrl: toCanonicalUrl(pathname),
    imageUrl: IMAGE_URL,
    type: 'website',
  };
}

export function resolvePageMeta(pathname: string): PageMeta {
  const canonicalPath = normalizeCanonicalPath(pathname);

  if (canonicalPath === '/') return homeMeta();

  const fixedPages: Record<string, { title: string; description: string }> = {
    '/archives/': {
      title: '大相撲の場所別アーカイブ | o-sumo',
      description: '大相撲の過去の場所ごとの番付、取組結果、取組予定を閲覧できます。',
    },
    '/rikishi/': {
      title: '力士一覧 | o-sumo',
      description: '大相撲力士のプロフィール、番付、成績を一覧で確認できます。',
    },
    '/kimarite/': {
      title: '決まり手一覧 | o-sumo',
      description: '大相撲の決まり手を分類別にわかりやすく紹介します。',
    },
    '/analytics/': {
      title: '大相撲データ分析 | o-sumo',
      description: '大相撲の取組結果、力士、決まり手のデータを分析します。',
    },
  };
  const fixedPage = fixedPages[canonicalPath];
  if (fixedPage) return pageMeta(canonicalPath, fixedPage.title, fixedPage.description);

  const banzukeMatch = canonicalPath.match(/^\/(\d{4})(\d{2})-banzuke\/$/);
  if (banzukeMatch) {
    const [, year, month] = banzukeMatch;
    if (!getArchiveRouteConfigByMonthKey(`${year}${month}`)) return homeMeta();
    const basho = bashoLabel(year, month);
    return pageMeta(canonicalPath, `${basho} 番付 | o-sumo`, `${basho}の番付を確認できます。`);
  }

  const hubMatch = canonicalPath.match(/^\/(\d{4})(\d{2})-(torikumi|yotei)\/$/);
  if (hubMatch) {
    const [, year, month, mode] = hubMatch;
    if (!getArchiveRouteConfigByMonthKey(`${year}${month}`)) return homeMeta();
    const basho = bashoLabel(year, month);
    const isResult = mode === 'torikumi';
    return pageMeta(
      canonicalPath,
      `${basho} ${isResult ? '取組・星取表' : '取組予定'} | o-sumo`,
      `${basho}の${isResult ? '取組結果と星取表' : '取組予定'}を確認できます。`,
    );
  }

  const dayMatch = canonicalPath.match(/^\/(\d{4})(\d{2})(\d{2})-(torikumi|yotei)\/$/);
  if (dayMatch) {
    const [, year, month, day, mode] = dayMatch;
    const basho = bashoLabel(year, month);
    const isResult = mode === 'torikumi';
    const archiveDay = findArchiveDay(`${year}${month}${day}`, isResult ? 'result' : 'schedule');
    if (!archiveDay) return homeMeta();
    const dayLabel = archiveDay.label;
    return pageMeta(
      canonicalPath,
      `${basho} ${dayLabel} ${isResult ? '取組・星取表' : '取組予定'} | o-sumo`,
      `${basho}${dayLabel}の${isResult ? '取組結果と星取表' : '取組予定'}を確認できます。`,
    );
  }

  if (/^\/rikishi\/[^/]+\/$/.test(canonicalPath)) {
    return pageMeta(
      canonicalPath,
      '力士プロフィール | o-sumo',
      '大相撲力士のプロフィール、番付、成績を確認できます。',
    );
  }

  return homeMeta();
}
