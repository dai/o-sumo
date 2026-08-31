export type ShareMetaItem = {
  id: number;
  name: string;
};

export type ShareMetaData = {
  rikishi: readonly ShareMetaItem[];
  gyoji: readonly ShareMetaItem[];
  yobidashi: readonly ShareMetaItem[];
};

export type ShareMetaOverride = {
  title: string;
  description: string;
  socialUrl: string;
};

function shareUrl(url: URL): string {
  const normalized = new URL(url);
  normalized.hash = '';
  return normalized.toString();
}

function findName(items: readonly ShareMetaItem[], id: number): string | null {
  const name = items.find((item) => item.id === id)?.name.trim();
  return name || null;
}

function parseCompareIds(serialized: string | null): [number, number] | null {
  if (!serialized) return null;
  const values = serialized.split(',');
  if (values.length !== 2 || values.some((value) => !/^\d+$/.test(value))) return null;
  const ids = values.map(Number);
  if (ids.some((id) => !Number.isSafeInteger(id) || id <= 0) || ids[0] === ids[1]) return null;
  return [ids[0], ids[1]];
}

function profileMeta(name: string, label: '力士' | '行司' | '呼出', socialUrl: string): ShareMetaOverride {
  const description = label === '力士'
    ? `${name}の大相撲力士プロフィール。番付、成績、出身地などを紹介します。`
    : `${name}の大相撲${label}プロフィール。階級や所属部屋などを紹介します。`;
  return {
    title: `${name} | ${label}プロフィール | o-sumo`,
    description,
    socialUrl,
  };
}

export function resolveShareMetaOverride(url: URL, data: ShareMetaData): ShareMetaOverride | null {
  const socialUrl = shareUrl(url);
  const compareIds = url.pathname === '/compare/' ? parseCompareIds(url.searchParams.get('ids')) : null;
  if (compareIds) {
    const [firstId, secondId] = compareIds;
    const firstName = findName(data.rikishi, firstId);
    const secondName = findName(data.rikishi, secondId);
    if (!firstName || !secondName) return null;
    return {
      title: `#${firstName} と #${secondName} の合口は？徹底比較 | o-sumo`,
      description: `大相撲力士${firstName}と${secondName}の合口、体格、得意決まり手、通算成績を比較できます。`,
      socialUrl,
    };
  }

  const profileMatch = url.pathname.match(/^\/(rikishi|gyoji|yobidashi)\/([1-9]\d*)\/$/);
  if (!profileMatch) return null;
  const kind = profileMatch[1] as keyof ShareMetaData;
  const id = Number(profileMatch[2]);
  const profiles = data[kind];
  const name = findName(profiles, id);
  if (!name) return null;
  const labels: Record<keyof ShareMetaData, '力士' | '行司' | '呼出'> = { rikishi: '力士', gyoji: '行司', yobidashi: '呼出' };
  return profileMeta(name, labels[kind], socialUrl);
}
