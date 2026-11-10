import { toRomaji } from './romaji';

describe('toRomaji', () => {
  it('uses the Japan Sumo Association ring-name spelling', () => {
    expect(toRomaji('おおのさと')).toBe('Onosato');
    expect(toRomaji('ほうしょうりゅう')).toBe('Hoshoryu');
    expect(toRomaji('おうほう')).toBe('Oho');
    expect(toRomaji('りゅうほう')).toBe('Ryuho');
  });

  it('keeps the う that starts うみ and a leading う', () => {
    expect(toRomaji('さだのうみ')).toBe('Sadanoumi');
    expect(toRomaji('ひらどうみ')).toBe('Hiradoumi');
    expect(toRomaji('おうしょううみ')).toBe('Oshoumi');
    expect(toRomaji('しまづうみ')).toBe('Shimazuumi');
    expect(toRomaji('うら')).toBe('Ura');
  });

  it('capitalizes each word when the reading has a space', () => {
    expect(toRomaji('きむら しょうのすけ')).toBe('Kimura Shonosuke');
  });
});
