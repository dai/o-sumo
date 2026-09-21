/**
 * Server-side noscript builders for the initial HTML.
 *
 * The Cloudflare Pages Function middleware calls into this module to render
 * a small `<noscript>` block that bots (Googlebot without JS) can read. The
 * block contains the same H1 + structured content that the SPA shows, but
 * derived purely from public JSON / static data so it works without JS.
 *
 * The goal is to keep the SPA untouched. The noscript content is purely
 * additive: if the JS-enabled visitor sees the React UI, this block is
 * ignored by the browser.
 */

import { KIMARITE_LIST, type Kimarite } from './kimarite-data';
import {
  getAllArchiveRouteConfigs,
  getArchiveRouteConfigByMonthKey,
  getArchiveRouteConfigForDateKey,
  getArchiveRouteConfigForPathname,
} from './torikumi-routes';

export interface SeoNoscriptContext {
  /** Fetch a JSON document under `/api/v1/*` and return the parsed value, or null on error. */
  fetchJson: (path: string) => Promise<unknown>;
}

interface BanzukeDocument {
  bashoName: string;
  year: string;
  updatedAt: string;
  makuuchi: BanzukeGroup[];
  juryo: BanzukeGroup[];
}

interface BanzukeGroup {
  title: string;
  east: BanzukeRikishi[];
  west: BanzukeRikishi[];
}

interface BanzukeRikishi {
  id: number;
  name: string;
  yomi: string;
  rank: string;
  side: 'east' | 'west';
}

interface RikishiIndex {
  updatedAt: string;
  rikishi: Array<{ id: number; name: string; yomi: string; currentRank: string }>;
}

interface OfficialsIndex {
  retrievedAt: string;
  officials: Array<{ id: number; name: string; yomi: string; rank: string }>;
}

interface MatchRow {
  division: string;
  boutNo: number;
  eastName: string;
  eastYomi: string;
  eastRank: string;
  eastProfileUrl: string;
  westName: string;
  westYomi: string;
  westRank: string;
  westProfileUrl: string;
  kimarite: string;
  winner?: 'east' | 'west' | null;
}

interface DayData {
  makuuchi?: { matches?: MatchRow[] };
  juryo?: { matches?: MatchRow[] };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return char;
    }
  });
}

function isRikishiEntry(value: unknown): value is BanzukeRikishi {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'number' &&
    Number.isInteger(v.id) &&
    typeof v.name === 'string' &&
    (v.side === 'east' || v.side === 'west')
  );
}

function isBanzukeGroup(value: unknown): value is BanzukeGroup {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.title === 'string' &&
    Array.isArray(v.east) &&
    Array.isArray(v.west) &&
    v.east.every(isRikishiEntry) &&
    v.west.every(isRikishiEntry)
  );
}

function isBanzukeDocument(value: unknown): value is BanzukeDocument {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.bashoName === 'string' &&
    typeof v.year === 'string' &&
    Array.isArray(v.makuuchi) &&
    Array.isArray(v.juryo) &&
    v.makuuchi.every(isBanzukeGroup) &&
    v.juryo.every(isBanzukeGroup)
  );
}

function isRikishiIndex(value: unknown): value is RikishiIndex {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.updatedAt === 'string' && Array.isArray(v.rikishi);
}

function isOfficialsIndex(value: unknown): value is OfficialsIndex {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.officials);
}

function buildBanzukeRikishiIndex(banzuke: BanzukeDocument): Map<number, { name: string; yomi: string }> {
  const map = new Map<number, { name: string; yomi: string }>();
  for (const division of [banzuke.makuuchi, banzuke.juryo]) {
    for (const group of division) {
      for (const side of [group.east, group.west]) {
        for (const r of side) {
          if (!map.has(r.id)) map.set(r.id, { name: r.name, yomi: r.yomi });
        }
      }
    }
  }
  return map;
}

function extractIdFromProfileUrl(url: string): number | null {
  const match = url.match(/\/profile\/(\d+)\/?/);
  return match ? Number(match[1]) : null;
}

function resolveRikishiName(
  id: number | null,
  index: Map<number, { name: string; yomi: string }>,
  fallback: string,
): string {
  if (id === null) return fallback;
  const r = index.get(id);
  return r ? r.name : fallback;
}

