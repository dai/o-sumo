import { useTranslation } from 'react-i18next';
import HomeLink from '../components/HomeLink';
import './page.css';

const contactUrl = 'https://x.com/daisuke';
const privacySections = [
  {
    id: 'services', title: '対象サービス',
    paragraphs: [
      'このポリシーは、縦綱 / o-sumo のウェブサイト（https://osada.us）と、同サイトが提供する読み取り専用 MCP サーバー（https://osada.us/mcp）に適用されます。MCP サーバーの利用にアカウント登録は必要ありません。',
    ],
  },
  {
    id: 'data', title: '取り扱う情報と利用目的',
    paragraphs: [
      'MCP サーバーへのリクエストには、検索語や指定した日付など、回答に必要な入力が含まれます。MCP サーバーは公開されている相撲データを返すためにこれらを処理します。サービス運営者が MCP 用のアカウントやユーザー履歴を作成する仕組みはありません。',
      'ChatGPT などの AI クライアント経由で MCP サーバーを使う場合、会話とクライアント側のアカウント情報はそのクライアントの提供者が取り扱います。o-sumo 側には、MCP ツールの呼び出しに必要な入力が送られます。',
      'ウェブサイトは、ログインせずに使う場合、気になる力士の番号や表示設定などをブラウザー内の保存領域に保存することがあります。保存内容はブラウザーの設定から削除できます。',
      '任意の Google ログインを利用すると、Google から受け取る一意のアカウント識別子と表示名を、ログインとアカウント同期のために保存します。メールアドレスや Google パスワードは要求・保存しません。同期を有効にした場合、選択した力士の番号もアカウントに保存します。OAuth アクセストークンは Google へのユーザー情報照会にのみ使い、保存しません。',
    ],
  },
  {
    id: 'cookies', title: 'Cookie、端末内保存、アクセスログ',
    paragraphs: [
      'Google ログインでは、ログイン処理中の確認用 Cookie と、ログイン状態を保つ HttpOnly / Secure / SameSite=Lax のセッション Cookie を使います。セッションの既定期間は 30 日ですが、運用設定によって異なる場合があります。ログアウトすると現在のセッションを無効化します。ログアウトだけではアカウントや同期済みデータは削除されません。',
      'ホスティング、CDN、データベースの提供事業者は、配信、セキュリティ、不正利用防止のためにリクエストや運用情報を処理する場合があります。Cloudflare が保持するログの項目と期間は、運営者がこのサイトから個別に確認・制御できないため、本ポリシーでは具体的な保持期間を約束しません。',
      'ソースコードと現在の配信設定を確認した範囲では、Google Analytics や Google AdSense のスクリプトはサイトに組み込まれていません。ページのフォント表示では Google Fonts へ接続する場合があります。その接続では、通常のウェブリクエスト情報が Google に送信されることがあります。',
    ],
  },
  {
    id: 'sharing', title: '第三者への提供と委託',
    paragraphs: [
      'Google は任意のログイン認証と、ログイン後の表示名・アカウント識別子の取得に関与します。Cloudflare はサイト、MCP サーバー、アカウント同期データのホスティングや配信に関与します。各社による情報の取扱いには各社のポリシーが適用されます。運営者が広告配信やアクセス解析のためにユーザー情報を販売・提供する仕組みは現在設けていません。',
    ],
  },
  {
    id: 'retention', title: '保存期間と削除の依頼',
    paragraphs: [
      'ブラウザー内の保存情報は、利用者がブラウザーから削除するまで端末に残る場合があります。アカウント情報と同期済み力士一覧には、利用者向けのアカウント削除画面はありません。削除を希望する場合は、運営者へ連絡してください。ログアウトは削除依頼の代わりにはなりません。',
      'ログインセッションは有効期限後に認証に使えなくなりますが、期限切れの記録がデータベースからいつ削除されるかは、現在の実装では定められていません。ホスティング事業者の運用ログにも運営者が保証できる一律の削除時期はありません。',
    ],
  },
  {
    id: 'contact', title: 'お問い合わせと更新',
    paragraphs: [
      '個人情報の確認、訂正、削除に関する依頼や、このポリシーへの質問は、X のダイレクトメッセージから運営者へご連絡ください。公開の GitHub Issue に個人情報やログイン情報を投稿しないでください。',
      'このポリシーはサービスの変更に合わせて更新します。更新後の内容はこのページに掲載します。最終更新日：2026年11月9日。',
    ],
  },
];

