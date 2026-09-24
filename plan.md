# plan: matchup popup の不透明度を 95% へ + 背面ブラー

## 背景

`app/torikumi` の「合口マッチアップ」デスクトップ用ポップアップ (`.torikumi-matchup-popover`) は、これまで背景を `var(--surface-container-lowest, #fff)` の完全不透明で描画していた。

- ホバーで開いたままスクロールすると、ポップアップの「下」に走っている本文・取組カードが視覚的に重なって読みづらい瞬間がある（特にダークモードで `--surface-container-lowest` が薄めの上位色になったとき、下のテキストがうっすら透けて「にじむ」印象になる）。
- 一方、完全不透明だと「重い」感も否めないため、視覚的な階層の重さを増やさずにごくわずかな透け感で奥行きを足したい。

このトレードオフを `color-mix` + `backdrop-filter: blur()` の組み合わせで解消する。

## 対象コード

- ファイル: `app/torikumi/page.css`
- 対象セレクタ:
  - `.torikumi-matchup-popover`（ポップアップ本体）
  - `.torikumi-matchup-popover::before`（吹き出し三角）

## 差分

```diff
 /* Desktop Popover */
 .torikumi-matchup-popover {
   position: absolute;
   top: calc(100% + 6px);
   left: 50%;
   transform: translateX(-50%);
   width: min(290px, 85vw);
-  background: var(--surface-container-lowest, #fff);
+  background: color-mix(in srgb, var(--surface-container-lowest, #fff) 95%, transparent);
+  backdrop-filter: blur(8px);
+  -webkit-backdrop-filter: blur(8px);
   border: 1px solid var(--color-outline-variant, #e5e7eb);
   ...
 }
 ...
 .torikumi-matchup-popover::before {
   ...
-  background: var(--surface-container-lowest, #fff);
+  background: color-mix(in srgb, var(--surface-container-lowest, #fff) 95%, transparent);
   ...
 }
```

要点:

1. **背景を 95% 不透明に** — `color-mix(in srgb, <base> 95%, transparent)` で 5% だけ後ろを透かす。下に何が走っているか「わからない」レベルではないが、完全に塗りつぶすより軽く見える。
2. **背面を 8px ブラー** — `backdrop-filter: blur(8px)` で後ろのテキストや色を軽く散らして、透けても可読性を維持。Safari 対応のため `-webkit-backdrop-filter` も併記。
3. **三角も同色に揃える** — `::before` の背景も同じ `color-mix(...)` に変更して、本体との継ぎ目を作らない。

## 検証手順

- `npm ci --no-audit --no-fund`
- `npm run typecheck`
- `npm test`
- `npm run build`
- 手動: ローカルで `/torikumi/...` を開き、合口マッチアップにホバー → ポップアップ表示中にページを下にスクロールし、下のテキストが「読めない」レベルまで透けていないこと、また完全不透明と比べて明らかに軽く見えることを確認。

## スコープ外

- モバイルのボトムシートモーダル (`.torikumi-matchup-modal-portal`) は全面オーバーレイ＋ `--color-scrim` 背景で本文とは別のレイヤード UI になっているため、今回の対象外。
- 別のトースト / ツールチップ (`tooltip`, `toast` 等) も対象外。マッチアップポップアップ固有の要望。
- カラートークン自体 (`--surface-container-lowest`) の値変更は今回行わない。

## 想定コミット

```
fix(torikumi): make matchup popup 95% opaque with backdrop blur

スクロールや重なった文字の参照読みを避け、またダークモードでも「下の文字が透ける」感をなくための調整。color-mix で 95% 不透明 + backdrop-filter: blur(8px) で微ガラスモーフィズムを付与。矢印 (::before) も同色に揃える。
```
