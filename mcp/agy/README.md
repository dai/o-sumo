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

#### 方法 1: ローカルプラグインとしての配置
この `o-sumo` フォルダを、ご自身の Antigravity 設定ディレクトリにコピーします。
- **配置先**: `~/.gemini/config/plugins/o-sumo/`
  - Windows: `C:\Users\<ユーザー名>\.gemini\config\plugins\o-sumo\`
  - macOS / Linux: `~/.gemini/config/plugins/o-sumo/`
- 配置後、Antigravity を再起動すると自動的に認識されます。
- 有効化・無効化の切り替えは Customizations 画面の `[o-sumo](customization://o-sumo)` から行えます。

#### 方法 2: Agent Marketplace からの追加（公開後）
Marketplace に公開された場合、以下のカードから 1 クリックでインストールできます：
```markdown
<plugin-card catalog-id="o-sumo"></plugin-card>
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

#### Method 1: Local Plugin Directory
Copy this `o-sumo` directory into your Antigravity config directory:
- **Target Path**: `~/.gemini/config/plugins/o-sumo/`
  - Windows: `C:\Users\<Username>\.gemini\config\plugins\o-sumo\`
  - macOS / Linux: `~/.gemini/config/plugins/o-sumo/`
- Restart Antigravity after placing the files.
- Manage and toggle the plugin on the Customizations page at `[o-sumo](customization://o-sumo)`.

#### Method 2: Agent Marketplace (Once Published)
Once published to the catalog, users can install it with a single click using the plugin card:
```markdown
<plugin-card catalog-id="o-sumo"></plugin-card>
```
