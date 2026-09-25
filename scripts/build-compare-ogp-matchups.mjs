/**
 * compare ページ OGP 用マチカード — Top N ペアの PNG プリレンダ
 *
 * 目的:
 *   rikishi-matchups.json から通算対戦数上位 N 件を抽出し、各ペアの
 *   1200x630 OGP 画像を satori + @resvg/resvg-js で生成。出力は
 *   public/images/matchups/{key}.png。KV 投入用の manifest も同じく書き出す。
 *
 * 使い方:
 *   node scripts/build-compare-ogp-matchups.mjs            # default Top 30
 *   MATCHUP_TOP_N=50 node scripts/build-compare-ogp-matchups.mjs
 *
 * 注意:
 *   - satori は yoga.wasm を内部で呼ぶ。Node 18+ で動作する。
 *   - フォントは scripts/fonts/ShipporiMincho-Regular.woff2 から読み込む。
 */

import { createElement as h } from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { decompress as woffDecompress } from 'wawoff2';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(HERE, '..');

const MATCHUPS_PATH = path.join(PROJECT_ROOT, 'public/api/v1/rikishi-matchups.json');
const RIKISHI_DIR = path.join(PROJECT_ROOT, 'public/api/v1/rikishi');
const FONT_PATH = path.join(PROJECT_ROOT, 'scripts/fonts/ShipporiMincho-Regular.woff2');
const OUT_DIR = path.join(PROJECT_ROOT, 'public/images/matchups');
const MANIFEST_PATH = path.join(HERE, 'compare-ogp-matchups-manifest.json');

const TOP_N = Number.parseInt(process.env.MATCHUP_TOP_N ?? '30', 10);

if (!fs.existsSync(FONT_PATH)) {
  console.error(`[FAIL] font not found: ${FONT_PATH}`);
  console.error('  配置先: scripts/fonts/ShipporiMincho-Regular.woff2');
  process.exit(1);
}
if (!fs.existsSync(MATCHUPS_PATH)) {
  console.error(`[FAIL] matchups data not found: ${MATCHUPS_PATH}`);
  process.exit(1);
}

const woffBytes = fs.readFileSync(FONT_PATH);
const ttfDecoded = await woffDecompress(woffBytes);
const fontBytes = new Uint8Array(ttfDecoded);

