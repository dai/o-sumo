# o-sumo MCP サーバーを公式 MCP レジストリへ公開する ランブック

- 作成: 2026-11-03（チャット側 Muse）
- 決定事項（2026-11-03 Osada）:
  - レジストリ名は **`us.osada/o-sumo`**（osada.us のリバースDNS。サーバーカードの名前と一致）
  - remotes は **https://osada.us/mcp のみ**（ask.osada.us は載せない）
  - 所有証明は **DNS 認証**（osada.us の apex に TXT レコード）
- 前提の実地確認（2026-11-03 チャット側）:
  - エンドポイント https://osada.us/mcp は稼働中（Cloudflare の WebMCP オプションで 2026-11-02 に有効化）。ツール5点: search_rikishi / get_rikishi_profile / get_banzuke / get_torikumi / list_basho。認証なしで initialize / tools/list / tools/call が通ることを確認済み
  - 公式レジストリ（registry.modelcontextprotocol.io）に o-sumo は未登録
  - osada.us の NS は Cloudflare（uma / walt.ns.cloudflare.com）。apex の TXT は既存が複数あり（SPF・各種所有確認）、MCP 用を1件追加しても競合しない
- 実行担当: ローカル（Osada 本人作業を含む）／公開後の確認: チャット側 Muse

## Step 1: server.json をリポジトリ直下に置く

ファイル名 `server.json`（dai/o-sumo のルート）。内容は以下で確定:

```json
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
  "name": "us.osada/o-sumo",
  "title": "o-sumo (大相撲アーカイブ)",
  "description": "Grand Sumo (大相撲) banzuke, torikumi results, rikishi profiles, and AI semantic search.",
  "version": "1.0.0",
  "websiteUrl": "https://osada.us/",
  "repository": {
    "source": "github",
    "url": "https://github.com/dai/o-sumo"
  },
  "remotes": [
    {
      "type": "streamable-http",
      "url": "https://osada.us/mcp"
    }
  ]
}
```

## Step 2: Ed25519 鍵ペアを作る（秘密鍵は Osada が保管）

Git Bash（Git for Windows 同梱の openssl）で:

```bash
openssl genpkey -algorithm ed25519 -out mcp-registry-key.pem
# 公開鍵（Base64・DNS 登録用）
openssl pkey -in mcp-registry-key.pem -pubout -outform DER | tail -c 32 | base64
# 秘密鍵（hex・login 用）
openssl pkey -in mcp-registry-key.pem -noout -text | grep -A3 'priv:' | tail -n +2 | tr -d ' :\n'
```

- **秘密鍵（pem と hex）は絶対にリポジトリへコミットしない**。パスワードマネージャ等で Osada が保管する。この鍵を持つ者は us.osada 名前空間で公開できる
- pem ファイルは作業フォルダの外（例: ドキュメント配下の非公開フォルダ）に置く

## Step 3: Cloudflare DNS に TXT を追加

Cloudflare ダッシュボード → osada.us → DNS → レコード追加:

- 種別: TXT
- 名前: `@`（apex）
- 内容: `v=MCPv1; k=ed25519; p=<Step 2 の公開鍵 Base64>`

反映確認（数分〜）:

```bash
curl -s 'https://cloudflare-dns.com/dns-query?name=osada.us&type=TXT' -H 'accept: application/dns-json'
```

の Answer に `v=MCPv1; ...` が含まれること。

## Step 4: mcp-publisher で公開

1. 公式リリースから Windows 版を取得: https://github.com/modelcontextprotocol/registry/releases （mcp-publisher_windows_amd64 系のアーカイブ）
2. リポジトリのクローン直下（server.json のある場所）で:

```bash
mcp-publisher login dns --domain osada.us --private-key <Step 2 の秘密鍵 hex>
mcp-publisher publish
```

- publish 時、レジストリ側が server.json のスキーマ検証と https://osada.us/mcp の到達確認を行う

## Step 5: 公開確認

```bash
curl -s 'https://registry.modelcontextprotocol.io/v0/servers?search=o-sumo'
```

に `us.osada/o-sumo` が返れば完了。チャット側でも同じ検索で確認する。Glama / Smithery / PulseMCP / mcp.so 等のディレクトリへは公式レジストリから順次取り込まれる（個別申請は不要なものが大半）。

## 運用メモ

- ツール構成や説明が変わったら server.json の `version` を上げて再 publish する
- 名前の変更は実質「別名での新規公開」になるため、us.osada/o-sumo を正とする
- TXT レコードは公開の維持に必要なので削除しない
