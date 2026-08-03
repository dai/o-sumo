/**
 * Build Markdown views for the main routes so AI agents that request
 * `Accept: text/markdown` get a meaningful response even before
 * Cloudflare Pages' Markdown-for-Agents negotiation kicks in. This
 * script is invoked by `vite.config.ts` (`agentSkillsPlugin` style)
 * after the main bundle is written.
 *
 * Output: `dist/<route>/index.md` for each route in `ROUTES`.
 */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readdirSync } from 'node:fs';

interface RikishiRow {
  id: number;
  name: string;
  yomi: string;
  currentRank: string;
  profileUrl: string;
}

interface KimariteRow {
  id: string;
  nameJa: string;
  reading: string;
  romaji: string;
  english: string;
  category: string;
  descriptionJa: string;
}

interface RankGroup {
  title: string;
  east: Array<{ id: number; name: string; yomi: string; rank: string; side: 'east' | 'west' }>;
  west: Array<{ id: number; name: string; yomi: string; rank: string; side: 'east' | 'west' }>;
}

interface BanzukeDocument {
  bashoName: string;
  year: string;
  updatedAt: string;
  makuuchi: RankGroup[];
  juryo: RankGroup[];
}

interface TorikumiDocument {
  bashoId: string;
  bashoName: string;
  year: string;
  resultUpdatedAt?: string;
  scheduleUpdatedAt?: string;
  resultDays?: ReadonlyArray<{ day: number; isoDate: string; pathDate: string; label: string; status?: string }>;
  scheduleDays?: ReadonlyArray<{ day: number; isoDate: string; pathDate: string; label: string; status?: string }>;
}

const SITE = 'https://osada.us';

