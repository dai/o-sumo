import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchOfficialProfile, officialApiPath, officialProfilePath } from './official-profile';

beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
afterEach(() => vi.unstubAllGlobals());

describe('official profiles', () => {
  it('builds canonical page and API paths from numeric official IDs', () => {
    expect(officialProfilePath('gyoji', 1986)).toBe('/gyoji/1986/');
    expect(officialApiPath('yobidashi', 1935)).toBe('/api/v1/yobidashi/1935.json');
  });

  it('fetches a profile only from its numeric API path', async () => {
    const profile = {
      id: 1986,
      name: '木村 庄之助',
      yomi: 'きむら しょうのすけ',
      realName: '洞澤 裕司',
      rank: '立行司',
      rankCode: 'tate-gyoji',
      affiliation: '九重',
      sourceUrl: 'https://www.sumo.or.jp/Profile/gyoji/1986/',
      kind: 'gyoji',
      birthDate: '1961-10-30',
      birthplace: '東京都府中市',
      adoptedAt: '1977-10',
      retrievedAt: '2026-08-12T00:27:59Z',
      nameHistory: ['木村 裕司', '木村 庄之助'],
    };
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => profile } as Response);

    await expect(fetchOfficialProfile('gyoji', '1986')).resolves.toEqual(profile);
    expect(fetch).toHaveBeenCalledWith('/api/v1/gyoji/1986.json');
  });

  it.each(['0', '-1', '1.5', 'kimura-shonosuke', '../1986'])('rejects invalid official ID %s without fetching', async (id) => {
    await expect(fetchOfficialProfile('gyoji', id)).resolves.toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('treats a profile whose kind or ID does not match the route as not found', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1935, kind: 'yobidashi' }),
    } as Response);

    await expect(fetchOfficialProfile('gyoji', '1986')).resolves.toBeNull();
  });
});
