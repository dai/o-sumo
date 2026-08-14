# o-sumo 運用ロードマップ（2026年8月）

## 完了: 七月場所の締めとアーカイブ化

- [x] 確定した七月場所（`202607`）の取組・番付を不変TypeScriptスナップショットとして保存
- [x] 七月を current の公開JSON/API/UI月に保ちつつ、七月・五月・三月を newest-first のアーカイブとして提供
- [x] 月別ルート、metadata、sitemapがcurrent/archiveの重複URLを作らないことを検証
- [x] 取組系workflowを `workflow_dispatch` のみにし、ニュース更新だけを定期実行として維持

## 次のPR: 九月場所の公式番付公開後

- [ ] 日本相撲協会の九月場所番付と取組日程が公開されたことを確認する
- [ ] 生成器を実行して現行番付・取組・公開JSONを新しい場所へ同時に更新する
- [ ] 新しい場所の型・JSON・15日分の日付・月別ルート・metadata・sitemapを検証する
- [ ] 七月スナップショットと過去アーカイブの不変性を回帰テストで確認する

## 開場前の復帰条件

- [ ] 公式番付、初日、取組日程、公開JSONの `bashoName` / `year` / 月キーが一致する
- [ ] 番付、取組、日別ページ、WebMCP、Markdown view、redirect、header、metadata、sitemapを検証する
- [ ] `daily-data-update.yml` と `realtime-torikumi-direct-update.yml` のscheduleを復元し、終了告知を通常表示へ戻す
- [ ] `npm run typecheck`、`npm test`、`npm run build`、`git diff --check` を通す

## 継続運用

- ニュースworkflowは休止期間中も定期更新を継続し、内容差分がないときは `news.json` を更新しない。
- 新しい公開API schemaや月別JSON endpointは追加せず、既存の `/api/v1/banzuke.json` と `/api/v1/torikumi.json` の互換性を維持する。
