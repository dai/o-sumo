import { describe, expect, it } from 'vitest';
import {
  prepareShareMetadataHeaders,
  resolveShareMetadataForPayload,
  shareCollectionForPath,
} from './share-meta-response';

describe('share metadata response helpers', () => {
  it.each([
    ['/compare/', 'rikishi'],
    ['/rikishi/4227/', 'rikishi'],
    ['/gyoji/1986/', 'gyoji'],
    ['/yobidashi/1935/', 'yobidashi'],
    ['/archives/', null],
  ])('maps %s to its public index', (pathname, expected) => {
    expect(shareCollectionForPath(pathname)).toBe(expected);
  });

  it('reads officials and emits the production social URL on a preview host', () => {
    expect(resolveShareMetadataForPayload(
      new URL('https://preview.example/gyoji/1986/'),
      'gyoji',
      { officials: [{ id: 1986, name: '木村 庄之助' }] },
    )).toEqual({
      title: '木村 庄之助 | 行司プロフィール | o-sumo',
      description: '木村 庄之助の大相撲行司プロフィール。階級や所属部屋などを紹介します。',
      socialUrl: 'https://osada.us/gyoji/1986/',
    });
  });

  it('uses route-specific fallback metadata for an unknown comparison pair', () => {
    expect(resolveShareMetadataForPayload(
      new URL('https://preview.example/compare/?ids=3842,999999'),
      'rikishi',
      { rikishi: [{ id: 3842, name: '豊昇龍' }] },
    )).toEqual({
      title: '力士比較 | o-sumo',
      description: '幕内・十両力士の合口、体格、得意決まり手、通算成績を比較できます。',
      socialUrl: 'https://osada.us/compare/?ids=3842,999999',
    });
  });

  it('separates Accept variants and removes validators invalidated by rewriting', () => {
    const headers = prepareShareMetadataHeaders(new Headers({
      Vary: 'Origin',
      ETag: '"static-index"',
      'Last-Modified': 'Sun, 31 Aug 2026 00:00:00 GMT',
      'Content-Encoding': 'gzip',
      'Content-Range': 'bytes 0-99/100',
    }));

    expect(headers.get('Vary')).toBe('Origin, Accept');
    expect(headers.get('Cache-Control')).toBe('public, max-age=60, must-revalidate');
    expect(headers.has('ETag')).toBe(false);
    expect(headers.has('Last-Modified')).toBe(false);
    expect(headers.has('Content-Encoding')).toBe(false);
    expect(headers.has('Content-Range')).toBe(false);
  });

  it('does not duplicate Accept in Vary', () => {
    expect(prepareShareMetadataHeaders(new Headers({ Vary: 'Accept, Origin' })).get('Vary'))
      .toBe('Accept, Origin');
  });
});
