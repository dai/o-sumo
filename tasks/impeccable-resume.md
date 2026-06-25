# impeccable セッション再開メモ（2026-06-25 中断時点）

VS Code でこのプロジェクトを開き、Claude Code でそのまま `/impeccable` を実行すれば、`PRODUCT.md` と `DESIGN.md` は自動で読み込まれ、続きから作業できます。

## キャプチャ済みのコンテキスト

| ファイル | 内容 |
|---|---|
| `PRODUCT.md` | register = product、人格 = 静謐・伝統・緊張、Anti-refs = アニメ・萌え・派手色 + SaaS デフォルト + AI デフォルト |
| `DESIGN.md` | "The Digital Washi"（既存、明系統）+ `DESIGN-Ronin.md`（暗系統）。両系統は別ファイル |
| `.impeccable/live/config.json` | Vite/React 用に構成済み。`files: ["index.html"]` / `insertBefore: "</body>"` / `cspChecked: true` |
| `.impeccable/config.local.json` | hook consent = accepted（検出 hook 有効） |

## このセッションで完了した作業

`/impeccable quieter` を `globals.css` と 3 ページ CSS に対して実行し、detector が指摘した absolute ban（gradient text / side-stripe border）を全件除去:

| ファイル | 修正内容 |
|---|---|
| `app/globals.css` | h1 グラデテキスト除去 / `.east`/`.west` の 6px 左ストライプ削除 / `.rank-badge` の `border-radius: 3px` 削除 / mobile h1 2.5rem → 2rem |
| `app/index.css` | `.hero-section h2` のグラデテキスト除去 / `.feature-card::before` の隠し 4px ゴールド縦帯削除 |
| `app/archives/page.css` | `.archive-item` の `border-left: 4px solid` 削除 |
| `app/torikumi/page.css` | `.division-section` の `border-left: 4px solid` 削除（h2 `::before` の 8px マーカーが視覚識別を維持） |

検証:

- `node .claude/skills/impeccable/scripts/detect.mjs --json "app/**/*.css"` → `[]`（8 CSS ファイル全てクリーン）
- typecheck pass、テスト 65/65 pass

## デザイン原則の参照

DESIGN.md が最重要。和の "静謐・伝統・緊張" に整合する実装原則:

- **No-Line Rule**: 1px solid borders for sectioning 禁止
- **0px border-radius**: グローバルで強制（`* { border-radius: 0; }`）
- **Ma 優先**: 詰まったら要素を減らす。狭めない
- **墨と紙と金**: パレットは Ink / Paper / Gold（または Midnight / Neon）に固定
- **グラデテキスト禁止**: `background-clip: text` + gradient は不可。`globals.css` の h1 と `index.css` の `.hero-section h2` から除去済み
- **サイドストライプ禁止**: `border-left/right` > 1px の色アクセントは不可。`.east` / `.west` / `.archive-item` / `.division-section` から除去済み

## VS Code での再開手順

### 1. 開発環境

```powershell
# PowerShell で node の PATH を通す（C:\nvm4w\nodejs\node がインストール先）
$env:Path = "C:\nvm4w\nodejs;" + $env:Path

# プロジェクトディレクトリへ
cd C:\dai\GitHub\o-sumo

# 開発サーバー（バックグラウンドで OK）
npm run dev
# → http://localhost:3001/
```

### 2. Claude Code

VS Code の Claude Code 拡張を開き、このセッションの続きの意図を伝えます。例:

```
/impeccable
```

`/impeccable` を引数なしで実行すると、メニューがコンテキスト依存で出ます。前回の推奨（critique / audit / document のいずれか）を続けるか、新しい指示を渡してください。

### 3. Live mode を続ける場合

ブラウザで `http://localhost:3001/` を開き、要素をピックして variant を生成したい場合は:

```powershell
$env:Path = "C:\nvm4w\nodejs;" + $env:Path
cd C:\dai\GitHub\o-sumo
node .claude/skills/impeccable/scripts/live.mjs
# → serverPort: 8400、pageFiles: ["index.html"] が返る
```

そして Claude Code 側で:

```
/impeccable live
```

これで前回の Live helper 状態（PRODUCT.md + DESIGN.md ロード済み）から即時再開できます。**ただし live-poll は前回のセッションで終了しているため、新しいポーリングループを開始する必要があります。**

## 推奨される次の 3 コマンド

1. **`/impeccable critique home`** — ホームの UX ヒューリスティック採点レビュー
2. **`/impeccable audit`** — a11y / パフォーマンス / レスポンシブの技術チェック（`prefers-reduced-motion` の有無、`lang` 属性、フォーカス順序、`-webkit-text-fill-color` 削除後のスクリーンリーダー影響など）
3. **`/impeccable document`** — DESIGN.md と DESIGN-Ronin.md を Stitch フォーマットで 1 ファイルに統合

## バックグラウンドプロセス

中断時点で稼働中だったもの（VS Code で再開時に手動で立ち上げ直しが必要）:

- Vite dev サーバー: タスク ID `bhaszy3g6`、ポート 3001、`npm run dev` で再起動
- Live poll: タスク ID `b2imw5ttk`、10 分タイムアウト済み（再開時は新しい `live.mjs` から）

## 編集ファイル一覧（git diff 対象）

```
modified:   app/globals.css
modified:   app/index.css
modified:   app/archives/page.css
modified:   app/torikumi/page.css
new file:   PRODUCT.md
new file:   tasks/impeccable-resume.md
new file:   .impeccable/live/config.json
```

必要なら `git add -A && git commit -m "chore: quieter pass on 4 CSS files + product context"` でコミットできます。