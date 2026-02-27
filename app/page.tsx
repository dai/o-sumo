import React from 'react';
import { Link } from 'react-router-dom';
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
          <p>最新の番付情報と力士データ</p>
          <Link to="/202603-o-sumo" className="cta-button">
            番付一覧を見る
          </Link>
        </section>

        <section className="features-section">
          <h2>機能</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>📋 番付一覧</h3>
              <p>幕内・十両力士の最新番付を表示</p>
            </div>
            <div className="feature-card">
              <h3>⚡ 高速表示</h3>
              <p>Cloudflare vinextで高速配信</p>
            </div>
            <div className="feature-card">
              <h3>📱 レスポンシブ</h3>
              <p>モバイル対応の見やすいデザイン</p>
            </div>
          </div>
        </section>

        <section className="tech-section">
          <h2>技術スタック</h2>
          <div className="tech-list">
            <span className="tech-badge">Cloudflare vinext</span>
            <span className="tech-badge">React</span>
            <span className="tech-badge">TypeScript</span>
            <span className="tech-badge">Vite</span>
            <span className="tech-badge">CSS3</span>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <p>&copy; 2026 o-sumo. All rights reserved.</p>
        <p>
          <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
