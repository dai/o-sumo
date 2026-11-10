/**
 * 力士プロフィール画像の配信サイズを作る。
 * Build the sized WebP and AVIF portraits served from the banzuke and profile pages.
 *
 * PNG（中身が JPEG のものも含む）は原本として残し、横に次を書き出す:
 * Original PNG files (including JPEG data saved as .png) are kept. Beside each one:
 *   {id}-96.webp   {id}-96.avif
 *   {id}-192.webp  {id}-192.avif
 *   {id}-384.webp  {id}-384.avif
 *
 *   node scripts/optimize_rikishi_images.mjs
 *   node scripts/optimize_rikishi_images.mjs --force
 */

import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(HERE, '..');
const DEFAULT_DIR = path.join(PROJECT_ROOT, 'public/images/rikishi');

export const RIKISHI_VARIANT_WIDTHS = [96, 192, 384];
export const RIKISHI_VARIANT_FORMATS = ['webp', 'avif'];

const WEBP_QUALITY = 68;
const AVIF_QUALITY = 45;
const ENCODE_EFFORT = 4;
const CONCURRENCY = 4;

const SOURCE_NAME = /^(\d+)\.(?:png|jpe?g)$/i;

export function sourcePortraitId(fileName) {
  return SOURCE_NAME.exec(fileName)?.[1] ?? null;
}

export function variantFileName(id, width, format) {
  return `${id}-${width}.${format}`;
}

function parseArgs(argv) {
  let directory = DEFAULT_DIR;
  let force = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--force') {
      force = true;
    } else if (arg === '--dir') {
      const next = argv[index + 1];
      if (!next) throw new Error('--dir requires a path');
      directory = path.resolve(next);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return { directory, force };
}

async function isFresh(sourcePath, outputPath) {
  try {
    const [sourceStat, outputStat] = await Promise.all([stat(sourcePath), stat(outputPath)]);
    return outputStat.size > 0 && outputStat.mtimeMs >= sourceStat.mtimeMs;
  } catch {
    return false;
  }
}

async function encodeVariant(sharp, sourcePath, outputPath, width, format) {
  const pipeline = sharp(sourcePath, { failOn: 'none' })
    .rotate()
    .resize(width, width, { fit: 'cover', position: 'centre' });
  if (format === 'webp') {
    await pipeline.webp({ quality: WEBP_QUALITY, effort: ENCODE_EFFORT, smartSubsample: true }).toFile(outputPath);
    return;
  }
  if (format === 'avif') {
    await pipeline.avif({ quality: AVIF_QUALITY, effort: ENCODE_EFFORT }).toFile(outputPath);
    return;
  }
  throw new Error(`Unsupported format: ${format}`);
}

export async function optimizePortrait(sharp, sourcePath, outputDir, { force = false } = {}) {
  const id = sourcePortraitId(path.basename(sourcePath));
  if (!id) throw new Error(`Not a rikishi portrait source: ${sourcePath}`);

  let written = 0;
  let skipped = 0;
  let bytes = 0;
  for (const width of RIKISHI_VARIANT_WIDTHS) {
    for (const format of RIKISHI_VARIANT_FORMATS) {
      const outputPath = path.join(outputDir, variantFileName(id, width, format));
      if (!force && await isFresh(sourcePath, outputPath)) {
        skipped += 1;
        bytes += (await stat(outputPath)).size;
        continue;
      }
      await encodeVariant(sharp, sourcePath, outputPath, width, format);
      written += 1;
      bytes += (await stat(outputPath)).size;
    }
  }
  return { id, written, skipped, bytes };
}

async function mapPool(items, limit, worker) {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      await worker(item);
    }
  });
  await Promise.all(runners);
}

export async function optimizeRikishiImages({ directory = DEFAULT_DIR, force = false, sharp } = {}) {
  const encoder = sharp ?? (await import('sharp')).default;
  const names = (await readdir(directory)).filter((name) => sourcePortraitId(name));
  names.sort();
  if (names.length === 0) throw new Error(`No rikishi portraits in ${directory}`);

  let written = 0;
  let skipped = 0;
  let bytes = 0;
  let sourceBytes = 0;
  await mapPool(names, CONCURRENCY, async (name) => {
    const sourcePath = path.join(directory, name);
    sourceBytes += (await stat(sourcePath)).size;
    const result = await optimizePortrait(encoder, sourcePath, directory, { force });
    written += result.written;
    skipped += result.skipped;
    bytes += result.bytes;
  });

  return {
    portraits: names.length,
    written,
    skipped,
    variantBytes: bytes,
    sourceBytes,
  };
}

function formatMiB(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
}

async function main() {
  const { directory, force } = parseArgs(process.argv.slice(2));
  const summary = await optimizeRikishiImages({ directory, force });
  console.log(
    `optimized ${summary.portraits} portraits: `
    + `wrote ${summary.written}, skipped ${summary.skipped}, `
    + `variants ${formatMiB(summary.variantBytes)}, originals ${formatMiB(summary.sourceBytes)}`,
  );
}

const invokedDirectly = process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (invokedDirectly) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
