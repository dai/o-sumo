/**
 * /api/og-compare/{ids} エンドポイント単体テスト (prerendered 経路)
 *
 * runtime では画像生成せず KV ルックアップ → 302 リダイレクトのみ検証する。
 * 画像生成 (satori + @resvg/resvg-js) は build time
 * (scripts/build-compare-ogp-matchups.mjs) 側に移管したため、本テストは
 * runtime リダイレクト挙動のみをカバーする。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { compareImageKey } from '../../og-share';

const { onRequestGet, onRequestHead } = await import(
  '../../../../functions/api/og-compare/[[ids]]'
);

interface MockKv {
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
}

function createMockKv(initial: Record<string, string | null> = {}): MockKv {
  const store = new Map(Object.entries(initial));
  return {
    get: vi.fn(async (key: string) => (store.has(key) ? store.get(key)! : null)),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
  };
}

function buildContext({
  ids,
  env,
  requestUrl,
}: {
  ids: string;
  env: Record<string, unknown>;
  requestUrl?: string;
}) {
  const url = requestUrl ?? `https://osada.us/api/og-compare/${ids}`;
  return {
    request: new Request(url),
    params: { ids },
    env,
  } as unknown as Parameters<typeof onRequestGet>[0];
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('compare OGP endpoint — パスバリデーション', () => {
  it('不正な ids (重複) は 302 フォールバック', async () => {
    const res = await onRequestGet(
      buildContext({
        ids: '4227,4227',
        env: { COMPARE_OG_CACHE: createMockKv() },
      }),
    );
    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toContain('og-compare-default.jpg');
    expect(res.headers.get('X-Compare-Og-Reason')).toBe('invalid-ids');
  });

  it('空 ids は 302 フォールバック', async () => {
    const res = await onRequestGet(
      buildContext({
        ids: '',
        env: { COMPARE_OG_CACHE: createMockKv() },
      }),
    );
    expect(res.status).toBe(302);
    expect(res.headers.get('X-Compare-Og-Reason')).toBe('invalid-ids');
  });
});

describe('compare OGP endpoint — フィーチャーフラグ', () => {
  it('COMPARE_OG_ENABLED=false で完全バイパス', async () => {
    const res = await onRequestGet(
      buildContext({
        ids: '4227,3622',
        env: {
          COMPARE_OG_CACHE: createMockKv(),
          COMPARE_OG_ENABLED: 'false',
        },
      }),
    );
    expect(res.status).toBe(302);
    expect(res.headers.get('X-Compare-Og-Reason')).toBe('feature-disabled');
  });
});

describe('compare OGP endpoint — KV バインド欠落', () => {
  it('COMPARE_OG_CACHE 未バインドなら cache-unbound フォールバック', async () => {
    const res = await onRequestGet(
      buildContext({
        ids: '4227,3622',
        env: {},
      }),
    );
    expect(res.status).toBe(302);
    expect(res.headers.get('X-Compare-Og-Reason')).toBe('cache-unbound');
  });
});

describe('compare OGP endpoint — KV ヒット (プリレンダ済みペア)', () => {
  it('KV に URL パスが入っていれば 302 リダイレクト + HIT', async () => {
    const expectedKey = await compareImageKey([4227, 3622]);
    const imagePath = `/images/matchups/${expectedKey}.png`;
    const cache = createMockKv({
      [`compare/matchup/${expectedKey}`]: imagePath,
    });

    const res = await onRequestGet(
      buildContext({
        ids: '4227,3622',
        env: { COMPARE_OG_CACHE: cache },
      }),
    );

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe(`${imagePath}?v=2`);
    expect(res.headers.get('X-Compare-Og-Cache')).toBe('HIT');
    expect(res.headers.get('X-Compare-Og-Path')).toBe(imagePath);
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=86400');
  });

  it('ids 順不同でも同じ KV キーでヒットする (正規化確認)', async () => {
    const expectedKey = await compareImageKey([4227, 3622]);
    const imagePath = `/images/matchups/${expectedKey}.png`;
    const cache = createMockKv({
      [`compare/matchup/${expectedKey}`]: imagePath,
    });

    const res = await onRequestGet(
      buildContext({
        ids: '3622,4227', // 逆順
        env: { COMPARE_OG_CACHE: cache },
      }),
    );

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe(`${imagePath}?v=2`);
    expect(cache.get).toHaveBeenCalledWith(`compare/matchup/${expectedKey}`);
  });
});

describe('compare OGP endpoint — KV ミス (未知ペア)', () => {
  it('該当キーが無ければ cache-miss フォールバック', async () => {
    const cache = createMockKv();

    const res = await onRequestGet(
      buildContext({
        ids: '4227,3622',
        env: { COMPARE_OG_CACHE: cache },
      }),
    );

    const expectedKey = await compareImageKey([4227, 3622]);
    expect(cache.get).toHaveBeenCalledWith(`compare/matchup/${expectedKey}`);
    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toContain('og-compare-default.jpg');
    expect(res.headers.get('X-Compare-Og-Reason')).toBe('cache-miss');
  });

  it('KV 値が URL パス形式でない (旧 base64 等の非互換データ) 場合も cache-miss', async () => {
    // 旧 implementation の残骸: PNG が base64 で入っていた可能性に対する防御
    const expectedKey = await compareImageKey([4227, 3622]);
    const cache = createMockKv({
      [`compare/matchup/${expectedKey}`]: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    });

    const res = await onRequestGet(
      buildContext({
        ids: '4227,3622',
        env: { COMPARE_OG_CACHE: cache },
      }),
    );

    expect(res.status).toBe(302);
    expect(res.headers.get('X-Compare-Og-Reason')).toBe('cache-miss');
  });

  it('HEAD リクエストも GET と同様に 302 リダイレクト', async () => {
    const expectedKey = await compareImageKey([4227, 3622]);
    const cache = createMockKv({
      [`compare/matchup/${expectedKey}`]: '/images/matchups/sample.png',
    });

    const res = await onRequestHead(
      buildContext({
        ids: '4227,3622',
        env: { COMPARE_OG_CACHE: cache },
      }),
    );

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toContain('/images/matchups/sample.png');
    expect(res.headers.get('X-Compare-Og-Cache')).toBe('HIT');
  });
});
