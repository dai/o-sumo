export function shouldCachePublicApi(url: URL): boolean {
  if (!url.pathname.startsWith('/api/')) return false;
  if (url.pathname.startsWith('/api/auth/')) return false;
  if (url.pathname === '/api/my-rikishi' || url.pathname.startsWith('/api/my-rikishi/')) return false;
  return true;
}
