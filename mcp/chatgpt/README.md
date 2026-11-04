# ChatGPT (GPT Store / Custom GPT) 連携ガイド / ChatGPT Integration Guide

[日本語](#日本語) | [English](#english)

---

<a id="日本語"></a>
## 日本語

### 概要
OpenAI の ChatGPT（GPT Store / Custom GPTs）で「大相撲アーカイブ」を利用可能にするための設定ガイドです。
GPT Store で一般公開することで、他のユーザーは URL を開くだけでインストールや設定不要で大相撲データを検索できるようになります。

### 作成手順

#### 1. Custom GPT の作成画面を開く
1. [chatgpt.com](https://chatgpt.com) にログインします。
2. 左サイドバーの「Explore GPTs（GPT を探す）」をクリックし、右上の「+ Create（作成する）」を選択します。
3. 「Configure（設定）」タブを開きます。

#### 2. 基本情報の設定
- **Name**: `大相撲アーカイブ (Grand Sumo Guide)`
- **Description**: `力士のプロフィール照会、幕内・十両番付、星取表、日別取組結果を案内する大相撲アシスタント。`
- **Instructions**: 同階層の [`gpt_instructions.md`](./gpt_instructions.md) 内の指示文を貼り付けます。
- **Conversation starters**:
  - `大の里のプロフィールと通算戦績を教えて`
  - `最新の幕内・十両の番付（ばんづけ）を見せて`
  - `直近の場所の取組結果を教えて`

#### 3. Actions（アクション）の設定
1. 下部の「Actions」セクションで「Create new action（新しいアクションを作成）」をクリックします。
2. **Schema** 欄に、同階層の [`openapi.yaml`](./openapi.yaml) の内容をそのまま貼り付けます。
3. **Authentication**: `None` を選択します。
4. **Privacy Policy**: サービスのプライバシーポリシー URL（例: `https://osada.us/`）を入力します。

#### 4. テストと公開
1. プレビュー画面で「大の里について教えて」と入力し、Actions が正常に呼び出されることを確認します。
2. 右上の「Save / Publish（保存・公開）」をクリックし、「Anyone with a link（リンクを知っている全員）」または「Public（GPT Store に公開）」を選択して公開します。
3. 発行された URL を消費者に配布すれば、ワンクリックで利用可能になります。

---

<a id="english"></a>
## English

### Overview
This guide explains how to build and publish a "Grand Sumo Guide" Custom GPT for OpenAI's ChatGPT and the GPT Store.
Once published, end users can access the assistant simply by visiting the shared link—no local installation or technical configuration required.

### Setup Instructions

#### 1. Open Custom GPT Creator
1. Sign in to [chatgpt.com](https://chatgpt.com).
2. Click **Explore GPTs** in the sidebar, then click **+ Create** in the top right.
3. Switch to the **Configure** tab.

#### 2. Configure Basic Profile
- **Name**: `Grand Sumo Guide (大相撲アーカイブ)`
- **Description**: `Official Grand Sumo assistant for looking up rikishi profiles, banzuke rankings, daily torikumi results, and tournament records.`
- **Instructions**: Copy and paste the instructions from [`gpt_instructions.md`](./gpt_instructions.md).
- **Conversation starters**:
  - `Tell me about Onosato's profile and career record`
  - `Show the latest Makuuchi and Juryo banzuke rankings`
  - `What are the match results for the recent basho?`

#### 3. Add Actions
1. In the **Actions** section at the bottom, click **Create new action**.
2. In the **Schema** field, paste the contents of [`openapi.yaml`](./openapi.yaml).
3. **Authentication**: Select `None`.
4. **Privacy Policy**: Enter the service privacy policy URL (e.g. `https://osada.us/`).

#### 4. Test & Publish
1. Test by sending a prompt like "Tell me about Onosato" in the preview pane and ensure the action runs successfully.
2. Click **Save / Publish** in the upper right, choose **Anyone with a link** or **Public** (for GPT Store listing), and save.
3. Share the generated link with consumers for instant one-click access.
