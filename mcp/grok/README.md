# xAI Grok (Connectors / Grok Bot) 連携ガイド / Grok Integration Guide

[日本語](#日本語) | [English](#english)

---

<a id="日本語"></a>
## 日本語

### 概要
xAI の **Grok**（grok.com Web アプリの Grok Connectors / Bring Your Own MCP 機能、および xAI API / Grok Bot）に大相撲アーカイブ（`https://osada.us/mcp`）を接続するためのガイドです。
`osada.us/mcp` は Streamable HTTP MCP トランスポートに対応しているため、パブリック URL を指定するだけで直接連携できます。

### 利用方法 1: Grok Web アプリ（Grok Connectors）での追加手順
1. ブラウザで [grok.com](https://grok.com) または `grok.com/connectors` にアクセスします。
2. 「**Add Connector（コネクターを追加）**」または「**Custom MCP**」を選択します。
3. 以下の接続情報を入力します：
   - **Name**: `o-sumo`
   - **Server URL**: `https://osada.us/mcp`
   - **Transport**: `Streamable HTTP`（または `HTTP / SSE`）
   - **Authentication**: `None`（認証不要）
4. 保存すると、Grok が自動的にツール一覧（`search_rikishi`, `get_banzuke` 等）を取得します。
5. チャット画面で「大相撲の最新番付を教えて」などと質問すると、Grok がコネクターを自動実行して回答します。

### 利用方法 2: xAI API / Grok Bot 開発者向け連携
xAI の API やカスタム Bot から呼び出す場合は、リクエストの `tools` パラメータに以下のように Remote MCP サーバーを指定します：

```python
import os
from openai import OpenAI  # xAI SDK または OpenAI 互換クライアント

client = OpenAI(
    api_key=os.environ.get("XAI_API_KEY"),
    base_url="https://api.x.ai/v1"
)

response = client.chat.completions.create(
    model="grok-beta",
    messages=[
        {"role": "user", "content": "大の里の最近の成績とプロフィールを教えて"}
    ],
    tools=[
        {
            "type": "mcp",
            "mcp": {
                "server_url": "https://osada.us/mcp",
                "server_label": "o-sumo"
            }
        }
    ]
)

print(response.choices[0].message.content)
```

---

<a id="english"></a>
## English

### Overview
This guide explains how to connect xAI's **Grok** (via Grok Connectors / "Bring Your Own MCP" on grok.com, or through the xAI API / Grok Bot) to the Grand Sumo Archive at `https://osada.us/mcp`.
Because `osada.us/mcp` operates over the standard Streamable HTTP MCP transport, you can integrate directly using the public endpoint URL without local proxy servers.

### Method 1: Grok Web App (Grok Connectors) Setup
1. Open your browser and navigate to [grok.com](https://grok.com) or `grok.com/connectors`.
2. Select **Add Connector** or **Custom MCP**.
3. Fill in the following connection details:
   - **Name**: `o-sumo`
   - **Server URL**: `https://osada.us/mcp`
   - **Transport**: `Streamable HTTP` (or `HTTP / SSE`)
   - **Authentication**: `None` (Public read-only)
4. Save the configuration. Grok will query the endpoint and discover available tools (`search_rikishi`, `get_banzuke`, etc.).
5. Ask Grok questions such as "Show me the latest Grand Sumo banzuke rankings", and it will invoke the connector automatically.

### Method 2: xAI API & Grok Bot Developer Integration
When integrating via the xAI API or building a custom Grok bot, pass the Remote MCP server in the `tools` array:

```python
import os
from openai import OpenAI  # xAI SDK or OpenAI-compatible client

client = OpenAI(
    api_key=os.environ.get("XAI_API_KEY"),
    base_url="https://api.x.ai/v1"
)

response = client.chat.completions.create(
    model="grok-beta",
    messages=[
        {"role": "user", "content": "Tell me about Onosato's profile and record"}
    ],
    tools=[
        {
            "type": "mcp",
            "mcp": {
                "server_url": "https://osada.us/mcp",
                "server_label": "o-sumo"
            }
        }
    ]
)

print(response.choices[0].message.content)
```
