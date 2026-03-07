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
          <p>メニューは番付表と星取表のみ</p>
          <div className="hero-actions">
            <Link to="/202603-o-sumo" className="cta-button">
              番付表
            </Link>
            <Link to="/202603-torikumi" className="cta-button secondary">
              星取表
            </Link>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <p>&copy; 2026 o-sumo. All rights reserved.</p>
      </footer>
    </div>
  );
}
