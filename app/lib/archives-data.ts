// Archive basho places - ordered from newest to oldest.
// Payloads live in /api/v1/archive/{id}.json. This list is only the links.
import { ARCHIVE_ROUTE_INDEX } from './archive-route-index.generated';
import { CURRENT_BASHO_ID } from './current-basho';

export interface ArchiveBasho {
  id: string;
  year: string;
  name: string;
  resultPath: string;
  schedulePath: string;
  banzukePath: string;
}

export const PAST_BASHO: ArchiveBasho[] = ARCHIVE_ROUTE_INDEX.map((entry) => ({
  id: entry.monthKey,
  year: entry.year,
  name: entry.bashoName,
  resultPath: `/${entry.monthKey}-torikumi`,
  schedulePath: `/${entry.monthKey}-yotei`,
  banzukePath: `/${entry.monthKey}-banzuke`,
}));

export { CURRENT_BASHO_ID };
