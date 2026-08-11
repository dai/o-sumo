export type OfficialKind = 'gyoji' | 'yobidashi';

export interface OfficialIndexItem {
  id: string;
  name: string;
  yomi: string;
  rank: string;
}

export interface OfficialProfile extends OfficialIndexItem {
  kind: OfficialKind;
  realName: string;
  affiliation: string;
  birthDate: string;
  birthplace: string;
  debut: string;
  sourceUrl: string;
  updatedAt: string;
}

export interface OfficialIndexResponse {
  updatedAt: string;
  source: string;
  officials: OfficialIndexItem[];
}

export const officialListPath = (kind: OfficialKind) => `/${kind}/`;
export const officialProfilePath = (kind: OfficialKind, id: string) => `/${kind}/${id}/`;
export const officialIndexApiPath = (kind: OfficialKind) => `/api/v1/${kind}.json`;
export const officialApiPath = (kind: OfficialKind, id: string) => `/api/v1/${kind}/${id}.json`;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.json() as Promise<T>;
}

export const fetchOfficialIndex = (kind: OfficialKind) =>
  fetchJson<OfficialIndexResponse>(officialIndexApiPath(kind));

export async function fetchOfficialProfile(kind: OfficialKind, id: string): Promise<OfficialProfile | null> {
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  try {
    return await fetchJson<OfficialProfile>(officialApiPath(kind, id));
  } catch {
    return null;
  }
}
