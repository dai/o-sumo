import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomeLink from '../components/HomeLink';
import { CURRENT_RESULT_PATH, CURRENT_SCHEDULE_PATH } from '../lib/archive-basho-data';
import { makuuchiData, type Rikishi } from '../lib/sumo-data';
import { torikumiArchive, torikumiMonthKey } from '../lib/torikumi-data';
import './page.css';

type DashboardMetric = {
  key: 'makuuchi' | 'records' | 'undefeated' | 'maxWins';
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
  const maxWins = Math.max(...rikishi.map((wrestler) => wrestler.wins ?? 0));

  return [
    {
      key: 'makuuchi',
      value: `${rikishi.length}`,
      note: '',
    },
    {
      key: 'records',
      value: `${totalWins}-${totalLosses}`,
      note: formatWinRate(totalWins, totalWins + totalLosses),
    },
    {
      key: 'undefeated',
      value: `${undefeated.length}`,
      note: undefeated.slice(0, 3).map((wrestler) => wrestler.name).join('・'),
    },
    {
      key: 'maxWins',
      value: `${maxWins}`,
      note: '',
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
    for (const match of day.data.makuuchi.matches) {
      if (match.kimarite) counts.set(match.kimarite, (counts.get(match.kimarite) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, 'ja'))
    .slice(0, limit);
}

export default function AnalyticsDashboardPage() {
  const { t, i18n } = useTranslation('common');
  const metrics = buildDashboardMetrics();
  const leaders = topRikishiByWins();
  const techniques = topKimarite();
  const maxTechniqueCount = Math.max(...techniques.map((technique) => technique.count), 1);
  const bashoYear = Number(torikumiMonthKey.slice(0, 4));
  const bashoMonth = Number(torikumiMonthKey.slice(4, 6));
  const englishBashoLabel = `${new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(bashoYear, bashoMonth - 1, 1)))} Basho`;
  const bashoLabel = i18n.resolvedLanguage === 'en'
    ? englishBashoLabel
    : `${torikumiArchive.year}${torikumiArchive.bashoName}`;

  const metricNote = (metric: DashboardMetric): string => {
    if (metric.key === 'records') return t('analytics.metrics.records.note', { rate: metric.note });
    if (metric.key === 'undefeated') return metric.note || t('analytics.metrics.undefeated.none');
    return t(`analytics.metrics.${metric.key}.note`);
  };

  return (
    <div className="analytics-dashboard-page">
      <header className="analytics-dashboard-header">
        <nav className="site-header-nav" aria-label={t('global.siteNavigation')}>
          <HomeLink placement="header" />
        </nav>
        <p className="analytics-dashboard-eyebrow">{t('analytics.eyebrow', { basho: bashoLabel })}</p>
        <h1 className="analytics-dashboard-title">{t('analytics.title')}</h1>
        <p className="analytics-dashboard-description">
          {t('analytics.description')}
        </p>
        <div className="analytics-dashboard-actions">
          <Link to={`${CURRENT_RESULT_PATH}/`} className="analytics-dashboard-action primary">{t('analytics.resultAction')}</Link>
          <Link to={`${CURRENT_SCHEDULE_PATH}/`} className="analytics-dashboard-action">{t('analytics.scheduleAction')}</Link>
        </div>
      </header>

      <main className="analytics-dashboard-main">
        <section className="analytics-metric-grid" aria-label={t('analytics.metrics.label')}>
          {metrics.map((metric) => (
            <article key={metric.key} className="analytics-metric-card">
              <p className="analytics-metric-label">{t(`analytics.metrics.${metric.key}.label`)}</p>
              <p className="analytics-metric-value">
                {metric.key === 'maxWins' ? t('analytics.metrics.maxWins.value', { count: metric.value }) : metric.value}
              </p>
              <p className="analytics-metric-note">{metricNote(metric)}</p>
            </article>
          ))}
        </section>

        <section className="analytics-dashboard-panel" aria-labelledby="leaders-heading">
          <div className="analytics-panel-header">
            <h2 id="leaders-heading">{t('analytics.leaders.title')}</h2>
            <p>{t('analytics.leaders.description')}</p>
          </div>
          <ol className="analytics-leader-list">
            {leaders.map((wrestler) => (
              <li key={wrestler.id} className="analytics-leader-row">
                <span className="analytics-leader-name">{wrestler.name}</span>
                <span className="analytics-leader-rank">{wrestler.rank}</span>
                <strong className="analytics-leader-record">
                  {t('analytics.leaders.record', { wins: wrestler.wins ?? 0, losses: wrestler.losses ?? 0 })}
                </strong>
              </li>
            ))}
          </ol>
        </section>

        <section className="analytics-dashboard-panel" aria-labelledby="kimarite-heading">
          <div className="analytics-panel-header">
            <h2 id="kimarite-heading">{t('analytics.kimarite.title')}</h2>
            <p>{t('analytics.kimarite.description')}</p>
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
