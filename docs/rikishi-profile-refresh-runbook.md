# 力士プロフィール 場所ごと更新 Runbook

場所ごと（番付更新タイミング）に、静的 API と自前プロフィール画面で使う力士プロフィール JSON を更新する手順です。

## 手順

1. `main` を最新化します。

```bash
git pull --ff-only origin main
```

2. 力士プロフィールを再生成します。

```bash
python scripts/update_sumo_data.py --rikishi-only
```

3. 生成結果を確認します。

```bash
git diff -- public/api/v1/rikishi.json public/api/v1/rikishi
```

4. 代表 ID の個別 JSON に以下が入っていることを確認します。

- `name`
- `yomi`
- `currentRank`
- `birthDate`
- `height`
- `weight`
- `shusshin`
- `debut`
- `sourceUrl`
- `updatedAt`

5. アプリ検証を実行します。

```bash
npm run typecheck
npm test
npm run build
```

6. ローカルプレビューで代表ページを確認します。

```bash
npm run preview -- --host 127.0.0.1
```

確認先:

- `http://127.0.0.1:4173/rikishi`
- `http://127.0.0.1:4173/rikishi/3842`
- `http://127.0.0.1:4173/202605-banduke`
- `http://127.0.0.1:4173/20260510-torikumi`

## 注意

- `--profile-limit` は取得テスト用です。公開用更新では使いません。
- 個別 JSON のフィールド追加は API v1 の後方互換変更として扱います。既存フィールドは削除・リネームしません。
- 協会プロフィールへの外部リンクは `sourceUrl` として保持し、画面上にも明示して残します。