async function compareImageKey(ids) {
  const [a, b] = ids;
  const min = a <= b ? a : b;
  const max = a <= b ? b : a;
  const seed = `compare:${min}:${max}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(seed));
  return Array.from(new Uint8Array(buf))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function loadRikishi(id) {
  const file = path.join(RIKISHI_DIR, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!json || typeof json.name !== 'string') return null;
    return json;
  } catch {
    return null;
  }
}

function buildSatoriTree(pair) {
  const firstName = pair.first.name ?? '—';
  const secondName = pair.second.name ?? '—';
  const firstRank = pair.first.currentRank || '—';
  const secondRank = pair.second.currentRank || '—';
  const firstWins = pair.firstWins ?? '−';
  const secondWins = pair.secondWins ?? '−';

  return h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '1200px',
        height: '630px',
        background: 'linear-gradient(135deg, #0b0b14 0%, #13131f 100%)',
        color: '#fafafa',
        fontFamily: 'Shippori Mincho',
        padding: '64px',
        boxSizing: 'border-box',
      },
    },
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 32,
          fontWeight: 700,
          color: '#d4af37',
          letterSpacing: 4,
        },
      },
      h('span', { style: { display: 'flex' } }, '大相撲 力士比較'),
      h('span', { style: { display: 'flex', fontSize: 24, color: '#a0a0a8' } }, 'osada.us/compare'),
    ),
    h('div', {
      style: {
        display: 'flex',
        width: '100%',
        height: 2,
        background: 'rgba(212, 175, 55, 0.4)',
        marginTop: 24,
        marginBottom: 32,
      },
    }),
    h(
      'div',
      { style: { display: 'flex', flex: 1, gap: 32, alignItems: 'stretch' } },
      rikishiPanel('東', firstName, firstRank, firstWins, '#2563eb', '#93c5fd', '#60a5fa', 'rgba(37, 99, 235, 0.18)'),
      vsBadge(),
      rikishiPanel('西', secondName, secondRank, secondWins, '#c026d3', '#f0abfc', '#e879f9', 'rgba(192, 38, 211, 0.18)'),
    ),
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'center',
          fontSize: 24,
          color: '#a0a0a8',
          marginTop: 32,
        },
      },
      pair.matchup
        ? `通算対戦成績: ${firstName} ${firstWins}勝 ― ${secondWins}勝 ${secondName}`
        : '初顔合わせ',
    ),
  );
}

function rikishiPanel(label, name, rank, wins, borderColor, labelColor, winColor, bgColor) {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        background: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: 16,
        padding: 32,
        justifyContent: 'space-between',
      },
    },
    h('div', { style: { display: 'flex', fontSize: 28, color: labelColor, fontWeight: 700 } }, label),
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' } },
      h('div', { style: { display: 'flex', fontSize: 56, fontWeight: 700, color: '#fafafa' } }, name),
      h('div', { style: { display: 'flex', fontSize: 24, color: '#cbd5f5', marginTop: 8 } }, rank),
    ),
    h(
      'div',
      { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' } },
      h('div', { style: { display: 'flex', fontSize: 24, color: '#a0a0a8' } }, '四股名'),
      h('div', { style: { display: 'flex', fontSize: 48, fontWeight: 700, color: winColor } }, `${wins}勝`),
    ),
  );
}

function vsBadge() {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 56,
        fontWeight: 700,
        color: '#d4af37',
        padding: '0 24px',
      },
    },
    'VS',
  );
}

async function main() {
  console.log(`[build:matchups] Top ${TOP_N} pairs from ${MATCHUPS_PATH}`);
  const data = JSON.parse(fs.readFileSync(MATCHUPS_PATH, 'utf8'));
  const matchups = Array.isArray(data && data.matchups) ? data.matchups : [];
  const sorted = matchups
    .slice()
    .sort((a, b) => (b.rikishi1Wins + b.rikishi2Wins) - (a.rikishi1Wins + a.rikishi2Wins));
  const top = sorted.slice(0, TOP_N);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const rikishiCache = new Map();
  const getR = (id) => {
    if (rikishiCache.has(id)) return rikishiCache.get(id);
    const d = loadRikishi(id);
    rikishiCache.set(id, d);
    return d;
  };

  const manifest = [];
  let success = 0;
  let skipped = 0;
  const t0 = Date.now();

  for (let i = 0; i < top.length; i += 1) {
    const m = top[i];
    const a = getR(m.rikishi1Id);
    const b = getR(m.rikishi2Id);
    if (!a || !b) {
      console.warn(`  [SKIP] ${m.rikishi1Id} vs ${m.rikishi2Id}: 力士データなし`);
      skipped += 1;
      continue;
    }
    const pair = {
      first: { id: a.id, name: a.name, currentRank: a.currentRank || '' },
      second: { id: b.id, name: b.name, currentRank: b.currentRank || '' },
      matchup: m,
      firstWins: m.rikishi1Wins,
      secondWins: m.rikishi2Wins,
    };
    const key = await compareImageKey([m.rikishi1Id, m.rikishi2Id]);
    const outPath = path.join(OUT_DIR, `${key}.png`);
    try {
      const svg = await satori(buildSatoriTree(pair), {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Shippori Mincho',
            data: fontBytes.buffer.slice(fontBytes.byteOffset, fontBytes.byteOffset + fontBytes.byteLength),
            weight: 400,
            style: 'normal',
          },
        ],
      });
      const png = new Resvg(svg).render().asPng();
      fs.writeFileSync(outPath, png);
      const sizeKb = Math.round((png.byteLength / 1024) * 10) / 10;
      manifest.push({
        ids: `${m.rikishi1Id},${m.rikishi2Id}`,
        key,
        imagePath: `/images/matchups/${key}.png`,
        firstId: m.rikishi1Id,
        secondId: m.rikishi2Id,
        firstWins: m.rikishi1Wins,
        secondWins: m.rikishi2Wins,
      });
      success += 1;
      if ((i + 1) % 5 === 0 || i === top.length - 1) {
        console.log(`  [${String(i + 1).padStart(2)}/${top.length}] ${a.name} vs ${b.name} -> ${key}.png (${sizeKb} KB)`);
      }
    } catch (err) {
      console.error(`  [FAIL] ${m.rikishi1Id} vs ${m.rikishi2Id}: ${(err && err.message) || err}`);
    }
  }

  const manifestBody = {
    generatedAt: new Date().toISOString(),
    imageVersion: '1',
    topN: TOP_N,
    count: success,
    skipped,
    entries: manifest,
  };
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifestBody, null, 2) + '\n');

  const ms = Date.now() - t0;
  console.log(`[done] ${success}/${top.length} PNG (skipped=${skipped}) -> ${OUT_DIR}`);
  console.log(`       manifest: ${MANIFEST_PATH}`);
  console.log(`       elapsed: ${(ms / 1000).toFixed(1)}s`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
