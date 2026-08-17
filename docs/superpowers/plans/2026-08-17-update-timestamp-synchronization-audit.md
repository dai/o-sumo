# Update Timestamp Synchronization Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** 全公開ページが、そのコンテンツを最後に更新した正しい日時を表示し、生成データ・アーカイブ・画面・Markdown・CI の間でずれない状態を回帰テストで固定する。

**Architecture:** 更新日時を一律化せず、コンテンツの更新単位ごとに責務を分ける。取組全体は `max(resultUpdatedAt, scheduleUpdatedAt)`、結果と番付は `resultUpdatedAt`、予定は `scheduleUpdatedAt`、力士は各 JSON の `updatedAt`、行司・呼出は各 JSON の `retrievedAt` を正とする。過去場所は月別 snapshot を正とし、ニュース記事日は `publishedAt` のまま扱う。

**Tech Stack:** React 19、TypeScript、Vite、Vitest、Testing Library、Python `unittest`、Cloudflare Pages/Wrangler

**Spec:** `docs/superpowers/plans/2026-08-17-update-timestamp-synchronization-audit.md`

## Global Constraints

- 今回の実装は既存 draft PR #434、branch `feat-sep-2026` に積む。
- 更新日時が存在しない静的ページへ、無関係な日時を追加しない。
- live 取得を実行した場合、内容が同じで日時だけ変わった生成差分はコミットしない。
- 日本語・英語のラベルと Markdown 出力を同じデータ源へ接続する。
- 実装前後で `tasks/todo.md` のチェック状態と Review を更新する。

---

### Task 1: 更新日時契約をデータ層のテストとして固定する

**Files:**
- Create: `app/lib/update-timestamp-contract.test.ts`
- Test: `app/lib/archive-basho-data.test.ts`
- Test: `app/lib/july2026-archive.test.ts`

- [ ] 現行 `public/api/v1/torikumi.json` と `app/lib/july2026-data.ts` の `updatedAt`、`resultUpdatedAt`、`scheduleUpdatedAt` が一致するテストを追加する。
- [ ] `updatedAt === max(resultUpdatedAt, scheduleUpdatedAt)` を ISO 日時として検証する。
- [ ] 現行 `public/api/v1/banzuke.json.updatedAt === torikumi.resultUpdatedAt` を検証する。
- [ ] 三月・五月・七月の各 `BanzukeData.updatedAt` が、対応する取組 snapshot の結果更新日時と一致することを table test にする。
- [ ] `npm test -- app/lib/update-timestamp-contract.test.ts app/lib/archive-basho-data.test.ts app/lib/july2026-archive.test.ts` を実行し、既存のずれがあれば RED の値を記録する。

期待する中心 assertion:

```ts
expect(current.updatedAt).toBe(
  [current.resultUpdatedAt, current.scheduleUpdatedAt].sort().at(-1),
);
expect(banzuke.updatedAt).toBe(current.resultUpdatedAt);
```

### Task 2: 生成器で番付と取組の更新単位を分離する

**Files:**
- Modify: `scripts/update_sumo_data.py:1482-1500`
- Modify: `scripts/update_sumo_data_parser_test.py`
- Modify: `scripts/ci/validate_torikumi.py`
- Test: `scripts/update_sumo_data_parser_test.py`

- [ ] schedule-only 更新で `scheduleUpdatedAt` と総合 `updatedAt` だけが進み、`resultUpdatedAt` が保持される既存テストを再確認する。
- [ ] result-only 更新で `resultUpdatedAt` が進み、`scheduleUpdatedAt` が保持される既存テストを再確認する。
- [ ] `write_api_json()` が `banzuke.json.updatedAt` に総合 `updatedAt` ではなく `resultUpdatedAt` を書く失敗テストを先に追加する。
- [ ] `write_api_json()` の番付 timestamp を `torikumi_dataset["resultUpdatedAt"]` へ変更する。これにより予定だけ更新した時に番付が新しく見える不整合を防ぐ。
- [ ] CI validator に総合日時が結果・予定の最大値である検証を追加し、不正な三値を fixture で拒否する。
- [ ] `python scripts/update_sumo_data_parser_test.py` と `python scripts/ci/validate_torikumi.py` を実行する。

### Task 3: 主要画面が正しいフィールドを表示することを厳密に検証する

