import { describe, expect, it } from 'vitest';
import { resolveShareMetaOverride } from './share-meta';

const data = {
  rikishi: [
    { id: 3842, name: '豊昇龍' },
    { id: 4227, name: '大の里' },
  ],
  gyoji: [{ id: 1986, name: '木村 庄之助' }],
  yobidashi: [{ id: 1935, name: '克之' }],
};

describe('resolveShareMetaOverride', () => {
  it('uses both selected rikishi names for a comparison share URL', () => {
    expect(resolveShareMetaOverride(new URL('https://osada.us/compare/?ids=3842,4227'), data)).toEqual({
      title: '豊昇龍と大の里の比較 | o-sumo',
      description: '大相撲力士豊昇龍と大の里の合口、体格、得意決まり手、通算成績を比較できます。',
      socialUrl: 'https://osada.us/compare/?ids=3842,4227',
    });
  });

  it.each([
    ['https://osada.us/compare/', 'comparison without ids'],
    ['https://osada.us/compare/?ids=3842', 'comparison with one id'],
    ['https://osada.us/compare/?ids=3842,3842', 'comparison with duplicate ids'],
    ['https://osada.us/compare/?ids=3842,9999', 'comparison with unknown id'],
  ])('returns no override for %s (%s)', (input) => {
    expect(resolveShareMetaOverride(new URL(input), data)).toBeNull();
  });

  it.each([
    ['https://osada.us/rikishi/4227/', '大の里 | 力士プロフィール | o-sumo'],
    ['https://osada.us/gyoji/1986/', '木村 庄之助 | 行司プロフィール | o-sumo'],
    ['https://osada.us/yobidashi/1935/', '克之 | 呼出プロフィール | o-sumo'],
  ])('uses the loaded name for %s', (input, title) => {
    expect(resolveShareMetaOverride(new URL(input), data)).toMatchObject({
      title,
      socialUrl: input,
    });
  });

  it('does not override an unsupported path or an unknown profile', () => {
    expect(resolveShareMetaOverride(new URL('https://osada.us/rikishi/9999/'), data)).toBeNull();
    expect(resolveShareMetaOverride(new URL('https://osada.us/archives/'), data)).toBeNull();
  });
});