const englishSections = [
  {
    id: 'services-en', title: 'Services covered',
    paragraphs: [
      'This policy covers the 縦綱 / o-sumo website (https://osada.us) and its read-only MCP server (https://osada.us/mcp). The MCP server does not require an account.',
    ],
  },
  {
    id: 'data-en', title: 'Information and purposes',
    paragraphs: [
      'Requests to the MCP server contain inputs needed to answer a query, such as a search term or date. The server processes those inputs to return public sumo data. The operator does not create MCP accounts or user query histories.',
      'If you use the MCP server through an AI client such as ChatGPT, that client provider handles the conversation and its account information. o-sumo receives the inputs needed for MCP tool calls.',
      'When you use the website without signing in, your browser may store wrestler IDs you save and display preferences. You can remove this information through your browser settings.',
      'If you choose Google sign-in, we store the unique account identifier and display name returned by Google to provide sign-in and account synchronization. We do not request or store your email address or Google password. If synchronization is enabled, we also store the wrestler IDs you select. OAuth access tokens are used only to request user information from Google and are not stored.',
    ],
  },
  {
    id: 'cookies-en', title: 'Cookies, browser storage, and access logs',
    paragraphs: [
      'Google sign-in uses a temporary verification cookie and an HttpOnly, Secure, SameSite=Lax session cookie. The default session duration is 30 days, but configuration may change it. Signing out invalidates the current session, but does not delete your account or synchronized data.',
      'Hosting, CDN, and database providers may process requests and operational information to deliver and secure the services and prevent abuse. The operator cannot individually inspect or control Cloudflare log fields and retention periods, so this policy does not promise a specific retention period for those logs.',
      'Based on the source code and delivery configuration reviewed, Google Analytics and Google AdSense scripts are not currently included in the site. Pages may connect to Google Fonts to display fonts. Such a connection may transmit ordinary web request information to Google.',
    ],
  },
  {
    id: 'sharing-en', title: 'Service providers and sharing',
    paragraphs: [
      'Google is involved in optional sign-in and provides the account identifier and display name after sign-in. Cloudflare provides hosting and delivery for the site, MCP server, and synchronized account data. Their own privacy policies apply to their handling of information. The operator does not currently sell or provide user information for advertising or analytics.',
    ],
  },
  {
    id: 'retention-en', title: 'Retention and deletion requests',
    paragraphs: [
      'Information stored in your browser may remain there until you remove it through browser settings. There is no self-service account deletion screen. To request deletion of account information and synchronized wrestler IDs, contact the operator. Signing out is not a deletion request.',
      'A login session cannot be used after it expires, but the current implementation does not specify when expired session records are removed from the database. The operator also cannot promise a single deletion schedule for hosting-provider operational logs.',
    ],
  },
  {
    id: 'contact-en', title: 'Contact and updates',
    paragraphs: [
      'For requests to access, correct, or delete account information, or for questions about this policy, contact the operator by direct message on X. Do not post personal information or sign-in details in a public GitHub issue.',
      'This policy may be updated when the services change. The current version will be posted on this page. Last updated: November 9, 2026.',
    ],
  },
];

function SectionList({ sections }: { sections: typeof privacySections }) {
  return sections.map((section) => (
    <section className="privacy-section" key={section.id} aria-labelledby={`privacy-${section.id}-heading`}>
      <h2 id={`privacy-${section.id}-heading`} className="privacy-section-heading">{section.title}</h2>
      {section.paragraphs.map((paragraph) => <p className="privacy-text" key={paragraph}>{paragraph}</p>)}
    </section>
  ));
}

export default function PrivacyPage() {
  const { t } = useTranslation('common');

  return (
    <div className="privacy-page">
      <header className="privacy-header">
        <div className="site-header-top-row">
          <nav className="site-header-nav" aria-label={t('global.siteNavigation')}><HomeLink placement="header" /></nav>
          <h1 className="privacy-header-title">プライバシーポリシー</h1>
        </div>
        <div className="site-header-desc-row"><p className="privacy-header-description">縦綱 / o-sumo のサイトと MCP サーバーにおける情報の取り扱い</p></div>
      </header>
      <main className="privacy-main">
        <SectionList sections={privacySections} />
        <section className="privacy-section" aria-labelledby="privacy-provider-policies-heading">
          <h2 id="privacy-provider-policies-heading" className="privacy-section-heading">提供事業者のポリシー</h2>
          <p className="privacy-text"><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google プライバシーポリシー</a></p>
          <p className="privacy-text"><a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare プライバシーポリシー</a></p>
        </section>
        <div lang="en" role="region" aria-label="English" className="privacy-language-section">
          <h2 className="privacy-language-heading">English</h2>
          <SectionList sections={englishSections} />
          <section className="privacy-section" aria-labelledby="privacy-provider-policies-en-heading">
            <h2 id="privacy-provider-policies-en-heading" className="privacy-section-heading">Provider policies</h2>
            <p className="privacy-text"><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></p>
            <p className="privacy-text"><a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare Privacy Policy</a></p>
          </section>
        </div>
      </main>
      <footer className="privacy-footer">
        <nav aria-label="ポリシーリンク">
          <HomeLink placement="footer" /><span> | </span>
          <a href="/terms/">利用規約 / Terms of Service</a><span> | </span>
          <a href={contactUrl} target="_blank" rel="noopener noreferrer">運営者への連絡</a>
        </nav>
      </footer>
    </div>
  );
}
