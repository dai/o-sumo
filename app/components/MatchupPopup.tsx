import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { MatchupWinsMap } from '../lib/daily-highlights-data';
import { analyzeAikuchi } from '../lib/rikishi-compare-data';

export interface MatchupPopupProps {
  eastId: number | null;
  westId: number | null;
  eastName: string;
  westName: string;
  matchupWinsMap: MatchupWinsMap;
}

export default function MatchupPopup({
  eastId,
  westId,
  eastName,
  westName,
  matchupWinsMap,
}: MatchupPopupProps) {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Close when clicking outside or pressing Escape
  React.useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (eastId === null || westId === null) {
    return <span>{t('torikumi.day.matchScheduled')}</span>;
  }

  const pairKey = `${eastId},${westId}`;
  const reversePairKey = `${westId},${eastId}`;
  const pairRecord = matchupWinsMap.get(pairKey) ?? (
    matchupWinsMap.has(reversePairKey)
      ? [matchupWinsMap.get(reversePairKey)![1], matchupWinsMap.get(reversePairKey)![0]] as [number, number]
      : null
  );

  const winsEast = pairRecord ? pairRecord[0] : 0;
  const winsWest = pairRecord ? pairRecord[1] : 0;
  const totalBouts = winsEast + winsWest;
  const isFirstMeeting = pairRecord !== null && totalBouts === 0;
  const hasHistory = pairRecord !== null && totalBouts > 0;
  const aikuchi = hasHistory ? analyzeAikuchi(winsEast, winsWest) : null;

  const getLeadBadge = (): string | null => {
    if (!aikuchi) return null;
    if (aikuchi.leader === null) return t('torikumi.day.matchupEven');
    const leaderName = aikuchi.leader === 0 ? eastName : westName;
    return t('torikumi.day.matchupLead', { name: leaderName, diff: aikuchi.diff });
  };

  const leadBadge = getLeadBadge();

  return (
    <div
      ref={containerRef}
      className="torikumi-matchup-container"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        className={`torikumi-matchup-trigger${isOpen ? ' is-active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`${t('torikumi.day.matchScheduled')} - ${t('torikumi.day.matchupBadgeAria')}`}
      >
        <span className="torikumi-matchup-label">{t('torikumi.day.matchScheduled')}</span>
        <span className="torikumi-matchup-badge" aria-hidden="true">ℹ</span>
      </button>

      {isOpen && (
        <div
          className="torikumi-matchup-popover"
          role="dialog"
          aria-modal="false"
          aria-label={`${eastName} - ${westName} ${t('torikumi.day.viewMatchupDetails')}`}
        >
          <div className="torikumi-matchup-popover__header">
            <span className="torikumi-matchup-popover__title">
              {eastName} <span className="torikumi-matchup-popover__vs">VS</span> {westName}
            </span>
            <button
              type="button"
              className="torikumi-matchup-popover__close"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              aria-label={t('torikumi.day.closePopup')}
            >
              ×
            </button>
          </div>

          <div className="torikumi-matchup-popover__body">
            {isFirstMeeting ? (
              <div className="torikumi-matchup-popover__first-meeting">
                {t('torikumi.day.firstMeeting')}
              </div>
            ) : hasHistory ? (
              <div className="torikumi-matchup-popover__stats">
                <div className="torikumi-matchup-popover__score-row">
                  <span className="torikumi-matchup-popover__name">{eastName}</span>
                  <span className="torikumi-matchup-popover__score">
                    <strong>{winsEast}</strong> - <strong>{winsWest}</strong>
                  </span>
                  <span className="torikumi-matchup-popover__name">{westName}</span>
                </div>
                {leadBadge && (
                  <div className="torikumi-matchup-popover__lead">
                    {leadBadge}
                  </div>
                )}
              </div>
            ) : (
              <div className="torikumi-matchup-popover__loading">
                {t('torikumi.day.firstMeeting')}
              </div>
            )}
          </div>

          <div className="torikumi-matchup-popover__footer">
            <Link
              to={`/compare/?ids=${eastId},${westId}`}
              className="torikumi-matchup-popover__cta"
              onClick={() => setIsOpen(false)}
            >
              {t('torikumi.day.viewMatchupDetails')} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
