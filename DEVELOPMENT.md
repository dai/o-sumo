# 開発ガイド

このドキュメントは、o-sumoプロジェクトの開発に関する情報を提供します。

## 環境構築

### 前提条件

- Node.js 18.0.0以上
- npm 9.0.0以上（またはpnpm）
- Git

### セットアップ手順

```bash
# リポジトリをクローン
git clone https://github.com/dai/o-sumo.git
cd o-sumo

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev:vinext
```

ブラウザで `http://localhost:3001` を開いてください。

## 開発コマンド

```bash
# 開発サーバー（Vite）
npm run dev:vinext

# 開発サーバー（vinext）
npm run dev

# ビルド（Vite）
npm run build:vinext

# ビルド（vinext）
npm run build

# ローカル本番サーバー
npm run start

# Cloudflare Workersへデプロイ
npm run deploy
```

## プロジェクト構造

```
app/
├── 202603-o-sumo/          # メインページ（令和8年3月場所）
│   ├── page.tsx            # ページコンポーネント
│   └── page.css            # ページスタイル
├── components/             # 再利用可能なコンポーネント
│   └── BanzukeTable.tsx     # 番付表示コンポーネント
├── lib/                    # ユーティリティと定義
│   └── sumo-data.ts        # 力士データ定義
├── styles/                 # 共有スタイル
│   └── banzuke.css         # 番付表のスタイル
├── layout.tsx              # ルートレイアウト
├── page.tsx                # ホームページ
├── globals.css             # グローバルスタイル
└── index.css               # ホームページスタイル
```

## コンポーネント開発

### 新しいコンポーネントの作成

1. `app/components/` ディレクトリに新しいファイルを作成
2. React コンポーネントを実装
3. 必要に応じてスタイルファイルを作成

```typescript
// app/components/MyComponent.tsx
'use client';

import React from 'react';
import './my-component.css';

export default function MyComponent() {
  return <div className="my-component">Hello</div>;
}
```

### スタイリングのベストプラクティス

- グローバルスタイルは `app/globals.css` に記述
- コンポーネント固有のスタイルは同じディレクトリに `.css` ファイルを作成
- レスポンシブデザインは `@media` クエリを使用
- グラデーションカラーの統一: `#667eea` (紫) と `#764ba2` (濃い紫)

## 力士データの管理

力士データは `app/lib/sumo-data.ts` で定義されています。

### データ構造

```typescript
export interface Rikishi {
  name: string;              // 四股名
  yomi: string;              // 読み仮名
  rank: string;              // 番付
  side: 'east' | 'west';     // 東西
  wins?: number;             // 勝数
  losses?: number;           // 敗数
  draws?: number;            // 休場数
}

export interface RankGroup {
  title: string;             // 番付名（例：「横綱」）
  east: Rikishi[];          // 東の力士
  west: Rikishi[];          // 西の力士
}
```

### 新しい力士を追加

```typescript
{
  name: '四股名',
  yomi: 'よみがな',
  rank: '番付',
  side: 'east',
  wins: 10,
  losses: 5,
  draws: 0
}
```

## TypeScript

このプロジェクトはTypeScriptで開発されています。

- `tsconfig.json`: TypeScript設定
- `tsconfig.node.json`: Vite設定用のTypeScript設定

### 型定義

すべてのコンポーネントと関数に型注釈を付けてください。

```typescript
interface Props {
  title: string;
  count: number;
}

export default function Component({ title, count }: Props) {
  return <div>{title}: {count}</div>;
}
```

## ビルドとデプロイ

### ローカルビルド

```bash
npm run build:vinext
```

出力は `dist/` ディレクトリに生成されます。

### Cloudflare Workersへのデプロイ

```bash
# 事前にCloudflare CLIをセットアップ
npm install -g wrangler

# デプロイ
npm run deploy
```

### 環境変数

`.env.local` ファイルで環境変数を定義できます。

```
VITE_API_URL=https://api.example.com
```

コンポーネント内での使用:

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## テスト

現在、自動テストは設定されていません。手動テストを実施してください。

### テスト項目

- [ ] ホームページが正常に表示される
- [ ] 202603-o-sumoページが正常に表示される
- [ ] 番付表が正しく表示される
- [ ] モバイルレスポンシブが機能する
- [ ] リンクが正常に動作する

## パフォーマンス最適化

### イメージ最適化

`next/image` コンポーネントを使用してイメージを最適化してください。

```typescript
import Image from 'next/image';

<Image
  src="/image.png"
  alt="Description"
  width={800}
  height={600}
/>
```

### コード分割

大きなコンポーネントは動的インポートで分割してください。

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

## トラブルシューティング

### ビルドエラー

```
Error: Could not load virtual:vinext-rsc-entry
```

**解決方法**: `npm install` を実行して依存関係を再インストールしてください。

### 開発サーバーが起動しない

```bash
# ポート3001が使用されていないか確認
lsof -i :3001

# 別のポートで起動
npm run dev:vinext -- --port 3002
```

### スタイルが反映されない

- ブラウザキャッシュをクリア（Ctrl+Shift+Delete）
- 開発サーバーを再起動
- CSSファイルが正しく保存されているか確認

## コード規約

### ファイル命名規則

- コンポーネント: PascalCase (`MyComponent.tsx`)
- ユーティリティ: camelCase (`myUtil.ts`)
- スタイル: kebab-case (`my-component.css`)
- ページ: `page.tsx`

### コーディング規約

- ESLintの設定に従う
- Prettierで自動フォーマット
- 型安全性を最優先
- コメントは日本語で記述

## 参考リンク

- [Cloudflare vinext](https://github.com/cloudflare/vinext)
- [React ドキュメント](https://react.dev/)
- [TypeScript ドキュメント](https://www.typescriptlang.org/docs/)
- [Vite ドキュメント](https://vitejs.dev/)
- [Cloudflare Workers](https://workers.cloudflare.com/)

## サポート

問題が発生した場合は、GitHubのIssueを作成してください。

---

**最終更新**: 2026年2月27日
