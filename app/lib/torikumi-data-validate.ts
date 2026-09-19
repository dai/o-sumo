import type { TorikumiDataSet } from './torikumi-data';

/**
 * Runtime guard used after `await response.json()` to confirm the API payload
 * still matches the TorikumiDataSet shape consumed by the manual refresh
 * handler. Rejects inputs whose `resultUpdatedAt` / `scheduleUpdatedAt`
 * timestamps are missing or whose day arrays are not lists.
 */
export function isTorikumiDataSet(value: unknown): value is TorikumiDataSet {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<TorikumiDataSet>;
  return (
    typeof candidate.bashoName === 'string'
    && typeof candidate.year === 'string'
    && typeof candidate.updatedAt === 'string'
    && typeof candidate.resultUpdatedAt === 'string'
    && typeof candidate.scheduleUpdatedAt === 'string'
    && (candidate.today === undefined || candidate.today === null || typeof candidate.today === 'object')
    && (candidate.tomorrow === undefined || candidate.tomorrow === null || typeof candidate.tomorrow === 'object')
    && (candidate.resultDays === undefined || Array.isArray(candidate.resultDays))
    && (candidate.scheduleDays === undefined || Array.isArray(candidate.scheduleDays))
  );
}
