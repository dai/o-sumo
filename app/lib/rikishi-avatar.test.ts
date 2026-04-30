import {
  basicRikishiPlaceholderDataUrl,
  generatedRikishiAvatarDataUrl,
  isLocalRikishiImagePath,
  localRikishiImagePath,
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
    expect(isLocalRikishiImagePath('https://example.com/profile.jpg')).toBe(false);
    expect(isLocalRikishiImagePath('')).toBe(false);
  });
});
