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
