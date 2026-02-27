# o-sumo

大相撲、 All about the OO-SUMO.

## 概要

o-sumoは、大相撲の番付情報と力士データを提供するモダンなWebアプリケーションです。令和8年3月場所（2026年3月）の幕内・十両力士の番付一覧を表示します。

## 技術スタック

- **フレームワーク**: [Cloudflare vinext](https://github.com/cloudflare/vinext) - Next.js API on Vite
- **フロントエンド**: React 19 + TypeScript
- **ビルドツール**: Vite 7
- **デプロイ**: Cloudflare Workers / Pages
- **スタイリング**: CSS3（モダンなグラデーションとレスポンシブデザイン）

## 機能

- 📋 **番付一覧**: 幕内・十両力士の最新番付を東西の欄で表示
- 📱 **レスポンシブデザイン**: モバイル・タブレット・デスクトップに対応
- ⚡ **高速配信**: Cloudflare vinextによる最適化された配信
- 🎨 **モダンUI**: グラデーションと洗練されたカラースキーム

## ページ構成

- `/` - ホームページ
- `/202603-o-sumo` - 令和8年3月場所の番付一覧（メインページ）

## セットアップ

### 必要な環境

- Node.js 18以上
- npm または pnpm

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/dai/o-sumo.git
cd o-sumo

# 依存関係をインストール
npm install
```

### 開発サーバーの起動

```bash
# vinextの開発サーバーを起動（推奨）
npm run dev

# または、Viteの開発サーバーを起動
npm run dev:vinext
```

ブラウザで `http://localhost:3000` または `http://localhost:3001` を開いてください。

### ビルド

```bash
# vinextでビルド
npm run build

# または、Viteでビルド
npm run build:vinext
```

### デプロイ

```bash
# Cloudflare Workersへデプロイ
npm run deploy
```

## ディレクトリ構造

```
o-sumo/
├── app/
│   ├── 202603-o-sumo/
│   │   ├── page.tsx          # 番付一覧ページ
│   │   └── page.css          # ページスタイル
│   ├── components/
│   │   └── BanzukeTable.tsx   # 番付表示コンポーネント
│   ├── lib/
│   │   └── sumo-data.ts       # 力士データ定義
│   ├── styles/
│   │   └── banzuke.css        # 番付表のスタイル
│   ├── layout.tsx             # ルートレイアウト
│   ├── page.tsx               # ホームページ
│   ├── globals.css            # グローバルスタイル
│   └── index.css              # ホームページスタイル
├── public/                    # 静的ファイル
├── vite.config.ts             # Vite設定
├── tsconfig.json              # TypeScript設定
├── package.json               # 依存関係
├── wrangler.toml              # Cloudflare Workers設定
└── README.md                  # このファイル
```

## 力士データ

令和8年3月場所の幕内・十両力士データは `app/lib/sumo-data.ts` で定義されています。

```typescript
export interface Rikishi {
  name: string;        // 四股名
  yomi: string;        // 読み仮名
  rank: string;        // 番付
  side: 'east' | 'west'; // 東西
  wins?: number;        // 勝数
  losses?: number;      // 敗数
  draws?: number;       // 休場数
}
```

## スタイリング

このプロジェクトは、モダンなグラデーション（紫色系）を使用した洗練されたデザインを採用しています。

- **プライマリカラー**: `#667eea` (紫)
- **セカンダリカラー**: `#764ba2` (濃い紫)
- **背景グラデーション**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

## レスポンシブブレークポイント

- **デスクトップ**: 1200px以上
- **タブレット**: 768px～1199px
- **モバイル**: 480px～767px
- **小型モバイル**: 479px以下

## ブラウザ対応

- Chrome/Edge (最新版)
- Firefox (最新版)
- Safari (最新版)
- モバイルブラウザ (iOS Safari, Chrome Mobile)

## ライセンス

ISC

## 参考リンク

- [Cloudflare vinext](https://github.com/cloudflare/vinext)
- [日本相撲協会](https://sumo.or.jp/)
- [vinext ドキュメント](https://vinext.io/)

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 作成者

[dai](https://github.com/dai)

---

**最終更新**: 2026年2月27日
