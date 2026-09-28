# `scripts/ci/`

CI から呼び出される共通ヘルパースクリプト群。

## ファイル

### `run_torikumi_generator.sh`
`scripts/update_sumo_data.py` を CI から呼び出す際のランナー。引数はそのまま `update_sumo_data.py` に転送し、最大2回まで10秒間隔でリトライする。

```bash
bash scripts/ci/run_torikumi_generator.sh --torikumi-only --torikumi-scope result --skip-rikishi-fetch --strict-torikumi-fetch
```

### `validate_torikumi.py`
`public/api/v1/torikumi.json` の構造とタイムスタンプを検証する。終了コード 0 が成功、1 が失敗。

```bash
python scripts/ci/validate_torikumi.py
```

### `validate_news.py`
`public/api/v1/news.json` の構造と各ソースの状態を検証する。

```bash
python scripts/ci/validate_news.py
```

### `notify_discord.sh`
Discord Webhook に通知を POST する。`DISCORD_WEBHOOK_URL` が未設定なら no-op。

```bash
bash scripts/ci/notify_discord.sh failure "Workflow failed" "Run URL: ..."
```

ワークフローからは `if: failure()` で呼び出す。未設定でも wf は落ちない。

## オフシーズン運用および十一月場所（11月場所）再開手順

- 2026年9月場所（秋場所）千秋楽（9月27日）終了および翌日確認に伴い、`daily-data-update.yml` と `realtime-torikumi-direct-update.yml` の `schedule` は削除され、オフシーズン中は `workflow_dispatch`（手動実行）のみの運用となります。
- これによりオフシーズン中の無駄な定期自動実行を抑止し、GitHub Actions の実行リソースを節約します。
- `news-feed-update.yml` はオフシーズン中も引き続き定期実行（2時間おき）を継続します。

### 十一月場所（2026年11月場所）での再開手順

十一月場所（2026年11月8日初日、取組公開11月6日頃予定）に向け、取組自動更新を再開する際は以下の設定を追加した PR を作成して `main` へマージします。

1. **`daily-data-update.yml`**:
   `on:` に以下を追加：
   ```yaml
   on:
     schedule:
       - cron: '0 4,6,8,10 * * *'
     workflow_dispatch:
   ```
2. **`realtime-torikumi-direct-update.yml`**:
   `on:` に以下を追加：
   ```yaml
   on:
     schedule:
       - cron: '*/3 6-9 * * *'
     workflow_dispatch:
   ```
3. `python -m unittest scripts.ci.workflow_config_test` を実行し、JST スロット検証がパスすることを確認。
4. PR を作成してマージ。マージ完了後、GitHub Actions にてスケジュール実行が有効になります。

