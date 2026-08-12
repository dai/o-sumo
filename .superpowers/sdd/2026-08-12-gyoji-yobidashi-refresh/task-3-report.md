# Task 3 Report: 更新手順と総合検証

## Result

`docs/official-profile-refresh-runbook.md` を追加し、公式数値ID、写真不使用、生成、差分確認、JSON整合、アプリ・sitemap、Cloudflare Pages配信の更新手順を記録した。`tasks/todo.md` のTask 3とReviewも更新した。

Documentation commit: `032237f0fc2d5fea760731aa90264a52d06d3d11` (`docs: add official profile refresh runbook`)。

このタスクではproduction/runtime codeと生成済みJSONを変更していない。検証対象HEADは `0718ce08f7cb3ee3edd77de08568a7585560b1e7`（Task 2 review fix round 2）である。

## Commands and results

すべて作業tree rootで実行した。明記がないコマンドはexit status 0である。

```text
python scripts/update_official_profiles_test.py
```

- exit 0
- `Ran 7 tests in 1.404s` / `OK`
- fixture注入のためネットワークに依存しない。

```text
npm test -- --run app/lib/official-profile.test.ts app/officials/page.test.tsx app/components/MetaHead.test.tsx app/lib/page-meta.test.ts app/lib/sitemap.test.ts app/lib/redirect-rules.test.ts
```

- exit 0
- 6 files / 74 tests passed

```text
npm run typecheck
npm test
npm run build
```

- `npm run typecheck`: exit 0
- `npm test`: exit 0, 40 files / 297 tests passed, 53.49s
- `npm run build`: exit 0, 135 modules transformed, 3.67s

```text
git diff --check
```

- exit 0

## Generated JSON and sitemap

PowerShellでindexと各数値ファイルをパースして確認した。

| kind | index | detail JSON | positive numeric IDs | matching kind/ID | photo/image fields |
| --- | ---: | ---: | --- | --- | ---: |
| gyoji | 42 | 42 | true | true | 0 |
| yobidashi | 45 | 45 | true | true | 0 |

代表値:

- `public/api/v1/gyoji/1986.json`: 木村 庄之助、`birthDate: 1961-10-30`、`adoptedAt: 1977-10`、`sourceUrl: https://www.sumo.or.jp/Profile/gyoji/1986/`
- `public/api/v1/yobidashi/1935.json`: 克之、`rank: 立呼出`、`adoptedAt: 1979-08`

`dist/sitemap.xml` は `https://osada.us/gyoji/` と `https://osada.us/yobidashi/` を含む。各indexから導出した詳細URLは行司42件、呼出45件、合計87件すべてが存在した。

## Cloudflare Pages HTTP verification

ビルド後に、隠し非対話プロセスで以下を起動した。

```text
npx wrangler pages dev dist --ip 127.0.0.1 --port 8788
```

`curl.exe --max-redirs 0` とHEAD response headerで実測した結果:

| request | status | Location | Content-Type |
| --- | ---: | --- | --- |
| `/gyoji/` | 200 | — | `text/html; charset=utf-8` |
| `/gyoji` | 301 | `/gyoji/` | `text/plain;charset=UTF-8` |
| `/gyoji/1986/` | 200 | — | `text/html; charset=utf-8` |
| `/gyoji/1986` | 301 | `/gyoji/1986/` | `text/plain;charset=UTF-8` |
| `/yobidashi/` | 200 | — | `text/html; charset=utf-8` |
| `/yobidashi` | 301 | `/yobidashi/` | `text/plain;charset=UTF-8` |
| `/yobidashi/1935/` | 200 | — | `text/html; charset=utf-8` |
| `/yobidashi/1935` | 301 | `/yobidashi/1935/` | `text/plain;charset=UTF-8` |
| `/api/v1/gyoji.json` | 200 | — | `application/json` |
| `/api/v1/gyoji/1986.json` | 200 | — | `application/json` |
| `/api/v1/yobidashi.json` | 200 | — | `application/json` |
| `/api/v1/yobidashi/1935.json` | 200 | — | `application/json` |

Playwrightで実ブラウザ描画も確認した。

- `/gyoji/`: titleは「行司名鑑 | o-sumo」。行司42名の数値IDリンク、協会公式出典、取得日時、写真不使用表示を確認。
- `/gyoji/1986/`: titleは「木村 庄之助 | 行司プロフィール | o-sumo」。公式出典、プロフィール値、`/api/v1/gyoji/1986.json`、取得日時、写真不使用表示を確認。

検証用のPlaywright snapshotは成果物に残さず削除した。Wranglerプロセスも停止した。

## Warnings

- `npm run build` は既存の500 kB超minify chunk warningと、`caniuse-lite` が6か月古いというBrowserslist通知を出した。buildは成功し、このタスクで変更していない。
- Nodeは`localStorage is not available because --localstorage-file was not provided`というExperimentalWarningをテスト・build中に出した。テストとbuildのexit statusは0だった。
- `wrangler pages dev` は`compatibility_date`未指定のwarningを出したが、上記HTTP matrixのとおりPages runtimeは期待どおり応答した。

## Self-review

- runbookは旧い力士画像更新手順を参照せず、行司・呼出の現契約だけを記述している。
- 数値IDをURL、index、個別JSON、sitemapで一貫した唯一のIDとして明記し、name slug互換を示唆していない。
- 画像取得・保存・フィールド追加を明確に禁止し、検査コマンドも含めた。
- HTTP確認は`_redirects`の静的確認で終わらせず、Pages runtimeのstatus、Location、JSON Content-Typeを実測した。
