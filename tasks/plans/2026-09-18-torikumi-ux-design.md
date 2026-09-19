# 設計: 取組予定ページのスティッキ手動更新とスクロール位置保持

更新日: 2026-09-18 JST
対象ブランチ: `feat/add-20260919`(本日 push 済み、未着手)

## 1. Task

本場所の即応観戦ツールとしての o-sumo(`https://osada.us/`) において、次の 2 つを一体で設計する。

1. 取組予定/結果日別ページに**スティッキの手動更新ボタン**を設置する。
2. 手動更新ボタン押下後に**スクロール位置を元のまま維持**する。

ニュースフィード、外部記事ディープリンク、ホームの「只今の速報」相当 UI 変更は本設計のスコープ外。ホーム既存ライブ取組リンク(`app/page.tsx:263-305` の `buildLiveTorikumiTarget`)はそのまま流用し、取組予定/結果画面で手動更新とスクロール保持が快適に動作することを到達点とする。

## 2. Context

### 既存資産と運用前提

- ホスティング: Vite + React Router SPA on Cloudflare Pages(PWA `registerType: "autoUpdate"`、ISR なし、webhook トリガー再デプロイ不可)
- 配信キャッシュ: `public/_headers` で SPA ルートは `Cache-Control: public, max-age=60, must-revalidate`、`sw.js` は `max-age=0, must-revalidate`(`/api/*` は SW NetworkFirst、3s timeout、maxAgeSeconds=900)
- 自動更新: JST 15:00–17:57 で 3 分間隔の result 自動 push(`realtime-torikumi-direct-update.yml`)、JST 09–19 で 2 時間おきの news 更新(`news-feed-update.yml`)。README 記載で「10 分以内の反映を保証しない」
- したがって **「コア時間に自動更新」は cron 側で既に成立**しており、本設計はそれを補完する**手動更新 + スクロール位置保持**にフォーカスする

### 取組予定ページの構造

- ハブ: `/{monthKey}-yotei/`(`app/torikumi/page.tsx`)
- 日別: `/{YYYYMMDD}-yotei/`(`app/components/TorikumiDayPage.tsx`)
- データソース: ビルド時に TS モジュールとして静的 import(`app/lib/torikumi-data.ts`)+ `public/api/v1/torikumi.json` ミラー
- 既存アンカー: `#bout-makuuchi-{n}` / `#bout-juryo-{n}`(`TorikumiDayPage.tsx:194,206,340,352`)
- ライブ判定ロジック: `app/page.tsx:27-29` に `LIVE_START_MINUTES=13*60`、`MAKUUCHI_START_MINUTES=15*60+30`、`LIVE_END_MINUTES=18*60`、`nearestTorikumiAnchor(dayData, jstMinutes)`(`app/page.tsx:220-248`)、`buildLiveTorikumiTarget(archive, data)`(`app/page.tsx:263-305`)
- ハッシュジャンプ実装: `app/components/ScrollToHash.tsx`(最大 12 回 `requestAnimationFrame` リトライ + `element.scrollIntoView`)、`app/components/HashPreservingRedirect.tsx`

### ホーム「只今の取組」リンクとの関係

- 既存実装 `buildLiveTorikumiTarget(archive, data)`(`app/page.tsx:263-305`)が `${getDayPath(resultDay,'result')}#${anchor}` を組み立て、`ScrollToHash` がそのアンカーにスクロールする
- 本設計は**この既存ホーム導線に変更を加えない**。ホームから飛んだ先の日別ページで、本設計の手動更新とスクロール保持が正しく動作することを保証する

### 現状課題(ユーザー提示)

- 結果ページで取組を確認した後、新しい取組結果を得る手段が「ページ再読み込み」のみで、スクロール位置が常にトップへ戻る
- cron が遅延・間引きされたケースで、ユーザーが任意のタイミングで最新を取りに行く経路が無い
- ホームの「只今の取組」リンクから飛んだ後、結果確定を取り逃さず追いたい

## 3. Decisions

### D-1: スティッキ手動更新ボタンは `TorikumiDayPage` 内の右下に常時固定

- 配置: 日別ページ `TorikumiDayPage` の右下、`position: sticky; bottom: env(safe-area-inset-bottom, 0)`、モバイルではセーフエリア考慮
- デザイン: Digital Washi(0px 角、No-Line、Ink & Gold)準拠。相撲の「木札」モチーフの矩形ボタンで、ラベルは `最新に更新`(オープン質問 Q-1 でユーザー確定)、更新中はスピナー表示
- 国際化キー: `src/locales/ja/common.json` / `src/locales/en/common.json` に `torikumi.manualRefresh` を追加
- アクセシビリティ: `aria-label`、`disabled` の押下中制御、`prefers-reduced-motion` でスピナーを静的表示に切替

### D-2: 手動更新は `/api/v1/torikumi.json` を SW バイパスで再取得して state を部分更新

