/** Same pattern as the generateSW urlPattern in vite.config.ts. */
const RIKISHI_IMAGE_PATH = /^\/images\/rikishi\/\d+(?:-\d+)?\.(?:png|jpe?g|webp|avif|svg)$/i;

export function shouldCacheRikishiImage(url: URL): boolean {
  return RIKISHI_IMAGE_PATH.test(url.pathname);
}
