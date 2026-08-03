---
name: osumo-discovery
type: agent-skill
description: Locate the right page on https://osada.us/ for a given basho (YYYYMM), torikumi day (YYYYMMDD), rikishi (id or shikona), kimarite, or analytics view.
---

# o-sumo Site Discovery Skill

## いつ使うか

- 「2026 年 7 月場所の番付ページ」のような **人間向け URL** を見つけたい
- 力士名（例: 「照ノ富士」）から **プロフィールページ** を特定したい
- 「決まり手」「分析」など **機能別ページ** の URL を解決したい
- サイトマップ (`/sitemap.xml`) から **クロール可能なページ一覧** を取得したい

## サイトマップ

- インデックス: `https://osada.us/sitemap.xml`
- API カタログ: `https://osada.us/.well-known/api-catalog`
- robots.txt: `https://osada.us/robots.txt`

## ルート早見表

| 用途 | URL パターン |
| --- | --- |
| ホーム | `https://osada.us/` |
| 過去場所アーカイブ | `https://osada.us/archives/` |
| 力士一覧 | `https://osada.us/rikishi/` |
| 決まり手一覧 | `https://osada.us/kimarite/` |
| データ分析 | `https://osada.us/analytics/` |
| 月別 番付 | `https://osada.us/{YYYYMM}-banzuke/` |
| 月別 取組結果 | `https://osada.us/{YYYYMM}-torikumi/` |
| 月別 取組予定 | `https://osada.us/{YYYYMM}-yotei/` |
| 日別 取組結果 | `https://osada.us/{YYYYMMDD}-torikumi/` |
| 日別 取組予定 | `https://osada.us/{YYYYMMDD}-yotei/` |
| 力士プロフィール | `https://osada.us/rikishi/{id}/` |

## 解決アルゴリズム

```ts
type Target =
  | { kind: 'basho'; monthKey: string; view: 'banzuke' | 'result' | 'schedule' }
  | { kind: 'day'; pathDate: string; view: 'result' | 'schedule' }
  | { kind: 'rikishi'; id: number }
  | { kind: 'kimarite' }
  | { kind: 'analytics' };

function resolve(target: Target): string {
  const base = 'https://osada.us';
  switch (target.kind) {
    case 'basho':
      return `${base}/${target.monthKey}-${
        target.view === 'banzuke' ? 'banzuke' :
        target.view === 'result' ? 'torikumi' : 'yotei'
      }/`;
    case 'day':
      return `${base}/${target.pathDate}-${
        target.view === 'result' ? 'torikumi' : 'yotei'
      }/`;
    case 'rikishi':
      return `${base}/rikishi/${target.id}/`;
    case 'kimarite':
      return `${base}/kimarite/`;
    case 'analytics':
      return `${base}/analytics/`;
  }
}
```

## 実装ルール

1. **月キーは `YYYYMM` 形式**（例: `202607`）。`public/api/v1/torikumi.json` の
   `bashoId` / `resultDays[].pathDate` を参照して動的に決める
2. **対応月は 2026 年 3 月・5 月・7 月**の 3 つ。未知の月キーは 404
3. **日別ページ** は `pathDate` (`YYYYMMDD`) 形式
4. **力士 ID** は正の整数。`rikishi.json` の `id` をそのまま使う
5. ページには **トレイリングスラッシュ** を含める（Cloudflare Pages の正規化に合わせる）
6. スクレイピングではなく、まず **`/api/v1/*.json` を叩く** こと

## よくある失敗

- トレイリングスラッシュを忘れて 301 リダイレクトを踏む
- 月キーと年/月の表記を混同する（例: `2026/07` は無効）
- 取組予定 (`yotei`) と取組結果 (`torikumi`) を取り違える
- 力士 ID ではなく四股名で URL を作ろうとする（ID でなければならない）

## Markdown ネゴシエーション

Markdown で受け取りたい場合は `Accept: text/markdown` を付ける。対応ルートは
ビルド時に `.md` ファイルとしても配信される。