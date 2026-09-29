import { describe, expect, it } from 'vitest';
import { shouldCachePublicApi } from './api-cache-policy';

describe('service worker API cache policy', () => {
  it('caches public data APIs', () => {
    expect(shouldCachePublicApi(new URL('https://osada.us/api/v1/rikishi.json'))).toBe(true);
  });

  it('never caches session or user-specific My Rikishi APIs', () => {
    expect(shouldCachePublicApi(new URL('https://osada.us/api/auth/session'))).toBe(false);
    expect(shouldCachePublicApi(new URL('https://osada.us/api/my-rikishi'))).toBe(false);
    expect(shouldCachePublicApi(new URL('https://osada.us/api/my-rikishi/1'))).toBe(false);
  });
});
