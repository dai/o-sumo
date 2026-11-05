# o-sumo MCP / Grand Sumo data

[日本語](#日本語) · [English](#english)

## 日本語

番付・取組・力士データを調べるには、リモートMCP対応クライアントに `https://osada.us/mcp` を登録します。接続方式はStreamable HTTPです。読み取り専用で、o-sumoへのログインやAPIキーは不要です。接続したら「o-sumoで大の里のプロフィールと生涯成績を調べて」と聞いてみてください。

| クライアント | 導入方法 |
| --- | --- |
| Google Antigravity | [配布ZIPからプラグインを導入](./agy/README.md#日本語) |
| Claude | [カスタムコネクターとして登録](./claude/README.md#日本語) |
| ChatGPT | [カスタムMCPサーバーを登録できる条件と手順](./chatgpt/README.md#日本語) |
| Grok | [カスタムコネクターとして登録](./grok/README.md#日本語) |
| Meta Muse | [開発・提出用の設定例](./muse/README.md#日本語) |

[質問例とAI Searchの使い分け](https://osada.us/agents/) · [プライバシーポリシー](https://osada.us/privacy/) · [技術仕様](../docs/agent-ready.md#mcp-servers)

## English

To look up banzuke, bouts, and rikishi, add `https://osada.us/mcp` to a client that supports remote MCP over Streamable HTTP. The server is read-only and requires no o-sumo sign-in or API key. Once connected, try asking “Use o-sumo to look up Onosato (大の里) and his career record.”

| Client | Setup |
| --- | --- |
| Google Antigravity | [Install the plugin from the ZIP](./agy/README.md#english) |
| Claude | [Add a custom connector](./claude/README.md#english) |
| ChatGPT | [Check access and add a custom MCP server](./chatgpt/README.md#english) |
| Grok | [Add a custom connector](./grok/README.md#english) |
| Meta Muse | [Developer and submission example](./muse/README.md#english) |

[Example requests and when to use AI Search](https://osada.us/agents/en) · [Privacy policy](https://osada.us/privacy/) · [Technical reference](../docs/agent-ready.md#mcp-servers)
