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

### `torikumi_paths.txt`
realtime 系の更新で生成・コミット対象とするファイル一覧。`git add` / GitHub Actions の `add-paths` などから `xargs` 経由で読み込む想定。

## 九月場所 workflow 運用

- Daily は JST 13/15/17/19時に予定を生成し、PR と auto-merge request を作る。Realtime は JST 13:00-18:50 の10分間隔で結果を検証し `main` へ直接 push する。共通 concurrency は pending run を置換し得るが、反映 SLA や未 merge PR との排他は提供しない。
- `workflow_summary.py` は生成直後の day/date、部門件数、timestamp を表示する snapshot であり、merge/deploy 証明ではない。失敗時 stderr は旧 JSON の生成成功として表示しない。
- `push_realtime_update.sh` は最大3回の非 force push。通常 rebase の競合は abort して remote を保持し、新規手動実行を要求する。非競合 rebase 後は payload を再検証する。
- 9月12日公式公開後は `gh workflow run daily-data-update.yml -R dai/o-sumo --ref main` を実行し、run、PR checks/merge、`main` JSON、本番 JSON を確認する。両部門空は no-op。9月27日最終結果と翌日確認後、cron は別 PR で削除する。
- `preflight:current-data` は workflow 停止が前提の場所切替専用 gate。場所中 readiness には使わない。不戦は validator の限定例外で、部分取得失敗は既存データを保持する。
