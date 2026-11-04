# Claude Desktop 連携ガイド / Claude Desktop Integration Guide

[日本語](#日本語) | [English](#english)

---

<a id="日本語"></a>
## 日本語

### 概要
Anthropic の **Claude Desktop** アプリから、`https://osada.us/mcp` の大相撲アーカイブ（力士検索、プロフィール、番付、取組結果等）を直接呼び出すための設定ガイドです。

### 前提条件
- Claude Desktop アプリがインストールされていること（Pro / Team / Enterprise 推奨）

### 設定手順

#### 1. 設定ファイルを開く
OS に応じて以下のパスにある `claude_desktop_config.json` を開きます（ファイルが存在しない場合は新規作成してください）。

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`（例: `C:\Users\<ユーザー名>\AppData\Roaming\Claude\claude_desktop_config.json`）

#### 2. 設定の追記
同階層にある `claude_desktop_config.json` の内容をコピーし、既存の設定にマージします。

```json
{
  "mcpServers": {
    "o-sumo": {
      "url": "https://osada.us/mcp"
    }
  }
}
```

> **注意**: 旧バージョンの Claude Desktop 等で Streamable HTTP URL 直接指定に未対応の場合は、以下のように `mcp-remote` ブリッジ経由で接続できます。
> ```json
> {
>   "mcpServers": {
>     "o-sumo": {
>       "command": "npx",
>       "args": ["-y", "mcp-remote", "https://osada.us/mcp"]
>     }
>   }
> }
> ```

#### 3. Claude Desktop を再起動
設定を保存したら、Claude Desktop を完全に終了して再起動します。チャット入力欄の下にハンマーアイコンが表示され、`search_rikishi` や `get_banzuke` などのツールが利用可能になります。

---

<a id="english"></a>
## English

### Overview
This guide explains how to connect Anthropic's **Claude Desktop** application directly to the Grand Sumo Archive MCP server at `https://osada.us/mcp` to look up rikishi, banzuke rankings, torikumi results, and basho archives.

### Prerequisites
- Claude Desktop application installed (Pro, Team, or Enterprise plan recommended).

### Setup Instructions

#### 1. Open the Configuration File
Open `claude_desktop_config.json` located at the following path depending on your operating system (create it if it does not already exist):

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json` (e.g. `C:\Users\<Username>\AppData\Roaming\Claude\claude_desktop_config.json`)

#### 2. Add Configuration
Copy the configuration from `claude_desktop_config.json` in this folder and merge it into your file:

```json
{
  "mcpServers": {
    "o-sumo": {
      "url": "https://osada.us/mcp"
    }
  }
}
```

> **Note**: If your Claude Desktop version does not yet support direct Streamable HTTP URLs, connect using the `mcp-remote` bridge:
> ```json
> {
>   "mcpServers": {
>     "o-sumo": {
>       "command": "npx",
>       "args": ["-y", "mcp-remote", "https://osada.us/mcp"]
>     }
>   }
> }
> ```

#### 3. Restart Claude Desktop
Save the file, completely quit Claude Desktop, and relaunch it. The hammer icon will appear beneath the chat input, indicating that tools such as `search_rikishi` and `get_banzuke` are active and ready.
