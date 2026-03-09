import React from 'react';
import { Link } from 'react-router-dom';
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
          <h2>令和8年3月場所</h2>
          <p>番付、日別の取組結果、日別の取組予定をトップ階層で整理しました。</p>
          <p className="contact-lead">
            連絡先: <a href="https://x.com/daisuke" target="_blank" rel="noopener noreferrer">x.com/daisuke</a>
            {' / '}
            <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">GitHub</a>
          </p>
          <div className="hero-actions">
            <Link to={banzukePath} className="cta-button">
              番付
            </Link>
            <Link to="/20260308-torikumi" className="cta-button secondary">
              初日結果
            </Link>
            <Link to="/20260308-yotei" className="cta-button secondary">
              初日予定
            </Link>
          </div>
        </section>

        <section className="features-section">
          <h2>日別アーカイブ</h2>
          <div className="features-grid">
            <Link to={getHubPath('result')} className="feature-card">
              <h3>取組結果</h3>
              <p>`/20260308-torikumi` から日ごとの結果ページへ移動できます。</p>
            </Link>
            <Link to={getHubPath('schedule')} className="feature-card">
              <h3>取組予定</h3>
              <p>`/20260308-yotei` から日ごとの予定ページへ移動できます。</p>
            </Link>
            <Link to={banzukePath} className="feature-card">
              <h3>番付</h3>
              <p>`/202603-banduke` を番付の固定入口にしました。</p>
            </Link>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <p>&copy; 2026 o-sumo. All rights reserved.</p>
        <p>
          <a href="https://x.com/daisuke" target="_blank" rel="noopener noreferrer">Daisuke on X</a>
          {' | '}
          <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">GitHub</a>
        </p>
      </footer>
    </div>
  );
}
