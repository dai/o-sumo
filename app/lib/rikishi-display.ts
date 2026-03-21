import { torikumiArchive } from './torikumi-data';
import { getDayPath } from './torikumi-routes';
import type { Rikishi } from './sumo-data';

export function divisionAnchorId(division: '幕内' | '十両', boutNo: number): string {
  return `bout-${division === '幕内' ? 'makuuchi' : 'juryo'}-${boutNo}`;
}

export function buildProfileNameMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const day of torikumiArchive.resultDays) {
    for (const divisionDay of [day.data.makuuchi, day.data.juryo]) {
      for (const match of divisionDay.matches) {
        map.set(match.eastProfileUrl, match.eastName);
        map.set(match.westProfileUrl, match.westName);
      }
    }
  }
  return map;
}

export function buildResultLinkMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const day of torikumiArchive.resultDays) {
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
