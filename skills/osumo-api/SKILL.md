---
name: osumo-api
description: Use this skill when you need to fetch, parse, or integrate o-sumo public API data (`/api/v1/banzuke.json`, `/api/v1/torikumi.json`) for banzuke, daily results, and schedule workflows.
---

# o-sumo API Skill

## いつ使うか

- 大相撲の番付データを取得したい
- 15日分の結果・予定を日付ベースで扱いたい
- `pending` 状態を含むクライアント実装を行いたい

## クイックスタート

```bash
curl -s https://osada.us/api/v1/banzuke.json
curl -s https://osada.us/api/v1/torikumi.json
```

TypeScript:

```ts
const base = 'https://osada.us/api/v1';
const [banzuke, torikumi] = await Promise.all([
  fetch(`${base}/banzuke.json`).then((r) => r.json()),
  fetch(`${base}/torikumi.json`).then((r) => r.json()),
]);
```

## 実装ルール

1. `updatedAt` を比較して差分更新を判断する
2. `resultDays` / `scheduleDays` は常に 15 日分ある前提で UI を構成する
3. `status = "pending"` の日は空状態を表示し、エラー扱いしない
4. `winner` は空文字の可能性があるため、必ずフォールバック表示を用意する

## フィールド詳細

詳細なフィールドマップは `references/field-map.md` を参照。

## よくある失敗

- `pending` を欠損として扱ってしまい、表示が崩れる
- 日別配列の「配列順」だけに依存し、`isoDate` を無視する
- `kimarite` や `winner` が空の場合を想定しない
