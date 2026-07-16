# 「場所を掘る」トップページカード Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** トップページのHero直下で、取組速報と大相撲アナリティクスを同格の2カードとして表示する。

**Architecture:** `Home` のHero直下に `home-feature-grid` を追加し、既存速報セクションと新しい分析セクションを内包する。スタイルは既存の `home-editorial` スコープとテーマトークンだけで構成し、データ取得や分析ロジックは変更しない。

**Tech Stack:** React 19、React Router、TypeScript、CSS、Vitest、Testing Library、Playwright

## Global Constraints

- 見出しは `場所を掘る`、補足は `大相撲アナリティクス`、CTAは `アナリティクスを見る` とする。
- 遷移先は末尾スラッシュ付き `/analytics/` とする。
- 860px以下では速報、分析の順で縦積みにする。
- News、決まり手、過去場所の順序と既存の速報リンク算出は変更しない。
- 既存の紙・墨・金・朱のテーマトークンを再利用し、新しい依存関係を追加しない。

---

### Task 1: カード構造と回帰テスト

**Files:**
- Modify: `app/page.test.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: 既存の `liveTorikumiTarget.href`、`liveTorikumiTarget.description`、React Router `Link`
- Produces: `.home-feature-grid`、`.analytics-feature-card`、`/analytics/` CTA

- [x] **Step 1: 失敗する構造テストを書く**

```tsx
const featureGrid = document.querySelector('.home-feature-grid');
const analyticsCard = document.querySelector('.analytics-feature-card');

expect(featureGrid).not.toBeNull();
expect(analyticsCard).not.toBeNull();
expect(within(analyticsCard as HTMLElement).getByRole('heading', { name: '場所を掘る' })).toBeInTheDocument();
expect(within(analyticsCard as HTMLElement).getByRole('link', { name: 'アナリティクスを見る' })).toHaveAttribute('href', '/analytics/');
expect(featureGrid!.compareDocumentPosition(document.querySelector('.news-section')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
```

- [x] **Step 2: REDを確認する**

Run: `npm test -- --run app/page.test.tsx`

Expected: `.home-feature-grid` と `.analytics-feature-card` が存在しないため失敗する。

- [x] **Step 3: Hero内の旧リンクを削除し、2カード構造を実装する**

```tsx
<div className="home-feature-grid">
  <section className="live-torikumi-section" aria-labelledby="live-torikumi-title">...</section>
  <section className="analytics-feature-card" aria-labelledby="analytics-feature-title">
    <p className="analytics-feature-label">大相撲アナリティクス</p>
    <h2 id="analytics-feature-title">場所を掘る</h2>
    <p>勝ち星、無敗力士、決まり手から、今場所の流れを読み解きます。</p>
    <Link to="/analytics/" className="analytics-feature-link">アナリティクスを見る</Link>
  </section>
</div>
```

- [x] **Step 4: GREENを確認する**

Run: `npm test -- --run app/page.test.tsx`

Expected: 全テスト成功。

### Task 2: Editorial Homeスタイルと実画面検証

**Files:**
- Modify: `app/index.css`
- Modify: `tasks/todo.md`

**Interfaces:**
- Consumes: `--surface-container-*`、`--color-primary`、`--color-secondary`、`--color-accent` と既存の `home-editorial` スコープ
- Produces: デスクトップ2列、860px以下1列、ライト・ダーク互換のカード表示

- [x] **Step 1: スタイルを追加する**

```css
.home-editorial .home-feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}

.home-editorial .analytics-feature-card {
  display: grid;
  align-content: start;
  padding: clamp(2rem, 4vw, 3rem);
  background: var(--surface-container-low);
}

@media (max-width: 860px) {
  .home-editorial .home-feature-grid {
    grid-template-columns: 1fr;
  }
}
```

CTA、見出し、補足文は既存の角なしEditorial表現に合わせ、フォーカスリングとダークテーマの色を明示する。

- [x] **Step 2: デザイン検出と実画面を確認する**

Run: `node C:\dai\GitHub\o-sumo\.agents\skills\impeccable\scripts\detect.mjs --json app/page.tsx app/index.css`

Expected: 指摘0件。

Playwrightで1440x1000ライト、390x844ライト、390x844ダークを確認し、`document.documentElement.scrollWidth === document.documentElement.clientWidth` を満たすことを確認する。

- [x] **Step 3: 全体検証を行う**

Run: `npm run typecheck`

Run: `npm test -- --run`

Run: `npm run build`

Run: `git diff --check`

Expected: すべて終了コード0。既存のchunk size警告以外に新規警告なし。

- [x] **Step 4: Reviewを記録してコミットする**

```powershell
git add app/page.tsx app/page.test.tsx app/index.css tasks/todo.md docs/superpowers
git commit -m "feat: add basho analytics feature card"
```

### Task 3: PushとPR作成

**Files:**
- No file changes

**Interfaces:**
- Consumes: `codex/analytics-dashboard` の検証済みコミット
- Produces: GitHub上のdraft PR

- [x] **Step 1: ブランチをpushする**

Run: `git push -u origin codex/analytics-dashboard`

Expected: remote tracking branchが設定される。

- [x] **Step 2: draft PRを作成する**

Run: `gh pr create --draft --base main --head codex/analytics-dashboard --title "feat: add sumo analytics dashboard" --body "大相撲アナリティクス、トップページの「場所を掘る」カード、正規URL、サイトマップ、回帰テストを追加します。"`

Expected: `dai/o-sumo` のPR URLが返る。
