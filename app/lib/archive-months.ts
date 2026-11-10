/** Past basho published as `/api/v1/archive/{YYYYMM}.json`, newest first. */
export const PAST_ARCHIVE_MONTH_KEYS = ['202609', '202607', '202605', '202603'] as const;

export type PastArchiveMonthKey = (typeof PAST_ARCHIVE_MONTH_KEYS)[number];

export function isPastArchiveMonthKey(monthKey: string): monthKey is PastArchiveMonthKey {
  return (PAST_ARCHIVE_MONTH_KEYS as readonly string[]).includes(monthKey);
}
