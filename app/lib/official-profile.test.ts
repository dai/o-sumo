import { describe, expect, it, vi } from 'vitest';
import { fetchOfficialProfile, officialApiPath, officialProfilePath } from './official-profile';

describe('official profiles', () => {
  it('builds canonical page and API paths', () => {
    expect(officialProfilePath('gyoji', 'kimura-shonosuke')).toBe('/gyoji/kimura-shonosuke/');
    expect(officialApiPath('yobidashi', 'jiro')).toBe('/api/v1/yobidashi/jiro.json');
  });
  it('rejects unsafe IDs without fetching', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await expect(fetchOfficialProfile('gyoji', '../secret')).resolves.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
