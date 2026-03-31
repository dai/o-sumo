import { Link } from 'react-router-dom';
import { bashoTitle } from './lib/basho-meta';
import { banzukePath, getHubPath } from './lib/torikumi-routes';
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
        <section className="hero-section">
          <h2>{bashoTitle}</h2>
          <p>最新の番付、日別の取組結果、日別の取組予定をご覧いただけます。</p>
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

        <section className="features-section">
          <h2>日別アーカイブ</h2>
          <nav className="features-grid" aria-label="日別アーカイブページへの導線">
            <Link to={getHubPath('result')} className="feature-card">
              <h3>取組結果</h3>
              <p>結果ページを日別に一覧できます。</p>
            </Link>
            <Link to={getHubPath('schedule')} className="feature-card">
              <h3>取組予定</h3>
              <p>取組予定を日別に一覧できます。</p>
            </Link>
            <Link to={banzukePath} className="feature-card">
              <h3>番付</h3>
              <p>番付をセクションにわけています。</p>
            </Link>
          </nav>
        </section>
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
