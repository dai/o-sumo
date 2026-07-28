export const SITE_ORIGIN = 'https://osada.us';

export function normalizeCanonicalPath(path: string): string {
  const pathname = path.split(/[?#]/, 1)[0] || '/';
  if (pathname === '/') {
    return pathname;
  }
  return `${pathname.replace(/\/+$/, '')}/`;
}

export function toCanonicalUrl(path: string): string {
  return `${SITE_ORIGIN}${normalizeCanonicalPath(path)}`;
}
