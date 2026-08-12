# Task 2 実装レポート

## 結果

行司・呼出のAPI型、一覧・詳細画面、日英階級表示、人物metadata、sitemap入力検証、Cloudflare Pages redirectを、Task 1の数値ID JSON契約へ接続した。Task 1の生成器、生成テスト、生成済みJSONは変更していない。

実装コミット: `ad83d66` (`feat: connect official profile UI and sitemap`)

## TDD evidence

### RED

production code変更前に次を実行した。

```text
npm test -- --run app/lib/official-profile.test.ts app/officials/page.test.tsx app/components/MetaHead.test.tsx app/lib/page-meta.test.ts app/lib/sitemap.test.ts app/lib/redirect-rules.test.ts
```

結果はexit 1、6 filesすべてで期待した未実装差分が検出され、19 tests failed / 47 tests passedだった。主な失敗は次のとおり。

- `MetaHead`: 読み込み後も汎用の「行司プロフィール」titleのままで、人物名がtitle、description、OG、Twitterへ反映されなかった。
- officials UI: 一覧の公式出典リンク、取得日時、写真不使用説明、英語階級表示がなく、個別画面は旧`updatedAt` / `debut`契約を参照していた。
- API helper: `0`、負数、文字slugを拒否せず、取得JSONのkind / ID不一致をnot-foundにしなかった。
- page metadata: 非数値のofficial profile pathもプロフィールページとして扱った。
- sitemap: 数値official IDを受理せず、重複ID、個別JSON欠落、kind不一致、ID不一致のbuild入力検証がなかった。
- redirects: 行司・呼出の一覧と詳細に301 / SPA 200規則がなかった。

### GREEN

最小実装後のfocused test:

```text
Test Files  6 passed (6)
Tests       66 passed (66)
```

最終検証:

```text
npm run typecheck  -> pass
npm test           -> 40 files / 289 tests pass
npm run build      -> pass
git diff --check   -> pass
```

build後の`dist/sitemap.xml`をJSON index件数と照合した。

```text
GyojiSitemap     : 42
GyojiIndex       : 42
YobidashiSitemap : 45
YobidashiIndex   : 45
HasGyojiList     : True
HasYobidashiList : True
```

buildには既存の500 kB超chunk warningとcaniuse-lite更新warningがあるが、処理は成功した。

## 変更ファイル

- `app/lib/official-profile.ts`, `app/lib/official-profile.test.ts`
  - 数値ID、`retrievedAt`、`rankCode`、`adoptedAt`、任意`nameHistory`へ型を更新。
  - route IDは正のsafe integerだけを許可し、取得JSONのkind / ID一致も検証。
- `app/officials/page.tsx`, `app/officials/page.test.tsx`
  - 数値詳細URL、日英階級、公式出典、取得日時、写真不使用説明、採用年月、任意の行司名履歴を表示。
  - 無効IDと取得失敗をnot-found表示へ接続。
- `src/locales/ja/common.json`, `src/locales/en/common.json`
  - 全17 rankCodeの表示名と、取得日時・metadata・採用年月・行司名履歴の文言を追加。
  - 英語階級名は日本相撲協会英語版一覧の表記に合わせた。
- `app/components/MetaHead.tsx`, `app/components/MetaHead.test.tsx`, `app/main.tsx`
  - Context経由で読み込み済み人物のtitle / descriptionだけを上書き。
  - canonical相当のOG URL、image、typeはpathname由来の`PageMeta`を維持。
- `app/lib/page-meta.ts`, `app/lib/page-meta.test.ts`
  - official detail metadataを正の数値ID pathだけに限定。
- `app/lib/sitemap.ts`, `app/lib/sitemap.test.ts`, `vite.config.ts`
  - official IDの型、正数、safe integer、重複を検証。
  - build時に各index IDの個別JSON存在、kind一致、ID一致を検証してからsitemapを生成。
- `public/_redirects`, `app/lib/redirect-rules.test.ts`
  - `/gyoji`、`/yobidashi`と各詳細の末尾スラッシュ301、canonical pathのSPA 200を追加。
- `tasks/todo.md`
  - Task 2の計画、進捗、検証結果を記録。

## Contract decisions

- 公式個別プロフィールURL末尾と同じ正の数値を、page pathとAPI pathの唯一のIDとして使う。旧文字slug互換は追加しない。
- 日本語ではJSONの公式`rank`と同値の表示を使い、英語では`rankCode`から日本相撲協会英語版の階級名へ変換する。
- `retrievedAt`は公式更新日ではないため、「更新日」ではなく「取得日時」と表示する。
- 詳細metadataは人物名を含むtitle / descriptionだけを動的上書きし、OG URLとcanonicalはpathnameから導出する。
- sitemap helperは投入されたofficial一覧を厳格検証し、Vite build pluginはさらに個別JSONとのファイル整合性を確認する。
- Cloudflare Pagesの`:id` placeholderは数値正規表現を表現できないため、redirectは既存rikishi patternに合わせ、非数値IDの拒否は画面/API helperで行う。

## Self-review

- 写真要素、写真URL、画像由来フィールドは追加していない。UI testでも`img`不在を確認した。
- Task 1の生成器と生成済みJSONに差分がないことを`git status`で確認した。
- 個別JSON欠落やindex / profile不一致時は`buildStart`で失敗するため、不完全なsitemapは生成されない。
- metadata overrideはページ固有のtitle / descriptionに限定し、既存のpathname正規化とcanonical URL生成を複製していない。
- profile route変更時は現在のkind / 数値IDと一致する読み込み済みprofileだけを表示・metadata反映するため、前人物の情報を新URLへ流用しない。
- focused test、全test、typecheck、build、diff checkの全てが緑で、Task 2範囲外の実装変更はない。

