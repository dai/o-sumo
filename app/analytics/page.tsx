import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomeLink from '../components/HomeLink';
import PageBreadcrumb from '../components/PageBreadcrumb';
import { getBashoStatus } from '../lib/basho-status';
import { CURRENT_RESULT_PATH, CURRENT_SCHEDULE_PATH } from '../lib/archive-basho-data';
import { makuuchiData, juryo, type Rikishi } from '../lib/sumo-data';
import { torikumiArchive, torikumiMonthKey, type TorikumiDataSet } from '../lib/torikumi-data';
import { getBashoResults } from '../lib/basho-results';
import './page.css';

export type DashboardMetric = {
  key: 'makuuchi' | 'juryo' | 'records' | 'undefeated' | 'maxWins';
  value: string;
  note: string;
};

export type TechniqueCount = {
  name: string;
  count: number;
};

export type DivisionKey = 'makuuchi' | 'juryo';

const WIN_RATE_PRECISION = 1;

export function allMakuuchiRikishi(): Rikishi[] {
  return makuuchiData.flatMap((group) => [...group.east, ...group.west]);
}

export function allJuryoRikishi(): Rikishi[] {
  return juryo.flatMap((group) => [...group.east, ...group.west]);
}

function formatWinRate(wins: number, decided: number): string {
  if (decided === 0) return '0.0%';
  return `${((wins / decided) * 100).toFixed(WIN_RATE_PRECISION)}%`;
}

