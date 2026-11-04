# 大相撲アーカイブ MCP連携キット / Grand Sumo Archive MCP Integration Kit

> **Repository**: [github.com/dai/o-sumo/mcp](https://github.com/dai/o-sumo/tree/main/mcp)  
> **Server Endpoint**: `https://osada.us/mcp` (Streamable HTTP)

[日本語](#日本語) | [English](#english)

---

<a id="日本語"></a>
## 日本語

### 概要
本リポジトリは、[osada.us](https://osada.us) が公開している大相撲アーカイブ（Grand Sumo）の MCP サーバー（`https://osada.us/mcp`）を、各種 AI エージェントやチャットアシスタント（**Google Antigravity**, **Anthropic Claude**, **OpenAI ChatGPT**, **xAI Grok**, **Meta Muse**）で一般消費者が簡単に利用できるようにするための配布パッケージ集です。

認証（API キー）不要・読み取り専用（Public Read-Only）で提供されているため、どなたでも手軽に連携できます。

### 対応プラットフォーム一覧

| プラットフォーム | 接続方式 | 配布形式 | ガイドリンク |
| :--- | :--- | :--- | :--- |
| **Google Antigravity (AGY)** | Native Plugin (Streamable HTTP) | プラグインパッケージ / Marketplace Card | [AGY ガイド](./agy/README.md) |
| **Anthropic Claude** | MCP (Claude Desktop) | `claude_desktop_config.json` スニペット | [Claude ガイド](./claude/README.md) |
| **OpenAI ChatGPT** | Custom GPT / Actions | `openapi.yaml` / GPT Store 共有リンク | [ChatGPT ガイド](./chatgpt/README.md) |
| **xAI Grok** | Grok Connectors / Remote MCP | `grok.com/connectors` 登録定義 / API | [Grok ガイド](./grok/README.md) |
| **Meta Muse** | Muse Connectors (Hosted MCP) | `muse_connector.json` / Directory 登録 | [Meta Muse ガイド](./muse/README.md) |

### 提供される 5 つのツール機能

1. **`search_rikishi`**
   - 四股名（漢字）または読み仮名（ひらがな）から力士を検索し、力士 ID・現在の番付などを返します。
   - 例: `{"query": "大の里"}`
2. **`get_rikishi_profile`**
   - 力士 ID（数値）を指定して、生年月日・年齢・身長・体重・出身地・初土俵・生涯通算成績（勝・敗・分）を取得します。
   - 例: `{"id": 4227}`
3. **`get_banzuke`**
   - 幕内および十両の公式番付データと各力士の日別星取（白星・黒星・休場）を取得します。
   - 例: 指定なし（最新場所）または `{"monthKey": "202609"}`（2026年9月場所）
4. **`get_torikumi`**
   - 指定した日付（YYYYMMDD 形式）の取組結果、または予定対戦カードを取得します。
   - 例: `{"pathDate": "20260927", "mode": "result"}`
5. **`list_basho`**
   - 現在の開催場所およびアーカイブされている過去の場所一覧とメタデータを取得します。

### ディレクトリ構成

```text
mcp/
├── README.md                      # 本ドキュメント（総合案内）
├── agy/                           # Google Antigravity 用プラグイン一式
│   ├── o-sumo/                    # プラグイン本体 (plugin.json, skills, rules, logo.svg)
│   └── README.md                  # AGY 向け導入手順
├── claude/                        # Anthropic Claude Desktop 用
│   ├── claude_desktop_config.json # 設定追加用 JSON
│   └── README.md                  # デスクトップ版設定手順
├── chatgpt/                       # OpenAI ChatGPT (Custom GPT) 用
│   ├── openapi.yaml               # Actions 用 OpenAPI 3.1 仕様書
│   ├── gpt_instructions.md        # GPT 向けシステムプロンプト
│   └── README.md                  # GPT Store 公開手順
├── grok/                          # xAI Grok (Connectors) 用
│   ├── connector_config.json      # コネクター設定定義
│   └── README.md                  # grok.com 登録手順
└── muse/                          # Meta Muse (Muse Connectors) 用
    ├── muse_connector.json        # Muse 連携マニフェスト
    └── README.md                  # 登録・配布手順
```

### アーキテクチャ

```
                                  ┌───────────────────────────┐
                                  │   https://osada.us/mcp    │
                                  │ (Streamable HTTP Server)  │
                                  └─────────────┬─────────────┘
                                                │
         ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
         │                  │                   │                   │                  │
         ▼                  ▼                   ▼                   ▼                  ▼
┌─────────────────┐ ┌───────────────┐ ┌───────────────────┐ ┌───────────────┐ ┌────────────────┐
│   Antigravity   │ │Claude Desktop │ │  ChatGPT Actions  │ │   xAI Grok    │ │   Meta Muse    │
│ (Native Plugin) │ │(Local Config) │ │ (OpenAPI Schema)  │ │ (Connectors)  │ │  (Connectors)  │
└─────────────────┘ └───────────────┘ └───────────────────┘ └───────────────┘ └────────────────┘
```

---

<a id="english"></a>
## English

### Overview
This repository contains the multi-agent distribution kit for the Grand Sumo Archive MCP server (`https://osada.us/mcp`) hosted by [osada.us](https://osada.us). It allows end-users and consumers to easily integrate Grand Sumo data—including wrestler lookups, banzuke rankings, star results, and daily match bouts—into their preferred AI assistant: **Google Antigravity**, **Anthropic Claude**, **OpenAI ChatGPT**, **xAI Grok**, and **Meta Muse**.

All endpoints are publicly accessible and read-only without requiring API keys.

### Supported Platforms Matrix

| Platform | Protocol | Distribution Format | Setup Guide |
| :--- | :--- | :--- | :--- |
| **Google Antigravity (AGY)** | Native Plugin (Streamable HTTP) | Plugin Bundle / Marketplace Card | [AGY Guide](./agy/README.md) |
| **Anthropic Claude** | MCP (Claude Desktop) | `claude_desktop_config.json` snippet | [Claude Guide](./claude/README.md) |
| **OpenAI ChatGPT** | Custom GPT / Actions | `openapi.yaml` / GPT Store shared link | [ChatGPT Guide](./chatgpt/README.md) |
| **xAI Grok** | Grok Connectors / Remote MCP | `grok.com/connectors` profile / API | [Grok Guide](./grok/README.md) |
| **Meta Muse** | Muse Connectors (Hosted MCP) | `muse_connector.json` / Directory entry | [Meta Muse Guide](./muse/README.md) |

### 5 Available Tools

1. **`search_rikishi`**
   - Search rikishi by kanji name (shikona) or hiragana reading (yomi). Returns numeric IDs, current ranks, and profile links.
   - Example: `{"query": "大の里"}`
2. **`get_rikishi_profile`**
   - Retrieves full personal information and lifetime career records (wins, losses, draws, height, weight, birth date, birthplace, debut) by numeric ID.
   - Example: `{"id": 4227}`
3. **`get_banzuke`**
   - Retrieves official Makuuchi and Juryo division rankings and day-by-day star records for each wrestler.
   - Example: Omitted (latest tournament) or `{"monthKey": "202609"}` (September 2026 basho).
4. **`get_torikumi`**
   - Retrieves match results or scheduled bouts for a specific date in `YYYYMMDD` format.
   - Example: `{"pathDate": "20260927", "mode": "result"}`
5. **`list_basho`**
   - Lists active and archived Grand Sumo tournaments available in the database.

### Directory Structure

```text
mcp/
├── README.md                      # Main repository index & quickstart
├── agy/                           # Google Antigravity plugin package
│   ├── o-sumo/                    # Plugin directory (plugin.json, skills, rules, logo.svg)
│   └── README.md                  # AGY setup guide
├── claude/                        # Anthropic Claude Desktop
│   ├── claude_desktop_config.json # Configuration snippet
│   └── README.md                  # Claude Desktop setup guide
├── chatgpt/                       # OpenAI ChatGPT (Custom GPT)
│   ├── openapi.yaml               # OpenAPI 3.1 specification for Actions
│   ├── gpt_instructions.md        # System instructions prompt
│   └── README.md                  # GPT Store publishing walkthrough
├── grok/                          # xAI Grok (Connectors)
│   ├── connector_config.json      # Connector manifest
│   └── README.md                  # grok.com integration guide
└── muse/                          # Meta Muse (Muse Connectors)
    ├── muse_connector.json        # Connector profile manifest
    └── README.md                  # Registration and publishing guide
```

### Architecture

The public server endpoint at `https://osada.us/mcp` serves as the single source of truth over the Streamable HTTP Model Context Protocol. Each subdirectory provides the native adapter and installation workflow tailored to each respective consumer AI assistant.
