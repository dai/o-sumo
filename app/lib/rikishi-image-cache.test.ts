import { describe, expect, it } from 'vitest';
import { shouldCacheRikishiImage } from './rikishi-image-cache';

describe('rikishi image runtime cache', () => {
  it('matches png originals and the generated webp and avif sizes', () => {
    expect(shouldCacheRikishiImage(new URL('https://osada.us/images/rikishi/3842.png'))).toBe(true);
    expect(shouldCacheRikishiImage(new URL('https://osada.us/images/rikishi/3842.jpg'))).toBe(true);
    expect(shouldCacheRikishiImage(new URL('https://osada.us/images/rikishi/3842-96.webp'))).toBe(true);
    expect(shouldCacheRikishiImage(new URL('https://osada.us/images/rikishi/3842-192.avif'))).toBe(true);
    expect(shouldCacheRikishiImage(new URL('https://osada.us/images/rikishi/3842-384.webp'))).toBe(true);
    expect(shouldCacheRikishiImage(new URL('https://osada.us/images/rikishi/3842.svg'))).toBe(true);
  });

  it('ignores other directories and non-portrait files', () => {
    expect(shouldCacheRikishiImage(new URL('https://osada.us/images/matchups/a.png'))).toBe(false);
    expect(shouldCacheRikishiImage(new URL('https://osada.us/images/rikishi/README.md'))).toBe(false);
    expect(shouldCacheRikishiImage(new URL('https://osada.us/images/rikishi/not-an-id.webp'))).toBe(false);
  });
});
