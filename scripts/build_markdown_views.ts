/**
 * Build Markdown views for the main routes so AI agents that request
 * `Accept: text/markdown` get a meaningful response even before
 * Cloudflare Pages' Markdown-for-Agents negotiation kicks in. This
 * script is invoked by `vite.config.ts` (`markdownViewsPlugin`)
 * after the main bundle is written.
 *
 * Output: `dist/<route>/index.md` for the main routes and configured monthly/daily pages.
 */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getAllArchiveRouteConfigs } from '../app/lib/torikumi-routes';
import { getBanzukeDataByMonthKey } from '../app/lib/archive-basho-data';
import type { TorikumiArchiveDay, TorikumiDataSet } from '../app/lib/torikumi-data';

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

type TorikumiDocument = TorikumiDataSet;

/** bashoId is an upstream numeric identifier, never a YYYYMM key. */
export function currentMonthKey(document: TorikumiDocument): string {
  const day = [...(document.resultDays ?? []), ...(document.scheduleDays ?? [])]
    .find((entry) => /^\d{8}$/.test(entry.pathDate));
  if (!day) throw new Error('Cannot derive current basho month: no valid pathDate');
  return day.pathDate.slice(0, 6);
}

function loadTorikumi(publicDir: string, monthKey: string): TorikumiDocument {
  const live = readJson<TorikumiDocument>(publicDir, 'api/v1/torikumi.json');
  if (currentMonthKey(live) === monthKey) return live;
  const archive = getAllArchiveRouteConfigs().find((config) => config.monthKey === monthKey);
  if (!archive) throw new Error(`Unknown basho: ${monthKey}`);
  return archive.archive;
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
  const document: BanzukeDocument = currentMonthKey(torikumi) === monthKey
    ? readJson<BanzukeDocument>(publicDir, 'api/v1/banzuke.json')
    : getBanzukeDataByMonthKey(monthKey);

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
  const torikumi = loadTorikumi(publicDir, monthKey);
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

function markdownCell(value: string): string {
  return value.replace(/\|/g, '&#124;').replace(/[\r\n]+/g, ' ');
}

function renderDayMarkdown(document: TorikumiDocument, day: TorikumiArchiveDay, mode: 'result' | 'schedule'): string {
  const suffix = mode === 'result' ? 'torikumi' : 'yotei';
  const title = `${document.year} ${document.bashoName} ${day.label} ${mode === 'result' ? '取組結果' : '取組予定'} | o-sumo`;
  const updatedAt = mode === 'result' ? document.resultUpdatedAt : document.scheduleUpdatedAt;
  const body = [
    `日付: ${day.isoDate}`, `更新: \`${updatedAt}\``, `掲載状況: ${day.status}`,
    `[場所の一覧](${SITE}/${day.pathDate.slice(0, 6)}-${suffix}/)`,
  ];
  if (day.status === 'pending') {
    body.push(day.statusMessage || '公式発表・更新待ちです。未掲載を休場や取組なしと解釈しないでください。');
  } else {
    for (const [key, label] of [['makuuchi', '幕内'], ['juryo', '十両']] as const) {
      const division = day.data[key];
      body.push(`## ${label}`);
      const matches = division?.matches ?? [];
      if (!matches.length) {
        body.push('掲載されている取組はありません。');
        continue;
      }
      const header = mode === 'result' ? '| 東 | 西 | 勝者 | 決まり手 |' : '| 東 | 西 |';
      const separator = mode === 'result' ? '| --- | --- | --- | --- |' : '| --- | --- |';
      const rows = matches.map((match) => {
        const pair = `| ${markdownCell(match.eastName)} | ${markdownCell(match.westName)} |`;
        if (mode === 'schedule') return pair;
        const winner = match.winner === 'east' ? match.eastName : match.winner === 'west' ? match.westName : '未確定';
        return `${pair} ${markdownCell(winner)} | ${markdownCell(match.kimarite || '未定')} |`;
      });
      body.push([header, separator, ...rows].join('\n'));
      if (division.absentees?.length) body.push(`休場: ${division.absentees.map((entry) => entry.name).join('、')}`);
    }
  }
  return renderMarkdownPage({ title, canonical: `${SITE}/${day.pathDate}-${suffix}/`, body: body.join('\n\n') });
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

function renderArchivesMarkdown(publicDir: string): string {
  const current = currentMonthKey(readJson<TorikumiDocument>(publicDir, 'api/v1/torikumi.json'));
  return renderMarkdownPage({
    title: '大相撲の場所別アーカイブ | o-sumo',
    description: '大相撲の過去の場所ごとの番付、取組結果、取組予定を閲覧できます。',
    canonical: `${SITE}/archives/`,
    body: [
      ...getAllArchiveRouteConfigs().reverse().map(({ monthKey }) =>
        `- [${monthKey} 場所${monthKey === current ? '（現在）' : ''}](${SITE}/${monthKey}-torikumi/)`),
    ].join('\n'),
  });
}

function renderHomeMarkdown(publicDir: string): string {
  const current = currentMonthKey(readJson<TorikumiDocument>(publicDir, 'api/v1/torikumi.json'));
  return renderMarkdownPage({
    title: 'o-sumo | 大相撲 番付・星取表',
    description: '大相撲の番付・星取表・取組スケジュール・場所結果を網羅したアーカイブ。',
    canonical: `${SITE}/`,
    body: [
      'o-sumo は大相撲の番付・星取表・取組スケジュール・場所結果を網羅したアーカイブです。',
      '',
      '### 主要ページ',
      '',
      `- [番付（直近の場所）](https://osada.us/${current}-banzuke/)`,
      `- [取組予定](https://osada.us/${current}-yotei/)`,
      `- [取組結果](https://osada.us/${current}-torikumi/)`,
      '- [力士一覧](https://osada.us/rikishi/)',
      '- [決まり手](https://osada.us/kimarite/)',
      '- [分析](https://osada.us/analytics/)',
      '- [当サイトについて・プライバシーポリシー](https://osada.us/about/)',
      '- [プライバシーポリシー](https://osada.us/privacy/)',
      '',
      '### エージェント向けエンドポイント',
      '',
      '- [API カタログ](https://osada.us/.well-known/api-catalog)',
      '- [Agent Skills index](https://osada.us/.well-known/agent-skills/index.json)',
      '- [auth.md](https://osada.us/auth.md)',
    ].join('\n'),
  });
}

function renderPrivacyMarkdown(): string {
  return renderMarkdownPage({
    title: 'プライバシーポリシー | o-sumo',
    description: 'ウェブサイトと MCP サーバーで扱う情報、任意の Google ログイン、保存と削除について説明します。',
    canonical: `${SITE}/privacy/`,
    body: [
      'このポリシーは、https://osada.us と https://osada.us/mcp に適用されます。MCP サーバーはアカウント不要の読み取り専用です。',
      '',
      '## 取り扱う情報',
      '',
      'MCP リクエストには検索語や日付が含まれ、公開相撲データを返すために処理されます。MCP のアカウントやユーザー履歴は作成しません。',
      'ChatGPT などの AI クライアント経由で使う場合、会話とクライアント側アカウント情報はその提供者が取り扱い、o-sumo には MCP 呼び出しに必要な入力が送られます。',
      'ウェブサイトでは、未ログイン時に保存した力士 ID や表示設定をブラウザーに保存する場合があります。任意の Google ログインでは、一意の Google アカウント識別子と表示名をログイン・同期のために保存します。メールアドレス、パスワード、OAuth アクセストークンは保存しません。同期を有効にすると選択した力士 ID も保存します。',
      '',
      '## Cookie、ログ、外部サービス',
      '',
      'Google ログインでは一時的な確認 Cookie とセッション Cookie を使用します。セッションの既定期間は 30 日ですが、運用設定によって異なる場合があります。Cloudflare などのホスティング事業者はリクエストや運用情報を処理する場合がありますが、運営者が確認できないログの保持期間は約束しません。',
      '確認したソースと配信設定では Google Analytics と Google AdSense のスクリプトは現在組み込まれていません。Google Fonts への接続時には通常のリクエスト情報が Google に送信されることがあります。',
      '',
      '## 保存期間と削除',
      '',
      'ブラウザー内の情報はブラウザー設定から削除できます。アカウント削除画面はありません。アカウント情報や同期データの削除は運営者へ依頼してください。ログアウトだけでは削除されません。期限切れセッション記録や事業者ログの削除時期は現行実装では定められていません。',
      '',
      '## お問い合わせ',
      '',
      '個人情報を GitHub の公開 Issue に投稿せず、[X のダイレクトメッセージ](https://x.com/daisuke)でご連絡ください。最終更新日：2026年11月9日。',
      '',
      '提供事業者の方針: [Google](https://policies.google.com/privacy) / [Cloudflare](https://www.cloudflare.com/privacypolicy/)',
      '',
      '## English',
      '',
      'This policy covers https://osada.us and https://osada.us/mcp. The MCP server is read-only and requires no account. MCP requests include inputs such as search terms and dates; they are processed to return public sumo data. No MCP accounts or query histories are created.',
      'When you use the server through an AI client such as ChatGPT, that provider handles the conversation and its account information. o-sumo receives the inputs needed for MCP tool calls.',
      'The website may store saved wrestler IDs and display preferences in your browser. Optional Google sign-in stores a unique Google account identifier and display name for sign-in and synchronization. We do not store email addresses, passwords, or OAuth access tokens. Synchronized accounts also store selected wrestler IDs.',
      'Google sign-in uses temporary verification and session cookies. The default session duration is 30 days, but configuration may change it. Hosting providers such as Cloudflare may process request and operational information; the operator cannot promise a retention period for logs that the operator cannot inspect. Google Analytics and AdSense scripts are not currently included in the source and delivery configuration reviewed. Google Fonts may receive ordinary request information when a font is loaded.',
      'Browser-stored information can be removed through browser settings. There is no self-service account deletion screen; contact the operator to request deletion of account and synchronized data. Signing out does not delete them. The current implementation does not specify when expired session records or provider logs are deleted.',
      'For privacy requests, contact the operator by [direct message on X](https://x.com/daisuke). Do not post personal information in a public GitHub issue. Last updated: November 9, 2026.',
      'Provider policies: [Google](https://policies.google.com/privacy) / [Cloudflare](https://www.cloudflare.com/privacypolicy/).',
    ].join('\n'),
  });
}

function renderTermsMarkdown(): string {
  return renderMarkdownPage({
    title: '利用規約 | o-sumo',
    description: '縦綱 / o-sumo のウェブサイトと MCP サーバーの利用条件。',
    canonical: `${SITE}/terms/`,
    body: [
      '## 適用範囲',
      '',
      'この規約は https://osada.us と https://osada.us/mcp に適用されます。利用者は本サービスを利用することでこの規約に同意します。',
      '',
      '## サービスと利用上のルール',
      '',
      '本サービスは大相撲に関する公開情報の検索・閲覧を提供します。MCP サーバーは読み取り専用で、予約、購入、支払い、プロフィール変更、アカウント操作は行いません。任意の Google ログインで「マイ力士」を同期できます。',
      '法令を守り、サービスの安全や運営を妨げたり、不正アクセスや過度な負荷を生じさせたりしないでください。自動アクセスは公開された条件と技術的制限に従ってください。',
      '',
      '## 情報と外部サービス',
      '',
      '公開情報を編集して提供していますが、完全性・正確性・最新性を保証しません。公式情報は日本相撲協会などの公式発表を参照してください。本サービスは日本相撲協会の公式サービスではありません。Google ログインやホスティング事業者の障害や変更により機能が使えない場合があります。',
      '',
      '## 変更、停止、免責',
      '',
      '保守、安全確保、法令対応、データ供給元や外部サービスの変更のため、サービスを変更または停止することがあります。法令で認められる範囲で、本サービスは現状有姿で提供されます。運営者は、法令上除外できない責任を除き、中断、誤り、欠落、利用による損害について責任を負いません。',
      '',
      '## 規約の変更と連絡先',
      '',
      '改定内容はこのページに掲載します。規約への質問は [X のダイレクトメッセージ](https://x.com/daisuke) でご連絡ください。',
      '',
      '## English: Terms of Service',
      '',
      'These terms apply to https://osada.us and https://osada.us/mcp. By using the services, you agree to these terms. The services let you search and view public Grand Sumo information. The MCP server is read-only and does not make reservations or purchases, process payments, change profiles, or perform account operations. Optional Google sign-in can synchronize your My Rikishi list.',
      'Comply with applicable laws. Do not disrupt service operation or security, attempt unauthorized access, or create excessive load. Automated access must follow published conditions and technical limits.',
      'Information is compiled from public sources, but completeness, accuracy, and timeliness are not guaranteed. Consult official announcements for authoritative information. These services are not affiliated with or operated by the Japan Sumo Association. Third-party outages or changes may affect availability.',
      'The operator may change or suspend the services for maintenance, security, legal compliance, or changes to data sources or third-party services. To the extent permitted by applicable law, the services are provided “as is.” The operator is not liable for interruptions, errors, missing data, or losses arising from use, except for liability that cannot lawfully be excluded.',
      'Revisions will be posted here. For questions, contact the operator by [direct message on X](https://x.com/daisuke).',
    ].join('\n'),
  });
}

function renderAboutMarkdown(): string {
  return renderMarkdownPage({
    title: '当サイトについて・プライバシーポリシー | o-sumo',
    description: 'o-sumoのサイト概要、データ出典、免責事項、プライバシーポリシー、利用規約、運営者情報について。',
    canonical: `${SITE}/about/`,
    body: [
      '## 当サイト（o-sumo）について',
      '',
      'o-sumo（オオ相撲）は、大相撲の番付表、取組結果、星取表、力士・行司・呼出名鑑、決まり手、データ分析などをシンプルかつ軽快に閲覧できる非公式ファンサイトです。',
      '',
      '## データ出典および免責事項',
      '',
      '当サイトに掲載されている大相撲のデータは、公益財団法人日本相撲協会の公式発表情報等を参考に個人で集約・分析して提供しています。',
      '当サイトは個人が開発・運営する非公式ファンサイトであり、公益財団法人日本相撲協会とは一切関係ありません。',
      '',
      '## プライバシーポリシーと利用規約',
      '',
      '- [プライバシーポリシー](https://osada.us/privacy/): Google ログイン、ブラウザー保存、アクセスログ、削除依頼について',
      '- [利用規約](https://osada.us/terms/): ウェブサイトと MCP サーバーの利用条件',
      '',
      '## 運営者情報',
      '',
      '- 運営者: Daisuke',
      '- X: [Daisuke on X (@daisuke)](https://x.com/daisuke)',
      '- GitHub: [dai/o-sumo](https://github.com/dai/o-sumo)',
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

export function buildMarkdownPages(publicDir: string, _outRoot: string): MarkdownRoute[] {
  const routes: MarkdownRoute[] = [];

  routes.push({
    outDir: '',
    content: renderHomeMarkdown(publicDir),
  });
  routes.push({
    outDir: 'archives/',
    content: renderArchivesMarkdown(publicDir),
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
  routes.push({
    outDir: 'about/',
    content: renderAboutMarkdown(),
  });
  routes.push({
    outDir: 'privacy/',
    content: renderPrivacyMarkdown(),
  });
  routes.push({
    outDir: 'terms/',
    content: renderTermsMarkdown(),
  });

  // Iterate over the supported basho set.
  for (const { monthKey } of getAllArchiveRouteConfigs()) {
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

  // Generate only dates present in each published dataset, including pending days.
  for (const { monthKey } of getAllArchiveRouteConfigs()) {
    const document = loadTorikumi(publicDir, monthKey);
    for (const mode of ['result', 'schedule'] as const) {
      const days = mode === 'result' ? document.resultDays : document.scheduleDays;
      for (const day of days ?? []) {
        if (!/^\d{8}$/.test(day.pathDate) || !day.pathDate.startsWith(monthKey)) {
          throw new Error(`Invalid day pathDate: ${day.pathDate} for ${monthKey}`);
        }
        routes.push({
          outDir: `${day.pathDate}-${mode === 'result' ? 'torikumi' : 'yotei'}/`,
          content: renderDayMarkdown(document, day, mode),
        });
      }
    }
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
  'about/',
  'privacy/',
  'terms/',
  ...getAllArchiveRouteConfigs().flatMap(({ monthKey }) => [
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
