---
name: sumo
description: Grand Sumo (大相撲) search and data inspection skill using the o-sumo MCP server. Use when searching rikishi, retrieving wrestler profiles and career stats, inspecting banzuke rankings (makuuchi and juryo), checking daily torikumi results, or listing basho archives.
---

# Grand Sumo (大相撲) Skill

This skill provides guidance on using the `o-sumo` MCP tools provided by `https://osada.us/mcp`.

## Available Tools

The following tools are exposed by the `o-sumo` MCP server:

1. **`search_rikishi`**
   - **Purpose**: Search for Grand Sumo rikishi by 四股名 (shikona) or 読み (yomi).
   - **Parameters**:
     - `query` (string, required): Shikona or yomi in Japanese (e.g., `"大の里"`, `"おおのさと"`, `"豊昇龍"`).
   - **Returns**: Up to 20 matching rikishi with `id`, `name`, `yomi`, `currentRank`, `profileUrl`, and `apiUrl`.

2. **`get_rikishi_profile`**
   - **Purpose**: Get detailed personal profile and lifetime career records for a rikishi.
   - **Parameters**:
     - `id` (integer, required): Official numeric ID obtained from `search_rikishi` or `get_banzuke` (e.g. `4227`).
   - **Returns**: Birth date, age, height, weight, birthplace (shusshin), debut basho, career stats (`wins`, `losses`, `draws`), official profile URLs, and photo URL.

3. **`get_banzuke`**
   - **Purpose**: Retrieve official Grand Sumo banzuke (rankings for 幕内 (makuuchi) and 十両 (juryo) divisions).
   - **Parameters**:
     - `monthKey` (string, optional): Tournament year and month in `YYYYMM` format (e.g. `"202609"`). If omitted, retrieves the latest basho.
   - **Returns**: Year, basho name, updated timestamp, and division lists with East/West wrestlers, their wins/losses/draws, star results per day (`results`), and official profile URLs.

4. **`get_torikumi`**
   - **Purpose**: Get daily bout matchups (torikumi) or results for a specific day.
   - **Parameters**:
     - `pathDate` (string, required): Date in `YYYYMMDD` format (e.g. `"20260927"`).
     - `mode` (string, optional, default `"result"`): `"result"` for completed matches or `"schedule"` for upcoming bouts.
   - **Returns**: Matchups for the given day with bout results and participating rikishi.

5. **`list_basho`**
   - **Purpose**: List available current and archived Grand Sumo tournaments in the database.
   - **Parameters**: None.
   - **Returns**: Current tournament metadata and a list of archived basho with their IDs (`YYYYMM`), names, and URL endpoints.

## Best Practices & Workflows

### 1. Looking Up Rikishi Information
1. When asked about a specific wrestler (e.g., "大の里の戦績は？"), first invoke `search_rikishi` with their name or reading.
2. From the search results, pick the corresponding `id`.
3. Call `get_rikishi_profile` with the `id` to obtain their complete stats, height/weight, birthplace, and career record.
4. Present the response with clear formatting (e.g., 四股名、最高位/現役番付、所属・出身地、身長・体重、通算成績).

### 2. Checking Current or Past Banzuke (番付)
1. If the user asks for a specific tournament (e.g., "2026年9月場所の番付"), format the month key as `202609` and call `get_banzuke(monthKey: "202609")`.
2. If the user asks for the latest/current banzuke, call `get_banzuke()` without arguments, or call `list_basho` first to confirm the current basho ID.
3. Organize the output cleanly, highlighting the top San'yaku ranks (横綱, 大関, 関脇, 小結) followed by 前頭 and 十両 as requested.

### 3. Checking Daily Match Results (取組結果)
1. For match results of a specific day, identify the date `YYYYMMDD` and call `get_torikumi(pathDate: "YYYYMMDD", mode: "result")`.
2. Format the matchups clearly, showing winner, loser, and kimarite (決まり手) if available.
