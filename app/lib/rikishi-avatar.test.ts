import {
  basicRikishiPlaceholderDataUrl,
  generatedRikishiAvatarDataUrl,
  isLocalRikishiImagePath,
  localRikishiImagePath,
  responsiveRikishiImage,
  shouldGenerateRikishiAvatar,
} from './rikishi-avatar';

describe('generatedRikishiAvatarDataUrl', () => {
  it('returns deterministic output for the same rikishi seed', () => {
    const seed = { id: 1, name: '豊昇龍', side: 'east' as const };
    const first = generatedRikishiAvatarDataUrl(seed);
    const second = generatedRikishiAvatarDataUrl(seed);

    expect(first).toBe(second);
  });

  it('returns different output for different rikishi seeds', () => {
    const first = generatedRikishiAvatarDataUrl({ id: 1, name: '豊昇龍', side: 'east' });
    const second = generatedRikishiAvatarDataUrl({ id: 2, name: '照ノ富士', side: 'west' });

    expect(first).not.toBe(second);
  });

  it('embeds an SVG payload as data URL', () => {
    const url = generatedRikishiAvatarDataUrl({ id: 42, name: '琴櫻', side: 'east' });
    expect(url.startsWith('data:image/svg+xml;charset=UTF-8,')).toBe(true);

    const encoded = url.split(',')[1] ?? '';
    const svg = decodeURIComponent(encoded);

    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox="0 0 112 112"');
  });

  it('generates only for makuuchi rikishi and 錦木', () => {
    expect(shouldGenerateRikishiAvatar({ rank: '前頭1', name: '豊昇龍' })).toBe(true);
    expect(shouldGenerateRikishiAvatar({ rank: '十両5', name: '錦木' })).toBe(true);
    expect(shouldGenerateRikishiAvatar({ rank: '十両5', name: '朝紅龍' })).toBe(false);
  });

  it('returns a legacy placeholder data URL for non-generated targets', () => {
    const url = basicRikishiPlaceholderDataUrl('朝紅龍');
    expect(url.startsWith('data:image/svg+xml;charset=UTF-8,')).toBe(true);
    expect(decodeURIComponent(url.split(',')[1] ?? '')).toContain('力士プレースホルダ');
  });

  it('builds the local processed rikishi image path', () => {
    expect(localRikishiImagePath(3842)).toBe('/images/rikishi/3842.png');
  });

  it('detects locally managed rikishi image paths', () => {
    expect(isLocalRikishiImagePath('/images/rikishi/3842.png')).toBe(true);
    expect(isLocalRikishiImagePath('/images/rikishi/3842-96.webp')).toBe(true);
    expect(isLocalRikishiImagePath('/images/rikishi/3842-192.avif')).toBe(true);
    expect(isLocalRikishiImagePath('https://example.com/profile.jpg')).toBe(false);
    expect(isLocalRikishiImagePath('')).toBe(false);
  });

  it('builds 96, 192, and 384 px srcsets for the banzuke slot', () => {
    const image = responsiveRikishiImage(3842, 'banzuke');

    expect(image.src).toBe('/images/rikishi/3842-96.webp');
    expect(image.avifSrcSet).toBe(
      '/images/rikishi/3842-96.avif 96w, /images/rikishi/3842-192.avif 192w, /images/rikishi/3842-384.avif 384w',
    );
    expect(image.webpSrcSet).toBe(
      '/images/rikishi/3842-96.webp 96w, /images/rikishi/3842-192.webp 192w, /images/rikishi/3842-384.webp 384w',
    );
    expect(image.sizes).toBe('(max-width: 480px) 48px, (max-width: 768px) 56px, 104px');
    expect(image.width).toBe(112);
    expect(image.height).toBe(112);
  });

  it('uses the profile photo box for the profile slot', () => {
    const image = responsiveRikishiImage('4227', 'profile');

    expect(image.sizes).toBe('(max-width: 720px) 96px, 128px');
    expect(image.width).toBe(128);
    expect(image.height).toBe(128);
    expect(image.src).toBe('/images/rikishi/4227-96.webp');
  });
});
