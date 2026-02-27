import React from 'react';
import './page.css';

export const metadata = {
  title: '{{title}} - o-sumo',
  description: '{{description}}',
};

export default function Page() {
  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-content">
          <h1 className="page-title">大相撲</h1>
          <h2 className="page-subtitle">{{subtitle}}</h2>
        </div>
      </header>

      <main className="page-main">
        <section className="banzuke-section">
          <h2 className="section-heading">番付</h2>
          <div className="banzuke-list">
            {/* BanzukeTable components go here */}
          </div>
        </section>
      </main>

      <footer className="page-footer">
        <p>&copy; 2026 o-sumo. All rights reserved.</p>
      </div>
    </div>
  );
}