function wrapNoscript(innerHtml: string): string {
  return `<noscript data-o-sumo-seo="noscript">${innerHtml}</noscript>`;
}

function renderUpdated(updatedAt: string | undefined): string {
  if (!updatedAt) return '';
  return `<p class="seo-noscript-updated">更新: <time>${escapeHtml(updatedAt)}</time></p>`;
}

function renderKimariteList(): string {
  const order = ['kihon', 'nage', 'kake', 'hineri', 'sori', 'tokushu'] as const;
  const labels: Record<(typeof order)[number], string> = {
    kihon: '基本',
    nage: '投げ',
    kake: '掛け',
    hineri: '捻り',
    sori: '反り',
    tokushu: '特殊',
  };
  const grouped = new Map<string, Kimarite[]>();
  for (const entry of KIMARITE_LIST) {
    const list = grouped.get(entry.category) ?? [];
    list.push(entry);
    grouped.set(entry.category, list);
  }
  const sections: string[] = [];
  for (const key of order) {
    const list = grouped.get(key);
    if (!list || list.length === 0) continue;
    const items = list
      .map((entry) => `<li>${escapeHtml(entry.nameJa)}（${escapeHtml(entry.reading)} / ${escapeHtml(entry.romaji)}）</li>`)
      .join('');
    sections.push(`<section><h2>${escapeHtml(labels[key])}</h2><ul>${items}</ul></section>`);
  }
  return sections.join('');
}

function renderArchives(): string {
  const configs = getAllArchiveRouteConfigs();
  const links = configs
    .map((config) => {
      const year = config.monthKey.slice(0, 4);
      const month = config.monthKey.slice(4, 6);
      return `<li><a href="${escapeHtml(config.banzukePath)}">${escapeHtml(`${year}年${Number(month)}月場所`)}</a></li>`;
    })
    .join('');
  return `<ul>${links}</ul>`;
}

