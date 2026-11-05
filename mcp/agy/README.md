# Antigravity プラグイン (o-sumo) / Antigravity Plugin Guide

[日本語](#日本語) | [English](#english)

---

<a id="日本語"></a>
## 日本語

### 概要
Google Antigravity（AGY）用プラグインパッケージです。`https://osada.us/mcp` の大相撲アーカイブと連携し、力士検索、詳細プロフィール、幕内・十両の番付、日別取組結果、場所アーカイブを Antigravity のエージェントから利用できるようにします。

### プラグイン構成
- `plugin.json`: プラグイン定義（メタデータ、推奨プロンプト等）
- `mcp_config.json`: osada.us MCP サーバーへの接続定義
- `skills/sumo/SKILL.md`: 大相撲データ照会用スキル
- `rules/AGENTS.md`: プラグイン有効時に常に適用されるエージェント向け指示
- `assets/logo.svg`: 土俵と相撲ロゴ
- `README.md`: ドキュメント

### インストール方法（ユーザー向け）

#### 方法 1: Antigravity CLI からの直接インストール（推奨）
Antigravity CLI をお使いの場合、GitHub リポジトリから直接インストールできます：
```bash
agy plugin install https://github.com/dai/o-sumo.git#main:mcp/agy/o-sumo
```

#### 方法 2: 配布用 ZIP からの配置
1. [o-sumo-plugin.zip](https://osada.us/agents/o-sumo-plugin.zip) をダウンロードして展開します。
2. 展開された `o-sumo` フォルダをご自身の Antigravity 設定ディレクトリに配置します：
   - **配置先**: `~/.gemini/config/plugins/o-sumo/`
     - Windows: `C:\Users\<ユーザー名>\.gemini\config\plugins\o-sumo\`
     - macOS / Linux: `~/.gemini/config/plugins/o-sumo/`
3. Antigravity を再起動すると自動的に認識されます（または `agy plugin install ./o-sumo` を実行）。
4. 有効化・無効化の切り替えは Customizations 画面の `[o-sumo](customization://o-sumo)` から行えます。

#### 方法 3: ローカルリポジトリからの手動配置
本リポジトリを clone している場合は、`mcp/agy/o-sumo` フォルダを上記配置先ディレクトリへコピーするか、以下を実行します：
```bash
agy plugin install ./mcp/agy/o-sumo
```

---

<a id="english"></a>
## English

### Overview
Antigravity (AGY) plugin package for integrating with the Grand Sumo Archive at `https://osada.us/mcp`. It equips your Antigravity agent with tools to search rikishi, look up career profiles, view official banzuke rankings, inspect daily torikumi results, and explore tournament archives.

### Bundle Components
- `plugin.json`: Manifest metadata and starter prompts.
- `mcp_config.json`: MCP server configuration pointing to osada.us.
- `skills/sumo/SKILL.md`: Comprehensive skill guide for tool invocation.
- `rules/AGENTS.md`: Always-on rules for formatted responses.
- `assets/logo.svg`: Dohyo and Sumo branding icon.
- `README.md`: Documentation.

### Installation Instructions

#### Method 1: Direct Install via Antigravity CLI (Recommended)
Install directly from the GitHub repository using the Antigravity CLI:
```bash
agy plugin install https://github.com/dai/o-sumo.git#main:mcp/agy/o-sumo
```

#### Method 2: Install via Distribution ZIP
1. Download [o-sumo-plugin.zip](https://osada.us/agents/o-sumo-plugin.zip) and extract it.
2. Place the extracted `o-sumo` folder into your Antigravity configuration directory:
   - **Target Path**: `~/.gemini/config/plugins/o-sumo/`
     - Windows: `C:\Users\<Username>\.gemini\config\plugins\o-sumo\`
     - macOS / Linux: `~/.gemini/config/plugins/o-sumo/`
3. Restart Antigravity (or run `agy plugin install ./o-sumo`).
4. Manage and toggle the plugin on the Customizations page at `[o-sumo](customization://o-sumo)`.

#### Method 3: Manual Installation from Local Repository
If you cloned this repository, copy `mcp/agy/o-sumo` into your plugins directory or run:
```bash
agy plugin install ./mcp/agy/o-sumo
```
