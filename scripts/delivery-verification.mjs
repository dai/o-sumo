import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const SITE_ORIGIN = 'https://osada.us';
const DEFAULT_IMAGE_URL = `${SITE_ORIGIN}/og-default.jpg`;
const HEAD_FIELDS = [
  'canonical',
  'description',
  'og:title',
  'og:description',
  'og:url',
  'og:image',
  'og:type',
  'og:site_name',
  'og:image:width',
  'og:image:height',
  'twitter:card',
  'twitter:title',
  'twitter:description',
  'twitter:image',
];

const REPRESENTATIVE_PAGES = [
  {
    path: '/',
    title: 'o-sumo | 大相撲 番付・星取表',
    description: '大相撲の番付・星取表・取組スケジュール・場所結果を網羅したアーカイブ。最新の場所進行中も取組結果をリアルタイムで更新します。',
  },
  {
    path: '/archives/',
    title: '大相撲の場所別アーカイブ | o-sumo',
    description: '大相撲の過去の場所ごとの番付、取組結果、取組予定を閲覧できます。',
  },
  {
    path: '/rikishi/3842/',
    title: '力士プロフィール | o-sumo',
    description: '大相撲力士のプロフィール、番付、成績を確認できます。',
  },
  {
    path: '/202607-banzuke/',
    title: '2026年7月場所 番付 | o-sumo',
    description: '2026年7月場所の番付を確認できます。',
  },
  {
    path: '/202607-torikumi/',
    title: '2026年7月場所 取組・星取表 | o-sumo',
    description: '2026年7月場所の取組結果と星取表を確認できます。',
  },
  {
    path: '/20260712-torikumi/',
    title: '2026年7月場所 初日 取組・星取表 | o-sumo',
    description: '2026年7月場所初日の取組結果と星取表を確認できます。',
  },
  {
    path: '/20260310-yotei/',
    title: '2026年3月場所 三日目 取組予定 | o-sumo',
    description: '2026年3月場所三日目の取組予定を確認できます。',
  },
];

const FIXED_SITEMAP_PATHS = ['/', '/archives/', '/rikishi/', '/kimarite/', '/analytics/'];

export function getRepresentativePages() {
  return REPRESENTATIVE_PAGES.map((page) => ({ ...page, canonicalUrl: `${SITE_ORIGIN}${page.path}` }));
}

export function toEnvironmentUrl(baseUrl, path) {
  return `${baseUrl.replace(/\/$/, '')}${path}`;
}

export function getPendingTorikumiPaths(torikumiDocument) {
  const pendingPaths = [];
  for (const [days, suffix] of [[torikumiDocument?.resultDays, 'torikumi'], [torikumiDocument?.scheduleDays, 'yotei']]) {
    if (!Array.isArray(days)) continue;
    for (const day of days) {
      if (day?.status === 'pending' && /^\d{8}$/.test(day.pathDate)) {
        pendingPaths.push(`/${day.pathDate}-${suffix}/`);
      }
    }
  }
  return pendingPaths;
}

export function summarizeEnvironment(name, baseUrl, routingStatus, sitemapStatus, headStatus) {
  const statuses = [routingStatus, sitemapStatus, headStatus];
  return {
    name,
    baseUrl,
    routingStatus,
    sitemapStatus,
    headStatus,
    status: statuses.includes('ISSUE') ? 'ISSUE' : (statuses.every((status) => status === 'SKIPPED') ? 'SKIPPED' : 'OK'),
  };
}

export function assessRouting(checks) {
  const issues = checks.flatMap((check) => {
    const actualLocation = check.actualLocation || '';
    if (check.actualStatus === check.expectedStatus && actualLocation === check.expectedLocation) {
      return [];
    }
    return [`${check.path}: expected ${check.expectedStatus} ${check.expectedLocation || '-'}, received ${check.actualStatus} ${actualLocation || '-'}`];
  });
  return { status: issues.length === 0 ? 'OK' : 'ISSUE', issues };
}

