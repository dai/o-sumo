# 大相撲アーカイブ プラグイン (`o-sumo`)

[osada.us/mcp](https://osada.us/mcp) で公開されている大相撲アーカイブ（Grand Sumo）の Streamable HTTP MCP サーバーと連携し、力士の検索やプロフィール照会、番付・星取表、日別取組結果の取得を可能にする Antigravity プラグインです。

## 主な機能

- **力士検索 (`search_rikishi`)**: 四股名（漢字）や読み仮名（ひらがな）から力士を検索。
- **力士詳細・戦績照会 (`get_rikishi_profile`)**: 力士IDから身長・体重・出身地・初土俵・通算戦績などを取得。
- **番付・星取表取得 (`get_banzuke`)**: 幕内および十両の公式番付データと各力士の星取（勝敗・引き分け）を取得。過去の場所（YYYYMM形式）の指定にも対応。
- **日別取組結果・予定 (`get_torikumi`)**: 指定日（YYYYMMDD形式）の対戦結果や予定取組を取得。
- **場所一覧取得 (`list_basho`)**: 現在および過去のアーカイブ場所一覧（年月、名称など）を取得。

## 構成ファイル

- `plugin.json`: プラグイン定義（メタデータ、おすすめプロンプト等）
- `mcp_config.json`: osada.us MCP サーバー（Streamable HTTP）への接続設定
- `skills/sumo/SKILL.md`: 大相撲データ照会用スキル
- `rules/AGENTS.md`: プラグイン有効時に常に適用されるエージェント向け指示
- `README.md`: プラグイン概要ドキュメント

## 接続先 MCP サーバー

- エンドポイント: `https://osada.us/mcp`
- プロトコル: Streamable HTTP