export function buildDashboardMetrics(
  rikishi: Rikishi[] = allMakuuchiRikishi(),
  divisionKey: DivisionKey = 'makuuchi',
): DashboardMetric[] {
  const totalWins = rikishi.reduce((sum, wrestler) => sum + (wrestler.wins ?? 0), 0);
  const totalLosses = rikishi.reduce((sum, wrestler) => sum + (wrestler.losses ?? 0), 0);
  const undefeated = rikishi.filter((wrestler) => (wrestler.wins ?? 0) > 0 && (wrestler.losses ?? 0) === 0);
  const maxWins = rikishi.length > 0 ? Math.max(...rikishi.map((wrestler) => wrestler.wins ?? 0)) : 0;

  return [
    {
      key: divisionKey,
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

export function topKimarite(
  archive: TorikumiDataSet = torikumiArchive,
  limit = 6,
  division: DivisionKey = 'makuuchi',
): TechniqueCount[] {
  const counts = new Map<string, number>();
  for (const day of archive.resultDays ?? []) {
    const divisionMatches = division === 'juryo' ? day.data.juryo.matches : day.data.makuuchi.matches;
    for (const match of divisionMatches) {
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
  const [activeDivision, setActiveDivision] = useState<DivisionKey>('makuuchi');

  const currentRikishi = activeDivision === 'makuuchi' ? allMakuuchiRikishi() : allJuryoRikishi();
  const metrics = buildDashboardMetrics(currentRikishi, activeDivision);
  const leaders = topRikishiByWins(currentRikishi);
  const techniques = topKimarite(torikumiArchive, 6, activeDivision);
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
  const bashoStatus = getBashoStatus(torikumiArchive);
  const isFinal = bashoStatus.kind === 'final';
  const isSenshuraku = bashoStatus.day === 15;
  const showResultsSection = isFinal || isSenshuraku;

  const bashoResults = getBashoResults(torikumiMonthKey);
  const isAnnounced = bashoResults?.status === 'announced' && (bashoResults.winners.length ?? 0) > 0;

  const divisionLabel = t(`analytics.divisions.${activeDivision}`);

  const metricNote = (metric: DashboardMetric): string => {
    if (metric.key === 'records') return t('analytics.metrics.records.note', { rate: metric.note });
    if (metric.key === 'undefeated') return metric.note || t('analytics.metrics.undefeated.none');
    if (metric.key === 'maxWins') {
      return t(isFinal
        ? 'analytics.metrics.maxWins.finalNote'
        : 'analytics.metrics.maxWins.note', { division: divisionLabel });
    }
    return t(`analytics.metrics.${metric.key}.note`);
  };

  return (
    <div className="analytics-dashboard-page">
      <header className="analytics-dashboard-header">
        <div className="site-header-top-row">
          <nav className="site-header-nav" aria-label={t('global.siteNavigation')}>
            <HomeLink placement="header" />
          </nav>
          <div className="site-header-heading-group">
            <span className="analytics-dashboard-eyebrow">{t('analytics.eyebrow', { basho: bashoLabel })}</span>
            <h1 className="analytics-dashboard-title">{t('analytics.title')}</h1>
          </div>
        </div>
        <div className="site-header-desc-row">
          <p className="analytics-dashboard-description">
            {t('analytics.description')}
          </p>
        </div>
        <div className="site-header-links-row analytics-dashboard-actions">
          <Link to={`${CURRENT_RESULT_PATH}/`} className="analytics-dashboard-action primary">{t('analytics.resultAction')}</Link>
          <Link to={`${CURRENT_SCHEDULE_PATH}/`} className="analytics-dashboard-action">{t(isFinal ? 'analytics.pastScheduleAction' : 'analytics.scheduleAction')}</Link>
        </div>
      </header>

      <main className="analytics-dashboard-main">
        <PageBreadcrumb
          ariaLabel={t('rikishi.breadcrumbLabel')}
          items={[
            { label: t('global.homeLink'), href: '/' },
            { label: t('analytics.crumb') },
          ]}
        />

        {/* 優勝・三賞セクション（千秋楽または場所終了後） */}
        {showResultsSection && (
          <section className="analytics-dashboard-panel analytics-results-panel" aria-labelledby="results-heading">
            <div className="analytics-panel-header">
              <h2 id="results-heading">{t('analytics.results.heading', { basho: bashoLabel })}</h2>
              <p>{isAnnounced ? t('analytics.results.description') : (bashoResults?.announcementNote || t('analytics.results.pendingDescription'))}</p>
            </div>

            {!isAnnounced && (
              <div className="analytics-pending-badge" style={{ marginBottom: '1rem' }}>
                <span className="pulse-dot" aria-hidden="true" />
                {t('analytics.results.pendingTitle')}
              </div>
            )}

            <table className="analytics-results-table">
              <thead>
                <tr>
                  <th scope="col">{t('analytics.results.tableHeading')}</th>
                  <th scope="col">{t('analytics.results.tableRikishi')}</th>
                  <th scope="col">{t('analytics.results.tableRecord')}</th>
                </tr>
              </thead>
              <tbody>
                {isAnnounced ? (
                  bashoResults.winners.map((row) => (
                    <tr key={row.id}>
                      <th scope="row">{t(`analytics.results.category.${row.category}`)}</th>
                      <td className="analytics-results-rikishi-cell">
                        <strong>{row.rikishi}</strong>
                        {row.note && <span className="analytics-results-note">（{row.note}）</span>}
                      </td>
                      <td>{row.record}</td>
                    </tr>
                  ))
                ) : (
                  (['makuuchiYusho', 'shukun', 'kanto', 'gino', 'juryoYusho'] as const).map((category) => (
                    <tr key={category}>
                      <th scope="row">{t(`analytics.results.category.${category}`)}</th>
                      <td className="analytics-results-rikishi-cell">—</td>
                      <td>—</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        )}

        {/* 幕内 / 十両 ディビジョン切り替えタブ */}
        <div className="analytics-division-nav" role="tablist" aria-label={t('analytics.divisionSelect')}>
          <button
            type="button"
            role="tab"
            aria-selected={activeDivision === 'makuuchi'}
            aria-controls="division-panel"
            className={`analytics-division-tab ${activeDivision === 'makuuchi' ? 'active' : ''}`}
            onClick={() => setActiveDivision('makuuchi')}
          >
            {t('analytics.divisions.makuuchi')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeDivision === 'juryo'}
            aria-controls="division-panel"
            className={`analytics-division-tab ${activeDivision === 'juryo' ? 'active' : ''}`}
            onClick={() => setActiveDivision('juryo')}
          >
            {t('analytics.divisions.juryo')}
          </button>
        </div>

        <div id="division-panel" role="tabpanel" aria-label={divisionLabel}>
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
              <h2 id="leaders-heading">{t('analytics.leaders.titleDivision', { division: divisionLabel })}</h2>
              <p>{t('analytics.leaders.description')}</p>
            </div>
            <ol className="analytics-leader-list">
              {leaders.map((wrestler, index) => (
                <li key={wrestler.id} className="analytics-leader-row">
                  <span className={`analytics-leader-rank-badge rank-${index + 1}`}>
                    {index + 1}
                  </span>
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
              <h2 id="kimarite-heading">{t('analytics.kimarite.titleDivision', { division: divisionLabel })}</h2>
              <p>{t('analytics.kimarite.descriptionDivision', { division: divisionLabel })}</p>
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
        </div>
      </main>
    </div>
  );
}
