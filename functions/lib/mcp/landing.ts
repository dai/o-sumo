import { MCP_SERVER_DESCRIPTION, MCP_SERVER_TITLE } from './server-card';

export function renderMcpLandingHtml(): string {
  const endpointUrl = 'https://osada.us/mcp';
  const serverCardUrl = 'https://osada.us/mcp/server-card';

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#1a3a52">
  <meta name="description" content="o-sumo の公開 MCP サーバー。大相撲の番付、日別取組結果、力士名鑑を AI アシスタント（Claude、ChatGPT、Cursor、Muse等）から取得できます。認証不要・読み取り専用。">
  <meta property="og:title" content="o-sumo MCP サーバー | 大相撲アーカイブ">
  <meta property="og:description" content="大相撲の公式番付・取組結果・力士プロフィールをAIエージェントに提供する公開 MCP サーバー。">
  <meta property="og:url" content="${endpointUrl}">
  <meta property="og:image" content="https://osada.us/images/og-default.jpg">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="o-sumo">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="o-sumo MCP サーバー | 大相撲アーカイブ">
  <meta name="twitter:description" content="大相撲の公式番付・取組結果・力士プロフィールをAIエージェントに提供する公開 MCP サーバー。">
  <title>o-sumo MCP サーバー | 大相撲アーカイブ</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700;8..60,800&display=swap">
  <script>
    (function () {
      var theme = 'light';
      try {
        var stored = localStorage.getItem('o-sumo-theme');
        if (stored === 'light' || stored === 'dark') theme = stored;
        else if (window.matchMedia('(prefers-color-scheme: dark)').matches) theme = 'dark';
      } catch (e) {}
      document.documentElement.setAttribute('data-theme', theme);
      var themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.setAttribute('content', theme === 'dark' ? '#111319' : '#1a3a52');
    })();
  </script>
  <style>
    :root {
      --ink: #1a1a1a;
      --surface: #fdfaf5;
      --surface-container: #f5f2eb;
      --surface-card: #ffffff;
      --primary: #1d3a5f;
      --secondary: #735c00;
      --secondary-gold: #fed65b;
      --accent: #c2410c;
      --muted: #5f6368;
      --border-subtle: rgba(208, 197, 175, 0.4);
      --header-bg: #14171f;
      --header-text: #f5efde;
      --code-bg: #f4f3ee;
      --code-color: #1a1a1a;
      --tag-bg: #ece8dc;
      --tag-text: #4a453e;
      --shadow-soft: 0 4px 20px rgba(0, 0, 0, 0.04);
      --texture: url("data:image/svg+xml,%3Csvg width='96' height='96' viewBox='0 0 96 96' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 18h96M0 42h96M0 66h96M0 90h96' stroke='%23b58b5f' stroke-opacity='.14' stroke-width='1'/%3E%3Cpath d='M8 0v96M40 0v96M72 0v96' stroke='%231a1a1a' stroke-opacity='.035' stroke-width='1'/%3E%3C/svg%3E");
    }

    [data-theme='dark'] {
      --ink: #c1c6d9;
      --surface: #111319;
      --surface-container: #191c24;
      --surface-card: #1f232e;
      --primary: #c1c6d9;
      --secondary: #fed65b;
      --secondary-gold: #fed65b;
      --accent: #ff8a65;
      --muted: #97a1bc;
      --border-subtle: rgba(193, 198, 217, 0.15);
      --header-bg: #0b0c10;
      --header-text: #f5efde;
      --code-bg: #161820;
      --code-color: #e2e8f0;
      --tag-bg: #272c3a;
      --tag-text: #cbd5e1;
      --shadow-soft: 0 4px 20px rgba(0, 0, 0, 0.25);
      --texture: none;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      border-radius: 0;
    }

    html {
      font-size: 16px;
    }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: 'Source Serif 4', 'Shippori Mincho', 'Yu Mincho', 'Hiragino Mincho ProN', serif;
      background-color: var(--surface);
      background-image: var(--texture);
      background-attachment: fixed;
      color: var(--ink);
      line-height: 1.8;
      letter-spacing: 0.02em;
    }

    a {
      color: var(--secondary);
      text-decoration: underline;
      text-underline-offset: 3px;
      transition: opacity 0.2s ease;
    }

    a:hover {
      opacity: 0.8;
    }

    /* Header */
    .mcp-header {
      background-color: var(--header-bg);
      background-image:
        linear-gradient(120deg, rgba(13, 14, 18, 0.92) 0%, rgba(20, 24, 33, 0.88) 100%),
        url('/images/header-bg.jpg');
      background-size: cover;
      background-position: center;
      color: var(--header-text);
      padding: 3.5rem 1.25rem 2.5rem;
      text-align: center;
      position: relative;
      border-bottom: 3px solid #735c00;
    }

    .mcp-nav {
      position: absolute;
      top: 1rem;
      left: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .mcp-nav a {
      color: var(--header-text);
      text-decoration: none;
      font-size: 0.9rem;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      opacity: 0.85;
    }

    .mcp-nav a:hover {
      opacity: 1;
      text-decoration: underline;
    }

    .mcp-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      background: rgba(254, 214, 91, 0.15);
      color: #fed65b;
      border: 1px solid rgba(254, 214, 91, 0.35);
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .mcp-title {
      font-size: clamp(2rem, 5vw, 2.75rem);
      margin: 0 0 0.5rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .mcp-subtitle {
      font-size: clamp(1rem, 2.5vw, 1.15rem);
      color: #cbd5e1;
      max-width: 680px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* Container */
    .mcp-container {
      max-width: 920px;
      margin: 0 auto;
      padding: 2.5rem 1.25rem 4rem;
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }

    /* Section Cards */
    .mcp-section {
      background: var(--surface-card);
      padding: clamp(1.5rem, 3.5vw, 2.25rem);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-soft);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .mcp-section-title {
      font-size: clamp(1.35rem, 3vw, 1.65rem);
      margin: 0;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid var(--secondary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      letter-spacing: 0.03em;
    }

    .mcp-section-desc {
      margin: 0;
      font-size: 0.98rem;
      line-height: 1.8;
    }

    /* Endpoint Box */
    .endpoint-card {
      background: var(--surface-container);
      padding: 1.25rem;
      border-left: 4px solid var(--secondary);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .endpoint-label {
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted);
    }

    .endpoint-input-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .endpoint-input {
      flex: 1 1 300px;
      font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
      font-size: 1rem;
      padding: 0.65rem 0.9rem;
      background: var(--surface-card);
      color: var(--ink);
      border: 1px solid var(--border-subtle);
      outline: none;
    }

    .endpoint-input:focus {
      border-color: var(--primary);
    }

    .copy-btn {
      padding: 0.65rem 1.25rem;
      font-family: 'Source Serif 4', 'Shippori Mincho', serif;
      font-weight: 700;
      font-size: 0.9rem;
      background: #1a1a1a;
      color: #ffffff;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: background 0.2s ease;
      white-space: nowrap;
    }

    [data-theme='dark'] .copy-btn {
      background: #fed65b;
      color: #111319;
    }

    .copy-btn:hover {
      background: #333333;
    }

    [data-theme='dark'] .copy-btn:hover {
      background: #e6c14f;
    }

    .copy-btn.copied {
      background: #2e7d32 !important;
      color: #ffffff !important;
    }

    /* Spec Pill Row */
    .spec-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .spec-pill {
      font-size: 0.8rem;
      padding: 0.2rem 0.6rem;
      background: var(--tag-bg);
      color: var(--tag-text);
      font-weight: 500;
    }

    /* Tool List */
    .tool-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-top: 0.5rem;
    }

    .tool-item {
      background: var(--surface-container);
      padding: 1.1rem 1.25rem;
      border-left: 3px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .tool-item:hover {
      border-left-color: var(--secondary);
    }

    .tool-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tool-name {
      font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--primary);
    }

    [data-theme='dark'] .tool-name {
      color: var(--secondary-gold);
    }

    .tool-desc {
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.6;
    }

    .tool-args {
      font-size: 0.85rem;
      font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
      background: var(--code-bg);
      color: var(--code-color);
      padding: 0.4rem 0.65rem;
      border: 1px dashed var(--border-subtle);
      overflow-x: auto;
    }

    /* Client Setup Grid */
    .client-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
      margin-top: 0.5rem;
    }

    .client-card {
      background: var(--surface-container);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      border: 1px solid var(--border-subtle);
    }

    .client-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--ink);
    }

    .client-desc {
      font-size: 0.88rem;
      margin: 0;
      line-height: 1.6;
      color: var(--ink);
    }

    .code-snippet {
      font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
      font-size: 0.8rem;
      background: var(--code-bg);
      color: var(--code-color);
      padding: 0.6rem 0.75rem;
      overflow-x: auto;
      line-height: 1.5;
      margin: 0;
      border: 1px solid var(--border-subtle);
    }

    /* Links & Footer */
    .mcp-links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
    }

    .mcp-link-btn {
      display: block;
      padding: 0.75rem 1rem;
      background: var(--surface-container);
      border: 1px solid var(--border-subtle);
      text-decoration: none;
      color: var(--ink);
      font-size: 0.9rem;
      font-weight: 600;
      transition: background 0.15s ease, border-color 0.15s ease;
    }

    .mcp-link-btn:hover {
      background: var(--surface-card);
      border-color: var(--secondary);
    }

    .mcp-footer {
      text-align: center;
      font-size: 0.85rem;
      color: var(--muted);
      padding: 2rem 1.25rem;
      border-top: 1px solid var(--border-subtle);
    }

    @media (max-width: 600px) {
      .mcp-header {
        padding: 3rem 1rem 2rem;
      }
      .mcp-nav {
        position: static;
        margin-bottom: 1rem;
        justify-content: center;
      }
      .mcp-container {
        padding: 1.5rem 1rem 3rem;
        gap: 2rem;
      }
      .client-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>

  <header class="mcp-header">
    <div class="mcp-nav">
      <a href="https://osada.us/">← o-sumo トップに戻る</a>
    </div>
    <span class="mcp-badge">Model Context Protocol</span>
    <h1 class="mcp-title">${MCP_SERVER_TITLE}</h1>
    <p class="mcp-subtitle">${MCP_SERVER_DESCRIPTION}</p>
  </header>

  <main class="mcp-container">

    <!-- 1. サーバー概要 -->
    <section class="mcp-section">
      <h2 class="mcp-section-title">サーバー概要</h2>
      <p class="mcp-section-desc">
        <strong>o-sumo MCP サーバー</strong>は、大相撲の最新番付・過去アーカイブ、取組日程と勝敗結果、力士名鑑プロフィールを AI アシスタント（Claude、ChatGPT、Cursor、Muse等）から直接検索・参照できるようにする公開リモート MCP サーバーです。
      </p>
      <div class="spec-badges">
        <span class="spec-pill">✓ 認証不要（APIキーなし）</span>
        <span class="spec-pill">✓ 完全読み取り専用 (Read-Only)</span>
        <span class="spec-pill">✓ Streamable HTTP</span>
        <span class="spec-pill">✓ 幕内・十両・力士名鑑対応</span>
      </div>
    </section>

    <!-- 2. 接続 URL -->
    <section class="mcp-section">
      <h2 class="mcp-section-title">接続 URL</h2>
      <p class="mcp-section-desc">
        お使いの MCP 対応クライアントに以下のエンドポイント URL を登録してください。
      </p>
      <div class="endpoint-card">
        <span class="endpoint-label">Remote MCP Endpoint (Streamable HTTP)</span>
        <div class="endpoint-input-group">
          <input
            id="endpoint-input"
            class="endpoint-input"
            type="text"
            readonly
            value="${endpointUrl}"
            aria-label="MCP Endpoint URL"
            onclick="this.select()"
          />
          <button id="copy-btn" class="copy-btn" type="button" onclick="copyEndpoint()">
            URLをコピー
          </button>
        </div>
      </div>
      <p class="mcp-section-desc" style="font-size: 0.88rem; color: var(--muted); margin: 0;">
        ※ SEP-2127 準拠のサーバーカードは <a href="${serverCardUrl}">${serverCardUrl}</a> で提供されています。
      </p>
    </section>

    <!-- 3. 公開ツール一覧（5点） -->
    <section class="mcp-section">
      <h2 class="mcp-section-title">公開ツール一覧 (5 Tools)</h2>
      <p class="mcp-section-desc">
        AI アシスタントはこのエンドポイントに接続することで、以下の5つのツールを自動的に呼び出すことができます。
      </p>

      <div class="tool-list">
        <!-- 1. search_rikishi -->
        <div class="tool-item">
          <div class="tool-header">
            <span class="tool-name">search_rikishi</span>
            <span class="spec-pill">力士検索</span>
          </div>
          <p class="tool-desc">
            四股名（漢字）または読み仮名（ひらがな・カタカナ）で現役・過去の力士を検索し、力士ID、現在位、プロフィールURLを返します。
          </p>
          <div class="tool-args">引数の例: { "query": "大の里" } または { "query": "おおのさと" }</div>
        </div>

        <!-- 2. get_rikishi_profile -->
        <div class="tool-item">
          <div class="tool-header">
            <span class="tool-name">get_rikishi_profile</span>
            <span class="spec-pill">力士プロフィール</span>
          </div>
          <p class="tool-desc">
            公式力士ID（数値）を指定して、身長、体重、出身地、所属部屋、初土俵、通算勝敗、幕内勝敗などの詳細データを取得します。
          </p>
          <div class="tool-args">引数の例: { "id": 4227 }</div>
        </div>

        <!-- 3. get_banzuke -->
        <div class="tool-item">
          <div class="tool-header">
            <span class="tool-name">get_banzuke</span>
            <span class="spec-pill">番付取得</span>
          </div>
          <p class="tool-desc">
            幕内および十両の公式番付（東・西の格付け・力士名・出身地等）を取得します。場所の指定を省略した場合は最新場所の番付を返します。
          </p>
          <div class="tool-args">引数の例: { "monthKey": "202609" } （省略時は最新場所）</div>
        </div>

        <!-- 4. get_torikumi -->
        <div class="tool-item">
          <div class="tool-header">
            <span class="tool-name">get_torikumi</span>
            <span class="spec-pill">取組結果・日程</span>
          </div>
          <p class="tool-desc">
            指定日付の幕内・十両の取組結果または対戦日程を取得します。勝敗、決まり手、対戦カードが確認できます。
          </p>
          <div class="tool-args">引数の例: { "pathDate": "20260927", "mode": "result" } （modeは "result" または "schedule"）</div>
        </div>

        <!-- 5. list_basho -->
        <div class="tool-item">
          <div class="tool-header">
            <span class="tool-name">list_basho</span>
            <span class="spec-pill">開催場所一覧</span>
          </div>
          <p class="tool-desc">
            現在進行中の最新場所情報および過去アーカイブに収録されている全場所の一覧とリンク先を取得します。
          </p>
          <div class="tool-args">引数の例: {} （引数不要）</div>
        </div>
      </div>
    </section>

    <!-- 4. クライアント別追加手順 -->
    <section class="mcp-section">
      <h2 class="mcp-section-title">クライアント別追加手順</h2>
      <p class="mcp-section-desc">
        各 AI クライアントでの設定例です。接続後は「o-sumo で大の里の最新プロフィールと成績を調べて」のように指示してください。
      </p>

      <div class="client-grid">
        <!-- Claude -->
        <div class="client-card">
          <h3 class="client-title">Claude (Desktop / Web)</h3>
          <p class="client-desc">
            「Customize」→「Connectors」から「Add Connector」を選択。名前を <code>o-sumo</code>、URL に <code>${endpointUrl}</code> を指定し、認証は「No sign in」を選択します。
          </p>
          <p class="client-desc">設定ファイル（<code>claude_desktop_config.json</code>）で設定する場合:</p>
          <pre class="code-snippet"><code>{
  "mcpServers": {
    "o-sumo": {
      "url": "${endpointUrl}"
    }
  }
}</code></pre>
        </div>

        <!-- Claude Code -->
        <div class="client-card">
          <h3 class="client-title">Claude Code</h3>
          <p class="client-desc">
            CLI から以下のコマンドを1行実行するだけで MCP サーバーを追加できます:
          </p>
          <pre class="code-snippet"><code>claude mcp add --transport http osumo ${endpointUrl}</code></pre>
        </div>

        <!-- ChatGPT -->
        <div class="client-card">
          <h3 class="client-title">ChatGPT</h3>
          <p class="client-desc">
            Developer / Plus / Team 向けの設定画面より、カスタム MCP サーバー（Remote Server）を追加し、URL に <code>${endpointUrl}</code> を登録します（認証不要）。
          </p>
        </div>

        <!-- Cursor -->
        <div class="client-card">
          <h3 class="client-title">Cursor</h3>
          <p class="client-desc">
            <code>Settings</code> → <code>Features</code> → <code>MCP Servers</code> → <code>Add New MCP Server</code>
          </p>
          <p class="client-desc">
            Type: <code>SSE</code> または <code>HTTP</code><br>
            Name: <code>o-sumo</code><br>
            URL: <code>${endpointUrl}</code>
          </p>
        </div>

        <!-- Muse / Antigravity / Gemini CLI -->
        <div class="client-card">
          <h3 class="client-title">Muse / Antigravity</h3>
          <p class="client-desc">
            設定ファイルまたは拡張構成の <code>mcpServers</code> に追加します:
          </p>
          <pre class="code-snippet"><code>{
  "mcpServers": {
    "o-sumo": {
      "url": "${endpointUrl}"
    }
  }
}</code></pre>
        </div>
      </div>
    </section>

    <!-- 5. 関連リンク -->
    <section class="mcp-section">
      <h2 class="mcp-section-title">関連リンク</h2>
      <div class="mcp-links-grid">
        <a class="mcp-link-btn" href="https://osada.us/">o-sumo トップページ →</a>
        <a class="mcp-link-btn" href="https://osada.us/terms/">利用規約 (Terms of Service) →</a>
        <a class="mcp-link-btn" href="https://osada.us/privacy/">プライバシーポリシー →</a>
        <a class="mcp-link-btn" href="https://osada.us/agents/">AIエージェント向けガイド →</a>
        <a class="mcp-link-btn" href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">GitHub リポジトリ ↗</a>
      </div>
    </section>

  </main>

  <footer class="mcp-footer">
    <p>© 2026 o-sumo (縦綱). All about the OO-SUMO.</p>
    <p style="font-size: 0.8rem; margin-top: 0.25rem;">
      本サービスは大相撲の公開情報をもとに提供されています。日本相撲協会の公式サービスではありません。
    </p>
  </footer>

  <script>
    function copyEndpoint() {
      var url = "${endpointUrl}";
      var btn = document.getElementById('copy-btn');
      var handleSuccess = function () {
        var prevText = btn.innerText;
        btn.innerText = 'コピー完了 ✓';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.innerText = prevText;
          btn.classList.remove('copied');
        }, 2000);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(handleSuccess).catch(function () {
          fallbackCopy();
        });
      } else {
        fallbackCopy();
      }

      function fallbackCopy() {
        var input = document.getElementById('endpoint-input');
        input.select();
        try {
          document.execCommand('copy');
          handleSuccess();
        } catch (e) {}
      }
    }
  </script>
</body>
</html>`;
}
