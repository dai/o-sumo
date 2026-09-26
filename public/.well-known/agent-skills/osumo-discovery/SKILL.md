---
name: osumo-discovery
type: skill-md
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

1. 最初に `https://osada.us/api/v1/torikumi.json` を取得する。`bashoId` は上流の通し番号（例: `637`）であり、月キーではない。
2. **月キーは `YYYYMM` 形式**。`resultDays[]` または `scheduleDays[]` の有効な `pathDate`（8桁）の先頭6桁から求める。日付がなければ推測せず、サイトマップを調べる。
3. **対応月を固定しない**。過去場所は `/sitemap.xml` または `/archives/` に存在するURLから選ぶ。現在の JSON API を過去場所のデータとして扱わない。
4. **日別ページ** は API の `pathDate` をそのまま使う。予定は `scheduleDays` → `yotei`、結果は `resultDays` → `torikumi`。`pending` は未掲載であり、取組なしや休場を意味しない。
5. 「今日」「昨日」は **Asia/Tokyo（JST）** の日付と `isoDate` を照合する。「千秋楽」は対象配列の `day` が最大の項目を選ぶ。該当日がなければ別の日を今日として返さない。
6. **力士 ID** は正の整数。四股名から探すときは `/api/v1/rikishi.json` の一覧で ID を解決し、`/rikishi/{id}/` を作る。
7. ページURLには **トレイリングスラッシュ** を含める。返す前にサイトマップ・APIの日付と整合することを確認する。HTTP 200 だけではSPAのフォールバックと区別できないため、本文の日付・タイトルも確認する。
8. データそのものを求められたら、まず **公開 JSON API** を使う。出典URLと、結果は `resultUpdatedAt`、予定は `scheduleUpdatedAt` を併記する。

## よくある失敗

- トレイリングスラッシュを忘れて 301 リダイレクトを踏む
- 月キーと年/月の表記を混同する（例: `2026/07` は無効）
- 取組予定 (`yotei`) と取組結果 (`torikumi`) を取り違える
- 力士 ID ではなく四股名で URL を作ろうとする（ID でなければならない）

## Markdown ネゴシエーション

`Accept: text/markdown` を付けて取得し、`Content-Type: text/markdown` を確認する。
対応範囲はホーム・アーカイブ一覧・力士一覧・決まり手・分析・サイト概要、
および公開データに存在する月別の番付/結果/予定と日別の結果/予定。
対応ページの `/index.md` も直接取得できる。日別ページには掲載状況・更新時刻・取組を含む。
力士個別ページなど、生成対象外のルートはHTMLにフォールバックする。

## 利用方針と接続方法

- 公開読み取りは認証・登録・APIキー不要。`robots.txt` は `search=yes, ai-input=yes, ai-train=no`。
- APIカタログと公開スキルがHTTP経由の入口。MCPサーバーは提供していない。
- A2Aカードは案内用であり、`/a2a` のタスク操作は未実装。これらのカードの存在をタスク実行対応と解釈しない。
