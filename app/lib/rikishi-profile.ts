export interface RikishiIndexItem {
  id: number;
  name: string;
  yomi: string;
  currentRank: string;
  profileUrl: string;
}

export interface RikishiIndexResponse {
  updatedAt: string;
  rikishi: RikishiIndexItem[];
}

export interface RikishiProfileDetail {
  id: number;
  name?: string;
  yomi?: string;
  currentRank?: string;
  birthDate: string;
  height: number;
  weight: number;
  shusshin: string;
  debut: string;
  sourceUrl?: string;
  updatedAt?: string;
  careerStats: {
    wins: number;
    losses: number;
    draws: number;
  };
  photoUrl: string;
}

export interface RikishiProfile extends RikishiProfileDetail {
  name: string;
  yomi: string;
  currentRank: string;
  sourceUrl: string;
  updatedAt: string;
}

export interface RikishiMatchup {
  rikishi1Id: number;
  rikishi2Id: number;
  rikishi1Wins: number;
  rikishi2Wins: number;
}

export interface RikishiMatchupsResponse {
  updatedAt: string;
  matchups: RikishiMatchup[];
}

const RIKISHI_INDEX_URL = '/api/v1/rikishi.json';
const RIKISHI_MATCHUPS_URL = '/api/v1/rikishi-matchups.json';

export function rikishiProfilePath(id: number | string): string {
  return `/rikishi/${id}/`;
}

export function banzukeRikishiPath(baseBanzukePath: string, id: number | string): string {
  const normalized = baseBanzukePath.endsWith('/') ? baseBanzukePath : `${baseBanzukePath}/`;
  return `${normalized}#rikishi-${id}`;
}

export function rikishiApiPath(id: number | string): string {
  return `/api/v1/rikishi/${id}.json`;
}

export function extractRikishiIdFromProfileUrl(profileUrl: string): number | null {
  const match = profileUrl.match(/\/profile\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function fetchOptionalJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchRikishiIndex(): Promise<RikishiIndexResponse> {
  return fetchJson<RikishiIndexResponse>(RIKISHI_INDEX_URL);
}

export async function fetchRikishiProfile(id: number): Promise<RikishiProfile | null> {
  const index = await fetchRikishiIndex();
  const indexItem = index.rikishi.find((rikishi) => rikishi.id === id);
  if (!indexItem) {
    return null;
  }

  try {
    const detail = await fetchJson<RikishiProfileDetail>(rikishiApiPath(id));
    return mergeRikishiProfile(indexItem, detail, index.updatedAt);
  } catch {
    return mergeRikishiProfile(indexItem, emptyProfileDetail(id), index.updatedAt);
  }
}

export async function fetchRikishiProfilesFromIndex(
  index: RikishiIndexResponse,
  ids: number[],
): Promise<Array<RikishiProfile | null>> {
  return Promise.all(ids.map(async (id) => {
    const indexItem = index.rikishi.find((rikishi) => rikishi.id === id);
    if (!indexItem) return null;
    const detail = await fetchOptionalJson<RikishiProfileDetail>(rikishiApiPath(id));
    return detail ? mergeRikishiProfile(indexItem, detail, index.updatedAt) : null;
  }));
}

export async function fetchRikishiMatchups(): Promise<RikishiMatchupsResponse> {
  const payload = await fetchJson<unknown>(RIKISHI_MATCHUPS_URL);
  if (!isRikishiMatchupsResponse(payload)) {
    throw new Error('Invalid rikishi matchup response');
  }
  return payload;
}

export function findOrderedMatchup(
  response: RikishiMatchupsResponse,
  firstId: number,
  secondId: number,
): [number, number] {
  const lowId = Math.min(firstId, secondId);
  const highId = Math.max(firstId, secondId);
  const matchup = response.matchups.find((item) => item.rikishi1Id === lowId && item.rikishi2Id === highId);
  if (!matchup) return [0, 0];
  return firstId === lowId
    ? [matchup.rikishi1Wins, matchup.rikishi2Wins]
    : [matchup.rikishi2Wins, matchup.rikishi1Wins];
}

export function mergeRikishiProfile(
  indexItem: RikishiIndexItem,
  detail: RikishiProfileDetail,
  indexUpdatedAt: string,
): RikishiProfile {
  return {
    ...detail,
    id: indexItem.id,
    name: detail.name || indexItem.name,
    yomi: detail.yomi || indexItem.yomi,
    currentRank: detail.currentRank || indexItem.currentRank,
    sourceUrl: detail.sourceUrl || indexItem.profileUrl,
    updatedAt: detail.updatedAt || indexUpdatedAt,
    birthDate: detail.birthDate || '',
    height: detail.height || 0,
    weight: detail.weight || 0,
    shusshin: detail.shusshin || '',
    debut: detail.debut || '',
    careerStats: detail.careerStats ?? { wins: 0, losses: 0, draws: 0 },
    photoUrl: detail.photoUrl || '',
  };
}

function emptyProfileDetail(id: number): RikishiProfileDetail {
  return {
    id,
    birthDate: '',
    height: 0,
    weight: 0,
    shusshin: '',
    debut: '',
    careerStats: {
      wins: 0,
      losses: 0,
      draws: 0,
    },
    photoUrl: '',
  };
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function isRikishiMatchupsResponse(value: unknown): value is RikishiMatchupsResponse {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { updatedAt?: unknown; matchups?: unknown };
  if (typeof candidate.updatedAt !== 'string' || !Array.isArray(candidate.matchups)) return false;

  const seen = new Set<string>();
  return candidate.matchups.every((item) => {
    if (!item || typeof item !== 'object') return false;
    const matchup = item as Partial<RikishiMatchup>;
    if (
      !isNonNegativeInteger(matchup.rikishi1Id)
      || !isNonNegativeInteger(matchup.rikishi2Id)
      || !isNonNegativeInteger(matchup.rikishi1Wins)
      || !isNonNegativeInteger(matchup.rikishi2Wins)
      || Number(matchup.rikishi1Id) <= 0
      || Number(matchup.rikishi2Id) <= Number(matchup.rikishi1Id)
    ) return false;
    const key = `${matchup.rikishi1Id},${matchup.rikishi2Id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
