import { MARCH2026_TORIKUMI_DATA, torikumiArchive, torikumiMonthKey } from './torikumi-data';
import { getDayPath } from './torikumi-routes';
import { juryo, makuuchiData, type RankGroup, type Rikishi } from './sumo-data';

function allRikishi(groups: RankGroup[]): Rikishi[] {
  return groups.flatMap((group) => [...group.east, ...group.west]);
}

const canonicalRikishi = [...allRikishi(makuuchiData), ...allRikishi(juryo)];
const canonicalNameMap = new Map(canonicalRikishi.map((rikishi) => [rikishi.profileUrl, rikishi.name] as const));

export function divisionAnchorId(division: '幕内' | '十両', boutNo: number): string {
  return `bout-${division === '幕内' ? 'makuuchi' : 'juryo'}-${boutNo}`;
}

export function buildProfileNameMap(): Map<string, string> {
  return new Map(canonicalNameMap);
}

function getResultDaysByMonthKey(monthKey: string) {
  if (monthKey === '202603') {
    return MARCH2026_TORIKUMI_DATA.resultDays ?? [];
  }
  return torikumiArchive.resultDays;
}

export function buildResultLinkMap(monthKey: string = torikumiMonthKey): Map<string, string> {
  const map = new Map<string, string>();
  const resultDays = getResultDaysByMonthKey(monthKey);

  for (const day of resultDays) {
    for (const divisionDay of [day.data.makuuchi, day.data.juryo]) {
      for (const match of divisionDay.matches) {
        const href = `${getDayPath(day, 'result')}#${divisionAnchorId(divisionDay.division, match.boutNo)}`;
        map.set(`${match.eastProfileUrl}:${day.day}`, href);
        map.set(`${match.westProfileUrl}:${day.day}`, href);
      }
    }
  }
  return map;
}

export function displayShikona(rikishi: Rikishi, profileNameMap: Map<string, string>): string {
  return profileNameMap.get(rikishi.profileUrl) ?? rikishi.name;
}

export function canonicalShikona(profileUrl: string, fallbackName: string): string {
  return canonicalNameMap.get(profileUrl) ?? fallbackName;
}
