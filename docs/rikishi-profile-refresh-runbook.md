# 力士プロフィール 場所ごと更新 Runbook

場所ごと（番付更新タイミング）に、静的 API と自前プロフィール画面で使う力士プロフィール JSON と通算合い口 JSON を更新する手順です。

## 手順

1. `main` を最新化します。

```bash
git pull --ff-only origin main
```

2. 力士プロフィールと合い口を全件再生成します。

```bash
python scripts/update_sumo_data.py --rikishi-only
```

`--rikishi-only` は現行の幕内・十両一覧を全件取得し、プロフィール履歴の改名前後の四股名を公式力士IDへ解決します。双方のプロフィールに記録された勝敗が一致した場合だけ `rikishi-matchups.json` を置き換えます。全件処理中の取得漏れ、未解決名、重複・相互不一致などは失敗として扱い、既存の正常な合い口JSONを保持します。`--profile-limit` による意図した部分取得では失敗させず、合い口JSONだけを更新しません。

3. 生成結果を確認します。

```bash
git diff -- public/api/v1/rikishi.json public/api/v1/rikishi public/api/v1/rikishi-matchups.json
```

4. 代表 ID の個別 JSON に以下が入っていることを確認します。

- `name`
- `yomi`
- `currentRank`
- `birthDate`
- `height`
- `weight`
- `shusshin`
- `debut`
- `sourceUrl`
- `updatedAt`

あわせて `photoUrl` が `/images/rikishi/{id}.png` を指していることを確認します。

5. 合い口JSONの契約を確認します。

```powershell
$matchupData = Get-Content -Raw public/api/v1/rikishi-matchups.json | ConvertFrom-Json
$keys = $matchupData.matchups | ForEach-Object { "$($_.rikishi1Id)-$($_.rikishi2Id)" }
if (-not $matchupData.updatedAt -or $keys.Count -ne ($keys | Sort-Object -Unique).Count) { throw 'matchup metadata or pair uniqueness is invalid' }
$invalid = $matchupData.matchups | Where-Object {
  $_.rikishi1Id -ge $_.rikishi2Id -or
  -not ($_.rikishi1Wins -is [int] -or $_.rikishi1Wins -is [long]) -or $_.rikishi1Wins -lt 0 -or
  -not ($_.rikishi2Wins -is [int] -or $_.rikishi2Wins -is [long]) -or $_.rikishi2Wins -lt 0
}
if ($invalid) { throw 'matchup pair ordering or wins are invalid' }
$representative = $matchupData.matchups | Where-Object { $_.rikishi1Id -eq 4230 -and $_.rikishi2Id -eq 4279 }
if ($representative.rikishi1Wins -ne 1 -or $representative.rikishi2Wins -ne 5) { throw 'representative official matchup changed; inspect the source before publishing' }
```

代表値は固定仕様ではなく、生成時点の公式プロフィール履歴を点検するための目印です。公式履歴が更新されて値が変わった場合は、双方のプロフィール原文とパーサーテストを確認してから文書例を更新します。

6. 生成器とアプリの検証を実行します。

```bash
python scripts/update_sumo_data_parser_test.py
python scripts/update_sumo_data_torikumi_logic_test.py
npm run typecheck
npm test
npm run build
```

7. ローカルプレビューで代表ページとAPIを確認します。

```bash
npm run preview -- --host 127.0.0.1
```

確認先:

- `http://127.0.0.1:4173/rikishi`
- `http://127.0.0.1:4173/rikishi/3842`
- `http://127.0.0.1:4173/compare/?ids=4230,4279`
- `http://127.0.0.1:4173/api/v1/rikishi-matchups.json`
- `http://127.0.0.1:4173/202607-banzuke/`
- `http://127.0.0.1:4173/20260712-yotei`

確認ポイント:

- `/rikishi/3842` の出典欄に、日本相撲協会と MiniMax I2I Generation の両方が表示される
- `/compare/?ids=4230,4279` に7項目が表示され、合い口が列順に `1-5` / `5-1` となる
- `/202607-banzuke/` で `public/images/rikishi/{id}.png` の画像が表示される

## 注意

- `--profile-limit` は取得テスト用です。公開用更新では使いません。
- `--profile-limit` を使った部分取得では `rikishi-matchups.json` を更新しません。
- 個別 JSON のフィールド追加は API v1 の後方互換変更として扱います。既存フィールドは削除・リネームしません。
- 協会プロフィールへの外部リンクは `sourceUrl` として保持し、画面上にも明示して残します。
- 元写真を追加・差し替えた場合は `MINIMAX_API_KEY` を設定して `python scripts/style_transfer_rikishi.py` を実行し、`public/images/rikishi/*.png` を更新します。
