const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_PATTERN = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})?$/;

function formatOffset(offset?: string): string {
  if (!offset) return '';
  if (offset === 'Z') return ' UTC';
  if (offset === '+09:00') return ' JST';
  return ` UTC${offset}`;
}

export function formatUpdatedAt(updatedAt: string): string {
  if (DATE_ONLY_PATTERN.test(updatedAt)) {
    return updatedAt;
  }

  const match = updatedAt.match(DATE_TIME_PATTERN);
  if (!match) {
    return updatedAt;
  }

  const [, date, time, offset] = match;
  return `${date} ${time}${formatOffset(offset)}`;
}

export function updatedAtDateKey(updatedAt: string): string | null {
  if (updatedAt.length < 10) {
    return null;
  }
  const datePart = updatedAt.slice(0, 10);
  return DATE_ONLY_PATTERN.test(datePart) ? datePart.replace(/-/g, '') : null;
}
