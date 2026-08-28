/**
 * HTTP `Accept` header content negotiation.
 *
 * Implements the subset of RFC 9110 §12.5.1 that the Markdown-for-Agents
 * (MfA) delivery path actually needs:
 *
 * - Quality factors (`;q=`) are interpreted on a 0–1 scale.
 * - `q=0` is treated as an explicit refusal of that media-range.
 * - Omitted `;q=` defaults to `q=1`.
 * - The wildcards `*\/*` and `text\/*` both match `text/markdown`.
 * - Media types are compared case-insensitively.
 * - The `text/markdown` media-range wins only when its effective q is
 *   strictly greater than the effective q of any `text/html` media-range.
 *
 * The function is **pure** — no I/O, no shared state — so it can be
 * tested directly in Vitest without a Cloudflare Pages Functions harness.
 *
 * Reference: https://www.rfc-editor.org/rfc/rfc9110.html#name-accept
 */

export function prefersMarkdown(accept: string): boolean {
  if (typeof accept !== 'string' || accept.length === 0) {
    return false;
  }

  type Parsed = {
    type: string;
    subtype: string;
    q: number;
    matchesMarkdown: boolean;
    matchesHtml: boolean;
    isWildcardAll: boolean;
    isWildcardType: boolean;
  };

  const parsed: Parsed[] = [];
  for (const rawRange of accept.split(',')) {
    const range = rawRange.trim();
    if (range.length === 0) continue;

    const parts = range.split(';').map((p) => p.trim());
    const mimePart = parts[0];
    if (!mimePart) continue;
    const [rawType, rawSubtype] = mimePart.toLowerCase().split('/');
    if (!rawType || !rawSubtype) continue;

    let q = 1;
    let malformed = false;
    for (const param of parts.slice(1)) {
      if (!param.startsWith('q=')) continue;
      const match = /^q=([0-9.]+)$/.exec(param);
      if (!match) {
        malformed = true;
        break;
      }
      const value = Number(match[1]);
      if (!Number.isFinite(value) || value < 0 || value > 1) {
        malformed = true;
        break;
      }
      q = value;
    }
    if (malformed) continue;
    if (q === 0) continue; // explicit refusal

    parsed.push({
      type: rawType,
      subtype: rawSubtype,
      q,
      matchesMarkdown: rawType === 'text' && rawSubtype === 'markdown',
      matchesHtml: rawType === 'text' && rawSubtype === 'html',
      isWildcardAll: rawType === '*' && rawSubtype === '*',
      isWildcardType: rawSubtype === '*',
    });
  }

  if (parsed.length === 0) return false;

  // Effective q for markdown: direct hit, or wildcard that covers it.
  let markdownQ = 0;
  for (const p of parsed) {
    if (p.matchesMarkdown) {
      markdownQ = Math.max(markdownQ, p.q);
      continue;
    }
    if (p.isWildcardAll) {
      markdownQ = Math.max(markdownQ, p.q);
      continue;
    }
    if (p.isWildcardType && p.type === 'text') {
      markdownQ = Math.max(markdownQ, p.q);
    }
  }

  if (markdownQ === 0) return false;

  // Effective q for html: only a direct hit competes with markdown.
  let htmlQ = 0;
  for (const p of parsed) {
    if (p.matchesHtml) {
      htmlQ = Math.max(htmlQ, p.q);
    }
  }

  return markdownQ > htmlQ;
}