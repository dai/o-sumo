あなたは `dai/o-sumo` リポジトリの実装担当です。  
作業ブランチは **`copilot-renovate`**。  
以下の制約を厳守して、**1コミット1目的**で実装してください。

## 絶対制約
1. GitHub Actions の「休場中ストップ」運用を変更しない（workflowの自動再開禁止）
2. Cloudflare Workers Paid + Pages の既存運用を壊さない
3. 従量課金を増やす高頻度ポーリングを導入しない
4. 既存機能（番付・星取・取組予定/結果）を壊さない
5. 変更は最小限・段階的に行う

## 実装タスク（順番厳守）

### Commit 1: chore(pwa): PWA依存追加
- `vite-plugin-pwa` を追加
- lockfile更新
- `npm run build` が通ることを確認

### Commit 2: feat(pwa): Viteに最小PWA設定を追加
- `vite.config.ts` に `VitePWA` を追加
- `registerType: "prompt"` を設定
- `manifest` を追加（name/short_name/theme_color/background_color/display/start_url/icons）
- runtimeCachingは `/api/` のみ `NetworkFirst`
- `networkTimeoutSeconds: 3`
- APIキャッシュ `maxAgeSeconds: 900`（15分）
- 静的資産のglobは `js, css, html, svg, png, ico, woff2` を対象

### Commit 3: feat(branding): 綱モチーフfavicon追加
- `public/favicon.svg` を追加（綱イメージ、モダン、ミニマル）
- `public/favicon.ico` 追加
- `public/apple-touch-icon.png` 追加
- `public/pwa-192.png`, `public/pwa-512.png`, `public/maskable-512.png` 追加
- `index.html` のicon参照を確認/更新

### Commit 4: feat(cache): Cloudflare向け `_headers` 追加
- ルートに `_headers` を追加
- `/assets/*` => `Cache-Control: public, max-age=31536000, immutable`
- `/manifest.webmanifest` => `public, max-age=3600`
- `/sw.js` => `public, max-age=0, must-revalidate`
- `/` => `public, max-age=300`

### Commit 5: feat(a11y): 最低限のアクセシビリティ補強
- 主要ナビに `aria-label`
- 明確なフォーカスリング
- コントラスト不足の色を調整
- 表に `caption` と `scope` を適用

### Commit 6: docs(policy): 運用制約を明文化
- `README.md` または `DEVELOPMENT.md` に追記:
  - Actionsは休場中停止を維持
  - Cloudflare従量抑制のためのキャッシュ方針
  - PWA更新はprompt型で過剰更新を防ぐ方針

### Commit 7: test(smoke): スモークテスト
- 番付・星取・取組予定/結果の表示確認
- PWAインストール可能確認
- オフライン時の最低限表示確認
- SW更新挙動（prompt）確認

## 実装時の出力ルール
- 各コミットごとに:
  - 変更ファイル一覧
  - 変更理由（1〜3行）
  - 想定リスク
  - 検証結果
- 最後にPR説明文を作成:
  - 概要
  - 変更点
  - 影響範囲
  - テスト結果
  - 運用上の注意（Actions停止維持・Cloudflare従量維持）