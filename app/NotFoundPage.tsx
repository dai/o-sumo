import { Link } from 'react-router-dom';
import MetaHead from './components/MetaHead';
import { torikumiMonthKey } from './lib/torikumi-data';

const NOT_FOUND_DESCRIPTION = 'お探しのページは見つかりませんでした。o-sumoの最新取組表や番付一覧をご確認ください。';

const NAV_LINKS = [
  { to: '/', label: 'ホーム' },
  { to: `/${torikumiMonthKey}-banzuke/`, label: '番付' },
  { to: `/${torikumiMonthKey}-torikumi/`, label: '取組' },
  { to: '/rikishi/', label: '力士' },
] as const;

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <MetaHead>
        <title>404 ページが見つかりません | o-sumo</title>
        <meta name="robots" content="noindex, follow" />
        <meta name="description" content={NOT_FOUND_DESCRIPTION} />
      </MetaHead>

      <header className="page-header">
        <div className="site-header-top-row">
          <p className="page-subtitle">404</p>
        </div>
        <div className="site-header-heading-group">
          <h1 className="site-header-title">ページが見つかりません</h1>
        </div>
        <div className="site-header-desc-row">
          <p>お探しのページは削除されたか、URLが変更された可能性があります。</p>
        </div>
      </header>

      <div className="container">
        <p style={{ textAlign: 'center' }}>下記のリンクから最新の大相撲情報をご覧ください。</p>
        <div className="primary-navigation-shell">
          <nav className="primary-navigation" aria-label="主要ナビゲーション">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="primary-navigation__link">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
