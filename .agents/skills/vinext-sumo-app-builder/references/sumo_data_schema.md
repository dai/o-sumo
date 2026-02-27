# Sumo Data Schema

大相撲情報サイトで使用する力士データと番付グループの型定義です。

## Rikishi (力士)
力士一人一人の情報を保持するインターフェースです。

```typescript
export interface Rikishi {
  name: string;        // 四股名 (例: "豊昇龍")
  yomi: string;        // 読み仮名 (例: "ほうしょうりゅう")
  rank: string;        // 番付 (例: "横綱", "前頭筆頭")
  side: 'east' | 'west'; // 東西
  wins?: number;       // 勝数 (オプション)
  losses?: number;     // 敗数 (オプション)
  draws?: number;      // 休場数 (オプション)
}
```

## RankGroup (番付グループ)
特定の番付（例：横綱、大関）における東西の力士をまとめるインターフェースです。

```typescript
export interface RankGroup {
  title: string;       // 番付の名称 (例: "横綱")
  east: Rikishi[];     // 東の力士リスト
  west: Rikishi[];     // 西の力士リスト
}
```

## データ作成のベストプラクティス
- `yomi` はすべてひらがなで記述してください。
- `rank` は「横綱」「大関」「関脇」「小結」「前頭[数字]枚目」の形式を推奨します。
- `side` は必ず 'east' または 'west' を指定してください。
