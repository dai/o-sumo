# Final fix report: `feat-gyoji`

## Result

Final senior reviewのImportant 2件とMinor 5件を、1回の修正waveで対応した。生成済み公式snapshotは変更せず、production parser、profile取得境界、detail state、rank code契約、sitemap検証、runbookと回帰テストだけを更新した。

## TDD evidence

### Official heading parser

現行 `https://www.sumo.or.jp/Profile/gyoji/1986/` のsanitized raw fragmentと同じ、`<br>` 後の改行と20空白をfixtureへ入れた。production変更前の結果は次のとおり。

```text
python scripts/update_official_profiles_test.py
Ran 7 tests
FAILED (failures=3, errors=3)
profile heading is invalid for gyoji 1986
```

正規化済みheadingの階級と読みの間だけ任意空白を許容した。capture後の一覧・詳細の氏名、階級、読みの完全一致判定は変更していない。

```text
Ran 7 tests in 0.602s
OK
```

### Profile transport, keyed state, rank codes, and sitemap IDs

production変更前のfocused testでは8 testsが失敗した。失敗は、network／HTTP 500がnot-foundへ変換されること、同期request-key commitで旧profileが残りloadingにならないこと、rikishi unsafe integerと未知rankCodeが受理されることを示した。

取得JSONのkind／ID mismatchは、not-foundではなくinvalid payloadにする追加テストを先に変更し、`promise resolved null instead of rejecting` のREDを確認した。

最小修正後の契約は次のとおり。

- route ID不正とHTTP 404だけが`null`になり、network、5xx、JSON parse、identity mismatch、未知rankCodeはrejectされる。
- profile画面はrejectを既存のlocalized load-errorへ表示し、not-foundと区別する。
- detail stateは`{kind,id,status,profile}`を単一stateで所有し、current request keyと不一致のcommitはloadingとして描画する。旧profileは表示せず、既存のpathname-keyed metadata保護と組み合わせて旧人物metadataを新routeへ適用しない。
- 17値tupleから`OfficialRankCode` unionとruntime setを導出し、fetched index／profileとbuild index／profileで共有検証する。英語UIのsilent rank fallbackは削除した。
- rikishi／official sitemap IDはlabel付き共通validatorでpositive safe integerと一意性を検証する。

```text
npm test -- --run app/lib/official-profile.test.ts app/officials/page.test.tsx app/components/MetaHead.test.tsx app/lib/page-meta.test.ts app/lib/sitemap.test.ts app/lib/redirect-rules.test.ts
Test Files  6 passed (6)
Tests       83 passed (83)
```

## Live generator proof

```text
python scripts/update_official_profiles.py --output-root public/api/v1
gyoji=42 yobidashi=45
```

- index 2件とdetail 87件、計89 JSONのfile setはHEADと同一。
- `retrievedAt` を再帰的に除外したJSON比較は差分0件。
- live取得時刻は `2026-08-12T02:01:21Z`。
- 証明後、4生成targetをHEAD snapshotへ復元した。timestamp-only生成差分はcommitしない。

## Runbook fixes

- PowerShell整合性検査はindex／detail件数、positive safe integer ID、重複ID、kind／ID、画像fieldを判定し、不一致時にthrowする。
- 正常snapshotでは行司42/42、呼出45/45、全判定True、画像field 0でexit 0。
- `UniqueIds=False` の検査結果では `Official profile integrity check failed: gyoji` をthrowしてexit 1。
- HTTP手順へslashless `/yobidashi` と `/yobidashi/1935` を追加した。

## Final verification

```text
python scripts/update_official_profiles_test.py
7 tests passed

npm test -- --run app/lib/official-profile.test.ts app/officials/page.test.tsx app/components/MetaHead.test.tsx app/lib/page-meta.test.ts app/lib/sitemap.test.ts app/lib/redirect-rules.test.ts
6 files / 83 tests passed

npm run typecheck
exit 0

npm test
40 files / 306 tests passed

npm run build
135 modules transformed; exit 0
```

生成データとsitemap:

| kind | index | detail | safe unique IDs | kind／ID | rankCode | image fields | sitemap detail |
| --- | ---: | ---: | --- | --- | --- | ---: | ---: |
| gyoji | 42 | 42 | true | true | true | 0 | 42 |
| yobidashi | 45 | 45 | true | true | true | 0 | 45 |

Wrangler Pages runtime:

| request group | result |
| --- | --- |
| `/gyoji/`, `/gyoji/1986/`, `/yobidashi/`, `/yobidashi/1935/` | 200 `text/html` |
| slashless 4 URL | 301 to corresponding trailing-slash URL |
| index／representative detail JSON 4 URL | 200 `application/json` |

Wranglerのworkerd listenerは検証後に停止した。

## Warnings and concerns

- buildは既存の500 kB超chunk warningと、6か月古いBrowserslist data warningを出すがexit 0。
- Vitestは既存のNode `localStorage` ExperimentalWarningを出すが40 files / 306 testsが通過した。
- 最初のPages assertでPowerShell `Invoke-WebRequest -MaximumRedirection 0` がredirectを例外化したため、runbookと同じ`curl.exe`のstatus／content type／redirect URLへ切り替え、12 requestsをassertした。配信結果の失敗ではない。