export function deriveRequiredSitemapPaths(rikishiDocument, torikumiDocument) {
  const paths = new Set(FIXED_SITEMAP_PATHS);
  const issues = [];

  const rikishi = rikishiDocument?.rikishi;
  if (!Array.isArray(rikishi)) {
    issues.push('rikishi index must contain a rikishi array');
  } else {
    const ids = new Set();
    rikishi.forEach((item, index) => {
      const id = item?.id;
      if (!Number.isInteger(id) || id <= 0) {
        issues.push(`rikishi index item at index ${index} must have a positive integer id`);
      } else if (ids.has(id)) {
        issues.push(`rikishi index contains duplicate id: ${id}`);
      } else {
        ids.add(id);
        paths.add(`/rikishi/${id}/`);
      }
    });
  }

  const monthKeys = new Set();
  for (const [field, suffix] of [['resultDays', 'torikumi'], ['scheduleDays', 'yotei']]) {
    const days = torikumiDocument?.[field];
    if (!Array.isArray(days)) {
      issues.push(`torikumi ${field} must be an array`);
      continue;
    }
    days.forEach((day, index) => {
      if (!/^\d{8}$/.test(day?.pathDate ?? '')) {
        issues.push(`torikumi ${field} item at index ${index} must have an 8-digit pathDate`);
        return;
      }
      monthKeys.add(day.pathDate.slice(0, 6));
      if (day.status === 'published') {
        paths.add(`/${day.pathDate}-${suffix}/`);
      } else if (day.status !== 'pending') {
        issues.push(`torikumi ${field} item at index ${index} has invalid status`);
      }
    });
  }
  if (monthKeys.size === 0) {
    issues.push('torikumi API contains no valid current month');
  }
  for (const monthKey of monthKeys) {
    paths.add(`/${monthKey}-banzuke/`);
    paths.add(`/${monthKey}-torikumi/`);
    paths.add(`/${monthKey}-yotei/`);
  }

  return { paths: Array.from(paths), issues };
}

export function assessSitemapLocations(locations, excludedPaths = [], requiredPaths = [], sourceIssues = []) {
  const issues = [...sourceIssues];
  const paths = [];
  const seen = new Set();
  const excluded = new Set(excludedPaths);

  if (locations.length === 0) {
    issues.push('sitemap must contain at least one location');
  }

  for (const location of locations) {
    if (seen.has(location)) {
      issues.push(`duplicate sitemap location: ${location}`);
      continue;
    }
    seen.add(location);

    let url;
    try {
      url = new URL(location);
    } catch {
      issues.push(`sitemap location is not absolute: ${location}`);
      continue;
    }

    if (url.origin !== SITE_ORIGIN || url.protocol !== 'https:') {
      issues.push(`sitemap location has non-canonical origin: ${location}`);
    }
    if (url.search || url.hash) {
      issues.push(`sitemap location must not include query or fragment: ${location}`);
    }
    if (url.pathname !== '/' && !url.pathname.endsWith('/')) {
      issues.push(`sitemap location lacks trailing slash: ${location}`);
    }
    if (url.pathname.includes('//')) {
      issues.push(`sitemap location has duplicate slash: ${location}`);
    }
    if (url.pathname.includes('/api/') || url.pathname.includes('404') || /-(?:banduke|o-sumo)\/$/.test(url.pathname)) {
      issues.push(`sitemap location is not indexable: ${location}`);
    }
    if (excluded.has(url.pathname)) {
      issues.push(`sitemap location is excluded: ${location}`);
    }
    paths.push(url.pathname);
  }

  const presentPaths = new Set(paths);
  for (const requiredPath of requiredPaths) {
    if (!presentPaths.has(requiredPath)) {
      issues.push(`sitemap is missing required path: ${requiredPath}`);
    }
  }

  return { status: issues.length === 0 ? 'OK' : 'ISSUE', paths, issues };
}

export function assessHeadMetadata(metadata, expected = {}) {
  const expectations = typeof expected === 'string' ? { canonicalUrl: expected } : expected;
  const issues = [];
  for (const field of HEAD_FIELDS) {
    const values = metadata[field] ?? [];
    if (values.length !== 1) {
      issues.push(`${field} must appear exactly once (found ${values.length})`);
    } else if (!values[0]) {
      issues.push(`${field} must have content`);
    }
  }

  const canonical = metadata.canonical ?? [];
  const ogUrl = metadata['og:url'] ?? [];
  if (ogUrl.length === 1 && canonical.length > 0 && canonical.some((value) => value !== ogUrl[0])) {
    issues.push('canonical must equal og:url');
  }
  if (expectations.canonicalUrl && canonical.length === 1 && canonical[0] !== expectations.canonicalUrl) {
    issues.push(`canonical must equal ${expectations.canonicalUrl}`);
  }
  for (const imageField of ['og:image', 'twitter:image']) {
    const values = metadata[imageField] ?? [];
    if (values.length === 1 && values[0] !== DEFAULT_IMAGE_URL) {
      issues.push(`${imageField} must be ${DEFAULT_IMAGE_URL}`);
    }
  }
  if (expectations.title) {
    for (const field of ['title', 'og:title', 'twitter:title']) {
      const values = metadata[field] ?? [];
      if (values.length !== 1 || values[0] !== expectations.title) {
        issues.push(`${field} must equal ${expectations.title}`);
      }
    }
  }
  if (expectations.description) {
    for (const field of ['description', 'og:description', 'twitter:description']) {
      const values = metadata[field] ?? [];
      if (values.length !== 1 || values[0] !== expectations.description) {
        issues.push(`${field} must equal ${expectations.description}`);
      }
    }
  }

  return { status: issues.length === 0 ? 'OK' : 'ISSUE', issues };
}