**Files:**
- Modify: `app/page.test.tsx`
- Modify: `app/analytics/page.test.tsx`
- Modify: `app/banzuke/page.test.tsx`
- Modify: `app/torikumi/page.test.tsx`
- Modify: `app/components/TorikumiDayPage.test.tsx`

- [ ] Home と Analytics の `BashoContextBar` が総合 `torikumiArchive.updatedAt` を表示するテストを追加する。
- [ ] 番付の現行・三月・五月・七月 route を table test にし、本文と context bar の両方が月別番付日時を表示することを確認する。
- [ ] 取組 hub の結果 route は `resultUpdatedAt`、予定 route は `scheduleUpdatedAt` を表示する厳密値テストへ置き換える。
- [ ] 取組 day page は `visibleDay.source` が schedule の場合に予定日時、それ以外の結果表示に結果日時を使うことを、現行・archive の双方で確認する。
- [ ] `formatUpdatedAt()` 後の表示値で assertion し、単なる「更新日」ラベル存在確認を残さない。
- [ ] 上記 5 test files を focused 実行する。

### Task 4: 人物名鑑の一覧・詳細で個別データの日時を保証する

**Files:**
- Modify: `app/rikishi/page.test.tsx`
- Modify: `app/rikishi/RikishiProfilePage.test.tsx`
- Modify: `app/officials/page.test.tsx`
- Test: `app/lib/rikishi-profile.test.ts`

- [ ] 力士一覧が index JSON の `updatedAt` を表示する既存保証を維持する。
- [ ] 力士詳細は detail JSON に `updatedAt` があればそれを使い、欠ける場合だけ index JSON の値へ fallback するテストを追加する。
- [ ] 行司・呼出の一覧は list JSON、詳細は detail JSON の `retrievedAt` を使い、種別切替時に旧日時を表示しない既存保証を維持する。
- [ ] 表示ラベルは力士を「更新日」、行司・呼出を取得事実に合う「取得日時」のままとする。
- [ ] 人物名鑑 4 test files を focused 実行する。

### Task 5: 更新日時を表示しないページの仕様を明示する

**Files:**
- Modify: `app/components/NewsSection.test.tsx`
- Modify: `app/archives/page.test.tsx`
- Modify: `app/kimarite/page.test.tsx`
- Modify: `docs/api/v1.md`
- Modify: `docs/api/v1.en.md`

- [ ] News は feed 取得時刻 `newsFeed.updatedAt` ではなく各記事の公開日 `publishedAt` を表示する現行仕様をテストで固定する。
- [ ] Archives 一覧はリンク集、Kimarite は静的解説であり、誤解を招く取組の更新日時を表示しないことを明示的にテストする。
- [ ] API 文書の日英双方へ `updatedAt`、`resultUpdatedAt`、`scheduleUpdatedAt`、`retrievedAt` の意味と表示先を追記し、古い例示値は現行 schema に合わせる。
- [ ] News、Archives、Kimarite の focused tests を実行する。

### Task 6: Markdown と実ブラウザで route matrix を検証する

**Files:**
- Modify if needed: `scripts/generate-markdown-pages.ts`
- Modify: `tasks/todo.md`

- [ ] `npm run typecheck`、`npm test`、`npm run build`、`git diff --check` を実行する。
- [ ] build 後の HTML/Markdown について、Home、Analytics、現行・過去番付、結果 hub、予定 hub、結果 day、予定 day、力士一覧・詳細、行司・呼出一覧・詳細を source JSON/snapshot と突合する。
- [ ] `npx wrangler pages dev dist` で代表 route を開き、表示日時、JST/UTC suffix、末尾スラッシュの配信を確認する。
- [ ] News、Archives、Kimariteに無関係な更新日時が表示されていないことを確認する。
- [ ] `tasks/todo.md` の Review に route matrix、期待値、実測値、テスト件数、build 結果を記録する。
- [ ] 実装差分を commit し、`feat-sep-2026` へ push して draft PR #434 を更新する。

## Acceptance Criteria

- 予定だけの更新で番付の「更新日」が進まない。
- 結果・予定の総合日時は常に二つの専用日時の新しい方である。
- 現行と三つの archive month で、番付・結果・予定がそれぞれ正しい snapshot 日時を表示する。
- 人物詳細は一覧の日時で上書きされず、詳細 JSON 固有の日時を優先する。
- 日時を持たない静的ページに、別コンテンツの日時を流用しない。
- 全日時 contract が CI で値まで検証され、ラベル存在だけのテストに依存しない。
