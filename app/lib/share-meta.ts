export type ShareMetaItem = {
  id: number;
  name: string;
};

export type ShareMetaData = {
  rikishi: readonly ShareMetaItem[];
  gyoji: readonly ShareMetaItem[];
  yobidashi: readonly ShareMetaItem[];
  matchups?: readonly ShareMetaMatchup[];
};

export type ShareMetaMatchup = {
  rikishi1Id: number;
  rikishi2Id: number;
  rikishi1Wins: number;
  rikishi2Wins: number;
};

export type ShareMetaOverride = {
  title: string;
  description: string;
  socialUrl: string;
  imageUrl?: string;
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

function findMatchup(matchups: readonly ShareMetaMatchup[], firstId: number, secondId: number): [number, number] | null {
  const matchup = matchups.find((item) => (
    (item.rikishi1Id === firstId && item.rikishi2Id === secondId)
    || (item.rikishi1Id === secondId && item.rikishi2Id === firstId)
  ));
  if (!matchup) return null;
  return matchup.rikishi1Id === firstId
    ? [matchup.rikishi1Wins, matchup.rikishi2Wins]
    : [matchup.rikishi2Wins, matchup.rikishi1Wins];
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
    const matchup = findMatchup(data.matchups ?? [], firstId, secondId);
    const score = matchup ? `${firstName} ${matchup[0]}勝 − ${matchup[1]}勝 ${secondName}` : null;
    const diff = matchup ? Math.abs(matchup[0] - matchup[1]) : 0;
    const leader = matchup && diff > 0 ? (matchup[0] > matchup[1] ? firstName : secondName) : null;
    const highlight = matchup
      ? leader
        ? `${leader}が${diff}勝リード`
        : `${matchup[0] + matchup[1]}番を終えて五分`
      : '本場所では初顔合わせ';
    return {
      title: score ? `#${firstName} vs #${secondName}｜合口 ${matchup?.[0]}−${matchup?.[1]} | o-sumo` : `#${firstName} vs #${secondName}｜初顔合わせ | o-sumo`,
      description: `${score ? `合口は${score}。` : ''}見どころ：${highlight}。体格や得意決まり手も比較できます。`,
      socialUrl,
      imageUrl: new URL(`/api/og-compare/${firstId},${secondId}`, url).toString(),
    };
  }

  const profileMatch = url.pathname.match(/^\/(rikishi|gyoji|yobidashi)\/([1-9]\d*)\/$/);
  if (!profileMatch) return null;
  const kind = profileMatch[1] as 'rikishi' | 'gyoji' | 'yobidashi';
  const id = Number(profileMatch[2]);
  const profiles = data[kind];
  const name = findName(profiles, id);
  if (!name) return null;
  const labels: Record<typeof kind, '力士' | '行司' | '呼出'> = { rikishi: '力士', gyoji: '行司', yobidashi: '呼出' };
  return profileMeta(name, labels[kind], socialUrl);
}