export function assessCollectedEnvironment({
  routing,
  sitemapLocations,
  sitemapExcludedPaths = [],
  sitemapRequiredPaths = [],
  sitemapSourceIssues = [],
  rikishiDocument,
  torikumiDocument,
}) {
  const excludedPaths = Array.isArray(sitemapExcludedPaths) ? sitemapExcludedPaths : [];
  const requiredPaths = Array.isArray(sitemapRequiredPaths) ? sitemapRequiredPaths : [];
  const sourceIssues = Array.isArray(sitemapSourceIssues)
    ? sitemapSourceIssues
    : (sitemapSourceIssues ? [sitemapSourceIssues] : []);
  const derivesFromEnvironment = rikishiDocument !== undefined || torikumiDocument !== undefined;
  const derived = derivesFromEnvironment
    ? deriveRequiredSitemapPaths(rikishiDocument, torikumiDocument)
    : { paths: requiredPaths, issues: [] };
  return {
    routing: assessRouting(routing),
    sitemap: assessSitemapLocations(
      sitemapLocations,
      excludedPaths,
      derived.paths,
      [...sourceIssues, ...derived.issues],
    ),
  };
}

async function readHeadMetadata(page) {
  return page.evaluate(() => ({
    title: [document.title],
    canonical: Array.from(document.head.querySelectorAll('link[rel="canonical"]'), (element) => element.href),
    description: Array.from(document.head.querySelectorAll('meta[name="description"]'), (element) => element.content),
    'og:title': Array.from(document.head.querySelectorAll('meta[property="og:title"]'), (element) => element.content),
    'og:description': Array.from(document.head.querySelectorAll('meta[property="og:description"]'), (element) => element.content),
    'og:url': Array.from(document.head.querySelectorAll('meta[property="og:url"]'), (element) => element.content),
    'og:image': Array.from(document.head.querySelectorAll('meta[property="og:image"]'), (element) => element.content),
    'og:type': Array.from(document.head.querySelectorAll('meta[property="og:type"]'), (element) => element.content),
    'og:site_name': Array.from(document.head.querySelectorAll('meta[property="og:site_name"]'), (element) => element.content),
    'og:image:width': Array.from(document.head.querySelectorAll('meta[property="og:image:width"]'), (element) => element.content),
    'og:image:height': Array.from(document.head.querySelectorAll('meta[property="og:image:height"]'), (element) => element.content),
    'twitter:card': Array.from(document.head.querySelectorAll('meta[name="twitter:card"]'), (element) => element.content),
    'twitter:title': Array.from(document.head.querySelectorAll('meta[name="twitter:title"]'), (element) => element.content),
    'twitter:description': Array.from(document.head.querySelectorAll('meta[name="twitter:description"]'), (element) => element.content),
    'twitter:image': Array.from(document.head.querySelectorAll('meta[name="twitter:image"]'), (element) => element.content),
  }));
}

export async function inspectRenderedHeads(baseUrl) {
  const representativePages = getRepresentativePages();
  const browser = await chromium.launch({ headless: true });
  try {
    const pages = [];
    for (const representativePage of representativePages) {
      const { path } = representativePage;
      const page = await browser.newPage();
      try {
        await page.goto(toEnvironmentUrl(baseUrl, path), { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => document.head.querySelectorAll('link[rel="canonical"]').length === 1, undefined, { timeout: 15_000 });
        const metadata = await readHeadMetadata(page);
        const assessment = assessHeadMetadata(metadata, representativePage);
        pages.push({ path, ...assessment, metadata, error: null });
      } catch (error) {
        pages.push({ path, status: 'ISSUE', issues: [error instanceof Error ? error.message : String(error)], metadata: null, error: error instanceof Error ? error.message : String(error) });
      } finally {
        await page.close();
      }
    }
    const issues = pages.flatMap((page) => page.issues.map((issue) => `${page.path}: ${issue}`));
    return { status: issues.length === 0 ? 'OK' : 'ISSUE', pages, issues };
  } finally {
    await browser.close();
  }
}

async function main() {
  if (process.argv.includes('--validate')) {
    const input = await new Promise((resolve, reject) => {
      let text = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', (chunk) => { text += chunk; });
      process.stdin.on('end', () => resolve(text));
      process.stdin.on('error', reject);
    });
    process.stdout.write(`${JSON.stringify(assessCollectedEnvironment(JSON.parse(input)))}\n`);
    return;
  }
  const baseUrlIndex = process.argv.indexOf('--base-url');
  const baseUrl = baseUrlIndex >= 0 ? process.argv[baseUrlIndex + 1] : undefined;
  if (!baseUrl) {
    throw new Error('Usage: node scripts/delivery-verification.mjs --base-url <URL>');
  }
  process.stdout.write(`${JSON.stringify(await inspectRenderedHeads(baseUrl))}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack : error}\n`);
    process.exitCode = 1;
  });
}
