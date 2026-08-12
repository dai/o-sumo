export type OfficialKind = 'gyoji' | 'yobidashi';

const OFFICIAL_RANK_CODE_VALUES = [
  'tate-gyoji', 'sanyaku-gyoji', 'makuuchi-gyoji', 'juryo-gyoji',
  'makushita-gyoji', 'sandanme-gyoji', 'jonidan-gyoji', 'jonokuchi-gyoji',
  'tate-yobidashi', 'fuku-tate-yobidashi', 'sanyaku-yobidashi', 'makuuchi-yobidashi',
  'juryo-yobidashi', 'makushita-yobidashi', 'sandanme-yobidashi',
  'jonidan-yobidashi', 'jonokuchi-yobidashi',
] as const;

export type OfficialRankCode = typeof OFFICIAL_RANK_CODE_VALUES[number];
export const OFFICIAL_RANK_CODES: ReadonlySet<string> = new Set(OFFICIAL_RANK_CODE_VALUES);
export const isOfficialRankCode = (value: unknown): value is OfficialRankCode =>
  typeof value === 'string' && OFFICIAL_RANK_CODES.has(value);

export interface OfficialIndexItem {
  id: number;
  name: string;
  yomi: string;
  realName: string;
  rank: string;
  rankCode: OfficialRankCode;
  affiliation: string;
  sourceUrl: string;
}

export interface OfficialProfile extends OfficialIndexItem {
  kind: OfficialKind;
  birthDate: string;
  birthplace: string;
  adoptedAt: string;
  retrievedAt: string;
  nameHistory?: string[];
}

export interface OfficialIndexResponse {
  retrievedAt: string;
  source: string;
  officials: OfficialIndexItem[];
}

export const officialListPath = (kind: OfficialKind) => `/${kind}/`;
export const officialProfilePath = (kind: OfficialKind, id: number) => `/${kind}/${id}/`;
export const officialIndexApiPath = (kind: OfficialKind) => `/api/v1/${kind}.json`;
export const officialApiPath = (kind: OfficialKind, id: number) => `/api/v1/${kind}/${id}.json`;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new HttpResponseError(url, response.status);
  return response.json() as Promise<T>;
}

class HttpResponseError extends Error {
  constructor(url: string, readonly status: number) {
    super(`Failed to fetch ${url}: ${status}`);
  }
}

export async function fetchOfficialIndex(kind: OfficialKind): Promise<OfficialIndexResponse> {
  const index = await fetchJson<OfficialIndexResponse>(officialIndexApiPath(kind));
  if (!Array.isArray(index.officials)) throw new Error(`${kind} index has invalid officials`);
  index.officials.forEach((official, itemIndex) => {
    if (!isOfficialRankCode(official.rankCode)) {
      throw new Error(`${kind} index item at index ${itemIndex} has invalid rankCode`);
    }
  });
  return index;
}

export async function fetchOfficialProfile(kind: OfficialKind, id: string): Promise<OfficialProfile | null> {
  if (!/^[1-9]\d*$/.test(id)) return null;
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId)) return null;
  try {
    const profile = await fetchJson<OfficialProfile>(officialApiPath(kind, numericId));
    if (profile.kind !== kind || profile.id !== numericId) {
      throw new Error(`${kind} profile ${numericId} does not match its API identity`);
    }
    if (!isOfficialRankCode(profile.rankCode)) {
      throw new Error(`${kind} profile ${numericId} has invalid rankCode`);
    }
    return profile;
  } catch (error) {
    if (error instanceof HttpResponseError && error.status === 404) return null;
    throw error;
  }
}
