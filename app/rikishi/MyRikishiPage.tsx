import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomeLink from '../components/HomeLink';
import MyRikishiToggle from '../components/MyRikishiToggle';
import { useMyRikishi } from '../lib/my-rikishi';
import { fetchRikishiIndex, rikishiProfilePath, type RikishiIndexItem } from '../lib/rikishi-profile';
import { getBanzukeDataByMonthKey } from '../lib/archive-basho-data';
import { torikumiArchive, torikumiMonthKey, type TorikumiArchiveDay } from '../lib/torikumi-data';
import { extractRikishiIdFromProfileUrl } from '../lib/rikishi-profile';
import { divisionAnchorId } from '../lib/rikishi-display';
import { getDayPath } from '../lib/torikumi-routes';

import { toRomaji } from '../lib/romaji';
import './page.css';

type RikishiBoutInfo = {
  opponentName: string;
  winner?: 'win' | 'loss' | 'draw' | 'pending';
  kimarite?: string;
  boutUrl?: string;
  dayLabel?: string;
};

function findRikishiBout(
  day: TorikumiArchiveDay | undefined,
  rikishiId: number,
  mode: 'result' | 'schedule',
): RikishiBoutInfo | null {
  if (!day) return null;
  const divisions = [
    { name: '幕内' as const, matches: day.data.makuuchi.matches },
    { name: '十両' as const, matches: day.data.juryo.matches },
  ];

  for (const { name: division, matches } of divisions) {
    for (const match of matches) {
      const eastId = extractRikishiIdFromProfileUrl(match.eastProfileUrl);
      const westId = extractRikishiIdFromProfileUrl(match.westProfileUrl);

      if (eastId === rikishiId) {
        const isWinner = match.winner === 'east';
        const isLoser = match.winner === 'west';
        return {
          opponentName: match.westName,
          winner: match.winner ? (isWinner ? 'win' : isLoser ? 'loss' : 'draw') : 'pending',
          kimarite: match.kimarite,
          boutUrl: `${getDayPath(day, mode)}#${divisionAnchorId(division, match.boutNo)}`,
          dayLabel: day.label,
        };
      }

      if (westId === rikishiId) {
        const isWinner = match.winner === 'west';
        const isLoser = match.winner === 'east';
        return {
          opponentName: match.eastName,
          winner: match.winner ? (isWinner ? 'win' : isLoser ? 'loss' : 'draw') : 'pending',
          kimarite: match.kimarite,
          boutUrl: `${getDayPath(day, mode)}#${divisionAnchorId(division, match.boutNo)}`,
          dayLabel: day.label,
        };
      }
    }
  }
  return null;
}

