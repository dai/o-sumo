import { Link } from 'react-router-dom';
import HomeLink from '../components/HomeLink';
import { CURRENT_RESULT_PATH, CURRENT_SCHEDULE_PATH } from '../lib/archive-basho-data';
import { makuuchiData, type Rikishi } from '../lib/sumo-data';
import { torikumiArchive } from '../lib/torikumi-data';
import './page.css';

type DashboardMetric = {
  label: string;
  value: string;
  note: string;
};

type TechniqueCount = {
  name: string;
  count: number;
};

const WIN_RATE_PRECISION = 1;

function allMakuuchiRikishi(): Rikishi[] {
  return makuuchiData.flatMap((group) => [...group.east, ...group.west]);
}

function formatWinRate(wins: number, decided: number): string {
  if (decided === 0) return '0.0%';
  return `${((wins / decided) * 100).toFixed(WIN_RATE_PRECISION)}%`;
}

export function buildDashboardMetrics(rikishi: Rikishi[] = allMakuuchiRikishi()): DashboardMetric[] {
  const totalWins = rikishi.reduce((sum, wrestler) => sum + (wrestler.wins ?? 0), 0);
  const totalLosses = rikishi.reduce((sum, wrestler) => sum + (wrestler.losses ?? 0), 0);
  const undefeated = rikishi.filter((wrestler) => (wrestler.wins ?? 0) > 0 && (wrestler.losses ?? 0) === 0);
  const leaders = Math.max(...rikishi.map((wrestler) => wrestler.wins ?? 0));

  return [
    {
      label: '幕内力士',
      value: `${rikishi.length}`,
      note: '番付データに掲載中の幕内人数',
    },
    {
      label: '勝敗入力',
      value: `${totalWins}-${totalLosses}`,
      note: `勝率 ${formatWinRate(totalWins, totalWins + totalLosses)}`,
    },
    {
      label: '無敗力士',
      value: `${undefeated.length}`,
      note: undefeated.slice(0, 3).map((wrestler) => wrestler.name).join('・') || '該当なし',
    },
    {
      label: '最多勝ライン',
      value: `${leaders}勝`,
      note: '幕内の現在トップライン',
    },
  ];
}

export function topRikishiByWins(rikishi: Rikishi[] = allMakuuchiRikishi()): Rikishi[] {
  return [...rikishi]
    .sort((left, right) => (right.wins ?? 0) - (left.wins ?? 0) || (left.losses ?? 0) - (right.losses ?? 0))
    .slice(0, 8);
}

export function topKimarite(limit = 6): TechniqueCount[] {
  const counts = new Map<string, number>();
  for (const day of torikumiArchive.resultDays ?? []) {
    for (const match of [...day.data.makuuchi.matches, ...day.data.juryo.matches]) {
      if (match.kimarite) counts.set(match.kimarite, (counts.get(match.kimarite) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, 'ja'))
    .slice(0, limit);
}

export default function AnalyticsDashboardPage() {
  const metrics = buildDashboardMetrics();
  const leaders = topRikishiByWins();
  const techniques = topKimarite();
  const maxTechniqueCount = Math.max(...techniques.map((technique) => technique.count), 1);

  return (
    <div className="analytics-dashboard-page">
      <header className="analytics-dashboard-header">
        <nav className="site-header-nav" aria-label="サイトナビゲーション">
          <HomeLink placement="header" />
        </nav>
        <p className="analytics-dashboard-eyebrow">July Basho Intelligence</p>
        <h1 className="analytics-dashboard-title">大相撲アナリティクス</h1>
        <p className="analytics-dashboard-description">
          幕内の勝敗、上位争い、決まり手傾向をひと目で確認できるダッシュボードです。
        </p>
        <div className="analytics-dashboard-actions">
          <Link to={`${CURRENT_RESULT_PATH}/`} className="analytics-dashboard-action primary">取組結果を見る</Link>
          <Link to={`${CURRENT_SCHEDULE_PATH}/`} className="analytics-dashboard-action">取組予定を見る</Link>
        </div>
      </header>

      <main className="analytics-dashboard-main">
        <section className="analytics-metric-grid" aria-label="主要指標">
          {metrics.map((metric) => (
            <article key={metric.label} className="analytics-metric-card">
              <p className="analytics-metric-label">{metric.label}</p>
              <p className="analytics-metric-value">{metric.value}</p>
              <p className="analytics-metric-note">{metric.note}</p>
            </article>
          ))}
        </section>

        <section className="analytics-dashboard-panel" aria-labelledby="leaders-heading">
          <div className="analytics-panel-header">
            <h2 id="leaders-heading">勝ち星リーダー</h2>
            <p>同勝数の場合は黒星の少ない力士を上位に表示します。</p>
          </div>
          <ol className="analytics-leader-list">
            {leaders.map((wrestler) => (
              <li key={wrestler.id} className="analytics-leader-row">
                <span className="analytics-leader-name">{wrestler.name}</span>
                <span className="analytics-leader-rank">{wrestler.rank}</span>
                <strong className="analytics-leader-record">{wrestler.wins ?? 0}勝{wrestler.losses ?? 0}敗</strong>
              </li>
            ))}
          </ol>
        </section>

        <section className="analytics-dashboard-panel" aria-labelledby="kimarite-heading">
          <div className="analytics-panel-header">
            <h2 id="kimarite-heading">決まり手トレンド</h2>
            <p>公開済み取組結果から頻出の決まり手を集計しています。</p>
          </div>
          <div className="analytics-technique-list">
            {techniques.map((technique) => (
              <div key={technique.name} className="analytics-technique-row">
                <span>{technique.name}</span>
                <div className="analytics-technique-track" aria-hidden="true">
                  <span style={{ width: `${(technique.count / maxTechniqueCount) * 100}%` }} />
                </div>
                <strong>{technique.count}</strong>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
