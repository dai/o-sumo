import { describe, expect, it } from 'vitest';
import {
  compareImageKey,
  normalizeIds,
  parseCompareIdsStrict,
} from '../og-share';

describe('normalizeIds', () => {
  it('既昇順のタプルはそのまま', () => {
    expect(normalizeIds([100, 200])).toEqual([100, 200]);
  });

  it('逆順なら昇順に揃える', () => {
    expect(normalizeIds([200, 100])).toEqual([100, 200]);
  });

  it('同値を含まない前提 (呼び出し側で重複排除)', () => {
    expect(normalizeIds([100, 100])).toEqual([100, 100]);
  });
});

describe('parseCompareIdsStrict', () => {
  it('正常な csv', () => {
    expect(parseCompareIdsStrict('4227,3622')).toEqual([4227, 3622]);
  });

  it('要素数 1 件は null', () => {
    expect(parseCompareIdsStrict('4227')).toBeNull();
  });

  it('要素数 3 件は null', () => {
    expect(parseCompareIdsStrict('4227,3622,1234')).toBeNull();
  });

  it('非数字を含む', () => {
    expect(parseCompareIdsStrict('4227,abc')).toBeNull();
  });

  it('空文字列', () => {
    expect(parseCompareIdsStrict('')).toBeNull();
  });

  it('空カンマ', () => {
    expect(parseCompareIdsStrict(',')).toBeNull();
  });

  it('重複', () => {
    expect(parseCompareIdsStrict('4227,4227')).toBeNull();
  });

  it('負数', () => {
    expect(parseCompareIdsStrict('-1,4227')).toBeNull();
  });

  it('前後空白はパース無効', () => {
    // share-meta.ts と挙動を合わせるためトリムしない
    expect(parseCompareIdsStrict(' 4227 , 3622 ')).toBeNull();
  });
});

describe('compareImageKey', () => {
  it('昇順・逆順で同じハッシュ (同一キャッシュキー)', async () => {
    const a = await compareImageKey([4227, 3622]);
    const b = await compareImageKey([3622, 4227]);
    expect(a).toBe(b);
  });

  it('16文字の hex', async () => {
    const key = await compareImageKey([4227, 3622]);
    expect(key).toMatch(/^[0-9a-f]{16}$/);
  });

  it('異なる ids は異なるキー', async () => {
    const a = await compareImageKey([4227, 3622]);
    const b = await compareImageKey([4227, 9999]);
    expect(a).not.toBe(b);
  });

  it('同 ids で再現性', async () => {
    const a = await compareImageKey([4227, 3622]);
    const b = await compareImageKey([4227, 3622]);
    expect(a).toBe(b);
  });
});