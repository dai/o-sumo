# Runbook: My Rikishi 認証の本番公開（Production rollout）

対象リポジトリ: dai/o-sumo（ローカル: C:\dai\GitHub\o-sumo）
根拠ドキュメント: `docs/auth/my-rikishi-cloudflare-operations.md`、
`docs/superpowers/plans/2026-09-29-my-rikishi-cloudflare-auth.md`（Task 6 / Task 7）

## 承認と前提

- Production ゲートの明示確認: **2026-10-26、オーナー（Osada）が本番公開まで
  一気に進めることを承認済み**。この文書がその実行指示書である。
- 前提条件（すべて充足済み）:
  - Preview の自動検証・ブラウザ検証が完了（2026-10-26、PR #696 マージ済み）
  - `main` が最新であること（着手前に `origin/main` へ同期する）
- 分担: Cloudflare / Google 側の操作と実行はローカル Muse、
  記録PRのレビューと公開後検証は Muse（チャット側、GitHub経由）。

## 絶対に守ること

- Preview のリソース（D1 `o-sumo-my-rikishi-preview`、Preview用 OAuth、
  Preview のシークレット）には一切触らない。本番はすべて別リソース・別値。
- データベースID、OAuthシークレット、セッション秘密、`.dev.vars` を
  コミットしない。ID は私的なデプロイノートにのみ記録する。
- シークレットをコマンドライン引数やシェル履歴に残さない。
  Cloudflare の secret 入力フローまたはダッシュボードを使う。
- Pages プロジェクトの更新は、適用前にペイロード全体をレビューし、
  既存の bindings / variables（`COMPARE_OG_CACHE` を含む）が
  すべて保持されることを確認してから適用する。想定外の差分があれば止まる。
- `wrangler.toml` はローカル専用設定。`pages_build_output_dir` を足さない。

## Step 1: 本番 D1 の作成とマイグレーション

Preview の時と同様、変更系コマンドの前に `cf cli search` で正規コマンドを
確認してから実行する。

1. D1 データベース `o-sumo-my-rikishi-production` を作成する。
   返ってきたデータベースIDは私的ノートにのみ記録する。
2. 未適用マイグレーションを確認し、適用する（対象は
   `migrations/0001_my_rikishi_auth.sql` のみ）:

   ```powershell
   cf d1 migrations list <PRODUCTION_DATABASE_ID> --dir migrations
   cf d1 migrations apply <PRODUCTION_DATABASE_ID> --dir migrations
   ```

3. 適用後、テーブル名とマイグレーション状態のみを確認する
   （行データはまだ存在しないはず）。

この時点では Pages から参照されていないため、本番サイトへの影響はない。

## Step 2: 本番用 Google OAuth クライアントの作成

オーナーの対話操作（Google Cloud コンソール）:

1. ウェブアプリケーション用 OAuth クライアントを新規作成する
   （Preview 用とは別物。新規発行し、使い回さない）。
2. 承認済みリダイレクト URI に次を**正確に**登録する:

   ```text
   https://osada.us/api/auth/callback/google
   ```

3. クライアントIDとクライアントシークレットを取得する。
   シークレットは Step 4 の secret 入力フローまで安全に保持し、
   チャット・ログ・ファイルに平文で残さない。

## Step 3: 本番用セッション秘密の生成

`AUTH_SESSION_SECRET` を新規生成する（Preview の値の使い回し禁止）。
暗号論的にランダムな 32 バイト以上を生成し、Step 4 の secret 入力フローに
直接渡す。生成値をコンソールやログに表示したままにしない。

## Step 4: Pages Production 環境への設定

対象は Pages プロジェクト `o-sumo` の **Production** 環境のみ。

1. 現在の Production 設定ペイロードを取得し、全体をレビューする。
   既存の bindings / variables がすべて含まれていることを確認する。
2. 次を追加する:
   - D1 binding: `MY_RIKISHI_DB` → `o-sumo-my-rikishi-production`
   - 変数: `AUTH_ORIGIN` = `https://osada.us`
   - 変数: `GOOGLE_CLIENT_ID` = Step 2 の本番用クライアントID
   - （任意）`AUTH_SESSION_TTL_SECONDS`: 未設定時は既定の30日。
     Preview と揃える判断でよい。
3. シークレットを secret 入力フローで設定する:
   - `GOOGLE_CLIENT_SECRET` = Step 2 の本番用シークレット
   - `AUTH_SESSION_SECRET` = Step 3 で生成した値
4. ペイロードを再レビューし、既存設定が保持されていることを確認して適用する。

## Step 5: 本番デプロイ

`main` の最新状態で Production デプロイを行う（通常の Pages 本番反映フロー）。
設定だけ先行してコードが古い状態を作らないこと。デプロイ完了を確認する。

## Step 6: 自動検証（本番URL）

```powershell
pwsh ./scripts/verify_my_rikishi_preview.ps1 -BaseUrl https://osada.us
```

期待結果:
- `GET /api/auth/session` が匿名で `{ authenticated: false }` を返す
- `GET /api/auth/google?returnTo=/my-rikishi/` が 302 で
  `https://accounts.google.com/` へリダイレクトし、その遷移先パラメータの
  redirect_uri が `https://osada.us/api/auth/callback/google`、
  client_id が本番用であること

## Step 7: ブラウザ受け入れ確認（オーナー実施）

Preview 検証と同じチェックリストを本番で実施する:

- 匿名で My Rikishi の追加・削除・絞り込み・再読み込みができる
- Google ログインでローカルの選択が保持・マージされる
  （ローカル `[1, 2]` + アカウント `[2, 3]` → `[1, 2, 3]` の重複なしマージ）
- 別ブラウザで同じ一覧が見える
- ログアウト後もローカル利用が継続できる
- セッション失効時に他ユーザーのデータが見えない
- 公開ページ（番付・取組・公開JSON）に認証UIが干渉しない

## Step 8: 記録と PR

1. `docs/auth/my-rikishi-cloudflare-operations.md` の Current state に
   Production の状態を追記する（リソース名と検証日。ID・シークレットは書かない）。
2. `tasks/todo.md` に最終レビュー記録を残す: 実施コマンド、検証結果、
   Production ゲートが今回の承認で開いたこと。
3. 上記2ファイルのみの PR を作る。マージはチャット側 Muse のレビュー後に行う。

## ロールバック

問題が出たら次の順で戻す（`docs/auth/...operations.md` の Rollback 節が正）:

1. ログイン導線を隠す/外す。匿名のローカル保存はそのまま使える。
2. 認証の環境設定・binding を外すのは、導線を無効化した後に行う。
3. 強制ログアウトが必要なら `sessions` の行を削除する。
   `users` と My Rikishi の行は、別のデータ削除判断なしに消さない。
4. 公開ページ・公開JSON・Markdown・A2A・OGP は認証DBに依存しないため、
   ロールバックの影響を受けない。
