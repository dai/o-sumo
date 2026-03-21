import { torikumiArchive } from './torikumi-data';
import { getDayPath } from './torikumi-routes';
import { juryo, makuuchiData, type RankGroup, type Rikishi } from './sumo-data';

function allRikishi(groups: RankGroup[]): Rikishi[] {
  return groups.flatMap((group) => [...group.east, ...group.west]);
}

const canonicalRikishi = [...allRikishi(makuuchiData), ...allRikishi(juryo)];
const canonicalNameMap = new Map(canonicalRikishi.map((rikishi) => [rikishi.profileUrl, rikishi.name] as const));
const SPECIAL_CANONICAL_NAMES = new Map<string, string>([
  ['https://www.sumo.or.jp/ResultRikishiData/profile/3334/', '白鷹山'],
  ['https://www.sumo.or.jp/ResultRikishiData/profile/3417/', '英乃海'],
  ['https://www.sumo.or.jp/ResultRikishiData/profile/3505/', '貴健斗'],
  ['https://www.sumo.or.jp/ResultRikishiData/profile/3803/', '炎鵬'],
  ['https://www.sumo.or.jp/ResultRikishiData/profile/3839/', '栃大海'],
  ['https://www.sumo.or.jp/ResultRikishiData/profile/4186/', '日向丸'],
  ['https://www.sumo.or.jp/ResultRikishiData/profile/4275/', '大花竜'],
]);


export function divisionAnchorId(division: '幕内' | '十両', boutNo: number): string {
  return `bout-${division === '幕内' ? 'makuuchi' : 'juryo'}-${boutNo}`;
}

export function buildProfileNameMap(): Map<string, string> {
  return new Map(canonicalNameMap);
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

export function canonicalShikona(profileUrl: string, fallbackName: string): string {
  return canonicalNameMap.get(profileUrl) ?? SPECIAL_CANONICAL_NAMES.get(profileUrl) ?? fallbackName;
}
