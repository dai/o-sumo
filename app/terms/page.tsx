import { useTranslation } from 'react-i18next';
import HomeLink from '../components/HomeLink';
import '../privacy/page.css';

const termsSections = [
  {
    id: 'scope', title: '適用範囲', paragraphs: [
      'この利用規約は、縦綱 / o-sumo が運営するウェブサイト（https://osada.us）および MCP サーバー（https://osada.us/mcp）の利用に適用されます。利用者は本サービスを利用することで、この規約に同意したものとします。',
    ],
  },
  {
    id: 'service', title: 'サービスの内容', paragraphs: [
      '本サービスは、大相撲に関する公開情報の検索・閲覧を提供します。MCP サーバーは読み取り専用で、予約、購入、支払い、プロフィールの変更、アカウント操作は行いません。日付、掲載範囲、項目は公開データによって異なります。',
      '一部のウェブサイト機能では、任意の Google ログインを使って「マイ力士」の同期を利用できます。',
    ],
  },
  {
    id: 'use', title: '利用上のルール', paragraphs: [
      '利用者は、法令を守り、本サービスや他の利用者に損害を与える行為、サービスの運営や安全を妨げる行為、不正アクセスや過度な負荷を生じさせる行為をしてはなりません。自動化されたアクセスを行う場合も、公開されている利用条件と技術的な制限に従ってください。',
      '本サービスが提供するデータを利用する際は、その出典や権利者が示されている場合にそれを尊重してください。',
    ],
  },
  {
    id: 'data', title: '情報の正確性と外部サービス', paragraphs: [
      '掲載情報は公開情報をもとに編集・提供していますが、完全性、正確性、最新性を保証しません。公式な確認が必要な場合は、日本相撲協会などの公式発表を参照してください。本サービスは日本相撲協会の公式サービスではありません。',
      'Google ログインやホスティングなど、本サービスは外部サービスに依存しています。外部サービスの障害、変更、終了により、本サービスの一部が利用できなくなることがあります。',
    ],
  },
  {
    id: 'availability', title: '提供の変更・停止', paragraphs: [
      '運営者は、保守、セキュリティ、法令対応、データ供給元や外部サービスの変更などのため、本サービスの内容を変更し、または一時的・恒久的に停止することがあります。可能な場合はサイト上でお知らせします。',
    ],
  },
  {
    id: 'disclaimer', title: '免責', paragraphs: [
      '法令で認められる範囲で、本サービスは現状有姿で提供されます。運営者は、サービスの中断、データの誤り・欠落、利用者が本サービスを利用したことによる損害について、法令上除外できない責任を除き責任を負いません。',
    ],
  },
  {
    id: 'changes', title: '規約の変更と連絡先', paragraphs: [
      'この規約を変更する場合は、このページに改定内容を掲載します。変更後に本サービスを利用した場合、変更後の規約が適用されます。',
      'この規約についての連絡は、X のダイレクトメッセージから運営者へお願いします。公開の GitHub Issue に個人情報やログイン情報を投稿しないでください。',
    ],
  },
];

const englishSections = [
  {
    id: 'scope-en', title: 'Scope', paragraphs: [
      'These Terms of Service apply to the 縦綱 / o-sumo website (https://osada.us) and its MCP server (https://osada.us/mcp). By using the services, you agree to these terms.',
    ],
  },
  {
    id: 'service-en', title: 'Service description', paragraphs: [
      'The services let you search and view public Grand Sumo information. The MCP server is read-only and does not make reservations or purchases, process payments, change profiles, or perform account operations. Available dates and fields depend on the published data.',
      'Some website features offer optional Google sign-in to synchronize your My Rikishi list.',
    ],
  },
  {
    id: 'use-en', title: 'Acceptable use', paragraphs: [
      'You must comply with applicable laws and must not harm other users, disrupt the operation or security of the services, attempt unauthorized access, or create excessive load. Automated access must follow published usage conditions and technical limits.',
      'When reusing data from the services, respect any source or rights-holder notices that accompany it.',
    ],
  },
  {
    id: 'data-en', title: 'Data accuracy and third-party services', paragraphs: [
      'Information is compiled from public sources, but completeness, accuracy, and timeliness are not guaranteed. For official information, consult announcements from the Japan Sumo Association. These services are not affiliated with or operated by the Japan Sumo Association.',
      'The services rely on third parties for features such as Google sign-in and hosting. Outages, changes, or discontinuation of those services may make some features unavailable.',
    ],
  },
  {
    id: 'availability-en', title: 'Changes and availability', paragraphs: [
      'The operator may change or temporarily or permanently suspend the services for maintenance, security, legal compliance, or changes to data sources or third-party services. When practicable, changes will be announced on the website.',
    ],
  },
  {
    id: 'disclaimer-en', title: 'Disclaimer', paragraphs: [
      'To the extent permitted by applicable law, the services are provided “as is.” The operator is not liable for interruptions, inaccurate or missing data, or losses arising from use of the services, except for liability that cannot lawfully be excluded.',
    ],
  },
  {
    id: 'changes-en', title: 'Changes to these terms and contact', paragraphs: [
      'Revisions will be posted on this page. The revised terms apply when you use the services after they are posted.',
      'For questions about these terms, contact the operator by direct message on X. Do not post personal information or sign-in details in a public GitHub issue.',
    ],
  },
];

function SectionList({ sections }: { sections: typeof termsSections }) {
  return sections.map((section) => (
    <section className="privacy-section" key={section.id} aria-labelledby={`terms-${section.id}-heading`}>
      <h2 id={`terms-${section.id}-heading`} className="privacy-section-heading">{section.title}</h2>
      {section.paragraphs.map((paragraph) => <p className="privacy-text" key={paragraph}>{paragraph}</p>)}
    </section>
  ));
}

export default function TermsPage() {
  const { t } = useTranslation('common');

  return (
    <div className="privacy-page">
      <header className="privacy-header">
        <div className="site-header-top-row">
          <nav className="site-header-nav" aria-label={t('global.siteNavigation')}><HomeLink placement="header" /></nav>
          <h1 className="privacy-header-title">利用規約</h1>
        </div>
        <div className="site-header-desc-row"><p className="privacy-header-description">縦綱 / o-sumo のサイトと MCP サーバーの利用条件</p></div>
      </header>
      <main className="privacy-main">
        <SectionList sections={termsSections} />
        <div lang="en" role="region" aria-label="English" className="privacy-language-section">
          <h2 className="privacy-language-heading">English: Terms of Service</h2>
          <SectionList sections={englishSections} />
        </div>
      </main>
      <footer className="privacy-footer">
        <nav aria-label="ポリシーリンク">
          <HomeLink placement="footer" /><span> | </span>
          <a href="/privacy/">プライバシーポリシー / Privacy Policy</a><span> | </span>
          <a href="https://x.com/daisuke" target="_blank" rel="noopener noreferrer">運営者への連絡</a>
        </nav>
      </footer>
    </div>
  );
}
