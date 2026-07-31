import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import {
  assessHeadMetadata,
  assessRouting,
  assessSitemapLocations,
  deriveRequiredSitemapPaths,
  getPendingTorikumiPaths,
  getRepresentativePages,
  summarizeEnvironment,
  toEnvironmentUrl,
} from './delivery-verification.mjs';

describe('delivery verification result validation', () => {
  it('validates collected HTTP and sitemap fixtures through its executable interface', () => {
    const child = spawnSync('node', ['scripts/delivery-verification.mjs', '--validate'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      input: JSON.stringify({
        routing: [
          { path: '/', expectedStatus: 200, expectedLocation: '', actualStatus: 200, actualLocation: '' },
        ],
        sitemapLocations: ['https://osada.us/'],
      }),
    });

    expect(child.status).toBe(0);
    expect(JSON.parse(child.stdout)).toMatchObject({
      routing: { status: 'OK' },
      sitemap: { status: 'OK', paths: ['/'] },
    });
  });

  it('accepts unique canonical sitemap locations and maps them to the environment paths', () => {
    const result = assessSitemapLocations([
      'https://osada.us/',
      'https://osada.us/archives/',
      'https://osada.us/rikishi/3842/',
    ]);

    expect(result.status).toBe('OK');
    expect(result.paths).toEqual(['/', '/archives/', '/rikishi/3842/']);
    expect(result.issues).toEqual([]);
  });

  it('requires a non-empty sitemap', () => {
    const result = assessSitemapLocations([]);

    expect(result.status).toBe('ISSUE');
    expect(result.issues).toContain('sitemap must contain at least one location');
  });

  it('accepts all independently required profile, fixed, hub, and published day paths', () => {
    const rikishi = Array.from({ length: 70 }, (_, index) => ({ id: 5000 + index }));
    const required = deriveRequiredSitemapPaths(
      { rikishi },
      {
        resultDays: [
          { pathDate: '20990101', status: 'published' },
          { pathDate: '20990102', status: 'pending' },
        ],
        scheduleDays: [{ pathDate: '20990102', status: 'published' }],
      },
    );
    const locations = required.paths.map((path) => `https://osada.us${path}`);

    expect(required.issues).toEqual([]);
    expect(required.paths.filter((path) => path.startsWith('/rikishi/') && path !== '/rikishi/')).toHaveLength(70);
    expect(assessSitemapLocations(locations, ['/20990102-torikumi/'], required.paths)).toMatchObject({
      status: 'OK',
      issues: [],
    });
  });

  it('rejects a sitemap missing one independently required profile path', () => {
    const rikishi = Array.from({ length: 70 }, (_, index) => ({ id: 5000 + index }));
    const required = deriveRequiredSitemapPaths(
      { rikishi },
      { resultDays: [{ pathDate: '20990101', status: 'published' }], scheduleDays: [] },
    );
    const locations = required.paths
      .filter((path) => path !== '/rikishi/5069/')
      .map((path) => `https://osada.us${path}`);
    const result = assessSitemapLocations(locations, [], required.paths);

    expect(result.status).toBe('ISSUE');
    expect(result.issues).toContain('sitemap is missing required path: /rikishi/5069/');
  });

  it('reports invalid rikishi and torikumi indexes as completeness issues', () => {
    const required = deriveRequiredSitemapPaths(
      { rikishi: [{ id: 1 }, { id: 1 }] },
      { resultDays: 'broken', scheduleDays: [] },
    );

    expect(required.issues).toEqual(expect.arrayContaining([
      'rikishi index contains duplicate id: 1',
      'torikumi resultDays must be an array',
    ]));
  });

  it.each([
    ['duplicate locations', ['https://osada.us/', 'https://osada.us/']],
    ['a non-canonical origin', ['https://example.com/archives/']],
    ['a path without a trailing slash', ['https://osada.us/archives']],
    ['an API path', ['https://osada.us/api/v1/rikishi.json']],
    ['a legacy path', ['https://osada.us/202603-banduke/']],
    ['a duplicate-slash path', ['https://osada.us/archives//']],
  ])('rejects %s in sitemap locations', (_label, locations) => {
    const result = assessSitemapLocations(locations);

    expect(result.status).toBe('ISSUE');
    expect(result.issues).not.toEqual([]);
  });

  it('rejects sitemap entries belonging to independently derived pending days', () => {
    const pendingPaths = getPendingTorikumiPaths({
      resultDays: [{ pathDate: '20260712', status: 'pending' }],
      scheduleDays: [{ pathDate: '20260713', status: 'pending' }],
    });
    const result = assessSitemapLocations([
      'https://osada.us/20260712-torikumi/',
      'https://osada.us/20260713-yotei/',
    ], pendingPaths);

    expect(pendingPaths).toEqual(['/20260712-torikumi/', '/20260713-yotei/']);
    expect(result.status).toBe('ISSUE');
    expect(result.issues).toEqual(expect.arrayContaining([
      'sitemap location is excluded: https://osada.us/20260712-torikumi/',
      'sitemap location is excluded: https://osada.us/20260713-yotei/',
    ]));
  });

  it('requires one complete, internally consistent rendered metadata set per page', () => {
    const result = assessHeadMetadata({
      canonical: ['https://osada.us/rikishi/3842/'],
      description: ['力士プロフィール'],
      'og:title': ['力士プロフィール | o-sumo'],
      'og:description': ['力士プロフィール'],
      'og:url': ['https://osada.us/rikishi/3842/'],
      'og:image': ['https://osada.us/og-default.jpg'],
      'og:type': ['website'],
      'og:site_name': ['o-sumo'],
      'og:image:width': ['1629'],
      'og:image:height': ['1007'],
      'twitter:card': ['summary_large_image'],
      'twitter:title': ['力士プロフィール | o-sumo'],
      'twitter:description': ['力士プロフィール'],
      'twitter:image': ['https://osada.us/og-default.jpg'],
    });

    expect(result.status).toBe('OK');
    expect(result.issues).toEqual([]);
  });

  it('reports duplicate, mismatched, and wrong-image rendered metadata', () => {
    const result = assessHeadMetadata({
      canonical: ['https://osada.us/', 'https://osada.us/'],
      description: ['home'],
      'og:title': ['home'],
      'og:description': ['home'],
      'og:url': ['https://osada.us/archives/'],
      'og:image': ['https://osada.us/other.jpg'],
      'og:type': ['website'],
      'og:site_name': ['o-sumo'],
      'og:image:width': ['1629'],
      'og:image:height': ['1007'],
      'twitter:card': ['summary_large_image'],
      'twitter:title': ['home'],
      'twitter:description': ['home'],
      'twitter:image': ['https://osada.us/other.jpg'],
    });

    expect(result.status).toBe('ISSUE');
    expect(result.issues).toEqual(expect.arrayContaining([
      'canonical must appear exactly once (found 2)',
      'canonical must equal og:url',
      'og:image must be https://osada.us/og-default.jpg',
      'twitter:image must be https://osada.us/og-default.jpg',
    ]));
  });

  it('requires the rendered canonical URL to match the representative route', () => {
    const result = assessHeadMetadata({
      canonical: ['https://osada.us/'],
      description: ['archive'],
      'og:title': ['archive'],
      'og:description': ['archive'],
      'og:url': ['https://osada.us/'],
      'og:image': ['https://osada.us/og-default.jpg'],
      'og:type': ['website'],
      'og:site_name': ['o-sumo'],
      'og:image:width': ['1629'],
      'og:image:height': ['1007'],
      'twitter:card': ['summary_large_image'],
      'twitter:title': ['archive'],
      'twitter:description': ['archive'],
      'twitter:image': ['https://osada.us/og-default.jpg'],
    }, 'https://osada.us/archives/');

    expect(result.issues).toContain('canonical must equal https://osada.us/archives/');
  });

  it('rejects a generic metadata set when the route has its own title and description', () => {
    const result = assessHeadMetadata({
      canonical: ['https://osada.us/202607-banzuke/'],
      description: ['generic'],
      'og:title': ['generic'],
      'og:description': ['generic'],
      'og:url': ['https://osada.us/202607-banzuke/'],
      'og:image': ['https://osada.us/og-default.jpg'],
      'og:type': ['website'],
      'og:site_name': ['o-sumo'],
      'og:image:width': ['1629'],
      'og:image:height': ['1007'],
      'twitter:card': ['summary_large_image'],
      'twitter:title': ['generic'],
      'twitter:description': ['generic'],
      'twitter:image': ['https://osada.us/og-default.jpg'],
    }, {
      canonicalUrl: 'https://osada.us/202607-banzuke/',
      title: '2026年7月場所 番付 | o-sumo',
      description: '2026年7月場所の番付を確認できます。',
    });

    expect(result.issues).toEqual(expect.arrayContaining([
      'title must equal 2026年7月場所 番付 | o-sumo',
      'description must equal 2026年7月場所の番付を確認できます。',
    ]));
  });

  it('uses distinct representative routes and normalizes each environment URL', () => {
    const pages = getRepresentativePages();
    const paths = pages.map((page) => page.path);

    expect(paths).toEqual(expect.arrayContaining([
      '/202607-banzuke/',
      '/202607-torikumi/',
      '/20260712-torikumi/',
      '/20260310-yotei/',
    ]));
    expect(toEnvironmentUrl('http://127.0.0.1:8788/', '/202607-banzuke/')).toBe('http://127.0.0.1:8788/202607-banzuke/');
    expect(pages).toContainEqual({
      path: '/20260712-torikumi/',
      canonicalUrl: 'https://osada.us/20260712-torikumi/',
      title: '2026年7月場所 初日 取組・星取表 | o-sumo',
      description: '2026年7月場所初日の取組結果と星取表を確認できます。',
    });
    expect(pages).toContainEqual({
      path: '/20260310-yotei/',
      canonicalUrl: 'https://osada.us/20260310-yotei/',
      title: '2026年3月場所 三日目 取組予定 | o-sumo',
      description: '2026年3月場所三日目の取組予定を確認できます。',
    });
  });

  it('marks omitted local and preview environments as skipped without affecting an otherwise passing overall status', () => {
    const environments = [
      summarizeEnvironment('BASE', 'https://osada.us', 'OK', 'OK', 'OK'),
      summarizeEnvironment('LOCAL', '', 'SKIPPED', 'SKIPPED', 'SKIPPED'),
      summarizeEnvironment('PREVIEW', '', 'SKIPPED', 'SKIPPED', 'SKIPPED'),
    ];

    expect(environments.map((environment) => environment.status)).toEqual(['OK', 'SKIPPED', 'SKIPPED']);
    expect(environments.some((environment) => environment.status === 'ISSUE')).toBe(false);
    expect(summarizeEnvironment('LOCAL', 'http://127.0.0.1:8788', 'OK', 'ISSUE', 'OK').status).toBe('ISSUE');
    expect(summarizeEnvironment('PREVIEW', 'https://preview.example', 'ISSUE', 'OK', 'OK').status).toBe('ISSUE');
  });

  it('checks expected HTTP statuses and redirect locations', () => {
    const result = assessRouting([
      { path: '/', expectedStatus: 200, expectedLocation: '', actualStatus: 200, actualLocation: '' },
      { path: '/archives', expectedStatus: 301, expectedLocation: '/archives/', actualStatus: 301, actualLocation: '/archives/' },
      { path: '/missing', expectedStatus: 404, expectedLocation: '', actualStatus: 404, actualLocation: '' },
    ]);

    expect(result.status).toBe('OK');
    expect(result.issues).toEqual([]);
  });

  it('reports a route that resolves with the wrong status or redirect target', () => {
    const result = assessRouting([
      { path: '/rikishi/3842', expectedStatus: 301, expectedLocation: '/rikishi/3842/', actualStatus: 200, actualLocation: '' },
    ]);

    expect(result.status).toBe('ISSUE');
    expect(result.issues).toEqual([
      '/rikishi/3842: expected 301 /rikishi/3842/, received 200 -',
    ]);
  });
});
