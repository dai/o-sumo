import type { RankGroup } from './sumo-data';
import type { TorikumiArchiveDay, TorikumiMatch } from './torikumi-data';

export type SortOrder = 'asc' | 'desc';

export function sortRankGroups(groups: RankGroup[], order: SortOrder): RankGroup[] {
  return order === 'asc' ? [...groups] : [...groups].reverse();
}

export function sortArchiveDays(days: TorikumiArchiveDay[], order: SortOrder): TorikumiArchiveDay[] {
  return [...days].sort((left, right) => (
    order === 'asc'
      ? left.day - right.day
      : right.day - left.day
  ));
}

export function sortMatches(matches: TorikumiMatch[], order: SortOrder): TorikumiMatch[] {
  return [...matches].sort((left, right) => (
    order === 'asc'
      ? left.boutNo - right.boutNo
      : right.boutNo - left.boutNo
  ));
}
