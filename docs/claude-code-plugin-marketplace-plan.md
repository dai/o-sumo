# Claude Code プラグインマーケットプレイス掲載プラン

対象: `https://osada.us/mcp`（o-sumo MCP サーバー）
参照: [Marketplace reference](https://code.claude.com/docs/en/plugins/marketplace-reference#plugin-entries) / [Create a marketplace](https://code.claude.com/docs/en/plugins/create-marketplace) / [Publish and distribute a plugin](https://code.claude.com/docs/en/plugins/publish)

---

## 1. 前提（調査結果）

| 項目 | 結果 |
| --- | --- |
| MCP エンドポイント | `https://osada.us/mcp`。Streamable HTTP。GET は 405、POST `initialize` は 200 / `text/event-stream` |
| serverInfo | `us.osada/o-sumo` v1.0.0、`title: o-sumo (大相撲アーカイブ)` |
| 認証 | 不要（読み取り専用） |
| ツール（5個） | `search_rikishi` / `get_rikishi_profile` / `get_banzuke` / `get_torikumi` / `list_basho` |
| Claude Code CLI | v2.1.319 がローカルにインストール済み（検証可能） |

**重要な前提:** Claude Code のマーケットプレイスが一覧するのは「MCP の URL」ではなく **プラグイン** です。
そのため `https://osada.us/mcp` を載せるには、MCP サーバーを同梱した**ラッパープラグイン**を作り、それを
`.claude-plugin/marketplace.json` に登録します。

---

## 2. 結論（推奨案）

1. このリポジトリ内にプラグインを追加する: `mcp/claude-code/`
2. リポジトリ直下にマーケットプレイスを追加する: `.claude-plugin/marketplace.json`
3. 配布は GitHub のこのリポジトリから（`claude plugin marketplace add dai/o-sumo`）
4. Anthropic 公式ディレクトリへの申請は第2フェーズ（任意）

### なぜこの形か

- 既存の `mcp/<client>/` 構成（claude / chatgpt / grok / agy / muse）と一貫する
- 追加リポジトリが不要で、MCP の URL や説明文の更新箇所が1か所で済む
- サイト本体と同じリリース単位で更新できる

### 代替案との比較

| 案 | 長所 | 短所 | 判断 |
| --- | --- | --- | --- |
| **A. 本リポジトリのルートに marketplace**（推奨） | 追加リポジトリ不要 / 既存構成と一貫 / 公開済み | clone が約35MB（サイト本体を含む） | まずこれ |
| B. 専用リポジトリ `dai/o-sumo-claude-plugin` | 軽量 / marketplace として独立 | 二重管理 / URL 変更時に2か所更新 | 将来の分離先 |
| C. `marketplace.json` を URL 配信 | clone 不要 / CDN 配信 | 相対パス source が使えず、プラグインは別 source 指定が必要 | 配信最適化したくなったら |

---

## 3. 成果物の構成

```text
o-sumo/
├── .claude-plugin/
│   └── marketplace.json          # 新規: マーケットプレイス定義（ルート）
└── mcp/
    └── claude-code/              # 新規: Claude Code プラグイン
        ├── .claude-plugin/
        │   └── plugin.json
        ├── .mcp.json             # osada.us/mcp を指す
        ├── README.md
        ├── skills/
        │   └── sumo/
        │       └── SKILL.md      # 任意（Phase 4）
        └── assets/
            └── logo-512.png      # 任意（公式ディレクトリ用）
```

> `.claude-plugin/` はリポジトリ直下とプラグイン直下の2か所に出ますが、役割が違います。
> ルート側はマーケットプレイス、`mcp/claude-code/` 側はプラグインのマニフェストです。

---

## 4. 各ファイルのドラフト

### 4.1 `.claude-plugin/marketplace.json`

```json
{
  "name": "osada",
  "description": "osada.us のデータを Claude Code から使うためのプラグイン集",
  "owner": {
    "name": "osada.us",
    "url": "https://osada.us"
  },
  "plugins": [
    {
      "name": "o-sumo",
      "source": "./mcp/claude-code",
      "description": "大相撲の番付・取組・力士プロフィールを osada.us の読み取り専用 MCP サーバーから取得します。",
      "category": "research",
      "tags": ["sumo", "sports", "japan", "mcp"]
    }
  ]
}
```

- `name` はユーザーが `@` の後ろに打つ識別子。**`osada` は予約名に該当しない**ことを確認済み
- マーケットプレイス名はユーザーごとに一意。`o-sumo` ではなく `osada` にして将来の複数プラグインに備える
- `$schema` は任意（ロード時は無視される）。入れる場合は検証済みの URL のみにする

### 4.2 `mcp/claude-code/.claude-plugin/plugin.json`

```json
{
  "name": "o-sumo",
  "displayName": "o-sumo（大相撲アーカイブ）",
  "description": "番付・取組・力士プロフィールを osada.us の読み取り専用 MCP サーバーから検索します。認証・API キーは不要です。",
  "version": "1.0.0",
  "author": {
    "name": "osada.us",
    "url": "https://osada.us"
  },
  "homepage": "https://osada.us",
  "repository": "https://github.com/dai/o-sumo",
  "license": "MIT",
  "keywords": ["sumo", "banzuke", "rikishi", "torikumi", "mcp"]
}
```

- `name` は**公開後は変更しない**（変更すると既存インストールが迷子になる）
- マーケットプレイス entry の `name` と必ず一致させる（不一致だと `Plugin "..." not found` になる）
- `version` の運用は §7

### 4.3 `mcp/claude-code/.mcp.json`

```json
{
  "mcpServers": {
    "o-sumo": {
      "type": "http",
      "url": "https://osada.us/mcp"
    }
  }
}
```

**注意:** `type` は必須です。既存の `mcp/claude/claude_desktop_config.json` は `url` だけですが、
Claude Code は `type` の無いエントリを stdio 扱いにしてスキップします。コピペしないこと。

### 4.4 `mcp/claude-code/README.md`

最低限、次を書く。

- これは何か（o-sumo の番付・取組・力士データ）
- インストール方法（下記 §6）
- 何ができるか（5ツールの要約）
- 認証不要・読み取り専用であること
- データ元とプライバシーポリシーへのリンク

### 4.5 `mcp/claude-code/skills/sumo/SKILL.md`（任意）

MCP ツールの説明が十分に良いので必須ではないが、次の効果がある。

- 質問の言い回し（「先場所の結び」「この力士の通算」）から適切なツールを選びやすくする
- ツールの呼び分け（`search_rikishi` → `get_rikishi_profile` の順）を明示できる
- `description` がトリガーになるため、ユーザーがスキル名を覚える必要はない

推奨スキル名は `sumo`（呼び出しは `/o-sumo:sumo`）。プラグイン名と同名にすると `/o-sumo:o-sumo` になって冗長。

---

## 5. 実装手順

### Phase 0: 決定（確定済み）

- [x] マーケットプレイス名: `osada`
- [x] プラグイン名: `o-sumo`
- [x] 本リポジトリ同梱（案A）
- [x] 自前マーケットプレイスを先に公開し、続けて公式ディレクトリ申請まで進める
- [x] スキルは Phase 4 で追加

### Phase 1: ファイル作成（完了）

- [x] `.claude-plugin/marketplace.json`
- [x] `mcp/claude-code/.claude-plugin/plugin.json`
- [x] `mcp/claude-code/.mcp.json`
- [x] `mcp/claude-code/README.md`
- [x] `mcp/claude-code/LICENSE`
- [x] `mcp/claude-code/assets/logo-512.png`（公式ディレクトリ用）

### Phase 2: ローカル検証（完了）

```powershell
# プラグイン単体
claude plugin validate ./mcp/claude-code

# マーケットプレイス全体（ルートで）
claude plugin validate .

# ローカルのマーケットプレイスとして登録
claude plugin marketplace add ./

# インストール
claude plugin install o-sumo@osada

# 状態確認
claude plugin list
claude plugin details o-sumo
claude mcp list
```

期待結果:

- `validate` が `✔ Validation passed`（警告が出たら潰す）
- `claude plugin list` に `o-sumo@osada` が `✔ enabled`
- `claude mcp list` に `plugin:o-sumo:o-sumo` 相当が出て `✔ Connected`

起動して `/mcp` を開き、5ツールが見えることを確認する。ツールの完全名は
`mcp__plugin_o-sumo_o-sumo__search_rikishi` の形式になる（permission ルールを書くときに使う）。

#### 実施結果（2026-11-09）

- `claude plugin validate ./mcp/claude-code` → `✔ Validation passed`
- `claude plugin validate .` → `✔ Validation passed`
- `claude plugin marketplace add ./` → `osada` を登録
- `claude plugin install o-sumo@osada` → `✔ Successfully installed`（scope: user）
- `claude plugin details o-sumo` → `MCP servers (1) o-sumo`
- `claude mcp list` → `plugin:o-sumo:o-sumo: https://osada.us/mcp (HTTP) - ✔ Connected`
- 生の MCP 呼び出しで `search_rikishi` が `大の里`（ID 4227）を返すことを確認

なお `claude -p` での LLM 経由のツール実行は、この環境の既定モデルの残高不足（402）で実行できなかった。
プラグインの接続とツール公開までは上記で確認済み。

### Phase 3: 公開

- [ ] コミット & push
- [ ] 別ディレクトリ（または別マシン）で GitHub 経由の登録を確認

```powershell
claude plugin marketplace add dai/o-sumo
claude plugin install o-sumo@osada
```

- [x] `mcp/README.md` のクライアント表に「Claude Code」行を追加
- [x] `docs/agent-ready.md` に導線を追加
- [ ] `https://osada.us/agents/` に導線を追加（サイト側のデプロイが必要）

### Phase 4: 品質・リスク対策

- [ ] `skills/sumo/SKILL.md` を追加
- [x] CI に検証を追加（`.github/workflows/plugin-validate.yml`）
- [x] リポジトリ独自チェック `scripts/check-claude-plugin.mjs` / `npm run plugin:check`
- [x] リリース時のバージョン更新ルールを決定（§7）
- [x] README に重複エンドポイント時の注意を記載
- [x] 公式ディレクトリ向けメタデータ（アイコン・各種 URL・ライセンス）を設定

### Phase 5: Anthropic 公式ディレクトリ（申請着手）

- [x] 申請用ドキュメント: `docs/claude-code-plugin-directory-submission.md`
- [x] ローカル事前検証とセルフチェック
- [ ] ポータルで **Validate** → Blocks を解消（ユーザー操作）
- [ ] 申請・審査・公開

---

## 6. ユーザーに案内するコマンド

シェルから:

```bash
claude plugin marketplace add dai/o-sumo
claude plugin install o-sumo@osada
```

セッション内から（v2.1.275 以降）:

```text
/plugin install o-sumo@osada --marketplace dai/o-sumo
```

プラグインを入れたくない人向けの代替（従来どおり）:

```bash
claude mcp add --transport http o-sumo https://osada.us/mcp
```

---

## 7. バージョン運用

現状のバージョンが食い違っている。

| 場所 | 値 |
| --- | --- |
| `mcp/server.json` | 1.0.1 |
| MCP `serverInfo.version` | 1.0.0 |
| `mcp/server-card` の `version` | 1.0.0 |
| `mcp/agy/o-sumo/plugin.json` | 1.0.0 |
| **新プラグイン `mcp/claude-code`** | **1.0.0** |

方針:

1. プラグインは**独立した成果物**として採番する。MCP サーバーと同時に上げる必要はない
2. `plugin.json` の `version` は、プラグイン配下（`.mcp.json`、README、マニフェスト）を変更したときに上げる
3. 初回はサーバーの実行時バージョン（`serverInfo` / server-card）に合わせて `1.0.0`
4. `mcp/server.json` の `1.0.1` はレジストリ側の値。実行時バージョンと揃えるかは別途判断する（本プラグインのブロッカーではない）
5. `version` を省略してコミット SHA に任せる運用もあるが、公式ディレクトリは「リリースごとに version を上げる」前提なので採用しない

---

## 8. Anthropic 公式ディレクトリへの掲載（申請着手）

自前マーケットプレイスとは別枠。`https://claude.ai/directory` に載り、claude.ai / Cowork / Claude Code に届く。

要件（2026-11 時点のドキュメント）:

- 有料の claude.ai プラン（Pro / Max / Ultra、または Team / Enterprise の Owner）
- GitHub リポジトリ上にプラグインがあること
- `claude plugin validate ./mcp/claude-code --strict` が通ること
- `plugin.json` にディレクトリ用フィールドを追加
  - `icon`（プラグイン内の画像パス、512x512 推奨）
  - `documentationUrl`, `supportUrl`, `privacyPolicyUrl`, `termsOfServiceUrl`（すべて `https://`）
- ポータル `https://claude.ai/directory/manage` から申請
- 審査あり。CLI 検証を通ってもポータル側の追加ルールで落ちることがある

補足:

- 公式マーケットプレイス `claude-plugins-official` はポータル経由の申請を受け付けていない（パートナー窓口のみ）
- MCP サーバー単体を「コネクター」として申請する導線もある。プラグインとコネクターの両方に出せるので、
  o-sumo のように「MCP が本体」のサービスはコネクター申請も検討価値が高い
- ディレクトリ掲載プラグインは、インストールすると `<name>@synced` として Claude Code にも同期される

---

## 9. リスクと対策

| リスク | 影響 | 対策 | 状態 |
| --- | --- | --- | --- |
| `.mcp.json` に `type` が無い | サーバーが読み込まれない | `"type": "http"` を明記。`claude mcp list` で Connected を確認 | ✅ 実装・確認済み |
| entry 名と `plugin.json` の `name` 不一致 | インストール時に not found | 両方 `o-sumo` に固定。`npm run plugin:check` で機械的に検出 | ✅ 実装済み |
| 既に手動で `osada.us/mcp` を登録済みのユーザー | プラグイン側が重複扱いでスキップされる | README に削除手順を明記 | ✅ 実装済み |
| マーケットプレイス名の衝突 | 登録できない | `osada` を使用 | ✅ 決定済み |
| 本リポジトリの clone が重い | 初回インストールが遅い | 追跡ファイル 798・約26 MiB で許容範囲。将来は案Bへ移行可能 | ✅ 計測済み |
| バージョン不整合 | 更新が届かない / 混乱 | §7 の採番ルールを決定 | ✅ 決定済み |
| 公式ディレクトリの審査落ち | 掲載できない | 事前チェックを `docs/claude-code-plugin-directory-submission.md` に整理。Blocks を先に解消 | ✅ 準備済み |
| ディレクトリの README/ライセンス要件 | Blocks | README 259語・LICENSE 同梱・`license` フィールド | ✅ 対応済み |
| ディレクトリのファイル制限 | 審査保留 / Blocks | プラグインは6ファイル、最大51 KB | ✅ 対応済み |
| 表示名の文字体系混在 | Blocks | `displayName` を `o-sumo`、`author.name` を `osada.us` に統一 | ✅ 修正済み |
| CI でスキーマ崩れが混入 | インストール不能 | `.github/workflows/plugin-validate.yml` で CLI 検証 | ✅ 追加済み |
| エンドポイント障害 | ツールが使えない | Claude Code は自動再接続。監視は別途 | ⏳ 運用 |
| 公式版と自前版の二重インストール | 混乱 | 申請後に README へ案内を追記 | ⏳ 申請後 |

### 実装した防御

- `scripts/check-claude-plugin.mjs`（`npm run plugin:check`）
  - marketplace 名・owner・entry 名の形式
  - entry 名と `plugin.json` の `name` の一致
  - `source` がリポジトリ内の `./` パスか
  - `.mcp.json` の `type` と `https://` URL
  - README 40語以上、LICENSE または `license`
  - `displayName` / `author.name` の文字体系混在
  - 1ファイル 5 MiB / 256 KiB、512ファイル、システムファイル
- `.github/workflows/plugin-validate.yml`
  - 上記スクリプト + `claude plugin validate`（プラグイン / マーケットプレイス）
  - Claude Code CLI は `2.1.319` に固定

---

## 10. 受け入れ条件

- [x] `claude plugin validate .` がエラーなし
- [x] `claude plugin marketplace add ./` → `claude plugin install o-sumo@osada` が成功
- [x] `claude plugin details o-sumo` に MCP サーバーが表示される
- [x] `claude mcp list` で `plugin:o-sumo:o-sumo` が Connected
- [x] 生の MCP 呼び出しで `search_rikishi` が結果を返す
- [ ] `/mcp` で 5 ツールが見える（対話セッションで最終確認）
- [ ] GitHub 経由（`dai/o-sumo`）でも同じ手順が成功する（push 後）
- [x] `mcp/README.md` と `docs/agent-ready.md` に導線がある
- [x] CI とローカルスクリプトで再検証できる
- [ ] 公式ディレクトリの Validate で Blocks ゼロ（ユーザー操作）

## 11. 決定事項（2026-11-09）

1. マーケットプレイス名: **`osada`**
2. リポジトリ: **本リポジトリに同梱（案A）**
3. スコープ: **自前マーケットプレイス公開 → 公式ディレクトリ申請まで進める**
4. スキル: **Phase 4 で後から追加**（初回リリースは `.mcp.json` のみ）
5. `version` 運用: プラグイン独立採番。初回 `1.0.0`（§7）
