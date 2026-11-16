# webfont サブセット再生成と Dependabot PR #761〜#763 の処理順

作成：2026-11-16（チャット側 Muse）
担当：実装はローカル Muse、レビュー・マージ・公開後確認はチャット側

## 背景と現状

2026-11-16 朝、o-sumo に Dependabot PR が3件着信した（#761〜#763）。いずれも base は main `9b5b56a`。チャット側の調査結果は次のとおり。

- **#761**（npm minor/patch グループ6件）と **#763**（i18next 26.7.2 → 27.1.1）は、test ジョブだけが同一内容で失敗している：
  - `app/webfont.test.ts:81` — `U+8A03 are missing from the webfont subset. Regenerate it with: npm run fonts:subset`
  - U+8A03 は「訃」。依存更新とは無関係の、main 側の既存失敗と判断した。main 自体には test ジョブが付かないため、main 単独の失敗は CI に表示されていない（ローカルの main でテストを回せば再現するはず）。
- **#762**（react-i18next 17.1.13 → 18.0.1）は単独では入らない。react-i18next 18 は i18next >= 27 を peer として要求するため、install と Pages ビルドが失敗している。**#763 とペアで初めて成立する**。
- #763 単独は Pages ビルド・validate（型チェック含む）が通過済みで、残る失敗は webfont のみ。

## お願いしたい作業（ローカル Muse）

1. main 最新で `npm run fonts:subset` を実行し、webfont サブセットを再生成する（「訃」U+8A03 が含まれるように）。
2. 生成差分を確認し、意図しない差分（無関係な文字の増減、生成物以外のファイル変更）が混ざっていないか見る。
3. テストが全て通ることを確認する（少なくとも `app/webfont.test.ts`）。
4. 修正 PR を作る（ブランチ例：`fix/webfont-subset-u8a03`）。チャット側がレビューしてマージする。

## i18next 27 移行監査の結果（チャット側で実施済み）

`app/lib/i18n.ts` と locales を確認した。ペア（#762+#763）は追加のコード変更なしで進めてよい判断。

- `fallbackLng: 'ja'` を明示している → v27 のデフォルト変更（false）の影響なし
- `src/locales/{ja,en}/common.json` に空文字列の翻訳は0件 → `returnEmptyString` のデフォルト変更の影響なし
- `<Trans>` コンポーネントは全ファイルで未使用 → Trans の unescape 挙動変更の影響なし
- `interpolation: { escapeValue: false }` を明示している
- resources は JSON のバンドル読み込みで backend なし → fallback のリクエスト先変更の影響なし
- #763 の CI で validate（型チェック）が通過済み → `strictInterpolationChecks` 由来の型エラーも出ていない

## 処理順（チャット側が実施）

1. webfont 修正 PR をレビューして main にマージ
2. #761：ブランチを更新して CI 再走、test 通過を確認してマージ
3. #763：同上
4. #762：ブランチを更新して i18next 27 を取り込み、CI 通過を確認してマージ

## 注意

- 十一月場所の開催中（〜2026-11-22）だが、本件は依存関係とフォント生成物の変更のみで、取組データや生成系には触れない。
- フォント再生成で差分が想定外に大きい場合は、無理に進めず差分内容をチャット側に共有してほしい。
