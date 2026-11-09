# Claude 公式ディレクトリ 申請手順（o-sumo プラグイン）

対象: `mcp/claude-code`（o-sumo プラグイン）
ポータル: https://claude.ai/directory/manage
参照: [Plugin pre-submission checklist](https://claude.com/docs/plugins/pre-submission-checklist) / [Submit a plugin](https://claude.com/docs/plugins/submit) / [Anthropic Software Directory Policy](https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy)

---

## 1. 前提条件

- [ ] 有料の claude.ai プラン（Pro / Max / Ultra、または Team / Enterprise の Owner）
- [ ] `dai/o-sumo` が公開リポジトリで、申請するコミットが `main` に push 済み
- [ ] プラグインの `name` を `o-sumo` で固定済み（公開後の変更は不可）
- [ ] ローカル検証が通っている（§2）

---

## 2. 申請前のローカル検証

```powershell
node scripts/check-claude-plugin.mjs
claude plugin validate ./mcp/claude-code
claude plugin validate .
```

すべて成功すること。

---

## 3. ポータルでの入力値

**Submit new** → **Plugin bundle** を選択し、以下を入力する。

| 項目 | 値 |
| --- | --- |
| Repository | `dai/o-sumo` |
| Plugin path | `mcp/claude-code` |
| Branch / tag | `main`（安定版タグがあればタグでもよい） |

**重要:** リポジトリのルート（マーケットプレイス）ではなく、**プラグインフォルダ `mcp/claude-code` を指定する**。
ディレクトリは「1回の申請につき1プラグイン」なので、複数プラグインをまとめて出さない。

「Validate」を押すと、このページのチェックが一括で走る。**Blocks** がゼロになるまで修正 → push → **Re-validate**。

---

## 4. 申請時点の状態（自己チェック結果）

| チェック | 要件 | 現状 |
| --- | --- | --- |
| プラグインフォルダ | `.claude-plugin/plugin.json` を含む | ✅ `mcp/claude-code` |
| `plugin.json` のパス | フォルダ外を参照しない | ✅ 参照なし（MCP は URL のみ） |
| シンボリックリンク / submodule / LFS | 使わない | ✅ なし |
| システムファイル | `.DS_Store` 等を含めない | ✅ なし |
| フォルダ名 | 英数字・`.`・`_`・`-` のみ | ✅ `mcp`, `claude-code` |
| リポジトリサイズ | GitHub archive 50 MiB 未満 / 展開後 256 MiB 未満 / 10,000 ファイル未満 | ✅ 798ファイル・約26 MiB |
| プラグインフォルダのファイル | 1ファイル 5 MiB 未満 | ✅ 最大 51 KB（アイコン） |
| `name` | 小文字英数字とハイフン、64文字以内 | ✅ `o-sumo` |
| `description` / `author` / `version` | 必須 | ✅ 設定済み |
| `displayName` / `author.name` | 単一の文字体系 | ✅ `o-sumo` / `osada.us`（ラテン文字のみ） |
| README | 40語以上、`README.md` | ✅ 259語（コードブロック除く） |
| ライセンス | `LICENSE` ファイルまたは `license` フィールド | ✅ 両方あり（MIT） |
| `.mcp.json` | 有効な JSON、`type` が `http`/`sse`/`ws`、URL が `https://` | ✅ `type: "http"` + `https://osada.us/mcp` |
| ランチャー | `npx` / `uvx` 等を使わない | ✅ なし |
| 認証情報 | ハードコードしない | ✅ なし（認証不要） |
| フック / スクリプト | 読めるソースのみ | ✅ なし |

### セキュリティスキャン対策

スキャンは「プラグインが何を実行・送信・取得するか」を見る。o-sumo プラグインの挙動は次の1点だけ。

- `https://osada.us/mcp` への HTTPS リクエスト（MCP の `initialize` / `tools/list` / `tools/call`）
- 認証情報・ローカルファイル・環境変数の送信なし
- フック・ローカル実行ファイル・パッケージインストールなし

README の「Notes」にこの挙動と、手動登録との重複時の扱いを明記済み。

---

## 5. 既知の未整備点

| 項目 | 状態 | 対応 |
| --- | --- | --- |
| `termsOfServiceUrl` | 未設定。`https://osada.us/terms/` は 404 | ポータルが必須とする場合のみ `/terms/` を新設。任意なら現状のまま |
| スクリーンショット | 未用意 | ポータルが要求した場合のみ追加 |
| バージョン | プラグイン 1.0.0 / `mcp/server.json` 1.0.1 / server-card 1.0.0 | プラグインは独自に採番する方針（§6）。レジストリ側の値は別途整理 |

---

## 6. 公開後の更新フロー

1. `mcp/claude-code` 配下を変更する
2. `plugin.json` の `version` を上げる（例: 1.0.0 → 1.0.1）
3. `node scripts/check-claude-plugin.mjs` と `claude plugin validate` を通す
4. `main` に push する
5. ディレクトリが追従しているブランチ／タグの新しいコミットをスキャンし、審査後に公開される

- インストール済みユーザーには新バージョンとして届く
- スキャンで問題が出たバージョンは公開されないため、変更内容と README の記述を一致させておく
- `name` は変更しない。変更すると既存インストールが別プラグイン扱いになる

---

## 7. 公開後にユーザーが使う経路

| サーフェス | 表示 |
| --- | --- |
| claude.ai / Cowork | ディレクトリから追加 |
| Claude Code | アカウント同期で `o-sumo@synced` として読み込まれる |
| 自前マーケットプレイス | `o-sumo@osada`（`claude plugin marketplace add dai/o-sumo`） |

公式ディレクトリと自前マーケットプレイスは併用できる。Claude Code では同期版と自前版が同じプラグイン名になるため、
両方入れないよう README で案内する（現状は自前版のみ記載。申請後に追記する）。
