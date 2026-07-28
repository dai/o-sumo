import { describe, expect, it } from 'vitest';
import { torikumiArchive, torikumiMonthKey } from './torikumi-data';
import { getSitemapEntries, renderSitemapXml } from './sitemap';
import { SITE_ORIGIN } from './site-url';
import { getAllArchiveRouteConfigs } from './torikumi-routes';

describe('sitemap helpers', () => {
  it('lists fixed pages and archive hubs with canonical trailing slashes', () => {
    const locs = getSitemapEntries().map((entry) => entry.loc);

    expect(locs).toContain('/');
    expect(locs).toContain('/archives/');
    expect(locs).toContain('/rikishi/');
    expect(locs).toContain('/kimarite/');
    expect(locs).toContain('/analytics/');
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
    const publishedResultDay = torikumiArchive.resultDays.find((day) => day.status === 'published');
    // pendingResultDay may be absent once all results are published for the basho
    const pendingResultDay = torikumiArchive.resultDays.find((day) => day.status === 'pending');
    const publishedScheduleDay = torikumiArchive.scheduleDays.find((day) => day.status === 'published');
    // pendingScheduleDay may be absent once all schedule days are announced for the basho
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
