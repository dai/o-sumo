import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTorikumiData, fallbackTorikumi, type TorikumiMatch } from '../lib/torikumi-data';
import './page.css';

export default function TorikumiPage() {
  const [matches, setMatches] = useState<TorikumiMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchTorikumiData();
        if (data.length === 0) {
          setMatches(fallbackTorikumi());
          setError('公式サイトの構造変更の可能性があるため、番付ベースの暫定取組を表示しています。');
        } else {
          setMatches(data);
        }
      } catch (error) {
        console.error('Failed to fetch torikumi data:', error);
        setMatches(fallbackTorikumi());
        setError('通信環境またはCORS制約により、番付ベースの暫定取組を表示しています。');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, TorikumiMatch[]>();
    matches.forEach((match) => {
      const key = match.division || 'その他';
      map.set(key, [...(map.get(key) ?? []), match]);
    });
    return Array.from(map.entries());
  }, [matches]);

  return (
    <div className="torikumi-page">
      <header className="torikumi-header">
        <h1>令和8年3月場所 取組表</h1>
        <p>東西の取組を同幅レイアウトで表示（取得元: 日本相撲協会）</p>
      </header>

      <main className="torikumi-main">
        {loading && <p className="status-message">取組データを取得中...</p>}
        {error && <p className="status-message warning">{error}</p>}

        {!loading && grouped.map(([division, divisionMatches]) => (
          <section key={division} className="division-section">
            <h2>{division}</h2>
            <div className="torikumi-table" role="table" aria-label={`${division}取組表`}>
              <div className="torikumi-head" role="rowgroup">
                <div className="cell east">東</div>
                <div className="cell kimarite">決まり手</div>
                <div className="cell west">西</div>
              </div>
              {divisionMatches.map((match, idx) => (
                <div className="torikumi-row" role="row" key={`${division}-${idx}`}>
                  <div className="cell east rikishi-card">
                    <div className="name">{match.eastName}</div>
                    <div className="yomi">{match.eastYomi}</div>
                    <div className="english">{match.eastEnglish}</div>
                  </div>
                  <div className="cell kimarite kimarite-value">{match.kimarite ?? '未定'}</div>
                  <div className="cell west rikishi-card">
                    <div className="name">{match.westName}</div>
                    <div className="yomi">{match.westYomi}</div>
                    <div className="english">{match.westEnglish}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="torikumi-footer">
        <Link to="/">ホーム</Link>
        <span> | </span>
        <Link to="/202603-o-sumo">番付一覧</Link>
      </footer>
    </div>
  );
}