- データソースの二重性: バンドル TS(`app/lib/torikumi-data.ts`)はビルド時固定、`/api/v1/torikumi.json` は最新(CDN edge 60s キャッシュ)
- 戦略: `fetch('/api/v1/torikumi.json', { cache: 'no-store' })` で SW を経由せず直接ネットワーク取得。`TorikumiDataSet` 単位で state を差し替え、`useState` フックで保持
- 既存の SW NetworkFirst は触らない(`/api/*` の NetworkFirst は他 API にも影響するため、ボタン押下のこの経路だけ bypass する)
- 失敗時: トーストで「更新に失敗しました(直近データ表示中)」、既存 state は維持
- 成功時: `window.dispatchEvent(new CustomEvent('osumo:torikumi-updated'))` を発火、`use-scroll-restore` フックが購読してスクロール復元を実行
- 同一性判定: レスポンスの `updatedAt`(`scheduleUpdatedAt` / `resultUpdatedAt` 含む)を前回値と比較し、不変なら「最新です」表示で no-op

### D-3: スクロール位置保持は「アンカー相対」で復元

- 保存: ボタン押下時に `window.scrollY` を sessionStorage(`osumo:torikumi-scroll:{pathname}`)に退避。同時にそのスクロール位置に最も近い `#bout-*` アンカーの ID を `getBoundingClientRect()` で計算して第二キーとする
- 復元: 新 state 反映後の `useLayoutEffect` で
  - 第一優先: URL hash が指定されていれば `ScrollToHash` 経由で当該アンカーへジャンプ(ホーム「只今の取組」からの流入時)
  - 第二優先: sessionStorage の絶対位置を `window.scrollTo` で復元
  - 第三優先: 第二キー(最も近い bout アンカー)に `ScrollToHash` でスナップ
- 既存の `ScrollToHash.tsx`(`requestAnimationFrame` 最大 12 回のリトライ + `scrollIntoView`)を再利用
- 退避キーのクリア: 別日ナビ押下時、または復元完了後 1 秒経過時

### D-4: 既存 cron との関係

- 本設計は cron 3 分間隔更新を**置き換えではなく補完**する
- ユーザーが手動更新を押すケース: ①クロンが遅延・間引きされた直後、②取組結果確定直後で「次の 1 つ」を見たい時、③ネットが不安定で SW NetworkFirst がタイムアウトした時
- 「コア時間に自動更新」は UI レベルで**追加しない**(cron 3 分間隔で十分、UI 自動更新は UX ノイズになる)

## 4. Implementation Roadmap

### Phase 1: 手動更新ボタンとスクロール保持(1 PR)

1. **`app/components/ManualRefreshButton.tsx` を新設**
   - スティッキ配置、`useState` で loading、押下で D-2 の fetch を実行
   - `osumo:torikumi-updated` イベントを発火
2. **`app/lib/use-scroll-restore.ts` を新設**
   - 押下時に `window.scrollY` + 最近接アンカー ID を sessionStorage に退避
   - カスタムイベント購読で D-3 の復元を実行
   - クリーンアップ関数で退避キーをクリア
3. **`TorikumiDayPage.tsx` への組み込み**
   - 画面右下に `<ManualRefreshButton />` を配置
   - 初回マウント時はバンドル TS のデータで描画(オープン質問 Q-3 でユーザー確定: 自動 fetch は行わず、ボタン押下時のみネットワーク取得)
   - `use-scroll-restore` を画面ルートで有効化
4. **i18n 追加**: `src/locales/ja/common.json` / `src/locales/en/common.json` に `torikumi.manualRefresh` / `torikumi.refreshFailed` / `torikumi.upToDate` を追加
5. **テスト**:
   - `app/components/__tests__/ManualRefreshButton.test.tsx` 新設(押下 → fetch 発火、loading 表示、フォールバック動作)
   - `app/lib/__tests__/use-scroll-restore.test.ts` 新設(退避・復元・クリア)
   - `TorikumiDayPage.test.tsx` にボタン表示と state 初期化の回帰ケース追加

## 5. Relevant Files

- 新規:
  - `app/components/ManualRefreshButton.tsx` — スティッキ手動更新ボタン
  - `app/components/__tests__/ManualRefreshButton.test.tsx`
  - `app/lib/use-scroll-restore.ts` — スクロール位置保持フック
  - `app/lib/__tests__/use-scroll-restore.test.ts`
- 変更:
  - `app/components/TorikumiDayPage.tsx` — ボタン配置 + state 切替 + `use-scroll-restore` 組込
  - `app/components/__tests__/TorikumiDayPage.test.tsx` — 回帰テスト追加
  - `src/locales/ja/common.json` / `src/locales/en/common.json` — i18n キー追加