async function renderRikishiList(ctx: SeoNoscriptContext): Promise<string> {
  const payload = await ctx.fetchJson('/api/v1/rikishi.json');
  if (!isRikishiIndex(payload)) return '';
  const rankOrder = ['横綱', '大関', '関脇', '小結', '前頭', '十両', '幕下', '三段目', '序二段', '序の口'];
  const grouped = new Map<string, RikishiIndex['rikishi']>();
  for (const rikishi of payload.rikishi) {
    const list = grouped.get(rikishi.currentRank) ?? [];
    list.push(rikishi);
    grouped.set(rikishi.currentRank, list);
  }
  const sections: string[] = [];
  const sortedRanks = [...grouped.keys()].sort((a, b) => {
    const ai = rankOrder.indexOf(a);
    const bi = rankOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b, 'ja');
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  for (const rank of sortedRanks) {
    const list = grouped.get(rank)!;
    const items = list
      .map((r) => `<li><a href="/rikishi/${r.id}/">${escapeHtml(r.name)}</a>（${escapeHtml(r.currentRank)}）</li>`)
      .join('');
    sections.push(`<section><h2>${escapeHtml(rank)}</h2><ul>${items}</ul></section>`);
  }
  return `<p class="seo-noscript-updated">更新: <time>${escapeHtml(payload.updatedAt)}</time></p>${sections.join('')}`;
}

async function renderOfficialsList(kind: 'gyoji' | 'yobidashi', ctx: SeoNoscriptContext): Promise<string> {
  const payload = await ctx.fetchJson(`/api/v1/${kind}.json`);
  if (!isOfficialsIndex(payload)) return '';
  const items = payload.officials
    .map((o) => `<li><a href="/${kind}/${o.id}/">${escapeHtml(o.name)}</a>（${escapeHtml(o.rank)}）</li>`)
    .join('');
  return `<p class="seo-noscript-updated">更新: <time>${escapeHtml(payload.retrievedAt)}</time></p><ul>${items}</ul>`;
}

async function renderBanzukeMonth(monthKey: string, title: string, ctx: SeoNoscriptContext): Promise<string | null> {
  const config = getArchiveRouteConfigByMonthKey(monthKey);
  if (!config) return null;
  // The current basho lives in /api/v1/banzuke.json. Past month snapshots
  // are not exposed as JSON, so we render a minimal noscript for them.
  let banzuke: BanzukeDocument | null = null;
  if (config.monthKey === '202609') {
    const payload = await ctx.fetchJson('/api/v1/banzuke.json');
    if (isBanzukeDocument(payload)) banzuke = payload;
  } else {
    // Fall back to a small placeholder for archived basho. The SPA fills
    // in the full table when JS is enabled.
    return `<p>${escapeHtml(title)} の番付の詳細は、<a href="https://www.sumo.or.jp/">日本相撲協会</a>の公式情報を参照してください。</p>`;
  }
  if (!banzuke) {
    return `<p>${escapeHtml(title)} の番付データを取得できませんでした。</p>`;
  }
  const sections: string[] = [];
  for (const [divisionTitle, groups] of [
    ['幕内', banzuke.makuuchi],
    ['十両', banzuke.juryo],
  ] as const) {
    const rows: string[] = [];
    for (const group of groups) {
      for (const side of [group.east, group.west]) {
        for (const r of side) {
          rows.push(
            `<tr><td>${escapeHtml(group.title)}</td><td>${side === group.east ? '東' : '西'}</td><td><a href="/rikishi/${r.id}/">${escapeHtml(r.name)}</a></td><td>${escapeHtml(r.yomi)}</td></tr>`,
          );
        }
      }
    }
    sections.push(
      `<section><h2>${escapeHtml(divisionTitle)}</h2><table><thead><tr><th>階級</th><th>東西</th><th>四股名</th><th>読み</th></tr></thead><tbody>${rows.join('')}</tbody></table></section>`,
    );
  }
  return `${renderUpdated(banzuke.updatedAt)}${sections.join('')}`;
}

interface LiveTorikumiDay {
  day: number;
  pathDate: string;
  label: string;
  status?: string;
  data: DayData;
}

async function renderMonthHub(monthKey: string, mode: 'result' | 'schedule', title: string, _ctx: SeoNoscriptContext): Promise<string | null> {
  const config = getArchiveRouteConfigByMonthKey(monthKey);
  if (!config) return null;
  const archive = config.archive;
  const days = mode === 'result' ? archive.resultDays ?? [] : archive.scheduleDays ?? [];
  if (days.length === 0) {
    return `<p>${escapeHtml(title)} の日別データはまだありません。</p>`;
  }
  const items = days
    .map((day) => {
      const statusLabel = day.status === 'pending' ? '（未更新）' : '';
      return `<li><a href="/${escapeHtml(day.pathDate)}-${mode === 'result' ? 'torikumi' : 'yotei'}/">${escapeHtml(day.label)}（${escapeHtml(day.isoDate)}）${statusLabel}</a></li>`;
    })
    .join('');
  const updated = mode === 'result' ? archive.resultUpdatedAt : archive.scheduleUpdatedAt;
  return `${renderUpdated(updated)}<ul>${items}</ul>`;
}

async function renderDayRoute(dateKey: string, mode: 'result' | 'schedule', title: string, ctx: SeoNoscriptContext): Promise<string | null> {
  const config = getArchiveRouteConfigForDateKey(dateKey);
  if (!config) return null;
  const archive = config.archive;
  const archiveDays = mode === 'result' ? archive.resultDays ?? [] : archive.scheduleDays ?? [];
  const day = archiveDays.find((entry) => entry.pathDate === dateKey) as LiveTorikumiDay | undefined;
  if (!day) {
    return `<p>${escapeHtml(title)} の取組データはまだありません。</p>`;
  }
  // For the live basho we additionally pull banzuke.json to look up kanji
  // names. Past months already have kanji names in the bundled fixtures.
  let banzukeIndex = new Map<number, { name: string; yomi: string }>();
  if (config.monthKey === '202609') {
    const payload = await ctx.fetchJson('/api/v1/banzuke.json');
    if (isBanzukeDocument(payload)) banzukeIndex = buildBanzukeRikishiIndex(payload);
  }
  const renderRows = (matches: MatchRow[] | undefined): string => {
    if (!matches || matches.length === 0) return '';
    return matches
      .map((match) => {
        const eastId = extractIdFromProfileUrl(match.eastProfileUrl);
        const westId = extractIdFromProfileUrl(match.westProfileUrl);
        const eastName = resolveRikishiName(eastId, banzukeIndex, match.eastName);
        const westName = resolveRikishiName(westId, banzukeIndex, match.westName);
        const eastDisplay = eastId !== null
          ? `<a href="/rikishi/${eastId}/">${escapeHtml(eastName)}</a>`
          : escapeHtml(eastName);
        const westDisplay = westId !== null
          ? `<a href="/rikishi/${westId}/">${escapeHtml(westName)}</a>`
          : escapeHtml(westName);
        const kimarite = mode === 'result' && match.winner ? escapeHtml(match.kimarite) : '';
        return `<tr><td>${match.boutNo}</td><td>${escapeHtml(match.eastRank)} ${eastDisplay}</td><td>${escapeHtml(match.westRank)} ${westDisplay}</td><td>${kimarite}</td></tr>`;
      })
      .join('');
  };
  const makuuchiRows = renderRows(day.data.makuuchi?.matches);
  const juryoRows = renderRows(day.data.juryo?.matches);
  const sections: string[] = [];
  if (makuuchiRows) {
    sections.push(
      `<section><h2>幕内</h2><table><thead><tr><th>番</th><th>東</th><th>西</th><th>${mode === 'result' ? '決まり手' : ''}</th></tr></thead><tbody>${makuuchiRows}</tbody></table></section>`,
    );
  }
  if (juryoRows) {
    sections.push(
      `<section><h2>十両</h2><table><thead><tr><th>番</th><th>東</th><th>西</th><th>${mode === 'result' ? '決まり手' : ''}</th></tr></thead><tbody>${juryoRows}</tbody></table></section>`,
    );
  }
  if (sections.length === 0) {
    return `<p>${escapeHtml(title)} の取組はまだ登録されていません。</p>`;
  }
  return sections.join('');
}

interface ProfileForNoscript {
  name: string;
  rank?: string;
  yomi?: string;
}

function findProfileName(payload: unknown, kind: 'rikishi' | 'gyoji' | 'yobidashi', id: number): ProfileForNoscript | null {
  if (!payload || typeof payload !== 'object') return null;
  const v = payload as Record<string, unknown>;
  if (kind === 'rikishi') {
    const list = v.rikishi;
    if (!Array.isArray(list)) return null;
    for (const entry of list) {
      if (entry && typeof entry === 'object' && (entry as { id?: unknown }).id === id) {
        const e = entry as { id: number; name?: unknown; currentRank?: unknown; yomi?: unknown };
        if (typeof e.name === 'string') {
          return { name: e.name, rank: typeof e.currentRank === 'string' ? e.currentRank : undefined, yomi: typeof e.yomi === 'string' ? e.yomi : undefined };
        }
      }
    }
    return null;
  }
  const list = v.officials;
  if (!Array.isArray(list)) return null;
  for (const entry of list) {
    if (entry && typeof entry === 'object' && (entry as { id?: unknown }).id === id) {
      const e = entry as { id: number; name?: unknown; rank?: unknown; yomi?: unknown };
      if (typeof e.name === 'string') {
        return { name: e.name, rank: typeof e.rank === 'string' ? e.rank : undefined, yomi: typeof e.yomi === 'string' ? e.yomi : undefined };
      }
    }
  }
  return null;
}

function renderProfile(title: string, profile: ProfileForNoscript, kindLabel: '力士' | '行司' | '呼出'): string {
  const rankLine = profile.rank ? `<p>${escapeHtml(profile.rank)}</p>` : '';
  const yomiLine = profile.yomi ? `<p>${escapeHtml(profile.yomi)}</p>` : '';
  return `<h1>${escapeHtml(profile.name)} | ${escapeHtml(kindLabel)}プロフィール | o-sumo</h1>${rankLine}${yomiLine}<p>${escapeHtml(title)}</p>`;
}

function renderHome(title: string): string {
  const current = getArchiveRouteConfigForPathname('/');
  const items = [
    `<li><a href="${escapeHtml(current.banzukePath)}">番付</a></li>`,
    `<li><a href="${escapeHtml(current.schedulePath)}">取組予定</a></li>`,
    `<li><a href="${escapeHtml(current.resultPath)}">取組・星取表</a></li>`,
    `<li><a href="/archives/">場所別アーカイブ</a></li>`,
    `<li><a href="/rikishi/">力士一覧</a></li>`,
    `<li><a href="/kimarite/">決まり手一覧</a></li>`,
  ];
  return `<h1>${escapeHtml(title)}</h1><ul>${items.join('')}</ul>`;
}

export async function buildSeoNoscriptHtml(
  pathname: string,
  title: string,
  ctx: SeoNoscriptContext,
): Promise<string | null> {
  // Home: crawlable links to the current basho hubs (resolved, not hardcoded).
  if (pathname === '/' || pathname === '') {
    return wrapNoscript(renderHome(title));
  }

  // /kimarite/
  if (pathname === '/kimarite/') {
    return wrapNoscript(`<h1>${escapeHtml(title)}</h1>${renderKimariteList()}`);
  }

  // /archives/
  if (pathname === '/archives/') {
    return wrapNoscript(`<h1>${escapeHtml(title)}</h1>${renderArchives()}`);
  }

  // /rikishi/
  if (pathname === '/rikishi/') {
    const body = await renderRikishiList(ctx);
    return wrapNoscript(`<h1>${escapeHtml(title)}</h1>${body}`);
  }

  // /gyoji/, /yobidashi/
  const officialsMatch = pathname.match(/^\/(gyoji|yobidashi)\/$/);
  if (officialsMatch) {
    const kind = officialsMatch[1] as 'gyoji' | 'yobidashi';
    const body = await renderOfficialsList(kind, ctx);
    return wrapNoscript(`<h1>${escapeHtml(title)}</h1>${body}`);
  }

  // /{YYYYMM}-banzuke/
  const banzukeMatch = pathname.match(/^\/(\d{4})(\d{2})-banzuke\/$/);
  if (banzukeMatch) {
    const monthKey = `${banzukeMatch[1]}${banzukeMatch[2]}`;
    const body = await renderBanzukeMonth(monthKey, title, ctx);
    if (!body) return null;
    return wrapNoscript(`<h1>${escapeHtml(title)}</h1>${body}`);
  }

  // /{YYYYMM}-yotei/ or /{YYYYMM}-torikumi/
  const hubMatch = pathname.match(/^\/(\d{4})(\d{2})-(torikumi|yotei)\/$/);
  if (hubMatch) {
    const monthKey = `${hubMatch[1]}${hubMatch[2]}`;
    const mode = hubMatch[3] === 'torikumi' ? 'result' : 'schedule';
    const body = await renderMonthHub(monthKey, mode, title, ctx);
    if (!body) return null;
    return wrapNoscript(`<h1>${escapeHtml(title)}</h1>${body}`);
  }

  // /{YYYYMMDD}-yotei/ or /{YYYYMMDD}-torikumi/
  const dayMatch = pathname.match(/^\/(\d{4})(\d{2})(\d{2})-(torikumi|yotei)\/$/);
  if (dayMatch) {
    const dateKey = `${dayMatch[1]}${dayMatch[2]}${dayMatch[3]}`;
    const mode = dayMatch[4] === 'torikumi' ? 'result' : 'schedule';
    const body = await renderDayRoute(dateKey, mode, title, ctx);
    if (!body) return null;
    return wrapNoscript(`<h1>${escapeHtml(title)}</h1>${body}`);
  }

  // Profile pages. We rely on the data already loaded by the share-collection
  // branch in the middleware. The middleware passes the profile payload
  // through the optional `sharePayload` argument.
  const profileMatch = pathname.match(/^\/(rikishi|gyoji|yobidashi)\/([1-9]\d*)\/$/);
  if (profileMatch) {
    const kind = profileMatch[1] as 'rikishi' | 'gyoji' | 'yobidashi';
    const id = Number(profileMatch[2]);
    const label = kind === 'rikishi' ? '力士' : kind === 'gyoji' ? '行司' : '呼出';
    const payload = await ctx.fetchJson(`/api/v1/${kind}.json`);
    const profile = payload ? findProfileName(payload, kind, id) : null;
    if (!profile) return null;
    return wrapNoscript(renderProfile(title, profile, label));
  }

  return null;
}
