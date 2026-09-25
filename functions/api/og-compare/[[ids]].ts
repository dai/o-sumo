/**
 * /api/og-compare/{ids} — compare ページ OGP リダイレクト (prerendered)
 *
 * Cloudflare Pages Functions の構成:
 * - URL 例: /api/og-compare/4227,3622 (カンマ区切り ids を path に取り込む)
 * - レスポンス: 302 リダイレクト (KV に登録済みの静的 PNG URL へ、または静的フォールバック)
 *
 * 設計:
 * - 画像生成は build time で実施済み (`scripts/build-compare-ogp-matchups.mjs`)。
 *   runtime では KV ルックアップのみを担当する。
 * - KV キー: `compare/matchup/{hash16}` (compareImageKey() で生成)
 * - KV 値: `/images/matchups/{hash16}.png` のような静的相対パス文字列
 * - 該当が無ければ og-compare-default.jpg にフォールバック。
 *
 * フィーチャーフラグ:
 * - `env.COMPARE_OG_ENABLED === 'false'` で完全バイパス (緊急時)
 * - KV バインディング欠落時もフォールバックに倒して開発環境で動く
 */

import type {
  PagesFunction,
  EventContext,
  KVNamespace,
} from '@cloudflare/workers-types';
import {
  compareImageKey,
  normalizeIds,
} from '../../../app/lib/og-share';

interface CompareOgEnv {
  COMPARE_OG_CACHE?: KVNamespace;
  COMPARE_OG_ENABLED?: string;
}

const IMAGE_VERSION = '2';

function parseIdsParam(raw: string | string[] | undefined): [number, number] | null {
  const serialized = Array.isArray(raw) ? raw[0] ?? '' : raw ?? '';
  const match = serialized.match(/^(\d+),(\d+)$/);
  if (!match) return null;
  const a = Number.parseInt(match[1], 10);
  const b = Number.parseInt(match[2], 10);
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b) || a <= 0 || b <= 0) return null;
  if (a === b) return null;
  return [a, b];
}

/**
 * 静的フォールバック (og-compare-default.jpg) を 302 リダイレクトで返す。
 * - bot は Location を辿って fetch するため 200 直ではなく 302
 * - フォールバック URL は Cache-Control no-store にして CDN 汚染を防ぐ
 */
function staticFallback(reason: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/images/og-compare-default.jpg?v=${encodeURIComponent(IMAGE_VERSION)}`,
      'X-Compare-Og-Reason': reason,
      'Cache-Control': 'no-store',
    },
  });
}

/**
 * プリレンダ済み PNG への 302 リダイレクト。
 * - Cache-Control はブラウザ 5分 / CDN 1日 (画像自体は immutable で長キャッシュ)
 * - X-Compare-Og-* ヘッダで運用観測 (HIT率, どのペアが多いか)
 */
function matchupRedirect(imagePath: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${imagePath}?v=${encodeURIComponent(IMAGE_VERSION)}`,
      'Cache-Control': 'public, max-age=300, s-maxage=86400',
      'X-Compare-Og-Cache': 'HIT',
      'X-Compare-Og-Path': imagePath,
    },
  });
}

export const onRequestGet = (async (
  context: EventContext<CompareOgEnv, any, Record<string, unknown>>,
): Promise<Response> => {
  const env = context.env ?? {};

  if (env.COMPARE_OG_ENABLED === 'false') {
    return staticFallback('feature-disabled');
  }

  const rawIds = parseIdsParam(context.params.ids);
  if (!rawIds) {
    return staticFallback('invalid-ids');
  }

  const cache = env.COMPARE_OG_CACHE;
  if (!cache) {
    return staticFallback('cache-unbound');
  }

  const normalized = normalizeIds(rawIds);
  const key = await compareImageKey(normalized);
  const cacheKey = `compare/matchup/${key}`;

  const imagePath = await cache.get(cacheKey);
  if (typeof imagePath !== 'string' || !imagePath.startsWith('/')) {
    return staticFallback('cache-miss');
  }

  return matchupRedirect(imagePath);
}) as unknown as PagesFunction<CompareOgEnv>;
