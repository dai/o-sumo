# 力士比較ページ刷新 Design

## Goal

`/compare/` を2人固定の比較画面へ刷新し、日本相撲協会プロフィール掲載履歴から改名前後を統合した通算合い口を表示する。

## Data contract

- 現役幕内・十両力士の公式プロフィールから四股名履歴と場所・日別の対戦相手・勝敗を取得する。
- PC／モバイル向けに重複する履歴は場所・日・力士IDで一意化し、休場・取組なしは集計しない。
- 四股名履歴を現行力士IDへ解決し、双方の履歴を照合する。矛盾や現役力士への解決失敗を0勝扱いしない。
- `public/api/v1/rikishi-matchups.json` は `updatedAt` と、`rikishi1Id < rikishi2Id` の一意なペア配列を持つ。全件検証後だけ置き換え、部分更新や取得失敗時は既存正常値を保持する。

## UI contract

- 「力士1」「力士2」の独立したcomboboxを用意し、四股名・かな・ローマ字・番付で検索する。
- 候補は上下キー、Enter、Escape、タッチで操作でき、同じ力士は重複選択できない。
- URLの `ids` は選択順を保持し、旧3人URLは先頭2人へ正規化する。検索文字はURLへ保存しない。
- 選択済み入力を編集するとその枠を解除する。「クリア」は両入力、選択、URL、比較表を初期化する。
- 2人揃った時だけ、現在の番付、身長、体重、出身地、初土俵、通算成績、合い口の7行を表示する。列見出しは自前プロフィールへリンクする。
- 合い口は双方視点で反転し、対戦なしは `0-0`、取得失敗や不整合は「不明」とする。
- モバイルでは入力を縦積み、表を横スクロール可能にして項目列を固定する。日本語・英語、light／darkに対応する。

## Verification

- Python parser／generator tests、Vitest UI tests、typecheck、full Vitest、build、diff check、Impeccable detectを通す。
- 実ブラウザで日英、light／dark、キーボード、360px幅を確認する。
- Wrangler Pagesで `/compare` 301、`/compare/` 200、新JSON 200 `application/json` を実測する。

