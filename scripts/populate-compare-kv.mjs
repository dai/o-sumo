/**
 * scripts/populate-compare-kv.mjs
 *
 * 目的:
 *   scripts/compare-ogp-matchups-manifest.json を読み、Cloudflare KV
 *   (COMPARE_OG_CACHE) に `compare/matchup/{key} -> /images/matchups/{key}.png`
 *   を bulk put する。
 *
 * 出力フォーマットは wrangler CLI 4.x の `kv bulk put` が受け付ける
 * JSON array (1 ファイル = 1 配列 = 30 JSON object)。
 *
 * 使い方:
 *   # 1) JSON 配列だけ書き出したい (目視確認 / 別経路での投入)
 *   node scripts/populate-compare-kv.mjs > /tmp/compare-ogp-kv.json
 *
 *   # 2) wrangler CLI で直接投入
 *   wrangler kv bulk put --binding COMPARE_OG_CACHE --remote /tmp/compare-ogp-kv.json
 *
 *   # 3) スクリプトから直接適用 (推奨)
 *   node scripts/populate-compare-kv.mjs --apply
 *
 * 前提:
 *   - scripts/build-compare-ogp-matchups.mjs を実行済みで manifest が最新。
 *   - wrangler 認証済み (cloudflared login or CLOUDFLARE_API_KEY env)。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(HERE, '..');
const MANIFEST_PATH = path.join(HERE, 'compare-ogp-matchups-manifest.json');

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error(`[FAIL] manifest not found: ${MANIFEST_PATH}`);
  console.error('  先に: npm run build:matchups');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const entries = Array.isArray(manifest.entries) ? manifest.entries : [];

if (entries.length === 0) {
  console.error('[FAIL] manifest has no entries');
  process.exit(1);
}

const KV_BINDING = 'COMPARE_OG_CACHE';

// wrangler 4.x の `kv bulk put` は JSON array を要求する (NDJSON ではない)。
const jsonArray = `[${entries
  .map((e) =>
    JSON.stringify({
      key: `compare/matchup/${e.key}`,
      value: e.imagePath,
    }),
  )
  .join(',')}]` + '\n';

const args = process.argv.slice(2);
const applyMode = args.includes('--apply');

if (!applyMode) {
  process.stdout.write(jsonArray);
  console.error(`[info] ${entries.length} entries ready (use --apply to push via wrangler)`);
} else {
  const tmpFile = path.join(HERE, '.compare-ogp-kv.json');
  fs.writeFileSync(tmpFile, jsonArray);
  console.log(`[apply] pushing ${entries.length} entries via wrangler kv bulk put...`);
  try {
    // --remote で production KV に書き込み。デフォルト (--local) は wrangler のローカルエミュレータ。
    const cmd = `wrangler kv bulk put --binding ${KV_BINDING} --remote "${tmpFile}"`;
    console.log(`[cmd] ${cmd}`);
    execSync(cmd, { stdio: 'inherit', cwd: PROJECT_ROOT, shell: true });
    console.log('[done] KV populated');
  } catch (e) {
    console.error(`[FAIL] wrangler exit code: ${e.status}`);
    process.exit(e.status || 1);
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}
