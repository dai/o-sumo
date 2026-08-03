---
name: osumo-content
type: skill-md
description: Fetch official 大相撲 banzuke, torikumi, and rikishi data from the public o-sumo JSON API (https://osada.us/api/v1/*.json).
---

# o-sumo Content API Skill

## いつ使うか

- 大相撲の **公式番付** (`banzuke.json`) を取得したい
- **15 日分の取組結果・予定** (`torikumi.json`) を扱いたい
- **力士のプロフィール一覧** (`rikishi.json`) を取得したい
- データ更新時刻 (`updatedAt`) を見て差分更新したい

## クイックスタート

```bash
curl -s https://osada.us/api/v1/banzuke.json
curl -s https://osada.us/api/v1/torikumi.json
curl -s https://osada.us/api/v1/rikishi.json
curl -s https://osada.us/api/v1/news.json
```

TypeScript / fetch:

```ts
const base = 'https://osada.us/api/v1';
const [banzuke, torikumi] = await Promise.all([
  fetch(`${base}/banzuke.json`).then((r) => r.json()),
  fetch(`${base}/torikumi.json`).then((r) => r.json()),
]);
```

## 実装ルール

1. `updatedAt` を比較して差分更新を判断する
2. `resultDays` / `scheduleDays` は常に 15 日分ある前提で扱う
3. `status = "pending"` の日は空状態として扱い、エラーにしない
4. `winner` は `null` の可能性があるため、必ずフォールバック表示を用意する
5. `resultUpdatedAt` と `scheduleUpdatedAt` は別管理なので、結果と予定の更新日時を混同しない
6. `dayHead` は開催名ではなく `"{N日目}： 令和X年M月D日(曜)"` 形式として扱う
7. `rikishi.json` は ID で参照する（profile 画像は `https://osada.us/images/rikishi/{id}.png`）

## よくある失敗

- `pending` を欠損として扱ってしまい、表示が崩れる
- 日別配列の「配列順」だけに依存し、`isoDate` を無視する
- `kimarite` や `winner = null` の場合を想定しない
- `updatedAt` だけを見て結果更新日と予定更新日を区別しない
- HTML ページをスクレイプしようとする（公開 JSON API を使うこと）

## データ出典

- 公益財団法人日本相撲協会 (https://www.sumo.or.jp/)
- API 仕様: https://github.com/dai/o-sumo/blob/main/docs/api/v1.md

## レート制限

Cloudflare のエッジ既定値のみ。明示的なレート制限はないが、頻繁にポーリングする前に
`updatedAt` を確認し、変更がない場合はバックオフすること。