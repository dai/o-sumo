# Meta Muse (Muse Connectors) 連携ガイド / Meta Muse Integration Guide

[日本語](#日本語) | [English](#english)

---

<a id="日本語"></a>
## 日本語

### 概要
Meta の自律型パーソナル AI エージェント **Meta Muse**（WhatsApp, Instagram, Messenger, 専用アプリで動作）向けに大相撲アーカイブ（`https://osada.us/mcp`）をコネクターとして接続・配布するためのガイドです。

### 連携方式の選択
Muse は外部ツール連携として以下の 2 方式をサポートしています：
1. **Hosted MCP 接続**: `https://osada.us/mcp`（Streamable HTTP）をそのまま登録する最もシンプルな方法。
2. **OpenAPI 接続**: `chatgpt/openapi.yaml` と同様の OpenAPI 3.1 仕様書を指定して登録する方法。

### 登録手順（Muse Developer Platform 経由）

#### 1. 開発者コンソールへアクセス
1. [muse.ai/platform](https://muse.ai/platform) または Meta Developer Portal にアクセスし、アカウントでログインします。
2. 「**Create Connector（コネクターを作成）**」を選択します。

#### 2. コネクターの基本情報
- **Connector Name**: `大相撲アーカイブ (o-sumo)`
- **Category**: `Sports & Reference（スポーツ・レファレンス）`
- **Description**: `大相撲の公式番付、力士プロフィール、星取表、日別取組結果を取得するコネクター。`
- **Icon**: アプリアイコン（推奨サイズ 512x512）

#### 3. 技術仕様の設定
- **Integration Type**: `Model Context Protocol (MCP)` を選択。
- **Endpoint URL**: `https://osada.us/mcp`
- **Transport**: `Streamable HTTP`
- **Authentication**: `None（パブリック・読み取り専用）`
- ※ マニフェストとして [`muse_connector.json`](./muse_connector.json) を直接インポートすることも可能です。

#### 4. 権限設定（Sentinel Guardrails）
- データ取得のみの読み取り専用ツール（Read-only）として登録されるため、ユーザーへの追加決済や機密個人情報アクセスの承認プロンプトなしでシームレスに実行されます。

#### 5. 配布と公開
- **個人・チーム利用**: 開発中の状態のまま、ご自身の Meta アカウントやテストグループの Muse で即座に利用できます。
- **一般消費者向け公開**: ディレクトリ審査に提出することで、世界中の Muse ユーザーがコネクターディレクトリから 1 タップで有効化できるようになります。

---

<a id="english"></a>
## English

### Overview
This guide describes how to connect and distribute the Grand Sumo Archive (`https://osada.us/mcp`) as a connector for **Meta Muse**, Meta's autonomous personal AI agent operating across WhatsApp, Instagram, Messenger, and mobile/desktop platforms.

### Integration Options
Muse supports two integration pathways:
1. **Hosted MCP**: Direct connection using the Streamable HTTP endpoint at `https://osada.us/mcp`.
2. **OpenAPI Spec**: Registration using the OpenAPI 3.1 schema defined in `chatgpt/openapi.yaml`.

### Setup Instructions (via Muse Developer Platform)

#### 1. Access Developer Platform
1. Navigate to [muse.ai/platform](https://muse.ai/platform) or Meta Developer Portal and log in.
2. Click **Create Connector**.

#### 2. Connector Profile
- **Connector Name**: `Grand Sumo Guide (o-sumo)`
- **Category**: `Sports & Reference`
- **Description**: `Official Grand Sumo records, banzuke rankings, rikishi profiles, and bout outcomes.`
- **Icon**: Square PNG/SVG asset (512x512 recommended).

#### 3. Technical Configuration
- **Integration Type**: Select `Model Context Protocol (MCP)`.
- **Endpoint URL**: `https://osada.us/mcp`
- **Transport**: `Streamable HTTP`
- **Authentication**: `None (Public Read-Only)`
- *Tip*: You can directly import [`muse_connector.json`](./muse_connector.json) as the configuration manifest.

#### 4. Security & Permissions (Sentinel Guardrails)
- Because all 5 tools are read-only reference operations, they execute transparently within Muse without requiring intrusive confirmation dialogues or elevated write scopes.

#### 5. Publishing & Distribution
- **Personal / Team Use**: Immediately active for your paired accounts and test groups.
- **Consumer Distribution**: Submit to the Meta Muse Directory for public review. Once approved, millions of users can activate it with a single tap from the connector catalog.
