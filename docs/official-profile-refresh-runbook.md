# 行司・呼出 公式プロフィール更新 Runbook

日本相撲協会の公式一覧と個別プロフィールから、行司・呼出の静的 API と名鑑画面用データを更新する手順です。

## 更新方針

- 公開IDは、協会の `/Profile/{kind}/{id}/` に含まれる正の数値だけを使います。名前slugや連番の再採番はしません。
- `gyoji` と `yobidashi` はそれぞれ一覧 JSON と、同じ数値IDの個別 JSON を持ちます。
- 公式ページ上の画像は取得・保存・配信しません。生成JSONに `photo` または `image` を含むフィールドを追加しません。
- `retrievedAt` はサイトが取得したUTC時刻であり、協会がプロフィールを更新した日時ではありません。
- 生成器は全件を検証してから出力を置換します。取得・検証に失敗した場合は、欠けた状態を公開しないで原因を調査します。

## 更新手順

1. 作業ブランチを最新のmainlineへ追随させ、既存差分を確認します。

```bash
git fetch origin
git rebase origin/main
git status --short
```

2. まずfixtureだけで生成器の回帰テストを実行します。このテストはネットワークに接続しません。

```bash
python scripts/update_official_profiles_test.py
```

3. 協会の現在の公式ページから、行司・呼出を再生成します。

```bash
python scripts/update_official_profiles.py --output-root public/api/v1
```

4. 生成差分を確認します。旧い文字列slugの個別JSONが残っていないこと、公式数値IDの追加・削除だけが意図どおりであることを確認します。

```bash
git diff -- public/api/v1/gyoji.json public/api/v1/gyoji public/api/v1/yobidashi.json public/api/v1/yobidashi
```

5. 以下のPowerShell検査で、一覧・個別JSONの件数整合、正の数値ID、写真・画像フィールド不在を確認します。通常の公式スナップショットは行司42名、呼出45名です。人数が変わった場合は協会の一覧と差分を確認してから進めます。

```powershell
$checks = @('gyoji', 'yobidashi') | ForEach-Object {
  $kind = $_
  $index = Get-Content -Raw "public/api/v1/$kind.json" | ConvertFrom-Json
  $indexItems = @($index.officials)
  $ids = @($indexItems | ForEach-Object { $_.id })
  $duplicateIds = @($ids | Group-Object | Where-Object { $_.Count -gt 1 })
  $profiles = @($indexItems | ForEach-Object {
    $expectedId = $_.id
    $profile = Get-Content -Raw -ErrorAction Stop "public/api/v1/$kind/$expectedId.json" | ConvertFrom-Json
    [pscustomobject]@{ ExpectedId = $expectedId; Profile = $profile }
  })
  $detailFiles = @(Get-ChildItem -File "public/api/v1/$kind" -Filter '*.json')
  [pscustomobject]@{
    Kind = $kind
    IndexCount = $indexItems.Count
    DetailCount = $detailFiles.Count
    MatchingCounts = $indexItems.Count -eq $detailFiles.Count
    PositiveSafeIntegerIds = @($indexItems | Where-Object {
      $_.id -is [long] -and $_.id -gt 0 -and $_.id -le 9007199254740991
    }).Count -eq $indexItems.Count
    UniqueIds = $duplicateIds.Count -eq 0
    MatchingKindAndId = @($profiles | Where-Object {
      $_.Profile.kind -ne $kind -or $_.Profile.id -ne $_.ExpectedId
    }).Count -eq 0
    PhotoOrImageFields = @($profiles | ForEach-Object { $_.Profile.PSObject.Properties.Name } | Where-Object { $_ -match '(?i)(photo|image)' }).Count
  }
}
$checks | Format-Table -AutoSize
$failed = @($checks | Where-Object {
  -not $_.MatchingCounts -or
  -not $_.PositiveSafeIntegerIds -or
  -not $_.UniqueIds -or
  -not $_.MatchingKindAndId -or
  $_.PhotoOrImageFields -ne 0
})
if ($failed.Count -gt 0) {
  throw "Official profile integrity check failed: $($failed.Kind -join ', ')"
}
```

6. 協会プロフィールの代表値と出典URLを確認します。例えば行司ID `1986` は、木村 庄之助、`birthDate: 1961-10-30`、`adoptedAt: 1977-10` です。

```powershell
Get-Content -Raw public/api/v1/gyoji/1986.json | ConvertFrom-Json |
  Select-Object id, name, birthDate, adoptedAt, sourceUrl
```

## アプリとsitemapの検証

1. focused test、型検査、全テスト、ビルドを順に実行します。