export default function MyRikishiPage() {
  const { t } = useTranslation('common');
  const { ids, clear } = useMyRikishi();
  const [rikishi, setRikishi] = React.useState<RikishiIndexItem[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [compareIds, setCompareIds] = React.useState<number[]>([]);

  const banzukeRecordMap = React.useMemo(() => {
    const map = new Map<number, { wins: number; losses: number; draws: number; rank: string }>();
    try {
      const banzuke = getBanzukeDataByMonthKey(torikumiMonthKey);
      [...banzuke.makuuchi, ...banzuke.juryo].forEach((group) => {
        [...group.east, ...group.west].forEach((r) => {
          map.set(r.id, {
            wins: r.wins ?? 0,
            losses: r.losses ?? 0,
            draws: r.draws ?? 0,
            rank: r.rank,
          });
        });
      });
    } catch {
      // ignore
    }
    return map;
  }, []);

  const latestResultDay = React.useMemo(() => {
    return torikumiArchive.resultDays?.filter((d) => d.status === 'published').slice(-1)[0]
      ?? torikumiArchive.resultDays?.[0];
  }, []);

  const latestScheduleDay = React.useMemo(() => {
    if (!latestResultDay) return torikumiArchive.scheduleDays?.[0];
    return torikumiArchive.scheduleDays?.find((d) => d.day === (latestResultDay.day + 1))
      ?? torikumiArchive.scheduleDays?.filter((d) => d.data.makuuchi.matches.length > 0).slice(-1)[0];
  }, [latestResultDay]);

  React.useEffect(() => {
    let active = true;
    fetchRikishiIndex()
      .then((data) => {
        if (!active) return;
        setRikishi(data.rikishi);
        setStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, []);

  const savedRikishi = React.useMemo(() => {
    const byId = new Map(rikishi.map((item) => [item.id, item]));
    return ids.map((id) => byId.get(id)).filter((item): item is RikishiIndexItem => Boolean(item));
  }, [ids, rikishi]);

  React.useEffect(() => {
    setCompareIds((current) => current.filter((id) => ids.includes(id)));
  }, [ids]);

  const clearAll = () => {
    if (window.confirm(t('myRikishi.clearAllConfirm'))) clear();
  };

  const toggleCompare = (id: number) => {
    setCompareIds((current) => current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : current.length < 2 ? [...current, id] : current);
  };

  return (
    <div className="rikishi-page">
      <header className="rikishi-header">
        <div className="site-header-top-row">
          <nav className="site-header-nav" aria-label={t('global.siteNavigation')}>
            <HomeLink placement="header" />
          </nav>
          <h1 className="site-header-title">{t('myRikishi.listTitle')}</h1>
        </div>
        <div className="site-header-desc-row">
          <p>{t('myRikishi.listDescription')}</p>
        </div>
        <div className="site-header-meta-row">
          <p>{t('myRikishi.storageNote')}</p>
        </div>
      </header>
      <main className="rikishi-main">
        {status === 'loading' ? <p className="rikishi-status">{t('rikishi.loading')}</p> : null}
        {status === 'error' ? <p className="rikishi-status warning">{t('rikishi.loadError')}</p> : null}
        {status === 'ready' && savedRikishi.length === 0 ? (
          <section className="rikishi-status my-rikishi-empty">
            <h2>{t('myRikishi.emptyTitle')}</h2>
            <p>{t('myRikishi.emptyDescription')}</p>
            <Link to="/rikishi/" className="rikishi-action-link">{t('myRikishi.findRikishi')}</Link>
          </section>
        ) : null}
        {status === 'ready' && savedRikishi.length > 0 ? (
          <section className="rikishi-grid-section" aria-label={t('myRikishi.listTitle')}>
            <div className="my-rikishi-toolbar">
              <p role="status" aria-live="polite">{t('rikishi.searchResultCount', { count: savedRikishi.length })}</p>
              <div className="my-rikishi-toolbar__actions">
                {compareIds.length >= 2 ? (
                  <Link to={`/compare/?ids=${compareIds.join(',')}`} className="rikishi-action-link">{t('myRikishi.compareSelected')}</Link>
                ) : <span className="my-rikishi-compare-hint">{t('myRikishi.compareNeedMore')}</span>}
                <button type="button" className="my-rikishi-clear" onClick={clearAll}>{t('myRikishi.clearAll')}</button>
              </div>
            </div>
            <div className="rikishi-profile-grid">
              {savedRikishi.map((item) => {
                const record = banzukeRecordMap.get(item.id);
                const todayBout = findRikishiBout(latestResultDay, item.id, 'result');
                const tomorrowBout = findRikishiBout(latestScheduleDay, item.id, 'schedule');
                const isKachikoshi = record && record.wins >= 8;

                return (
                  <article key={item.id} className="rikishi-profile-card">
                    <Link to={rikishiProfilePath(item.id)} className="rikishi-profile-card__link">
                      <span className="rikishi-card-rank">{item.currentRank}</span>
                      <span className="rikishi-card-name">{item.name}</span>
                      <span className="rikishi-card-yomi">{item.yomi}</span>
                      <span className="rikishi-card-romaji">{toRomaji(item.yomi)}</span>
                    </Link>

                    {/* Tournament Live Dashboard for My Rikishi */}
                    <div className="my-rikishi-dashboard">
                      {record ? (
                        <div className="my-rikishi-record">
                          <span className="my-rikishi-record__label">{t('myRikishi.currentRecord')}</span>
                          <span className="my-rikishi-record__score">
                            <strong>{record.wins}</strong>{t('banzuke.winShort')}
                            <strong>{record.losses}</strong>{t('banzuke.lossShort')}
                            {record.draws > 0 ? <span>{record.draws}{t('banzuke.absenceShort')}</span> : null}
                          </span>
                          {isKachikoshi && (
                            <span className="lb-badge lb-badge--kachikoshi">{t('banzuke.kachikoshi')}</span>
                          )}
                        </div>
                      ) : null}

                      <div className="my-rikishi-bouts">
                        {todayBout ? (
                          <div className="my-rikishi-bout today">
                            <div className="my-rikishi-bout__header">
                              <span className="my-rikishi-bout__tag">{todayBout.dayLabel ?? t('myRikishi.todayMatch')}</span>
                              <span className={`my-rikishi-bout__outcome ${todayBout.winner ?? 'pending'}`}>
                                {todayBout.winner === 'win'
                                  ? t('myRikishi.matchWin')
                                  : todayBout.winner === 'loss'
                                    ? t('myRikishi.matchLoss')
                                    : todayBout.winner === 'draw'
                                      ? t('myRikishi.matchDraw')
                                      : t('myRikishi.matchPending')}
                              </span>
                            </div>
                            <div className="my-rikishi-bout__body">
                              <span className="my-rikishi-bout__vs">
                                {t('myRikishi.matchVs', { opponent: todayBout.opponentName })}
                              </span>
                              {todayBout.kimarite ? (
                                <span className="my-rikishi-bout__kimarite">（{todayBout.kimarite}）</span>
                              ) : null}
                            </div>
                            {todayBout.boutUrl && (
                              <Link to={todayBout.boutUrl} className="my-rikishi-bout__link">
                                {t('myRikishi.matchDetailsLink')} →
                              </Link>
                            )}
                          </div>
                        ) : (
                          <div className="my-rikishi-bout none">
                            <div className="my-rikishi-bout__header">
                              <span className="my-rikishi-bout__tag">{t('myRikishi.todayMatch')}</span>
                            </div>
                            <span className="my-rikishi-bout__empty">{t('myRikishi.noMatchToday')}</span>
                          </div>
                        )}

                        {tomorrowBout && (
                          <div className="my-rikishi-bout tomorrow">
                            <div className="my-rikishi-bout__header">
                              <span className="my-rikishi-bout__tag">{tomorrowBout.dayLabel ?? t('myRikishi.tomorrowMatch')}</span>
                              <span className="my-rikishi-bout__outcome pending">{t('myRikishi.matchPending')}</span>
                            </div>
                            <div className="my-rikishi-bout__body">
                              <span className="my-rikishi-bout__vs">
                                {t('myRikishi.matchVs', { opponent: tomorrowBout.opponentName })}
                              </span>
                            </div>
                            {tomorrowBout.boutUrl && (
                              <Link to={tomorrowBout.boutUrl} className="my-rikishi-bout__link">
                                {t('myRikishi.matchDetailsLink')} →
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <MyRikishiToggle rikishiId={item.id} />
                    <label className="my-rikishi-compare-option">
                      <input
                        type="checkbox"
                        checked={compareIds.includes(item.id)}
                        disabled={compareIds.length >= 2 && !compareIds.includes(item.id)}
                        onChange={() => toggleCompare(item.id)}
                      />
                      {t('myRikishi.selectForCompare')}
                    </label>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </main>
      <footer className="rikishi-footer">
        <nav aria-label={t('rikishi.footerNavigation')}>
          <HomeLink placement="footer" />
          <span> | </span>
          <Link to="/rikishi/">{t('myRikishi.findRikishi')}</Link>
        </nav>
      </footer>
    </div>
  );
}
