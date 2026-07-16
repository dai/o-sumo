import { describe, expect, it } from 'vitest';
import { torikumiArchive, torikumiMonthKey } from './torikumi-data';
import { getSitemapEntries, renderSitemapXml, SITEMAP_ORIGIN } from './sitemap';

describe('sitemap helpers', () => {
  it('lists fixed pages and archive hubs with canonical trailing slashes', () => {
    const locs = getSitemapEntries().map((entry) => entry.loc);

    expect(locs).toContain('/');
    expect(locs).toContain('/archives/');
    expect(locs).toContain('/rikishi/');
    expect(locs).toContain('/kimarite/');
    expect(locs).toContain('/analytics/');
    expect(locs).toContain('/202603-banduke/');
    expect(locs).toContain('/202603-torikumi/');
    expect(locs).toContain('/202603-yotei/');
    expect(locs).toContain('/202605-banduke/');
    expect(locs).toContain('/202605-torikumi/');
    expect(locs).toContain('/202605-yotei/');
    expect(locs).toContain(`/${torikumiMonthKey}-banduke/`);
    expect(locs).toContain(`/${torikumiMonthKey}-torikumi/`);
    expect(locs).toContain(`/${torikumiMonthKey}-yotei/`);
    expect(locs.every((loc) => loc === '/' || loc.endsWith('/'))).toBe(true);
  });

  it('includes published day pages and excludes pending day pages', () => {
    const locs = getSitemapEntries().map((entry) => entry.loc);
    const publishedResultDay = torikumiArchive.resultDays.find((day) => day.status === 'published');
    const pendingResultDay = torikumiArchive.resultDays.find((day) => day.status === 'pending');
    const publishedScheduleDay = torikumiArchive.scheduleDays.find((day) => day.status === 'published');
    const pendingScheduleDay = torikumiArchive.scheduleDays.find((day) => day.status === 'pending');

    expect(publishedResultDay).toBeDefined();
    expect(pendingResultDay).toBeDefined();
    expect(publishedScheduleDay).toBeDefined();
    expect(pendingScheduleDay).toBeDefined();
    expect(locs).toContain(`/${publishedResultDay!.pathDate}-torikumi/`);
    expect(locs).not.toContain(`/${pendingResultDay!.pathDate}-torikumi/`);
    expect(locs).toContain(`/${publishedScheduleDay!.pathDate}-yotei/`);
    expect(locs).not.toContain(`/${pendingScheduleDay!.pathDate}-yotei/`);
  });

  it('renders an XML sitemap with absolute canonical URLs', () => {
    const xml = renderSitemapXml();
    const pendingScheduleDay = torikumiArchive.scheduleDays.find((day) => day.status === 'pending');

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain(`<loc>${SITEMAP_ORIGIN}/</loc>`);
    expect(xml).toContain(`<loc>${SITEMAP_ORIGIN}/archives/</loc>`);
    expect(xml).toContain(`<loc>${SITEMAP_ORIGIN}/analytics/</loc>`);
    expect(xml).toContain(`<loc>${SITEMAP_ORIGIN}/${torikumiMonthKey}-torikumi/</loc>`);
    expect(xml).not.toContain(`${SITEMAP_ORIGIN}/${pendingScheduleDay!.pathDate}-yotei/`);
  });
});
