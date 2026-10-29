import { extractRikishiIdFromProfileUrl } from './rikishi-profile';
import { canonicalShikona } from './rikishi-display';
import {
  matchInvolvesAbsent,
  type MyRikishiFilterSection,
  type MyRikishiMatcher,
} from './my-rikishi-filter';

/** X (Twitter) の Web Intent エンドポイント。API・ログインは不要。 */
export const X_INTENT_URL = 'https://twitter.com/intent/tweet';

/** X の文字数制限（日本語も 1 文字 = 1 として数える）。 */
export const SHARE_TEXT_MAX_LENGTH = 140;

/** 投稿文に列挙する取組の上限。超えた分は「…ほか◯番」で示す。 */
export const SHARE_MAX_ENTRIES = 4;

export type MyRikishiShareEntry = {
  division: '幕内' | '十両';
  boutNo: number;
  shikona: string;
  opponent: string;
  /** null は結果前（予定表示）。 */
  outcome: 'win' | 'loss' | null;
  kimarite: string;
};

/**
 * 投稿文の書式。すべて i18n キーから渡す（ハードコード禁止）。
 * `{{name}}` `{{opponent}}` `{{kimarite}}` `{{count}}` を差し込む。
 */
export type MyRikishiShareLabels = {
  resultWin: string;
  resultLoss: string;
  matchup: string;
  more: string;
};

function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (placeholder, key: string) => (
    key in values ? String(values[key]) : placeholder
  ));
}

function compact(text: string): string {
  return text.replace(/[ \t]{2,}/g, ' ').trim();
}

/**
 * 表示中のマイ力士が関わる取組から、投稿文に使うエントリを collects する。
 * - 休場（空席）の組は含めない（休場のマイ力士も除外）
 * - 結果が確定していれば勝敗と決まり手、未確定なら対戦カードを保持
 */
export function collectMyRikishiShareEntries({
  sections,
  isSaved,
  absenteeIds,
}: {
  sections: readonly MyRikishiFilterSection[];
  isSaved: MyRikishiMatcher;
  absenteeIds: ReadonlySet<number>;
}): MyRikishiShareEntry[] {
  const entries: MyRikishiShareEntry[] = [];

  for (const section of sections) {
    for (const match of section.matches) {
      // 空席の組は成立していないため投稿文に含めない。
      if (matchInvolvesAbsent(match, absenteeIds)) continue;

      const eastId = extractRikishiIdFromProfileUrl(match.eastProfileUrl);
      const westId = extractRikishiIdFromProfileUrl(match.westProfileUrl);
      const eastSaved = eastId !== null && isSaved(eastId) && !absenteeIds.has(eastId);
      const westSaved = westId !== null && isSaved(westId) && !absenteeIds.has(westId);
      if (!eastSaved && !westSaved) continue;

      const useEast = eastSaved;
      const winner = match.winner;
      const outcome = winner
        ? (winner === (useEast ? 'east' : 'west') ? 'win' : 'loss')
        : null;

      entries.push({
        division: section.division,
        boutNo: match.boutNo,
        shikona: useEast
          ? canonicalShikona(match.eastProfileUrl, match.eastName)
          : canonicalShikona(match.westProfileUrl, match.westName),
        opponent: useEast
          ? canonicalShikona(match.westProfileUrl, match.westName)
          : canonicalShikona(match.eastProfileUrl, match.eastName),
        outcome,
        kimarite: outcome ? match.kimarite : '',
      });
    }
  }

  return entries;
}

function formatShareEntry(entry: MyRikishiShareEntry, labels: MyRikishiShareLabels): string {
  if (entry.outcome === 'win') {
    return compact(interpolate(labels.resultWin, { name: entry.shikona, kimarite: entry.kimarite }));
  }
  if (entry.outcome === 'loss') {
    return compact(interpolate(labels.resultLoss, { name: entry.shikona, kimarite: entry.kimarite }));
  }
  return compact(interpolate(labels.matchup, { name: entry.shikona, opponent: entry.opponent }));
}

/**
 * 投稿文を組み立てる。上限を超える場合は列挙数を減らし、それでも収まらなければ
 * ヘッダー・ハッシュタグを削って文字数制限に収める。
 */
export function buildMyRikishiShareText({
  entries,
  header,
  labels,
  hashtagLine,
  maxEntries = SHARE_MAX_ENTRIES,
  maxLength = SHARE_TEXT_MAX_LENGTH,
}: {
  entries: readonly MyRikishiShareEntry[];
  header: string;
  labels: MyRikishiShareLabels;
  hashtagLine: string;
  maxEntries?: number;
  maxLength?: number;
}): string {
  if (entries.length === 0) return '';

  const build = (shown: number, withHeader: boolean, withHashtag: boolean): string => {
    const lines: string[] = [];
    if (withHeader && header) lines.push(header);
    for (const entry of entries.slice(0, shown)) {
      lines.push(formatShareEntry(entry, labels));
    }
    const rest = entries.length - shown;
    if (rest > 0) lines.push(interpolate(labels.more, { count: rest }));
    if (withHashtag && hashtagLine) lines.push(hashtagLine);
    return lines.join('\n');
  };

  const fits = (text: string) => [...text].length <= maxLength;
  const maxShown = Math.min(maxEntries, entries.length);

  for (const withHeader of [true, false]) {
    for (let shown = maxShown; shown >= 1; shown -= 1) {
      const text = build(shown, withHeader, true);
      if (fits(text)) return text;
    }
  }

  for (let shown = maxShown; shown >= 1; shown -= 1) {
    const text = build(shown, false, false);
    if (fits(text)) return text;
  }

  return [...build(1, false, false)].slice(0, maxLength).join('');
}

/**
 * X の Web Intent URL を組み立てる。共有 URL は正規 URL のみ（絞込パラメータは付けない）。
 */
export function buildXShareUrl(text: string, url: string): string {
  return `${X_INTENT_URL}?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}
