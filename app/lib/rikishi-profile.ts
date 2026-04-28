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

const RIKISHI_INDEX_URL = '/api/v1/rikishi.json';

export function rikishiProfilePath(id: number | string): string {
  return `/rikishi/${id}`;
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
