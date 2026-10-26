import { describe, expect, it } from 'vitest';
import {
  getBanzukeDataByMonthKey,
  getTorikumiArchiveByMonthKey,
} from './archive-basho-data';
import { PAST_BASHO } from './archives-data';
import {
  SEPTEMBER2026_BASHO_NAME,
  SEPTEMBER2026_JURYO_DATA,
  SEPTEMBER2026_MAKUUCHI_DATA,
  SEPTEMBER2026_UPDATED_AT,
  SEPTEMBER2026_YEAR,
} from './september2026-banzuke-data';
import { SEPTEMBER2026_TORIKUMI_DATA } from './september2026-data';
import { resolvePageMeta } from './page-meta';
import { getSitemapEntries } from './sitemap';
import { getAllArchiveRouteConfigs } from './torikumi-routes';

describe('September 2026 archive', () => {
  it('keeps the finalized September snapshot contract independent from the current data module', () => {
    const resultDays = SEPTEMBER2026_TORIKUMI_DATA.resultDays ?? [];
    const scheduleDays = SEPTEMBER2026_TORIKUMI_DATA.scheduleDays ?? [];
    const countRikishi = (groups: Array<{ east: unknown[]; west: unknown[] }>) => groups
      .reduce((count, group) => count + group.east.length + group.west.length, 0);

    expect(SEPTEMBER2026_TORIKUMI_DATA).toMatchObject({
      bashoId: 637,
      bashoName: SEPTEMBER2026_BASHO_NAME,
      year: SEPTEMBER2026_YEAR,
      resultUpdatedAt: SEPTEMBER2026_UPDATED_AT,
    });
    expect(resultDays).toHaveLength(15);
    expect(scheduleDays).toHaveLength(15);
    expect(resultDays.map((day) => day.pathDate)).toEqual([
      '20260913', '20260914', '20260915', '20260916', '20260917',
      '20260918', '20260919', '20260920', '20260921', '20260922',
      '20260923', '20260924', '20260925', '20260926', '20260927',
    ]);
    expect(scheduleDays.map((day) => day.pathDate)).toEqual(resultDays.map((day) => day.pathDate));
    expect([...resultDays, ...scheduleDays].every((day) => day.status === 'published')).toBe(true);
    expect(countRikishi(SEPTEMBER2026_MAKUUCHI_DATA)).toBe(42);
    expect(countRikishi(SEPTEMBER2026_JURYO_DATA)).toBe(28);
  });

  it('resolves September explicitly from its archive snapshots', () => {
    expect(getTorikumiArchiveByMonthKey('202609')).toBe(SEPTEMBER2026_TORIKUMI_DATA);
    expect(getBanzukeDataByMonthKey('202609')).toMatchObject({
      bashoName: SEPTEMBER2026_BASHO_NAME,
      year: SEPTEMBER2026_YEAR,
      updatedAt: SEPTEMBER2026_UPDATED_AT,
      makuuchi: SEPTEMBER2026_MAKUUCHI_DATA,
      juryo: SEPTEMBER2026_JURYO_DATA,
    });
  });

  it('lists September, July, May, and March as newest-first archives', () => {
    expect(PAST_BASHO.map((basho) => basho.id)).toEqual(['202609', '202607', '202605', '202603']);
  });

  it('keeps routes, metadata, and sitemap URLs unique across all basho', () => {
    const routeConfigs = getAllArchiveRouteConfigs();
    const monthKeys = routeConfigs.map((config) => config.monthKey);
    const routePaths = routeConfigs.flatMap((config) => [config.banzukePath, config.resultPath, config.schedulePath]);
    const sitemapPaths = getSitemapEntries(routeConfigs).map((entry) => entry.loc);

    expect(new Set(monthKeys).size).toBe(monthKeys.length);
    expect(new Set(routePaths).size).toBe(routePaths.length);
    expect(sitemapPaths.filter((path) => path === '/202609-banzuke/')).toHaveLength(1);
    expect(sitemapPaths.filter((path) => path === '/202609-torikumi/')).toHaveLength(1);
    expect(sitemapPaths.filter((path) => path === '/202609-yotei/')).toHaveLength(1);
    expect(resolvePageMeta('/202609-torikumi/')).toMatchObject({
      title: '2026年9月場所 取組・星取表 | o-sumo',
      canonicalUrl: 'https://osada.us/202609-torikumi/',
    });
  });
});
