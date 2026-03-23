# Field Map (o-sumo API v1)

## `/api/v1/banzuke.json`

- `bashoName: string`
- `year: string`
- `updatedAt: YYYY-MM-DD`
- `makuuchi: RankGroup[]`
- `juryo: RankGroup[]`

`RankGroup`:

- `title: string`
- `east: Rikishi[]`
- `west: Rikishi[]`

`Rikishi`:

- `id: number`
- `name: string`
- `yomi: string`
- `rank: string`
- `side: "east" | "west"`
- `wins/losses/draws: number`
- `results: ("win" | "loss" | "draw")[]`
- `profileUrl: string`
- `memo: string`

## `/api/v1/torikumi.json`

- `bashoName: string`
- `year: string`
- `updatedAt: YYYY-MM-DD`
- `resultUpdatedAt: YYYY-MM-DD`
- `scheduleUpdatedAt: YYYY-MM-DD`
- `today: { makuuchi: DivisionCard, juryo: DivisionCard }`
- `tomorrow: { makuuchi: DivisionCard, juryo: DivisionCard }`
- `resultDays: DayArchive[]`
- `scheduleDays: DayArchive[]`

`DivisionCard`:

- `day: number`
- `dayName: string`
- `dayHead: string`
- `division: string`
- `matches: Match[]`

`Match`:

- `division: string`
- `boutNo: number`
- `eastName/eastYomi/eastEnglish/eastRank/eastProfileUrl`
- `westName/westYomi/westEnglish/westRank/westProfileUrl`
- `kimarite: string`
- `winner: "east" | "west" | null`

`DayArchive`:

- `day: number`
- `isoDate: YYYY-MM-DD`
- `pathDate: YYYYMMDD`
- `label: string`
- `dayHead: string`
- `status: "published" | "pending"`
- `statusMessage: string | null`
- `data: { makuuchi: DivisionCard, juryo: DivisionCard }`
