import { Link } from 'react-router-dom';
import { bashoTitle } from './lib/basho-meta';
import { banzukePath, getHubPath } from './lib/torikumi-routes';
import { MARCH2026_TORIKUMI_DATA } from './lib/torikumi-data';
import './index.css';

export default function Home() {
  const marchPathDate = MARCH2026_TORIKUMI_DATA.resultDays?.[0]?.pathDate.slice(0, 6) ?? '202603';

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
          <p>最新の番付、日別の取組結果、日別の取扱い予定をご覧ください。</p>
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

        {/* Past Basho - March 2026 */}
        <section className="past-basho-section">
          <h2 className="past-basho-heading">
            {MARCH2026_TORIKUMI_DATA.year} {MARCH2026_TORIKUMI_DATA.bashoName}
          </h2>
          <nav className="past-basho-actions" aria-label="三月場所への導線">
            <Link to={`/${marchPathDate}-banduke`} className="cta-button secondary">
              番付
            </Link>
            <Link to={`/${marchPathDate}-yotei`} className="cta-button secondary">
              取組予定
            </Link>
            <Link to={`/${marchPathDate}-torikumi`} className="cta-button secondary">
              結果
            </Link>
          </nav>
          <div className="past-basho-days">
            <p className="past-basho-days-label">日別:</p>
            {MARCH2026_TORIKUMI_DATA.resultDays?.map((day) => (
              <Link
                key={day.pathDate}
                to={`/${day.pathDate}-torikumi`}
                className="past-basho-day-link"
              >
                {day.day}日
              </Link>
            ))}
          </div>
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
