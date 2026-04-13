import { Link } from 'react-router-dom';
import { PAST_BASHO } from '../lib/archives-data';
import './page.css';

export default function ArchivesPage() {
  return (
    <div className="archives-page">
      <header className="archives-header">
        <h1>過去場所一覧</h1>
        <p>過去の場所の番付と取組結果です。</p>
      </header>

      <main className="archives-main">
        <div className="archives-list">
          {PAST_BASHO.map((archive) => (
            <article key={archive.id} className="archive-item">
              <header className="archive-item-header">
                <h2>{archive.year} {archive.name}</h2>
              </header>
              <div className="archive-item-links">
                <Link to={archive.bandukePath} className="archive-link">
                  番付
                </Link>
                <Link to={archive.resultPath} className="archive-link">
                  取組結果
                </Link>
                <Link to={archive.schedulePath} className="archive-link">
                  取組予定
                </Link>
              </div>
            </article>
          ))}

          {PAST_BASHO.length === 0 && (
            <p className="archives-empty">過去場所データはありません。</p>
          )}
        </div>
      </main>

      <footer className="archives-footer">
        <Link to="/">ホームに戻る</Link>
      </footer>
    </div>
  );
}
