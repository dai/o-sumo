import { Link } from 'react-router-dom';
import { bashoTitle } from './lib/basho-meta';
import { banzukePath, getHubPath } from './lib/torikumi-routes';
import { PAST_BASHO } from './lib/archives-data';
import './index.css';

export default function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1 className="home-title">o-sumo</h1>
          <p className="home-subtitle">大相撲情報サイト</p>
        </div>
      </header>

      <main className="home-main">
        {/* Current Basho - Hero Section */}
        <section className="hero-section">
          <h2>{bashoTitle}</h2>
          <p>最新の番付、日別の取組結果、日別の取組予定をご覧ください。</p>
          <nav className="hero-actions" aria-label="主要ページへの導線">
            <Link to={banzukePath} className="cta-button">
              番付
            </Link>
            <Link to={getHubPath('schedule')} className="cta-button secondary">
              取組予定
            </Link>
            <Link to={getHubPath('result')} className="cta-button secondary">
              結果
            </Link>
          </nav>
        </section>

        {/* Past Basho Archives */}
        {PAST_BASHO.length > 0 && (
          <section className="archives-section">
            <h2 className="archives-heading">過去場所</h2>
            <div className="archives-grid">
              {PAST_BASHO.map((archive) => (
                <Link
                  key={archive.id}
                  to={archive.resultPath}
                  className="archive-card"
                >
                  <div className="archive-card-eyebrow">{archive.year}</div>
                  <h3 className="archive-card-title">{archive.name}</h3>
                  <p className="archive-card-meta">
                    {archive.data.resultDays?.length ?? 0}日間
                  </p>
                </Link>
              ))}
            </div>
            <p className="archives-footer">
              <Link to="/archives">過去場所一覧</Link>
            </p>
          </section>
        )}
      </main>

      <footer className="home-footer">
        <p>&copy; 2026 o-sumo. All rights reserved.</p>
        <nav aria-label="ホームの外部リンク">
          <a href="https://x.com/daisuke" target="_blank" rel="noopener noreferrer">Daisuke on X</a>
          {' | '}
          <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </footer>
    </div>
  );
}
