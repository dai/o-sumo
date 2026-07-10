# Project Plan: Modern & Public-Interest Sumo API Site (o-sumo)

## 1. プロジェクトの方向性とデザイン・アイデンティティ
- [ ] **カラーパレットの定義 (CSS Variables)**
  - [ ] 基調色: 墨色 (#1a1a1a), 生成り (#fdfaf5), 土俵土色 (#b58b5f)
  - [ ] アクセント色: 四神（青房: #0000ff, 白房: #ffffff, 赤房: #ff0000, 紫房: #800080）
- [ ] **タイポグラフィの選定**
  - [ ] タイトル用: モダンな楷書体、または力強い明朝体
  - [ ] データ/本文用: 可読性の高いモダン・サンセリフ (Inter, Noto Sans JP等)
- [ ] **モダンUIコンポーネントの設計**
  - [ ] Glassmorphism（透過エフェクト）を用いた力士カード
  - [ ] 土俵の「掃き目」を模した繊細なライン・バックグラウンドのSVG実装

## 2. コア機能の実装 (API活用)
- [ ] **Interactive Banzuke (番付表)**
  - [ ] `dai/o-sumo` APIから番付データを取得
  - [ ] 伝統的な縦書きレイアウトとモダンなグリッドシステムの融合
  - [ ] ホバー/タップによる詳細ポップアップ実装
- [ ] **Hoshitori Matrix (星取表)**
  - [ ] TypeScriptによる型安全な勝敗ロジックの実装
  - [ ] ○/● をアイコンや房の色を用いた視覚的な表現に変換
- [ ] **Real-time Schedule & Results (取組予定・結果)**
  - [ ] 令和8年3月場所からのデータを時系列タイムラインで表示
  - [ ] 決まり手（Kimarite）に連動した解説ツールチップの追加

## 3. 公益性の担保とアクセシビリティ
- [ ] **教育的コンテンツの統合**
  - [ ] 相撲用語（Shikona dictionary等）の自動リンク化と用語解説の実装
  - [ ] 決まり手の統計情報の可視化（Recharts等を使用したグラフ表示）
- [ ] **ユニバーサルデザインの追求**
  - [ ] 高コントラスト比の確保と文字サイズ変更機能
  - [ ] WAI-ARIA準拠のスクリーンリーダー対応（特に表形式のデータ）
- [ ] **情報の透明性**
  - [ ] データ出典（公益財団法人日本相撲協会）とAPI（dai/o-sumo）の明示的なクレジット表記

## 4. 技術スタック & 最適化
- [ ] **TypeScript / Next.js (or React) 構成**
  - [ ] APIレスポンスに対する厳格な型定義の作成
- [ ] **PWA (Progressive Web App) 対応**
  - [ ] 場所中でも素早く確認できるオフラインキャッシュ設定
- [ ] **パフォーマンス最適化**
  - [ ] 画像アセットのWebP化、フォントのサブセット化による高速化

## 5. 開発マイルストーン
- [ ] Phase 1: `base-ui` - カラー、フォント、基本レイアウトの構築
- [ ] Phase 2: `data-integration` - API連携と番付・星取の基本表示
- [ ] Phase 3: `polish` - アニメーション、インタラクション、アクセシビリティ対応
- [ ] Phase 4: `public-release` - PWA化とデプロイ

## 6. 2026-07-10 七月場所「取組予定未発表・休場者反映」引き継ぎメモ

### 背景
- 2026年七月場所の取組予定が未発表の状態でも、休場者情報だけは先に UI/API に反映しておく必要がある。
- 対象の休場者は若隆景と白鷹山。
- 今日作成したローカルコミット `22fc748 Preserve July absentees before schedule release` は、無効化された PR #149 の2コミットを外し、`1d92df7` 直上に作り直したもの。

### 実施したローカル変更
- `public/api/v1/torikumi.json` の七月場所データで、取組予定未発表の状態を維持しつつ休場者を反映。
- `app/lib/torikumi-data.ts` の埋め込みデータも同じ内容に同期。
- 取組予定未発表時に休場者表示が消えないよう、関連テストを更新。
- 自動更新スクリプトで、取組未発表時にも休場者情報を保持する挙動を確認できるようにした。

### テスト結果
- `git diff --check` は成功。
- `git status --short && nl -ba plan.md | sed -n '45,120p'` で作業ツリーと追記範囲を確認済み。

### PR作成がこの環境で詰まった理由
- `make_pr` の結果が環境上で可視化されなかった。
- GitHub CLI (`gh`) がインストールされていなかった。
- GitHub への push は `CONNECT tunnel failed, response 403` で遮断された。

### 新規チャットでの再開手順
1. `git status --short` で作業ツリーがクリーンか確認する。
2. `git log --oneline -5` で `22fc748 Preserve July absentees before schedule release` と `9c46192 Document July absentee PR handoff` の位置を確認する。
3. 必要であれば、`1d92df7` 直上から新しい作業ブランチを作り、無効化された PR #149 由来の2コミットを含めない形に整える。
4. 以下のブランチ名案・PRタイトル案・PR本文案を使って PR を作成する。

### ブランチ名案
- `fix/july-absentees-before-schedule`

### PRタイトル案
- `Preserve July absentees before schedule release`

### PR本文案
```markdown
## Summary
- Preserve July basho absentee data for Wakatakakage and Hakuyozan before the torikumi schedule is published.
- Keep the public torikumi JSON and embedded app data in sync.
- Update coverage so absentees remain visible while bouts are still unpublished.

## Testing
- git diff --check
```

### 追加コミット
- 前回環境での追加コミットとして、`9c46192 Document July absentee PR handoff` が作成済み。
