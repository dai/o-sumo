import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Roots whose text can be painted with the self-hosted webfonts. */
export const DISPLAYED_TEXT_ROOTS = ['app', 'src', 'public', 'index.html'] as const;

const SKIP_DIRECTORIES = new Set([
  'node_modules',
  'dist',
  'dist-blog',
  '.git',
  'images',
  '.cache',
]);

const SKIP_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.avif',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.zip',
  '.wasm',
  '.pdf',
  '.map',
]);

/**
 * Characters the webfont stack is not expected to draw. Emoji and variation
 * selectors come from the platform emoji font.
 */
export function isRequiredWebfontCharacter(character: string): boolean {
  const codePoint = character.codePointAt(0);
  if (codePoint === undefined) return false;
  if (codePoint < 0x20 || codePoint === 0x7f) return false;
  if (codePoint >= 0xfe00 && codePoint <= 0xfe0f) return false;
  if (codePoint === 0x200d) return false;
  if (codePoint >= 0x1f000) return false;
  return true;
}

function walk(path: string, characters: Set<string>): void {
  const stats = statSync(path);
  if (stats.isDirectory()) {
    for (const entry of readdirSync(path)) {
      if (SKIP_DIRECTORIES.has(entry)) continue;
      walk(join(path, entry), characters);
    }
    return;
  }

  const dot = path.lastIndexOf('.');
  if (dot !== -1 && SKIP_EXTENSIONS.has(path.slice(dot).toLowerCase())) return;

  const bytes = readFileSync(path);
  if (bytes.subarray(0, 1024).includes(0)) return;

  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return;
  }

  for (const character of text) {
    characters.add(character);
  }
}

/** Unique characters that appear in displayed site text, sorted by code point. */
export function collectDisplayedCharacters(repoRoot: string): string {
  const characters = new Set<string>();
  for (const root of DISPLAYED_TEXT_ROOTS) {
    walk(join(repoRoot, root), characters);
  }
  return [...characters]
    .sort((left, right) => (left.codePointAt(0) ?? 0) - (right.codePointAt(0) ?? 0))
    .join('');
}
