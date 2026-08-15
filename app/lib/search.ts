/** Normalizes Japanese, romaji, whitespace, and letter case for lightweight static-directory search. */
export function normalizeSearchText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFKC')
    .replace(/[ァ-ヶ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60))
    .replace(/[\s・ー−-]/g, '')
    .toLocaleLowerCase();
}

export function matchesSearch(query: string, ...values: Array<string | null | undefined>): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;
  return values.some((value) => normalizeSearchText(value).includes(normalizedQuery));
}
