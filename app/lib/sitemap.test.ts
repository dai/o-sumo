import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { torikumiArchive, torikumiMonthKey } from './torikumi-data';
import { getSitemapEntries, renderSitemapXml } from './sitemap';
import { SITE_ORIGIN } from './site-url';
import { getAllArchiveRouteConfigs } from './torikumi-routes';
import * as sitemapModule from './sitemap';

type OfficialSitemapLoader = (kind: 'gyoji' | 'yobidashi', indexPath: string) => Array<{ id: number }>;

function withOfficialFixture(
  index: unknown,
  profiles: Record<string, unknown>,
  test: (indexPath: string) => void,
) {
  const root = mkdtempSync(join(tmpdir(), 'o-sumo-official-sitemap-'));
  const profileDir = join(root, 'gyoji');
  const indexPath = join(root, 'gyoji.json');
  try {
    mkdirSync(profileDir);
    writeFileSync(indexPath, JSON.stringify(index));
    for (const [filename, profile] of Object.entries(profiles)) {
      writeFileSync(join(profileDir, filename), JSON.stringify(profile));
    }
    test(indexPath);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function officialSitemapLoader(): OfficialSitemapLoader | undefined {
  return (sitemapModule as typeof sitemapModule & { loadOfficialSitemapItems?: OfficialSitemapLoader }).loadOfficialSitemapItems;
}

describe('sitemap helpers', () => {
  it('adds synthetic rikishi profile paths from an injected index', () => {
    const locs = getSitemapEntries([], [{ id: 101 }, { id: 202 }]).map((entry) => entry.loc);

    expect(locs).toContain('/rikishi/101/');
    expect(locs).toContain('/rikishi/202/');
    expect(locs).not.toContain('/api/v1/rikishi/101.json');
  });

  it('rejects a rikishi index that is not an array', () => {
    expect(() => getSitemapEntries([], { id: 101 })).toThrow('Rikishi sitemap items must be an array');
  });

  it.each([
    [[{ id: 0 }]],
    [[{ id: 101.5 }]],
    [[{ id: Number.MAX_SAFE_INTEGER + 1 }]],
    [[{ id: 101 }, { id: 101 }]],
  ])('rejects invalid rikishi IDs: %j', (rikishiItems) => {
    expect(() => getSitemapEntries([], rikishiItems)).toThrow();
  });

  it('adds every profile in the public rikishi index exactly once', () => {
    const index = JSON.parse(
      readFileSync(resolve(process.cwd(), 'public/api/v1/rikishi.json'), 'utf8'),
    ) as { rikishi: Array<{ id: number }> };
    const fixedEntryCount = getSitemapEntries([]).length;
    const locs = getSitemapEntries([], index.rikishi).map((entry) => entry.loc);

    expect(index.rikishi.length).toBeGreaterThan(0);
    expect(locs).toHaveLength(fixedEntryCount + index.rikishi.length);
    expect(locs).toContain('/rikishi/3842/');
    expect(locs.filter((loc) => loc === '/rikishi/3842/')).toHaveLength(1);
  });

  it('lists fixed pages and archive hubs with canonical trailing slashes', () => {
    const locs = getSitemapEntries().map((entry) => entry.loc);

    expect(locs).toContain('/');
    expect(locs).toContain('/archives/');
    expect(locs).toContain('/rikishi/');
    expect(locs).toContain('/kimarite/');
    expect(locs).toContain('/analytics/');
    expect(locs).toContain('/about/');
    expect(locs).toContain('/202603-banzuke/');
    expect(locs).toContain('/202603-torikumi/');
    expect(locs).toContain('/202603-yotei/');
    expect(locs).toContain('/202605-banzuke/');
    expect(locs).toContain('/202605-torikumi/');
    expect(locs).toContain('/202605-yotei/');
    expect(locs).toContain(`/${torikumiMonthKey}-banzuke/`);
    expect(locs).toContain(`/${torikumiMonthKey}-torikumi/`);
    expect(locs).toContain(`/${torikumiMonthKey}-yotei/`);
    expect(locs.every((loc) => loc === '/' || loc.endsWith('/'))).toBe(true);
  });

  it('includes published day pages and excludes pending day pages', () => {
    const locs = getSitemapEntries().map((entry) => entry.loc);
    const publishedResultDay = getAllArchiveRouteConfigs()
      .flatMap((config) => config.archive.resultDays ?? [])
      .find((day) => day.status === 'published');
    const pendingResultDay = torikumiArchive.resultDays.find((day) => day.status === 'pending');
    const publishedScheduleDay = getAllArchiveRouteConfigs()
      .flatMap((config) => config.archive.scheduleDays ?? [])
      .find((day) => day.status === 'published');
    const pendingScheduleDay = torikumiArchive.scheduleDays.find((day) => day.status === 'pending');

    expect(publishedResultDay).toBeDefined();
    expect(locs).toContain(`/${publishedResultDay!.pathDate}-torikumi/`);
    if (pendingResultDay) {
      expect(locs).not.toContain(`/${pendingResultDay.pathDate}-torikumi/`);
    }
    if (publishedScheduleDay) {
      expect(locs).toContain(`/${publishedScheduleDay.pathDate}-yotei/`);
    }
    if (pendingScheduleDay) {
      expect(locs).not.toContain(`/${pendingScheduleDay.pathDate}-yotei/`);
    }
  });

  it('excludes pending days even when the committed data has no pending fixture', () => {
    const baseConfig = getAllArchiveRouteConfigs()[0];
    const baseDay = baseConfig.archive.resultDays?.[0];
    expect(baseDay).toBeDefined();
    if (!baseDay) {
      throw new Error('Expected the archive fixture to contain at least one result day');
    }
    const entries = getSitemapEntries([{
      ...baseConfig,
      monthKey: '209901',
      banzukePath: '/209901-banzuke/',
      resultPath: '/209901-torikumi/',
      schedulePath: '/209901-yotei/',
      archive: {
        ...baseConfig.archive,
        resultDays: [
          { ...baseDay, pathDate: '20990101', status: 'published' },
          { ...baseDay, pathDate: '20990102', status: 'pending' },
        ],
        scheduleDays: [
          { ...baseDay, pathDate: '20990101', status: 'published' },
          { ...baseDay, pathDate: '20990102', status: 'pending' },
        ],
      },
    }]).map((entry) => entry.loc);

    expect(entries).toContain('/20990101-torikumi/');
    expect(entries).not.toContain('/20990102-torikumi/');
    expect(entries).toContain('/20990101-yotei/');
    expect(entries).not.toContain('/20990102-yotei/');
  });

  it('renders an XML sitemap with absolute canonical URLs', () => {
    const xml = renderSitemapXml();
    // pendingScheduleDay may be absent once all schedule days are announced for the basho
    const pendingScheduleDay = torikumiArchive.scheduleDays.find((day) => day.status === 'pending');

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain(`<loc>${SITE_ORIGIN}/</loc>`);
    expect(xml).toContain(`<loc>${SITE_ORIGIN}/archives/</loc>`);
    expect(xml).toContain(`<loc>${SITE_ORIGIN}/analytics/</loc>`);
    expect(xml).toContain(`<loc>${SITE_ORIGIN}/${torikumiMonthKey}-torikumi/</loc>`);
    if (pendingScheduleDay) {
      expect(xml).not.toContain(`${SITE_ORIGIN}/${pendingScheduleDay.pathDate}-yotei/`);
    }
  });

  it('renders injected rikishi profile URLs as absolute trailing-slash XML locations', () => {
    const xml = renderSitemapXml([], [{ id: 101 }]);

    expect(xml).toContain(`<loc>${SITE_ORIGIN}/rikishi/101/</loc>`);
    expect(xml).not.toContain(`${SITE_ORIGIN}/api/v1/rikishi/101.json`);
  });

  it('renders gyoji and yobidashi directory and profile URLs', () => {
    const xml = renderSitemapXml([], [], [{ id: 1986 }], [{ id: 1935 }]);

    expect(xml).toContain(`<loc>${SITE_ORIGIN}/gyoji/</loc>`);
    expect(xml).toContain(`<loc>${SITE_ORIGIN}/gyoji/1986/</loc>`);
    expect(xml).toContain(`<loc>${SITE_ORIGIN}/yobidashi/</loc>`);
    expect(xml).toContain(`<loc>${SITE_ORIGIN}/yobidashi/1935/</loc>`);
  });

  it('rejects duplicate and non-positive official IDs', () => {
    expect(() => getSitemapEntries([], [], [{ id: 1986 }, { id: 1986 }], [])).toThrow('gyoji sitemap contains duplicate id: 1986');
    expect(() => getSitemapEntries([], [], [], [{ id: 0 }])).toThrow('yobidashi sitemap item at index 0 must have a positive safe integer id');
    expect(() => getSitemapEntries([], [], [{ id: '1986' }], [])).toThrow('gyoji sitemap item at index 0 must have a positive safe integer id');
  });

  it('loads official sitemap entries only when every profile JSON exists and matches', () => {
    const loader = officialSitemapLoader();
    expect(loader).toBeTypeOf('function');
    if (!loader) return;

    withOfficialFixture(
      { officials: [{ id: 1986, rankCode: 'tate-gyoji' }] },
      { '1986.json': { id: 1986, kind: 'gyoji', rankCode: 'tate-gyoji' } },
      (indexPath) => expect(loader('gyoji', indexPath)).toEqual([{ id: 1986 }]),
    );
  });

  it('rejects an index entry whose profile JSON is missing', () => {
    const loader = officialSitemapLoader();
    expect(loader).toBeTypeOf('function');
    if (!loader) return;

    withOfficialFixture(
      { officials: [{ id: 1986, rankCode: 'tate-gyoji' }] },
      {},
      (indexPath) => expect(() => loader('gyoji', indexPath)).toThrow('Missing gyoji profile JSON for id 1986'),
    );
  });

  it.each([
    [{ id: 9999, kind: 'gyoji', rankCode: 'tate-gyoji' }, 'gyoji profile JSON id mismatch for 1986'],
    [{ id: 1986, kind: 'yobidashi', rankCode: 'tate-gyoji' }, 'gyoji profile JSON kind mismatch for id 1986'],
  ])('rejects a profile JSON that does not match its index entry', (profile, message) => {
    const loader = officialSitemapLoader();
    expect(loader).toBeTypeOf('function');
    if (!loader) return;

    withOfficialFixture(
      { officials: [{ id: 1986, rankCode: 'tate-gyoji' }] },
      { '1986.json': profile },
      (indexPath) => expect(() => loader('gyoji', indexPath)).toThrow(message),
    );
  });

  it('rejects unknown rank codes in official index and profile build data', () => {
    const loader = officialSitemapLoader();
    expect(loader).toBeTypeOf('function');
    if (!loader) return;

    withOfficialFixture(
      { officials: [{ id: 1986, rankCode: 'unknown-rank' }] },
      { '1986.json': { id: 1986, kind: 'gyoji', rankCode: 'tate-gyoji' } },
      (indexPath) => expect(() => loader('gyoji', indexPath)).toThrow('gyoji index item at index 0 has invalid rankCode'),
    );
    withOfficialFixture(
      { officials: [{ id: 1986, rankCode: 'tate-gyoji' }] },
      { '1986.json': { id: 1986, kind: 'gyoji', rankCode: 'unknown-rank' } },
      (indexPath) => expect(() => loader('gyoji', indexPath)).toThrow('gyoji profile 1986 has invalid rankCode'),
    );
  });

  it('emits only unique, absolute, indexable canonical URLs', () => {
    const xml = renderSitemapXml();
    const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);

    expect(locs.length).toBeGreaterThan(0);
    expect(new Set(locs).size).toBe(locs.length);
    expect(locs.every((loc) => loc.startsWith(`${SITE_ORIGIN}/`))).toBe(true);
    expect(locs.every((loc) => loc === `${SITE_ORIGIN}/` || loc.endsWith('/'))).toBe(true);
    expect(locs.some((loc) => loc.includes('/api/'))).toBe(false);
    expect(locs.some((loc) => loc.includes('404'))).toBe(false);
    expect(locs.some((loc) => loc.includes('-banduke'))).toBe(false);
    expect(locs.some((loc) => loc.includes('-o-sumo'))).toBe(false);
  });
});
