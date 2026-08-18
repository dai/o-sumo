# ページシェル (ヘッダー / パンくず)

PR #443 Phase 2 で導入した、詳細ページ共通の「ページ最上部スティッキシェル」のパターン。

## 構成

```
┌─────────────────────────────────────┐  ← position: sticky; top: 0
│ ◀ ホーム / 人物名鑑 / 力士名        │   PageBreadcrumb (高 ~36px)
├─────────────────────────────────────┤
│ 大相撲 — 令和八年七月場所 番付      │   Header (高 ~56px desktop / ~40px mobile)
├─────────────────────────────────────┤  ← position: sticky; top: 0
│ ...メインコンテンツ (スクロール)    │
```

合計スティッキ領域:
- desktop: ~92px (~10vh)
- mobile: ~76px (~12vh)

## PageBreadcrumb コンポーネント

`app/components/PageBreadcrumb.tsx`

```tsx
<PageBreadcrumb
  ariaLabel={t('rikishi.breadcrumbLabel')}
  items={[
    { label: t('global.homeLink'), href: '/' },
    { label: t('rikishi.listTitle'), href: '/rikishi/' },
    { label: profile.name },
  ]}
/>
```

### 仕様

- `<nav role="navigation" aria-label="...">` を返す
- 各 `<li>` は最後の項目に `aria-current="page"` を持つ
- `current: true` を渡すと明示的に現在地としてマークできる
- 最後の項目はリンク化せず `<span>` で表示
- 区切り文字 `›` は `aria-hidden` の `<li>` として挿入
- items が空のときは何もレンダリングしない

### CSS

- `.page-breadcrumb` — `--surface-container-low` の地、フォント 0.85rem
- `.page-breadcrumb__item` — リンクは `--color-secondary`、現在ページは `--color-primary` + bold
- `.page-breadcrumb__sep` — `--color-muted`、ユーザ選択不可

## ヒーロー縮小ルール

詳細ページのヘッダースティッキ高さは原則 **56-92px** に収める。`position: sticky` で常時表示されるため、スクロール中の占有面積を意識して小さく保つ。

### 推奨値 (desktop / mobile)

| ページ | padding (desktop) | padding (≤720px) | タイトルサイズ |
|---|---|---|---|
| ホーム (`/`) | 1rem 1.5rem | 0.75rem 1rem | 2rem → 1.35rem |
| 力士 / 公式 (`/rikishi/`, `/gyoji/`, `/yobidashi/`) | 0.85rem 1rem | 0.65rem 0.85rem | (既存 h1) |
| 取組 hub / day (`/YYYYMM-torikumi/`, `/YYYYMMDD-torikumi/`) | 0.85rem 1rem | 0.6rem 0.85rem | 1.4rem → 1.15rem |
| 番付 (`/YYYYMM-banzuke/`) | 0.85rem 1rem | 0.65rem 0.85rem | 2rem → 1.5rem |
| 技 (`/kimarite/`) | 0.85rem 1rem | (同) | clamp(1.4-2rem) |
| 解析 (`/analytics/`) | 0.85rem 1rem | (同) | clamp(1.3-2rem) |
| アーカイブ (`/archives/`) | 0.85rem 1rem | 0.65rem 0.85rem | 1.6rem → 1.3rem |

### 力士詳細の写真サイズ

| 対象 | desktop | mobile |
|---|---|---|
| 詳細ヒーローの写真 | 128px × 128px | 96px × 96px |

写真縮小時は `font-size` (プレースホルダー文字) も 2.8rem (desktop) に連動。

## パンくずの階層ルール

すべての詳細ページは **ホーム → 一覧 (親) → 個別** の 3 段を原則とする。

| ルート | 階層 |
|---|---|
| `/rikishi/{id}/` | ホーム / 力士プロフィール / 力士名 |
| `/gyoji/{id}/`, `/yobidashi/{id}/` | ホーム / 行司名鑑・呼出名鑑 / 名前 |
| `/compare/` | ホーム / 力士プロフィール / 力士を比較 |
| `/YYYYMM-torikumi/` (hub) | ホーム / アーカイブ / 場所名 |
| `/YYYYMMDD-torikumi/` (day) | ホーム / アーカイブ / 場所名 / 場所名 / 日名 |
| `/YYYYMM-banzuke/` | ホーム / アーカイブ / 場所名 |
| `/kimarite/`, `/analytics/`, `/archives/` | ホーム / 技・解析・アーカイブ |

※ 階層が深い (4 段以上) 場合は truncate せず full 表示。横スクロールで隠れない程度に小さく (`font-size: 0.85rem`)。

## i18n キー

新規追加分:

| キー | ja | en |
|---|---|---|
| `comparison.crumb` | 力士を比較 | Compare rikishi |
| `torikumi.hub.crumb` | 取組 | Torikumi |
| `banzuke.crumb` | 番付 | Banzuke |
| `kimarite.cardTitle` (既存) | 決まり手 | Kimarite |
| `analytics.crumb` | 大相撲アナリティクス | Grand Sumo Analytics |
| `archives.crumb` | アーカイブ | Archives |

既存 `rikishi.breadcrumbLabel` (「パンくず」 / "Breadcrumb") は aria-label として再利用。

## テスト観点

`app/components/PageBreadcrumb.test.tsx` の 4 件で以下を検証:
- `<nav>` landmark と aria-label
- 末尾項目に `aria-current="page"` / リンク無し
- items 空のとき何もレンダリングしない
- 明示的 `current: true` の挙動

各詳細ページのテスト (officials × 2, compare, torikumi hub, day, banzuke, kimarite, analytics, archives) で以下を検証:
- `<nav aria-label="パンくず">` の存在
- ホーム / 一覧 / 個別 の各リンクの href
- 現在ページ名が表示される

## 触ったファイル

- 新規: `app/components/PageBreadcrumb.tsx`, `app/components/PageBreadcrumb.test.tsx`
- 詳細ページ 9 種に PageBreadcrumb を組み込み
- ヒーロースティッキを CSS でコンパクト化 (home / rikishi / torikumi / banzuke / kimarite / analytics / archives)
- i18n (ja/en): `crumb` キーを 6 セクションに追加