export type OfficialKind = 'gyoji' | 'yobidashi';

export interface OfficialIndexItem {
  id: number;
  name: string;
  yomi: string;
  realName: string;
  rank: string;
  rankCode: string;
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
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.json() as Promise<T>;
}

export const fetchOfficialIndex = (kind: OfficialKind) =>
  fetchJson<OfficialIndexResponse>(officialIndexApiPath(kind));

export async function fetchOfficialProfile(kind: OfficialKind, id: string): Promise<OfficialProfile | null> {
  if (!/^[1-9]\d*$/.test(id)) return null;
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId)) return null;
  try {
    const profile = await fetchJson<OfficialProfile>(officialApiPath(kind, numericId));
    if (profile.kind !== kind || profile.id !== numericId) return null;
    return profile;
  } catch {
    return null;
  }
}
