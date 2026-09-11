import React from 'react';
import { createPortal } from 'react-dom';
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
  const [isPlacementTop, setIsPlacementTop] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  // Check mobile viewport
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const updatePlacement = React.useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setIsPlacementTop(spaceBelow < 250);
    }
  }, []);

  const handleOpen = () => {
    updatePlacement();
    setIsOpen(true);
  };

  const handleToggle = () => {
    if (!isOpen) {
      updatePlacement();
    }
    setIsOpen((prev) => !prev);
  };

  // Close when clicking outside or pressing Escape
  React.useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (isMobile) {
        // Handled by modal backdrop
        return;
      }
      if (containerRef.current && !containerRef.current.contains(target)) {
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
  }, [isOpen, isMobile]);

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

  const renderContent = (mode: 'popover' | 'sheet') => (
    <div
      className={mode === 'sheet' ? 'torikumi-matchup-sheet' : `torikumi-matchup-popover${isPlacementTop ? ' is-placement-top' : ''}`}
      role="dialog"
      aria-modal={mode === 'sheet'}
      aria-label={`${eastName} - ${westName} ${t('torikumi.day.viewMatchupDetails')}`}
    >
      {mode === 'sheet' && <div className="torikumi-matchup-sheet__handle" aria-hidden="true" />}
      <div className={`${mode === 'sheet' ? 'torikumi-matchup-sheet' : 'torikumi-matchup-popover'}__header`}>
        <span className={`${mode === 'sheet' ? 'torikumi-matchup-sheet' : 'torikumi-matchup-popover'}__title`}>
          {eastName} <span className="torikumi-matchup-vs">VS</span> {westName}
        </span>
        <button
          type="button"
          className={`${mode === 'sheet' ? 'torikumi-matchup-sheet' : 'torikumi-matchup-popover'}__close`}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          aria-label={t('torikumi.day.closePopup')}
        >
          ×
        </button>
      </div>

      <div className={`${mode === 'sheet' ? 'torikumi-matchup-sheet' : 'torikumi-matchup-popover'}__body`}>
        {isFirstMeeting ? (
          <div className={`${mode === 'sheet' ? 'torikumi-matchup-sheet' : 'torikumi-matchup-popover'}__first-meeting`}>
            {t('torikumi.day.firstMeeting')}
          </div>
        ) : hasHistory ? (
          <div className={`${mode === 'sheet' ? 'torikumi-matchup-sheet' : 'torikumi-matchup-popover'}__stats`}>
            <div className={`${mode === 'sheet' ? 'torikumi-matchup-sheet' : 'torikumi-matchup-popover'}__score-row`}>
              <span className="torikumi-matchup-rikishi-name">{eastName}</span>
              <span className="torikumi-matchup-score-badge">
                <strong>{winsEast}</strong> - <strong>{winsWest}</strong>
              </span>
              <span className="torikumi-matchup-rikishi-name">{westName}</span>
            </div>
            {leadBadge && (
              <div className={`${mode === 'sheet' ? 'torikumi-matchup-sheet' : 'torikumi-matchup-popover'}__lead`}>
                {leadBadge}
              </div>
            )}
          </div>
        ) : (
          <div className={`${mode === 'sheet' ? 'torikumi-matchup-sheet' : 'torikumi-matchup-popover'}__loading`}>
            {t('torikumi.day.firstMeeting')}
          </div>
        )}
      </div>

      <div className={`${mode === 'sheet' ? 'torikumi-matchup-sheet' : 'torikumi-matchup-popover'}__footer`}>
        <Link
          to={`/compare/?ids=${eastId},${westId}`}
          className={`${mode === 'sheet' ? 'torikumi-matchup-sheet' : 'torikumi-matchup-popover'}__cta`}
          onClick={() => setIsOpen(false)}
        >
          {t('torikumi.day.viewMatchupDetails')} →
        </Link>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="torikumi-matchup-container"
      onMouseEnter={isMobile ? undefined : handleOpen}
      onMouseLeave={isMobile ? undefined : () => setIsOpen(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`torikumi-matchup-trigger${isOpen ? ' is-active' : ''}`}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`${t('torikumi.day.matchScheduled')} - ${t('torikumi.day.matchupBadgeAria')}`}
      >
        <span className="torikumi-matchup-label">
          <span className="torikumi-matchup-label--full">{t('torikumi.day.matchScheduled')}</span>
          <span className="torikumi-matchup-label--short">{t('torikumi.day.matchScheduledMobile', '予定')}</span>
        </span>
        <span className="torikumi-matchup-badge" aria-hidden="true">ℹ</span>
      </button>

      {isOpen && !isMobile && renderContent('popover')}

      {isOpen && isMobile && typeof document !== 'undefined' && createPortal(
        <div
          className="torikumi-matchup-modal-portal"
          role="presentation"
        >
          <div
            className="torikumi-matchup-backdrop"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          {renderContent('sheet')}
        </div>,
        document.body,
      )}
    </div>
  );
}
