# o-sumo for ChatGPT

[日本語](#日本語) · [English](#english)

## 日本語

### カスタムMCPサーバー

対応するワークスペースで追加権限がある場合は、ChatGPT Webの「Plugins」→「＋」→「Add custom MCP server」を開きます。名前は `o-sumo`、接続先は `https://osada.us/mcp`、認証はなしに設定します。プラグインとして作成したら、新しいチャットで `@` から選択し、力士や取組を質問します。ChatGPTからのツール呼び出しは実機未確認です。[ChatGPTのカスタムMCP接続手順](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt)

### GPT Actionsの作成用テンプレート

[`openapi.yaml`](./openapi.yaml) と[指示文](./gpt_instructions.md)は、GPT Actionsを利用できる既存のGPT向けの設定例です。現在の番付とID指定の力士プロフィールを取得するJSON APIと、検証用のMCP呼び出しを含みます。MCP呼び出しはChatGPT Actionsでの動作が未確認です。公開する場合のプライバシーポリシーURLは `https://osada.us/privacy/` です。[GPT Actionsの設定手順](https://help.openai.com/en/articles/9442513-configuring-actions-in-gpts) · [ほかのクライアント](../README.md#日本語)

## English

### Custom MCP server

If your workspace supports custom MCP connections and you have permission to add one, open **Plugins → + → Add custom MCP server** in ChatGPT on the web. Enter `o-sumo` as the name, `https://osada.us/mcp` as the connection URL, and choose no authentication. Create the plugin, then select it with `@` in a new chat to ask about a wrestler or a bout. Calls from ChatGPT have yet to be verified in the client. [ChatGPT custom MCP setup](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt)

### GPT Actions template

The [OpenAPI template](./openapi.yaml) and [sample instructions](./gpt_instructions.md) are for existing GPTs where Actions are available. The template includes JSON API calls for the current banzuke and a rikishi profile by ID, plus an experimental MCP call that has yet to be verified in ChatGPT Actions. Use `https://osada.us/privacy/` as the privacy policy URL if you publish the GPT. [GPT Actions setup](https://help.openai.com/en/articles/9442513-configuring-actions-in-gpts) · [Other clients](../README.md#english)
