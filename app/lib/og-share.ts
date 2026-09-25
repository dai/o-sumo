/**
 * compare ページ OGP 動的生成 — 力士データ解決とキャッシュキー
 *
 * Cloudflare Pages Functions の functions/api/og-compare/[[ids]].ts から
 * 呼ばれる共通ロジック。ids の正規化、SHA256 ハッシュキー生成、力士の
 * 現在場所情報の解決を提供する。
 *
 * 設計の前提:
 * - ids は昇順正規化して A vs B = B vs A を同一キャッシュにする
 * - ハッシュは SHA256 の先頭 8 バイト (16 hex chars) で衝突確率は実質ゼロ
 * - 力士データは ASSETS 経由 (context.env.ASSETS.fetch) で /api/v1/rikishi/{id}.json
 *   と /api/v1/rikishi-matchups.json から取得
 */

import { getRikishiCurrentBashoInfo, type CurrentBashoRikishiInfo } from './rikishi-compare-data';

export type RikooshiId = number;

export interface OgpRikishiData {
  id: RikooshiId;
  name: string;
  yomi: string;
  currentRank: string;
  photoUrl: string;
  basho: CurrentBashoRikishiInfo | null;
}

export interface OgpMatchupData {
  rikishi1Id: number;
  rikishi2Id: number;
  rikishi1Wins: number;
  rikishi2Wins: number;
}

export interface OgpPairContext {
  first: OgpRikishiData;
  second: OgpRikishiData;
  matchup: OgpMatchupData | null;
  /** 第一引数で指定された順での勝数 (first 視点) */
  firstWins: number | null;
  secondWins: number | null;
}

/**
 * ids を昇順正規化する (破壊的でない)。
 */
export function normalizeIds(ids: readonly [number, number]): [number, number] {
  const [a, b] = ids;
  return a <= b ? [a, b] : [b, a];
}

/**
 * ids から SHA256 ハッシュの先頭 16 文字を生成する。
 * Crypto API (Cloudflare Workers / Node.js 18+) で動作。
 */
export async function compareImageKey(ids: readonly [number, number]): Promise<string> {
  const [min, max] = normalizeIds(ids);
  const seed = `compare:${min}:${max}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(seed));
  return Array.from(new Uint8Array(buf))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * share-meta.ts と同じ厳密パース (2件・\d+・重複禁止)。
 * テストで再利用するため export。
 */
export function parseCompareIdsStrict(serialized: string): [number, number] | null {
  const values = serialized.split(',');
  if (values.length !== 2) return null;
  if (values.some((value) => !/^\d+$/.test(value))) return null;
  const ids = values.map(Number);
  if (ids.some((id) => !Number.isSafeInteger(id) || id <= 0)) return null;
  if (ids[0] === ids[1]) return null;
  return [ids[0], ids[1]];
}

/**
 * context.env.ASSETS.fetch の薄いラッパー。テストではモック化される。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AssetsBinding = { fetch: (input: URL | string, init?: RequestInit) => Promise<Response> };

export async function fetchRikishiDetail(
  assets: AssetsBinding,
  baseUrl: URL,
  id: number,
): Promise<OgpRikishiData | null> {
  const url = new URL(`/api/v1/rikishi/${id}.json`, baseUrl);
  const res = await assets.fetch(url);
  if (!res.ok) return null;
  const json = (await res.json()) as Record<string, unknown>;
  const name = typeof json.name === 'string' ? json.name.trim() : '';
  if (!name) return null;
  return {
    id,
    name,
    yomi: typeof json.yomi === 'string' ? json.yomi : '',
    currentRank: typeof json.currentRank === 'string' ? json.currentRank : '',
    photoUrl: typeof json.photoUrl === 'string' ? json.photoUrl : '',
    basho: getRikishiCurrentBashoInfo(id),
  };
}

/**
 * 第一引数で指定された ids 順を保持したまま、合口 (matchup) の勝数を返す。
 * matchup が未登録 (初顔合わせ) の場合は null。
 */
export async function fetchMatchupForPair(
  assets: AssetsBinding,
  baseUrl: URL,
  firstId: number,
  secondId: number,
): Promise<{ matchup: OgpMatchupData; firstWins: number; secondWins: number } | null> {
  const url = new URL('/api/v1/rikishi-matchups.json', baseUrl);
  const res = await assets.fetch(url);
  if (!res.ok) return null;
  const json = (await res.json()) as { matchups?: OgpMatchupData[] };
  const matchups = json.matchups ?? [];
  const found = matchups.find(
    (m) =>
      (m.rikishi1Id === firstId && m.rikishi2Id === secondId) ||
      (m.rikishi1Id === secondId && m.rikishi2Id === firstId),
  );
  if (!found) return null;
  const firstIsMatchFirst = found.rikishi1Id === firstId;
  return {
    matchup: found,
    firstWins: firstIsMatchFirst ? found.rikishi1Wins : found.rikishi2Wins,
    secondWins: firstIsMatchFirst ? found.rikishi2Wins : found.rikishi1Wins,
  };
}

/**
 * 2件の力士 + 合口をまとめて解決する。いずれか取得できない場合は null。
 */
export async function loadOgpPairContext(
  assets: AssetsBinding,
  baseUrl: URL,
  ids: readonly [number, number],
): Promise<OgpPairContext | null> {
  const [firstId, secondId] = ids;
  const [first, second] = await Promise.all([
    fetchRikishiDetail(assets, baseUrl, firstId),
    fetchRikishiDetail(assets, baseUrl, secondId),
  ]);
  if (!first || !second) return null;
  const matchupResult = await fetchMatchupForPair(assets, baseUrl, firstId, secondId);
  return {
    first,
    second,
    matchup: matchupResult?.matchup ?? null,
    firstWins: matchupResult?.firstWins ?? null,
    secondWins: matchupResult?.secondWins ?? null,
  };
}