## Review fix round 1

`task-2-review.md`のImportant 3件をTDDで修正した。deferred Minorの`rankCode` unionはこのroundでは変更していない。

### RED

production code変更前に`app/officials/page.test.tsx`へ、行司一覧から呼出一覧へ切り替えて次のfetchを未解決にした状態、次fetch失敗状態、JSONの公式`rank`がlocale mapと異なる日本語一覧・詳細のテストを追加した。

```text
npm test -- --run app/officials/page.test.tsx app/components/MetaHead.test.tsx
Test Files  1 failed | 1 passed (2)
Tests       4 failed | 10 passed (14)
```

失敗は、kind切替中に旧行司が`/yobidashi/1986/`へ再リンクされ旧source / retrievedAtも残ること、fetch失敗後も旧sourceが残ること、日本語一覧・詳細がJSONの`rank`ではなくrankCode localeを表示することを示した。

metadataは実ページのeffect順序だけに依存しない決定的な回帰テストへ強化した。読み込み済み人物overrideを保持したままプロフィール間、プロフィールから一覧、プロフィールから無効IDへ遷移すると、新しいOG URLに旧人物title / descriptionが結合した。

```text
npm test -- --run app/components/MetaHead.test.tsx
Test Files  1 failed (1)
Tests       3 failed | 3 passed (6)
```

### Changes

- `PageMetaOverride`に適用対象`pathname`を持たせ、現在pathと正規化後に一致するoverrideだけをtitle / description / OG / Twitterへ適用した。
- `OfficialListPage`はkind変更effect開始時にitems、source、retrievedAtを空にし、statusをloadingへ戻す。次fetch失敗時も旧directory情報を表示しない。
- 日本語UIはJSONの公式`rank`を直接表示し、英語UIだけ`rankCode`から公式英語階級名を選ぶ。
- 一覧遷移テストは次fetch未解決中に旧人物、旧source、旧retrievedAtが消えることを確認し、その後fetchを解決して正しい呼出URLになることも確認した。失敗遷移も別テストで確認した。
- metadata遷移テストはプロフィール間、一覧、無効IDの3経路で、新pathのcanonical / OG URLに旧人物metadataが使われないことを確認した。

### GREEN

```text
npm test -- --run app/officials/page.test.tsx app/components/MetaHead.test.tsx
Test Files  2 passed (2)
Tests       14 passed (14)

npm test -- --run app/lib/official-profile.test.ts app/officials/page.test.tsx app/components/MetaHead.test.tsx app/lib/page-meta.test.ts app/lib/sitemap.test.ts app/lib/redirect-rules.test.ts
Test Files  6 passed (6)
Tests       73 passed (73)

npm run typecheck  -> pass
npm test           -> 40 files / 296 tests pass
npm run build      -> pass
git diff --check   -> pass
```

build warningは前roundと同じ既存のchunk sizeおよびcaniuse-lite更新通知だけだった。Task 1生成器と生成済みJSONには差分がない。

## Review fix round 2

残っていたImportant findingをTDDで修正した。deferred Minorの`rankCode` unionは変更していない。

### RED

次の呼出fetchを未解決にしたまま、行司一覧を取得済みのcomponentへ`kind="yobidashi"`を同期commitする回帰テストを追加した。effect完了を待たず、callback内で旧行、旧source、旧retrievedAtがないことを検証した。

```text
npm test -- --run app/officials/page.test.tsx
Test Files  1 failed (1)
Tests       1 failed | 8 passed (9)
```

旧行司「木村 庄之助」が消えず、さらに新しいkindで`/yobidashi/1986/`へ再リンクされることを確認した。この失敗により、effect開始時のstate resetだけでは同期commitを保護できないことを再現した。

### Changes

- 一覧の`items`、`source`、`retrievedAt`、`status`を、取得対象の`kind`と同じ単一stateへまとめた。
- 描画時にstateのkindと現在のkindを比較し、不一致なら旧データを使わずloading、空の一覧、空のsource / retrievedAtとして扱う。
- effectはcurrent kindのloading、ready、errorを原子的に設定し、既存の`active` guardで完了順が逆転したfetchも無視する。
- 回帰テストは`flushSync`で種別変更をcommitし、次effectがstateを消す順序へ依存せず旧情報が非表示になることを同期的に確認する。
- レビュー修正から得たrequest keyと非同期stateの結び付け規則を`tasks/lessons.md`へ記録した。

### GREEN

```text
npm test -- --run app/officials/page.test.tsx
Test Files  1 passed (1)
Tests       9 passed (9)

npm test -- --run app/lib/official-profile.test.ts app/officials/page.test.tsx app/components/MetaHead.test.tsx app/lib/page-meta.test.ts app/lib/sitemap.test.ts app/lib/redirect-rules.test.ts
Test Files  6 passed (6)
Tests       74 passed (74)

npm run typecheck  -> pass
npm test           -> 40 files / 297 tests pass
npm run build      -> pass
git diff --check   -> pass
```

### Self-review

- 旧データをeffectのcleanup順で消す方式ではなく、描画可能な取得結果をcurrent kindへ制約して根本原因を除いた。
- loading、成功、失敗の各stateにkindが含まれるため、sourceだけが旧種別から残る部分状態は作られない。
- Task 1の生成器、生成テスト、生成済みJSONには変更がなく、deferred Minorも対象外のまま維持した。
