# o-sumo for Claude Code

[日本語](#日本語) · [English](#english)

## 日本語

大相撲の番付・取組・力士プロフィールを、osada.us の読み取り専用 MCP サーバー（`https://osada.us/mcp`）から調べるための Claude Code プラグインです。認証・API キーは不要です。

### インストール

シェルから:

```bash
claude plugin marketplace add dai/o-sumo
claude plugin install o-sumo@osada
```

Claude Code のセッション内から:

```text
/plugin install o-sumo@osada --marketplace dai/o-sumo
```

インストール後、`/mcp` を開くと `plugin:o-sumo:o-sumo` が見えます。そのまま次のように質問できます。

```text
o-sumoで大の里のプロフィールと生涯成績を調べて
```

### 提供するツール

| ツール | 用途 |
| --- | --- |
| `search_rikishi` | 四股名・読みから力士を検索（最大20件） |
| `get_rikishi_profile` | 力士IDからプロフィールと生涯成績を取得 |
| `get_banzuke` | 最新または指定場所（`YYYYMM`）の番付を取得 |
| `get_torikumi` | 指定日（`YYYYMMDD`）の取組結果または予定を取得 |
| `list_basho` | 現在・過去の場所一覧を取得 |

### 注意

- **手動で `https://osada.us/mcp` を登録済みの場合**: 同じエンドポイントなのでプラグイン側のサーバーは重複としてスキップされます。プラグインのツールを使う場合は `claude mcp remove o-sumo` で手動登録を削除してください。
- プラグインを入れずに使う場合は `claude mcp add --transport http o-sumo https://osada.us/mcp` でも接続できます。
- 検索語とツールの引数は `https://osada.us/mcp` に送信されます。認証情報やローカルファイルは送信しません。

### リンク

- [使い方と質問例](https://osada.us/agents/)
- [プライバシーポリシー](https://osada.us/privacy/)
- [技術仕様](https://github.com/dai/o-sumo/blob/main/docs/agent-ready.md#mcp-servers)
- [他のクライアント向けの設定](https://github.com/dai/o-sumo/blob/main/mcp/README.md)

## English

A Claude Code plugin that connects to the read-only o-sumo MCP server (`https://osada.us/mcp`) for Grand Sumo banzuke, torikumi results, and rikishi profiles. No authentication or API key is required.

### Install

From your shell:

```bash
claude plugin marketplace add dai/o-sumo
claude plugin install o-sumo@osada
```

From inside a Claude Code session:

```text
/plugin install o-sumo@osada --marketplace dai/o-sumo
```

After installing, open `/mcp` to see `plugin:o-sumo:o-sumo`, then ask:

```text
Use o-sumo to look up Onosato (大の里) and his career record.
```

### Tools

| Tool | Purpose |
| --- | --- |
| `search_rikishi` | Search rikishi by shikona or reading (up to 20 results) |
| `get_rikishi_profile` | Get a profile and career record by rikishi ID |
| `get_banzuke` | Get the latest or a historical (`YYYYMM`) banzuke |
| `get_torikumi` | Get results or the schedule for a day (`YYYYMMDD`) |
| `list_basho` | List current and archived basho |

### Notes

- **If you already added `https://osada.us/mcp` manually**: the plugin's server is skipped as a duplicate of the same endpoint. Remove the manual entry with `claude mcp remove o-sumo` to use the plugin's tools.
- To connect without the plugin, run `claude mcp add --transport http o-sumo https://osada.us/mcp`.
- Search terms and tool arguments are sent to `https://osada.us/mcp`. No credentials or local files are sent.

### Links

- [Usage and example requests](https://osada.us/agents/en)
- [Privacy policy](https://osada.us/privacy/)
- [Technical reference](https://github.com/dai/o-sumo/blob/main/docs/agent-ready.md#mcp-servers)
- [Setup for other clients](https://github.com/dai/o-sumo/blob/main/mcp/README.md)
