import {
  CURRENT_BANZUKE_PATH,
  CURRENT_BASHO_ID,
  CURRENT_RESULT_PATH,
  CURRENT_SCHEDULE_PATH,
  getBanzukeDataByMonthKey,
  getTorikumiArchiveByMonthKey,
} from '../../../app/lib/archive-basho-data';
import { PAST_BASHO } from '../../../app/lib/archives-data';

export interface RikishiSearchItem {
  id: number;
  name: string;
  yomi: string;
  currentRank: string;
  profileUrl: string;
  apiUrl: string;
}

interface TorikumiDayMatch {
  pathDate: string;
  status: string;
  dayHead?: string;
  data?: {
    makuuchi?: { matches?: unknown[] };
    juryo?: { matches?: unknown[] };
  };
}

interface TorikumiDataSetSummary {
  resultDays?: TorikumiDayMatch[];
  scheduleDays?: TorikumiDayMatch[];
}

export async function searchRikishi(
  query: string,
  fetcher: (path: string) => Promise<unknown | null>,
): Promise<{ count: number; matches: RikishiSearchItem[]; error?: string }> {
  const index = (await fetcher('/api/v1/rikishi.json')) as {
    rikishi?: Array<{ id: number; name: string; yomi: string; currentRank: string }>;
  } | null;
  if (!index || !Array.isArray(index.rikishi)) {
    return { count: 0, matches: [], error: 'Failed to load rikishi index.' };
  }
  const q = query.trim().toLowerCase();
  const matches = index.rikishi
    .filter((r) => r.name.toLowerCase().includes(q) || r.yomi.toLowerCase().includes(q))
    .slice(0, 20)
    .map((r) => ({
      id: r.id,
      name: r.name,
      yomi: r.yomi,
      currentRank: r.currentRank,
      profileUrl: `https://osada.us/rikishi/${r.id}/`,
      apiUrl: `https://osada.us/api/v1/rikishi/${r.id}.json`,
    }));
  return { count: matches.length, matches };
}

export async function getRikishiProfile(
  id: number,
  fetcher: (path: string) => Promise<unknown | null>,
): Promise<unknown> {
  const profile = await fetcher(`/api/v1/rikishi/${id}.json`);
  if (!profile) {
    return { error: `Rikishi with ID ${id} not found.` };
  }
  return profile;
}

export async function getBanzuke(
  monthKey: string | undefined,
  fetcher: (path: string) => Promise<unknown | null>,
): Promise<unknown> {
  if (!monthKey || monthKey === CURRENT_BASHO_ID) {
    const data = await fetcher('/api/v1/banzuke.json');
    if (!data) return { error: 'Failed to load current banzuke data.' };
    return data;
  }
  const supportedIds = [CURRENT_BASHO_ID, ...PAST_BASHO.map((b) => b.id)];
  if (!supportedIds.includes(monthKey)) {
    return {
      error: `Unsupported monthKey: ${monthKey}. Supported basho: ${supportedIds.join(', ')}.`,
    };
  }
  try {
    return getBanzukeDataByMonthKey(monthKey);
  } catch (error) {
    return {
      error: `Failed to load banzuke data for ${monthKey}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function getTorikumi(
  pathDate: string,
  mode: 'result' | 'schedule',
  fetcher: (path: string) => Promise<unknown | null>,
): Promise<unknown> {
  const torikumi = (await fetcher('/api/v1/torikumi.json')) as TorikumiDataSetSummary | null;
  if (!torikumi) {
    return { error: 'Failed to load torikumi dataset.' };
  }
  const days = mode === 'schedule' ? torikumi.scheduleDays : torikumi.resultDays;
  const day = days?.find((d) => d.pathDate === pathDate);
  if (day) {
    return day;
  }
  const monthKey = pathDate.slice(0, 6);
  const archive = PAST_BASHO.find((b) => b.id === monthKey);
  if (archive) {
    try {
      const archiveData = getTorikumiArchiveByMonthKey(monthKey);
      const aDays = mode === 'schedule' ? archiveData.scheduleDays : archiveData.resultDays;
      const aDay = aDays?.find((d) => d.pathDate === pathDate);
      if (aDay) return aDay;
    } catch {
      // ignore
    }
  }
  return { error: `No ${mode} data found for date ${pathDate}.` };
}

export function listBasho(): unknown {
  return {
    current: {
      id: CURRENT_BASHO_ID,
      banzukePath: CURRENT_BANZUKE_PATH,
      resultPath: CURRENT_RESULT_PATH,
      schedulePath: CURRENT_SCHEDULE_PATH,
      pageUrls: {
        banzuke: `https://osada.us${CURRENT_BANZUKE_PATH}/`,
        result: `https://osada.us${CURRENT_RESULT_PATH}/`,
        schedule: `https://osada.us${CURRENT_SCHEDULE_PATH}/`,
      },
      apiUrl: 'https://osada.us/api/v1/banzuke.json',
    },
    archive: PAST_BASHO.map((basho) => ({
      id: basho.id,
      year: basho.year,
      name: basho.name,
      banzukePath: basho.banzukePath,
      resultPath: basho.resultPath,
      schedulePath: basho.schedulePath,
      pageUrls: {
        banzuke: `https://osada.us${basho.banzukePath}/`,
        result: `https://osada.us${basho.resultPath}/`,
        schedule: `https://osada.us${basho.schedulePath}/`,
      },
    })),
  };
}