```bash
npm test -- --run app/lib/official-profile.test.ts app/officials/page.test.tsx app/components/MetaHead.test.tsx app/lib/page-meta.test.ts app/lib/sitemap.test.ts app/lib/redirect-rules.test.ts
npm run typecheck
npm test
npm run build
```

2. build後のsitemapに両一覧と、index全件に対応する87件の詳細URLがあることを確認します。

```powershell
$gyoji = Get-Content -Raw public/api/v1/gyoji.json | ConvertFrom-Json
$yobidashi = Get-Content -Raw public/api/v1/yobidashi.json | ConvertFrom-Json
$sitemap = Get-Content -Raw dist/sitemap.xml
$expected = @($gyoji.officials | ForEach-Object { "https://osada.us/gyoji/$($_.id)/" }) +
  @($yobidashi.officials | ForEach-Object { "https://osada.us/yobidashi/$($_.id)/" })
[pscustomobject]@{
  GyojiDetails = @($gyoji.officials | Where-Object { $sitemap.Contains("https://osada.us/gyoji/$($_.id)/") }).Count
  YobidashiDetails = @($yobidashi.officials | Where-Object { $sitemap.Contains("https://osada.us/yobidashi/$($_.id)/") }).Count
  AllDetailUrlsPresent = @($expected | Where-Object { -not $sitemap.Contains($_) }).Count -eq 0
  HasGyojiList = $sitemap.Contains('https://osada.us/gyoji/')
  HasYobidashiList = $sitemap.Contains('https://osada.us/yobidashi/')
} | Format-List
```

3. Cloudflare Pagesの静的配信を起動し、別端末でHTTPを実測します。終了時は起動したプロセスを停止します。

```bash
npx wrangler pages dev dist --ip 127.0.0.1 --port 8788
```

```bash
curl -sS -o /dev/null --max-redirs 0 -w '%{http_code} %{content_type} %{redirect_url}\n' http://127.0.0.1:8788/gyoji/
curl -sS -o /dev/null --max-redirs 0 -w '%{http_code} %{content_type} %{redirect_url}\n' http://127.0.0.1:8788/gyoji
curl -sS -o /dev/null --max-redirs 0 -w '%{http_code} %{content_type} %{redirect_url}\n' http://127.0.0.1:8788/gyoji/1986/
curl -sS -o /dev/null --max-redirs 0 -w '%{http_code} %{content_type} %{redirect_url}\n' http://127.0.0.1:8788/gyoji/1986
curl -sS -o /dev/null --max-redirs 0 -w '%{http_code} %{content_type} %{redirect_url}\n' http://127.0.0.1:8788/yobidashi/
curl -sS -o /dev/null --max-redirs 0 -w '%{http_code} %{content_type} %{redirect_url}\n' http://127.0.0.1:8788/yobidashi
curl -sS -o /dev/null --max-redirs 0 -w '%{http_code} %{content_type} %{redirect_url}\n' http://127.0.0.1:8788/yobidashi/1935/
curl -sS -o /dev/null --max-redirs 0 -w '%{http_code} %{content_type} %{redirect_url}\n' http://127.0.0.1:8788/yobidashi/1935
curl -sS -o /dev/null --max-redirs 0 -w '%{http_code} %{content_type}\n' http://127.0.0.1:8788/api/v1/gyoji.json
curl -sS -o /dev/null --max-redirs 0 -w '%{http_code} %{content_type}\n' http://127.0.0.1:8788/api/v1/gyoji/1986.json
curl -sS -o /dev/null --max-redirs 0 -w '%{http_code} %{content_type}\n' http://127.0.0.1:8788/api/v1/yobidashi.json
curl -sS -o /dev/null --max-redirs 0 -w '%{http_code} %{content_type}\n' http://127.0.0.1:8788/api/v1/yobidashi/1935.json
```

期待値は一覧・詳細の末尾スラッシュ付きURLが`200 text/html`、末尾スラッシュなしが対応する末尾スラッシュ付きURLへの`301`、4つのJSON APIが`200 application/json`です。ブラウザでも一覧と代表詳細を確認し、公式出典、取得日時、写真不使用表示、数値ID URLが表示されることを確認します。

4. コミット前に、不要な整形差分がないことを確認します。

```bash
git diff --check
git status --short
```

## 異常時の扱い

- 人数、公式階級、必須項目、一覧と詳細の一致に異常がある場合は、JSONを手で補正しません。協会ページと生成器のパース前提を調査します。
- `id`、`kind`、個別JSONの欠落によりbuildが失敗した場合は、生成結果を公開しません。indexと個別JSONを同じ生成実行で揃えます。
- 写真または画像のフィールド、画像ファイル、画像クレジットをこの名鑑へ追加しません。仕様変更が必要な場合は、データ契約・画面・テストを別タスクで見直します。
