# renovate-aug SEO基盤改善 設計

## 目的

SNS共有時の最低限のカード情報を初期HTMLから提供し、SPA内では現在のrouteに合うmetadataへ更新する。同時に、公開中の力士プロフィールをsitemapへ追加し、canonical・OGP・sitemap・Cloudflare Pages配信を同じ正規URL契約で検証できるようにする。

## Metadata

- `index.html` はトップページ相当の共通OGPとTwitter Cardを持つ。
- React側の `MetaHead` はpathnameを純粋なresolverへ渡し、固定ページ、番付、取組hub、日別取組、力士プロフィールを分類する。
- title、description、`og:url` はroute切替に追従し、`og:url` は既存 `toCanonicalUrl()` を利用する。
- canonical管理は既存 `CanonicalUrl` に残し、StrictModeや遷移後も各head要素を1個に保つ。
- metadataは日本語を既定とし、未知routeはトップページ相当へフォールバックする。
- 指定画像 `C:\2026\08\ogp.jpg` を内容・寸法を変えず `public/og-default.jpg` として使う。

## Sitemap

- `public/api/v1/rikishi.json` を力士プロフィールURLの唯一の入力元とする。
- ビルド時にJSON構造と正の整数ID、ID重複を検証し、不正な入力はビルドエラーにする。
- 既存のroute正規化、末尾スラッシュ、絶対URL化、重複排除を再利用する。
- sitemap件数は固定せず、入力された力士件数と既存route件数から決まる。

## 配信検証

- 現行のデータ同期判定を維持し、環境別HTTP、robots、sitemap全URL、描画後canonical・OGPを追加検証する。
- `BaseUrl` は後方互換で維持し、preview URLは任意指定とする。未指定時はSKIPPEDとして報告する。
- ローカルWranglerをbranchの必須gate、本番を変更前baseline、previewをURL取得後のgateとして扱う。
- 今回未実装のJSON-LDと`feed.xml`は検証対象外とする。

## 対象外

JSON-LD、場所名URL、法務ページ、ニュース詳細、Atom feed、アクセシビリティ機能追加、デプロイ、push、PR作成は含めない。
