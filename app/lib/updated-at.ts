import { formatDisplayTimestamp } from './relative-date';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function formatUpdatedAt(updatedAt: string, lang = 'ja'): string {
  return formatDisplayTimestamp(updatedAt, lang);
}

export function updatedAtDateKey(updatedAt: string): string | null {
  if (updatedAt.length < 10) {
    return null;
  }
  const datePart = updatedAt.slice(0, 10);
  return DATE_ONLY_PATTERN.test(datePart) ? datePart.replace(/-/g, '') : null;
}
