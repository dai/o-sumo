import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { RIKISHI_IMAGE_WIDTHS } from './rikishi-avatar';

const portraitDir = join(process.cwd(), 'public/images/rikishi');

describe('committed rikishi image variants', () => {
  it('keeps a 96, 192, and 384 px webp and avif next to every png original', () => {
    const sources = readdirSync(portraitDir).filter((name) => /^\d+\.png$/i.test(name));
    expect(sources.length).toBeGreaterThan(0);

    const missing: string[] = [];
    for (const source of sources) {
      const id = source.replace(/\.png$/i, '');
      for (const width of RIKISHI_IMAGE_WIDTHS) {
        for (const format of ['webp', 'avif'] as const) {
          const variant = `${id}-${width}.${format}`;
          try {
            if (statSync(join(portraitDir, variant)).size === 0) missing.push(variant);
          } catch {
            missing.push(variant);
          }
        }
      }
    }

    expect(missing).toEqual([]);
  });

  it('stores a square 96 px webp small enough for the banzuke thumbnails', async () => {
    const file = join(portraitDir, '4227-96.webp');
    const meta = await sharp(file).metadata();

    expect(meta.format).toBe('webp');
    expect(meta.width).toBe(96);
    expect(meta.height).toBe(96);
    expect(statSync(file).size).toBeLessThan(8 * 1024);
    expect(readFileSync(join(portraitDir, '4227-96.avif')).subarray(4, 8).toString()).toBe('ftyp');
    expect(statSync(join(portraitDir, '4227.png')).size).toBeGreaterThan(10 * 1024);
  });
});