function frontmatter(meta: { title: string; description?: string; canonical?: string }): string {
  const lines = ['---'];
  lines.push(`title: ${JSON.stringify(meta.title)}`);
  if (meta.description) lines.push(`description: ${JSON.stringify(meta.description)}`);
  if (meta.canonical) lines.push(`canonical: ${JSON.stringify(meta.canonical)}`);
  lines.push(`site: ${JSON.stringify(SITE)}`);
  lines.push('---');
  return lines.join('\n');
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function readJson<T>(publicDir: string, relativePath: string): T {
  return JSON.parse(readFileSync(resolve(publicDir, relativePath), 'utf8')) as T;
}

function rikishiTable(rows: ReadonlyArray<{ name: string; yomi: string; rank: string; side: 'east' | 'west'; id: number }>): string {
  if (rows.length === 0) return '_該当なし_\n';
  const header = '| 番付 | 東/西 | 四股名 | 読み | ID |';
  const sep = '| --- | --- | --- | --- | --- |';
  const body = rows
    .map((r) => `| ${r.rank} | ${r.side === 'east' ? '東' : '西'} | ${r.name} | ${r.yomi} | ${r.id} |`)
    .join('\n');
  return [header, sep, body].join('\n');
}

function renderBanzukeMarkdown(publicDir: string, monthKey: string, pathPrefix: string): string {
  const torikumi: TorikumiDocument = readJson<TorikumiDocument>(publicDir, 'api/v1/torikumi.json');
  const allBanzuke: Record<string, BanzukeDocument> = {};

  // Try the current basho (which the in-memory fixture uses) plus any
  // embedded per-month snapshots.  We only need a single title string per
  // month key; fall back to the LIVE basho when a snapshot is absent.
  try {
    const live = readJson<BanzukeDocument>(publicDir, 'api/v1/banzuke.json');
    allBanzuke[monthKey] = live;
  } catch {
    // ignore — handled below
  }

  const document = allBanzuke[monthKey];
  if (!document) {
    // Even without a banzuke.json snapshot, we can still describe the
    // basho using the torikumi metadata.
    const bashoMeta = torikumi.bashoId === monthKey
      ? `${torikumi.year} ${torikumi.bashoName}`
      : `${monthKey} 場所`;
    return renderMarkdownPage({
      title: `${bashoMeta} 番付 | o-sumo`,
      description: `${bashoMeta} の番付を確認できます。`,
      canonical: `${SITE}/${pathPrefix}-banzuke/`,
      body: `${bashoMeta} の番付データはこのビューでは未取得です。最新の JSON は ${SITE}/api/v1/banzuke.json を参照してください。`,
    });
  }

  const heading = `${document.year} ${document.bashoName}`;
  const sections: string[] = [];
  for (const division of [
    { title: '幕内', rows: document.makuuchi },
    { title: '十両', rows: document.juryo },
  ]) {
    const flatRows = division.rows.flatMap((group) => [
      ...group.east.map((r) => ({ ...r, side: 'east' as const })),
      ...group.west.map((r) => ({ ...r, side: 'west' as const })),
    ]);
    sections.push(`## ${division.title}\n\n${rikishiTable(flatRows)}`);
  }

  return renderMarkdownPage({
    title: `${heading} 番付 | o-sumo`,
    description: `${heading} の幕内・十両の番付を確認できます。`,
    canonical: `${SITE}/${pathPrefix}-banzuke/`,
    body: [
      `更新日: \`${document.updatedAt}\``,
      '',
      ...sections,
    ].join('\n'),
  });
}

function renderTorikumiMarkdown(
  publicDir: string,
  monthKey: string,
  pathPrefix: string,
  mode: 'result' | 'schedule',
): string {
  const torikumi: TorikumiDocument = readJson<TorikumiDocument>(publicDir, 'api/v1/torikumi.json');
  const liveMonthKey = typeof torikumi.bashoId === 'number'
    ? torikumi.resultDays?.[0]?.pathDate?.slice(0, 6) ?? String(torikumi.bashoId)
    : torikumi.bashoId;
  if (liveMonthKey !== monthKey) {
    return renderMarkdownPage({
      title: `${monthKey} ${mode === 'result' ? '取組結果' : '取組予定'} | o-sumo`,
      description: `${monthKey} の${mode === 'result' ? '取組結果' : '取組予定'}を確認できます。`,
      canonical: `${SITE}/${pathPrefix}-${mode === 'result' ? 'torikumi' : 'yotei'}/`,
      body: `${monthKey} の${mode === 'result' ? '取組結果' : '取組予定'}データはこのビューでは未取得です。`,
    });
  }
  const heading = `${torikumi.year} ${torikumi.bashoName}`;
  const days = mode === 'result' ? torikumi.resultDays : torikumi.scheduleDays;
  const updatedAt = mode === 'result' ? torikumi.resultUpdatedAt : torikumi.scheduleUpdatedAt;

  const dayLines = (days ?? []).map((d) => `- [${d.label}（${d.isoDate}）](${SITE}/${d.pathDate}-${mode === 'result' ? 'torikumi' : 'yotei'}/)`).join('\n');

  return renderMarkdownPage({
    title: `${heading} ${mode === 'result' ? '取組・星取表' : '取組予定'} | o-sumo`,
    description: `${heading} の${mode === 'result' ? '取組結果と星取表' : '取組予定'}を確認できます。`,
    canonical: `${SITE}/${pathPrefix}-${mode === 'result' ? 'torikumi' : 'yotei'}/`,
    body: [
      updatedAt ? `更新: \`${updatedAt}\`` : '',
      '',
      mode === 'result'
        ? '### 日別 取組結果\n\n' + (dayLines || '_データなし_')
        : '### 日別 取組予定\n\n' + (dayLines || '_データなし_'),
    ].filter(Boolean).join('\n'),
  });
}

function renderRikishiMarkdown(publicDir: string): string {
  const index = readJson<{ updatedAt: string; rikishi: RikishiRow[] }>(publicDir, 'api/v1/rikishi.json');
  const grouped = new Map<string, RikishiRow[]>();
  for (const rikishi of index.rikishi) {
    const key = rikishi.currentRank;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(rikishi);
  }
  const sections: string[] = [];
  // Display in canonical rank order.
  const order = ['横綱', '大関', '関脇', '小結', '前頭', '十両', '幕下', '三段目', '序二段', '序の口'];
  const sortedKeys = [...grouped.keys()].sort((a, b) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b, 'ja');
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  for (const key of sortedKeys) {
    const rows = grouped.get(key)!;
    const table = [
      '| 四股名 | 読み | ID | 公式プロフィール |',
      '| --- | --- | --- | --- |',
      ...rows.map((r) => `| ${r.name} | ${r.yomi} | ${r.id} | ${r.profileUrl} |`),
    ].join('\n');
    sections.push(`## ${key}\n\n${table}`);
  }

  return renderMarkdownPage({
    title: '力士一覧 | o-sumo',
    description: '大相撲力士のプロフィール、番付、成績を一覧で確認できます。',
    canonical: `${SITE}/rikishi/`,
    body: [
      `更新: \`${index.updatedAt}\``,
      '',
      `合計: ${index.rikishi.length} 名`,
      '',
      ...sections,
    ].join('\n'),
  });
}

function renderKimariteMarkdown(): string {
  // Read the JSON used by the SPA at build time so we don't depend on a
  // separately-installed runtime copy of the kimarite data.
  const sourcePath = resolve(process.cwd(), 'app/lib/kimarite-data.ts');
  const source = readFileSync(sourcePath, 'utf8');
  const matches = [...source.matchAll(/\{ id: '([a-z]+)', nameJa: '([^']+)', reading: '([^']+)', romaji: '([^']+)', english: '([^']+)', descriptionJa: '((?:[^'\\]|\\.)*)',[\s\S]*?category: '([a-z]+)'/g)];
  const rows: KimariteRow[] = matches.map((m) => ({
    id: m[1],
    nameJa: m[2],
    reading: m[3],
    romaji: m[4],
    english: m[5],
    descriptionJa: m[6].replace(/\\'/g, "'"),
    category: m[7],
  }));
  const byCategory = new Map<string, KimariteRow[]>();
  for (const row of rows) {
    if (!byCategory.has(row.category)) byCategory.set(row.category, []);
    byCategory.get(row.category)!.push(row);
  }
  const order = ['kihon', 'nage', 'kake', 'hineri', 'sori', 'tokushu'];
  const labels: Record<string, string> = {
    kihon: '基本',
    nage: '投げ',
    kake: '掛け',
    hineri: '捻り',
    sori: '反り',
    tokushu: '特殊',
  };
  const sections: string[] = [];
  for (const key of order) {
    const rows = byCategory.get(key) ?? [];
    if (rows.length === 0) continue;
    sections.push(`## ${labels[key] ?? key}\n\n` + rows.map((r) => `- **${r.nameJa}**（${r.reading} / ${r.romaji}）: ${r.descriptionJa}`).join('\n'));
  }

  return renderMarkdownPage({
    title: '決まり手一覧 | o-sumo',
    description: '大相撲の決まり手を分類別にわかりやすく紹介します。',
    canonical: `${SITE}/kimarite/`,
    body: [
      `合計: ${rows.length} 手`,
      '',
      ...sections,
    ].join('\n'),
  });
}

function renderAnalyticsMarkdown(): string {
  return renderMarkdownPage({
    title: '大相撲データ分析 | o-sumo',
    description: '大相撲の取組結果、力士、決まり手のデータを分析します。',
    canonical: `${SITE}/analytics/`,
    body: [
      'このサイトの分析ダッシュボードはインタラクティブに生成されます。',
      'AI エージェントはまず公開 JSON API を取得し、その後このページの Markdown ビューからナビゲートしてください。',
      '',
      '### 公開 JSON',
      '',
      `- [Banzuke JSON](${SITE}/api/v1/banzuke.json)`,
      `- [Torikumi JSON](${SITE}/api/v1/torikumi.json)`,
      `- [Rikishi JSON](${SITE}/api/v1/rikishi.json)`,
    ].join('\n'),
  });
}

function renderArchivesMarkdown(): string {
  return renderMarkdownPage({
    title: '大相撲の場所別アーカイブ | o-sumo',
    description: '大相撲の過去の場所ごとの番付、取組結果、取組予定を閲覧できます。',
    canonical: `${SITE}/archives/`,
    body: [
      'サポートされている月: 2026年3月場所 / 5月場所 / 7月場所',
      '',
      '- [2026年7月場所（現在）](https://osada.us/202607-torikumi/)',
      '- [2026年5月場所](https://osada.us/202605-torikumi/)',
      '- [2026年3月場所](https://osada.us/202603-torikumi/)',
    ].join('\n'),
  });
}

function renderHomeMarkdown(): string {
  return renderMarkdownPage({
    title: 'o-sumo | 大相撲 番付・星取表',
    description: '大相撲の番付・星取表・取組スケジュール・場所結果を網羅したアーカイブ。',
    canonical: `${SITE}/`,
    body: [
      'o-sumo は大相撲の番付・星取表・取組スケジュール・場所結果を網羅したアーカイブです。',
      '',
      '### 主要ページ',
      '',
      '- [番付（直近の場所）](https://osada.us/202607-banzuke/)',
      '- [取組予定](https://osada.us/202607-yotei/)',
      '- [取組結果](https://osada.us/202607-torikumi/)',
      '- [力士一覧](https://osada.us/rikishi/)',
      '- [決まり手](https://osada.us/kimarite/)',
      '- [分析](https://osada.us/analytics/)',
      '',
      '### エージェント向けエンドポイント',
      '',
      '- [API カタログ](https://osada.us/.well-known/api-catalog)',
      '- [Agent Skills index](https://osada.us/.well-known/agent-skills/index.json)',
      '- [auth.md](https://osada.us/auth.md)',
    ].join('\n'),
  });
}

function renderMarkdownPage(input: { title: string; description?: string; canonical?: string; body: string }): string {
  const fm = frontmatter({
    title: input.title,
    description: input.description,
    canonical: input.canonical,
  });
  return `${fm}\n\n# ${input.title}\n\n${input.body}\n`;
}

interface MarkdownRoute {
  /** Directory inside the build output (no leading slash, trailing slash). */
  outDir: string;
  content: string;
}

export function buildMarkdownPages(publicDir: string, outRoot: string): MarkdownRoute[] {
  const routes: MarkdownRoute[] = [];

  routes.push({
    outDir: '',
    content: renderHomeMarkdown(),
  });
  routes.push({
    outDir: 'archives/',
    content: renderArchivesMarkdown(),
  });
  routes.push({
    outDir: 'rikishi/',
    content: renderRikishiMarkdown(publicDir),
  });
  routes.push({
    outDir: 'kimarite/',
    content: renderKimariteMarkdown(),
  });
  routes.push({
    outDir: 'analytics/',
    content: renderAnalyticsMarkdown(),
  });

  // Iterate over the supported basho set.
  for (const monthKey of ['202603', '202605', '202607']) {
    routes.push({
      outDir: `${monthKey}-banzuke/`,
      content: renderBanzukeMarkdown(publicDir, monthKey, monthKey),
    });
    routes.push({
      outDir: `${monthKey}-torikumi/`,
      content: renderTorikumiMarkdown(publicDir, monthKey, monthKey, 'result'),
    });
    routes.push({
      outDir: `${monthKey}-yotei/`,
      content: renderTorikumiMarkdown(publicDir, monthKey, monthKey, 'schedule'),
    });
  }

  return routes;
}

/**
 * The static set of routes that get a Markdown view. Exposed so that
 * `public/_headers` (and the build plugin) can advertise a `Link:
 * rel="alternate" type="text/markdown"` header pointing at each
 * pre-rendered `index.md` without duplicating the route list.
 */
export const MARKDOWN_ROUTES: ReadonlyArray<string> = [
  '',
  'archives/',
  'rikishi/',
  'kimarite/',
  'analytics/',
  ...['202603', '202605', '202607'].flatMap((monthKey) => [
    `${monthKey}-banzuke/`,
    `${monthKey}-torikumi/`,
    `${monthKey}-yotei/`,
  ]),
];

/**
 * Convert an `outDir` (e.g. `archives/`) into the public URL path that
 * the Markdown view is served under (e.g. `/archives/`).
 */
export function markdownRoutePublicPath(outDir: string): string {
  return `/${outDir}`;
}

/**
 * Convert an `outDir` into the absolute URL of the pre-rendered
 * `index.md` (e.g. `${SITE}/archives/index.md`).
 */
export function markdownRouteAlternateUrl(outDir: string, site: string): string {
  return `${site}${markdownRoutePublicPath(outDir)}index.md`;
}

export function writeMarkdownViews(publicDir: string, outRoot: string): { written: string[] } {
  const pages = buildMarkdownPages(publicDir, outRoot);
  const written: string[] = [];
  for (const page of pages) {
    const target = resolve(outRoot, page.outDir, 'index.md');
    mkdirSync(resolve(target, '..'), { recursive: true });
    writeFileSync(target, page.content, 'utf8');
    written.push(target);
  }
  return { written };
}

// Allow running the script directly via `node scripts/build_markdown_views.ts`.
if (import.meta.url === `file://${process.argv[1]}`) {
  const publicDir = resolve(process.cwd(), 'public');
  const outRoot = resolve(process.cwd(), 'dist');
  const { written } = writeMarkdownViews(publicDir, outRoot);
  for (const path of written) {
    console.log(`wrote ${path.replace(outRoot, 'dist')}`);
  }
}

// Suppress unused-import warnings for the readdirSync helper; kept for future
// expansion when we may scan additional dynamic content.
void readdirSync;