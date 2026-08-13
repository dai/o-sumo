import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  getBanzukeDataByMonthKey,
  getTorikumiArchiveByMonthKey,
} from './archive-basho-data';
import { PAST_BASHO } from './archives-data';
import {
  JULY2026_BASHO_NAME,
  JULY2026_JURYO_DATA,
  JULY2026_MAKUUCHI_DATA,
  JULY2026_UPDATED_AT,
  JULY2026_YEAR,
} from './july2026-banzuke-data';
import { JULY2026_TORIKUMI_DATA } from './july2026-data';
import { resolvePageMeta } from './page-meta';
import { getSitemapEntries } from './sitemap';
import { makuuchiData, juryo } from './sumo-data';
import { torikumiData } from './torikumi-data';
import { getAllArchiveRouteConfigs } from './torikumi-routes';

describe('July 2026 archive', () => {
  it('keeps immutable snapshots exactly equal to the finalized current July data', () => {
    expect(torikumiData).toBe(JULY2026_TORIKUMI_DATA);
    expect(makuuchiData).toBe(JULY2026_MAKUUCHI_DATA);
    expect(juryo).toBe(JULY2026_JURYO_DATA);
    expect(JULY2026_TORIKUMI_DATA).toEqual(torikumiData);
    expect(JULY2026_MAKUUCHI_DATA).toEqual(makuuchiData);
    expect(JULY2026_JURYO_DATA).toEqual(juryo);
    expect(JULY2026_BASHO_NAME).toBe(torikumiData.bashoName);
    expect(JULY2026_YEAR).toBe(torikumiData.year);
    expect(JULY2026_UPDATED_AT).toBe(torikumiData.resultUpdatedAt);
  });

  it('resolves July explicitly from its archive snapshots', () => {
    expect(getTorikumiArchiveByMonthKey('202607')).toBe(JULY2026_TORIKUMI_DATA);
    expect(getBanzukeDataByMonthKey('202607')).toMatchObject({
      bashoName: JULY2026_BASHO_NAME,
      year: JULY2026_YEAR,
      updatedAt: JULY2026_UPDATED_AT,
      makuuchi: JULY2026_MAKUUCHI_DATA,
      juryo: JULY2026_JURYO_DATA,
    });
  });

  it('lists July, May, and March as newest-first archives', () => {
    expect(PAST_BASHO.map((basho) => basho.id)).toEqual(['202607', '202605', '202603']);
  });

  it('keeps July routes, metadata, and sitemap URLs unique while July remains current', () => {
    const routeConfigs = getAllArchiveRouteConfigs();
    const monthKeys = routeConfigs.map((config) => config.monthKey);
    const routePaths = routeConfigs.flatMap((config) => [config.banzukePath, config.resultPath, config.schedulePath]);
    const sitemapPaths = getSitemapEntries(routeConfigs).map((entry) => entry.loc);

    expect(monthKeys).toEqual(['202603', '202605', '202607']);
    expect(new Set(monthKeys).size).toBe(monthKeys.length);
    expect(new Set(routePaths).size).toBe(routePaths.length);
    expect(sitemapPaths.filter((path) => path === '/202607-banzuke/')).toHaveLength(1);
    expect(sitemapPaths.filter((path) => path === '/202607-torikumi/')).toHaveLength(1);
    expect(sitemapPaths.filter((path) => path === '/202607-yotei/')).toHaveLength(1);
    expect(resolvePageMeta('/202607-torikumi/')).toMatchObject({
      title: '2026年7月場所 取組・星取表 | o-sumo',
      canonicalUrl: 'https://osada.us/202607-torikumi/',
    });
  });

  it('keeps the current public JSON API on July data', () => {
    const banzukeJson = JSON.parse(readFileSync(resolve(process.cwd(), 'public/api/v1/banzuke.json'), 'utf8'));
    const torikumiJson = JSON.parse(readFileSync(resolve(process.cwd(), 'public/api/v1/torikumi.json'), 'utf8'));

    expect(banzukeJson).toMatchObject({ bashoName: '七月場所', year: '令和八年' });
    expect(torikumiJson).toMatchObject({ bashoName: '七月場所', year: '令和八年' });
    expect(torikumiJson.resultDays[0].pathDate).toBe('20260712');
    expect(torikumiJson.scheduleDays[0].pathDate).toBe('20260712');
  });
});
