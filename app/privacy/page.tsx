import { useTranslation } from 'react-i18next';
import HomeLink from '../components/HomeLink';
import './page.css';

export default function PrivacyPage() {
  const { t } = useTranslation('common');

  return (
    <div className="privacy-page">
      <header className="privacy-header">
        <div className="site-header-top-row">
          <nav className="site-header-nav" aria-label={t('global.siteNavigation')}>
            <HomeLink placement="header" />
          </nav>
          <h1 className="privacy-header-title">プライバシーポリシー</h1>
        </div>
        <div className="site-header-desc-row">
          <p className="privacy-header-description">縦綱 / o-sumo の MCP サーバーと本サイトにおける情報の取り扱い</p>
        </div>
      </header>

      <main className="privacy-main">
        <section className="privacy-section" aria-labelledby="privacy-handling-heading">
          <h2 id="privacy-handling-heading" className="privacy-section-heading">
            取り扱う情報
          </h2>
          <p className="privacy-text">
            縦綱 / o-sumo の MCP サーバー（
            <a href="https://osada.us/mcp">https://osada.us/mcp</a>
            ）と本サイト（
            <a href="https://osada.us">https://osada.us</a>
            ）は、読み取り専用です。ログインは不要です。個人情報は収集しません。
          </p>
          <p className="privacy-text">
            ホスティングおよび CDN（Cloudflare）は、運用とセキュリティのため、標準的なアクセスログを保持する場合があります。
          </p>
          <p className="privacy-text">掲載しているデータは、公開されている大相撲の情報です。</p>
        </section>

        <section className="privacy-section" aria-labelledby="privacy-contact-heading">
          <h2 id="privacy-contact-heading" className="privacy-section-heading">
            連絡先
          </h2>
          <p className="privacy-text">
            <a href="https://github.com/dai/o-sumo/issues" target="_blank" rel="noopener noreferrer">
              https://github.com/dai/o-sumo/issues
            </a>
          </p>
        </section>

        <section className="privacy-section" lang="en" aria-labelledby="privacy-english-heading">
          <h2 id="privacy-english-heading" className="privacy-section-heading">
            English
          </h2>
          <p className="privacy-text">
            The 縦綱 / o-sumo MCP server (
            <a href="https://osada.us/mcp">https://osada.us/mcp</a>
            ) and this site (
            <a href="https://osada.us">https://osada.us</a>
            ) are read-only. They need no login and collect no personal information. Hosting and the CDN (Cloudflare) may keep standard access logs for operation and security. The data is public Grand Sumo (大相撲) information. Contact:{' '}
            <a href="https://github.com/dai/o-sumo/issues" target="_blank" rel="noopener noreferrer">
              https://github.com/dai/o-sumo/issues
            </a>
            .
          </p>
        </section>
      </main>

      <footer className="privacy-footer">
        <nav aria-label="プライバシーポリシーのフッターリンク">
          <HomeLink placement="footer" />
          <span> | </span>
          <a href="https://github.com/dai/o-sumo/issues" target="_blank" rel="noopener noreferrer">
            GitHub Issues
          </a>
        </nav>
      </footer>
    </div>
  );
}
