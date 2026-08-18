# 力士プロフィール詳細ページ (`/rikishi/{id}/`) UI 構造

データ API・スキーマは変えず、UI とテストに集中して詳細ページの構成を整理した。データソースは `public/api/v1/rikishi/{id}.json` (詳細) と `public/api/v1/rikishi.json` (索引) の 2 つ。

## 1. ページ全体構造

`<main>` 直下に以下のセクションを上から順に並べる。

1. パンくず (`<nav aria-label="rikishi.breadcrumbLabel">`)
   - ホーム › 人物名鑑 › 力士プロフィール › 力士名
   - 末尾項目は `aria-current="page"`
2. ヒーロー (名前 / 読み / ローマ字 / 番付 / 写真 / 共有ボタン)
3. 基本データ (`<dl>` を `grid` で 1〜2 カラム展開)
4. 通算成績 (`<section aria-labelledby="rikishi-career-title">`)
5. 同じ番付の力士 (`<section aria-labelledby="rikishi-same-rank-title">`)
6. 出典 (`<section aria-labelledby="rikishi-source-title">`)

## 2. 通算成績セクション

データ: `profile.careerStats = { wins, losses, draws }` (詳細 API)。

| 表示 | 算出 |
|---|---|
| `${wins}勝 ${losses}敗 ${draws}分` | API の値をそのまま結合 |
| 勝率 | `(wins / (wins + losses)) * 100` を四捨五入して `%` で表示 (引分は分母から除外) |
| 出場数 | `wins + losses + draws` |

勝率は「分母 = 勝ち + 負け」とする相撲慣例に合わせた。引分は「分」の表記で個別に扱う。

## 3. 同じ番付の力士セクション

データ: `public/api/v1/rikishi.json` (`rikishi[]` 配列)。

- 詳細ページの `profile.id` と同じ `currentRank` を持ち、かつ `id !== profile.id` の項目を抽出
- 上限 8 人 (`SAME_RANK_LIMIT`)、該当 0 人のときはセクション全体を非表示
- index fetch が失敗した場合も 0 人として扱う (UI ブロックは出さない)

各力士は `<a class="rikishi-profile-same-rank__link">` でカード状に表示し、名前と読みを見せる。クリックで `/rikishi/{id}/` へ遷移する。

## 4. パンくず

- `aria-label` は翻訳キー `rikishi.breadcrumbLabel` (ja: 「パンくず」, en: 「Breadcrumb」)
- ホームと力士一覧への内部リンクを `<ol>` 風の構造で提供

## 5. アクセシビリティ

- 各セクションは `role="region"` 相当の `<section>` で `aria-labelledby` により `<h2>` と紐付け
- パンくずは `<nav>` で `aria-label` を翻訳キーから取得
- 同じ番付の力士カードは `<a>` で囲み、Tab でフォーカス可能
- フォーカス可視は CSS の `:focus-visible` で背景色を `--color-primary-container` に切替

## 6. テスト観点

`app/rikishi/page.test.tsx` に以下を追加:

| テスト | 検証内容 |
|---|---|
| 通算成績の表示 | `401 勝 235 敗 34 分` と勝率・出場数 |
| 同じ番付の力士 | 横綱 (3842) の場合に大の里 (4227) のみ表示され、霧島 (3622) や自分自身は含まれない |
| 同じ番付の非表示 | 前頭 1 (9999) が自分だけならセクション自体を出さない |
| パンくず | ホーム・力士一覧へのリンクと現在ページ名 |

## 7. 触ったファイル

- `app/rikishi/RikishiProfilePage.tsx`
- `app/rikishi/page.test.tsx`
- `app/rikishi/page.css`
- `src/locales/ja/common.json` (`rikishi.*` 配下に新規キー)
- `src/locales/en/common.json` (同上)
- `docs/ui/profile-page.md` (本ファイル)