- 既存参照(変更なし):
  - `app/page.tsx:27-29` — `LIVE_START_MINUTES` 等の定義
  - `app/page.tsx:220-305` — `nearestTorikumiAnchor` / `buildLiveTorikumiTarget`(ホーム「只今の取組」リンク、本設計では変更しない)
  - `app/lib/rikishi-display.ts:15-17` — `divisionAnchorId`
  - `app/components/ScrollToHash.tsx` — ハッシュジャンプ実装(再利用)
  - `app/components/HashPreservingRedirect.tsx` — リダイレクト時の hash 保持
  - `app/lib/torikumi-data.ts:1-59` — 型定義
  - `public/_headers` — キャッシュ設定(変更なし)
  - `vite.config.ts:158-176` — SW NetworkFirst 設定(変更なし)

## 6. Constraints & Invariants

1. **デジタル和紙(Digital Washi)遵守**: 0px 角丸、No-Line Rule、Ink & Gold。新設ボタンも例外なし
2. **既存テスト 68 ファイル / 468 ケース全パスを維持**(Phase 1 完了時に `npm test` 成功)
3. **URL 構造の不変**: `/{monthKey}-yotei/`、`/{YYYYMMDD}-yotei/`、`#bout-*` アンカー、trailing slash 正規化
4. **既存 cron を変更しない**: JST 15–18 の 3 分間隔 result 更新、09–19 の 2 時間おき news 更新を**そのまま維持**。本設計は UI 層の補完であり、配信パイプラインには触れない
5. **SW キャッシュ戦略の変更禁止**: `vite.config.ts` の PWA Workbox 設定(`/api/*` の NetworkFirst 3s timeout)を**変更しない**。手動更新ボタンだけ `cache: 'no-store'` で SW を bypass する
6. **ホーム「只今の取組」リンクを変更しない**: `app/page.tsx:263-305` の `buildLiveTorikumiTarget` を**そのまま使う**。`NewsSection` も触らない
7. **ISR / webhook 再デプロイ不可**: 反映は git commit → main push → CF Pages auto-deploy のみ。本設計は配信経路に依存しない
8. **多言語(日英)対応**: 新設テキストは `src/locales/ja/common.json` と `src/locales/en/common.json` の双方に追加

## 7. Acceptance Criteria

### Phase 1

- [ ] 取組予定/結果日別ページに手動更新ボタンが右下に表示され、`position: sticky` で常時視認可能
- [ ] ボタン押下で `/api/v1/torikumi.json` を再取得し、データが新しければ画面が更新される
- [ ] 同じ内容の場合は「最新です」等の no-op 表示が出て無駄な再レンダーが起きない
- [ ] 更新中にスピナーまたはラベル変化が表示され、押下中の二重押下が防止される
- [ ] 更新後にスクロール位置が維持される(セッション内のページ遷移を挟まないケースで `window.scrollY` が ±5px 以内に復元)
- [ ] ホーム「只今の取組」リンクから該当アンカー付きで流入したケースで、そのアンカーが保持される
- [ ] 更新失敗時はトースト等で通知され、既存データは維持される
- [ ] フェッチ時の SW バイパス(`cache: 'no-store'`)が Workbox 設定に影響しないこと(`/api/*` の NetworkFirst は他の API では従来通り)
- [ ] `npm test` / `npm run typecheck` / `npm run build` がパス
- [ ] 新設テキストが日英両方の i18n に登録されている

## 8. リスクとオープン質問

### リスク

- **R-1**: `/api/v1/torikumi.json` の CDN キャッシュ(`max-age=60`)により、cron push 直後の 60 秒間は同じ内容が返る可能性がある。SW bypass でも CDN edge のキャッシュは残る。許容可能か?(現実的には 60 秒の遅延は体感できない)
- **R-2**: `window.scrollY` の復元は、viewport 高さ・デバイスピクセル比に依存する。複数端末・複数セッションで一貫性が崩れるリスク。→ 第三優先で bout アンカーにスナップする設計で緩和
- **R-3**: (Q-3 で解消済み) 押下時のみ fetch の方針のため、初回マウント時のチラつきは発生しない。バンドル TS と API JSON のスキーマ不一致リスクは残るので、`useEffect` 内では型ガードを必ず入れる

### ユーザー確定事項(2026-09-18 レビュー反映)

- **D-Q1**: ボタンラベルは `最新に更新`
- **D-Q2**: スクロール位置の復元精度は `±5px 以内` で十分とする(これより高精度は求めない)
- **D-Q3**: 初回マウント時の API fetch は行わず、**ボタン押下時のみ**ネットワーク取得する(チラつき回避)

## 9. 参考リンク

- 既存設計ハンドオフ: `tasks/plans/2026-09-ux-redesign-handoff.md`
- 9 月場所運用ハンドオフ: `tasks/plans/2026-09-05-september-torikumi-actions-handoff.md`
- Digital Washi 仕様: `DESIGN.md`
- 開発運用ドキュメント: `DEVELOPMENT.md`
- 本番 API: `https://osada.us/api/v1/torikumi.json`
- ホーム「只今の取組」リンク実装: `app/page.tsx:263-305`