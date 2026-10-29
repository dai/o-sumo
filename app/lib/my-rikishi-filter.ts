import { extractRikishiIdFromProfileUrl } from './rikishi-profile';
import type { TorikumiMatch } from './torikumi-data';

/**
 * マイ力士（推し）フィルターの ON/OFF を端末に保持する localStorage キー。
 * 既存のマイ力士保存キー `o-sumo:my-rikishi:v1` と同じ命名規則に揃える。
 */
export const MY_RIKISHI_FILTER_STORAGE_KEY = 'o-sumo:my-rikishi-filter:v1';

export type MyRikishiFilterSection = {
  division: '幕内' | '十両';
  matches: TorikumiMatch[];
};

export type MyRikishiMatcher = (id: number) => boolean;

/**
 * 取組行にマイ力士が含まれるか。休場による空席行も通常どおり判定する
 * （空席行は結果ページで `(休場)` として残るため、除外しない）。
 */
export function matchInvolvesMyRikishi(match: TorikumiMatch, isSaved: MyRikishiMatcher): boolean {
  const eastId = extractRikishiIdFromProfileUrl(match.eastProfileUrl);
  const westId = extractRikishiIdFromProfileUrl(match.westProfileUrl);
  return (eastId !== null && isSaved(eastId)) || (westId !== null && isSaved(westId));
}

/**
 * 取組行のうちマイ力士が含まれるものだけを返す。休場行は残す。
 */
export function filterMatchesByMyRikishi(
  matches: readonly TorikumiMatch[],
  isSaved: MyRikishiMatcher,
): TorikumiMatch[] {
  return matches.filter((match) => matchInvolvesMyRikishi(match, isSaved));
}

/**
 * 部（十両・幕内）ごとのセクションをマイ力士が含まれる組だけに絞る。
 * マイ力士が出場しない部はセクションごと落とす（区分行も表示されないため）。
 */
export function filterSectionsByMyRikishi(
  sections: readonly MyRikishiFilterSection[],
  isSaved: MyRikishiMatcher,
): MyRikishiFilterSection[] {
  return sections
    .map((section) => ({
      division: section.division,
      matches: filterMatchesByMyRikishi(section.matches, isSaved),
    }))
    .filter((section) => section.matches.length > 0);
}

/**
 * 表示対象の中のマイ力士が関わる取組件数。
 */
export function countMyRikishiMatches(
  sections: readonly MyRikishiFilterSection[],
  isSaved: MyRikishiMatcher,
): number {
  return sections.reduce(
    (total, section) => total + filterMatchesByMyRikishi(section.matches, isSaved).length,
    0,
  );
}

/**
 * 当日の休場力士として扱われる ID 集合に含むかどうか。
 * 不戦（不戦終了）の組は空席扱いにしない（勝ち負けが確定しているため）。
 */
export function matchInvolvesAbsent(match: TorikumiMatch, absenteeIds: ReadonlySet<number>): boolean {
  if (match.winner && match.kimarite === '不戦') return false;
  if (absenteeIds.size === 0) return false;
  const eastId = extractRikishiIdFromProfileUrl(match.eastProfileUrl);
  const westId = extractRikishiIdFromProfileUrl(match.westProfileUrl);
  return (eastId !== null && absenteeIds.has(eastId))
    || (westId !== null && absenteeIds.has(westId));
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * マイ力士フィルターの ON/OFF を読む。保存が無い・保存できない場合は OFF。
 */
export function loadMyRikishiFilterEnabled(): boolean {
  const storage = getStorage();
  if (!storage) return false;

  try {
    return storage.getItem(MY_RIKISHI_FILTER_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * マイ力士フィルターの ON/OFF を端末に保持する。保持できなくても表示は成立する。
 */
export function saveMyRikishiFilterEnabled(enabled: boolean): boolean {
  const storage = getStorage();

  try {
    storage?.setItem(MY_RIKISHI_FILTER_STORAGE_KEY, enabled ? '1' : '0');
  } catch {
    // 保存できない環境（プライベートモード等）では次回訪問時に OFF に戻るだけ。
  }

  return enabled;
}
