interface AvatarSeed {
  id: number;
  name: string;
  side: 'east' | 'west';
}

interface AvatarPolicyInput {
  rank: string;
  name: string;
}

export function localRikishiImagePath(id: number | string): string {
  return `/images/rikishi/${id}.png`;
}

export function isLocalRikishiImagePath(photoUrl: string): boolean {
  return /^\/images\/rikishi\/\d+\.(png|jpg|svg)$/.test(photoUrl);
}

function hashSeed({ id, name, side }: AvatarSeed): number {
  const text = `${id}:${name}:${side}`;
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(list: readonly T[], random: () => number): T {
  return list[Math.floor(random() * list.length)];
}

export function generatedRikishiAvatarDataUrl(seed: AvatarSeed): string {
  const random = mulberry32(hashSeed(seed));
  const skin = pick(['#f4d3b4', '#efc7a4', '#e7bc96', '#ddb185'], random);
  const hair = pick(['#1f1a17', '#2a221d', '#342820'], random);
  const eye = pick(['#2b221b', '#352920'], random);
  const mawashi = pick(['#1a3a52', '#12314a', '#8b1538', '#5c2a12'], random);
  const ring = seed.side === 'east' ? '#4a90e2' : '#d94848';
  const blushOpacity = 0.08 + random() * 0.12;
  const mouthCurve = (random() - 0.5) * 2.2;
  const topKnotWidth = 16 + random() * 6;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="0 0 112 112" role="img" aria-label="力士の生成アバター">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7f2ea" />
      <stop offset="100%" stop-color="#ece3d6" />
    </linearGradient>
  </defs>
  <rect width="112" height="112" rx="16" fill="url(#bg)" />
  <rect x="3.5" y="3.5" width="105" height="105" rx="13" fill="none" stroke="${ring}" stroke-opacity="0.35" />
  <ellipse cx="56" cy="100" rx="33" ry="20" fill="${mawashi}" opacity="0.92" />
  <ellipse cx="56" cy="58" rx="30" ry="34" fill="${skin}" />
  <ellipse cx="27.5" cy="59" rx="4.6" ry="7.8" fill="${skin}" />
  <ellipse cx="84.5" cy="59" rx="4.6" ry="7.8" fill="${skin}" />
  <path d="M30 49c2-16 12-24 26-24s24 8 26 24v7H30z" fill="${hair}" />
  <ellipse cx="${56}" cy="21.5" rx="${topKnotWidth / 2}" ry="6" fill="${hair}" />
  <path d="M41 57c4-3 7-3 10 0" stroke="${eye}" stroke-width="2.2" stroke-linecap="round" fill="none" />
  <path d="M61 57c4-3 7-3 10 0" stroke="${eye}" stroke-width="2.2" stroke-linecap="round" fill="none" />
  <path d="M56 60v8" stroke="#8f6548" stroke-width="1.8" stroke-linecap="round" />
  <path d="M47 74c3 ${mouthCurve.toFixed(2)} 15 ${mouthCurve.toFixed(2)} 18 0" stroke="#8a4d38" stroke-width="2.2" stroke-linecap="round" fill="none" />
  <ellipse cx="44.5" cy="67" rx="5.8" ry="3.5" fill="#d46b78" opacity="${blushOpacity.toFixed(2)}" />
  <ellipse cx="67.5" cy="67" rx="5.8" ry="3.5" fill="#d46b78" opacity="${blushOpacity.toFixed(2)}" />
</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function basicRikishiPlaceholderDataUrl(name: string): string {
  const label = name.slice(0, 2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="0 0 112 112" role="img" aria-label="力士プレースホルダ">
  <rect width="112" height="112" rx="16" fill="#efe7dc"/>
  <circle cx="56" cy="39" r="21" fill="#c9b49c"/>
  <path d="M22 95c6-20 21-30 34-30s28 10 34 30" fill="#b9956f"/>
  <text x="56" y="102" text-anchor="middle" font-size="12" fill="#6f5338" font-family="sans-serif">${label}</text>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function shouldGenerateRikishiAvatar({ rank, name }: AvatarPolicyInput): boolean {
  const isMakuuchi = !rank.startsWith('十両');
  const isNishikigi = name.includes('錦木');
  return isMakuuchi || isNishikigi;
}
