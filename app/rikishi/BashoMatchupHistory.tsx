import React from 'react';
import { useTranslation } from 'react-i18next';
import type { BashoMatchupRecord } from '../lib/rikishi-compare-data';

interface BashoMatchupHistoryProps {
  records: BashoMatchupRecord[];
  nameA: string;
  nameB: string;
}

const PANEL_ID = 'my-rikishi-matchup-history-panel';
const TITLE_ID = 'my-rikishi-matchup-history-title';

export default function BashoMatchupHistory({ records, nameA, nameB }: BashoMatchupHistoryProps) {
  const { t } = useTranslation('common');
  const [open, setOpen] = React.useState(false);

  if (records.length === 0) return null;

  return (
    <section className="my-rikishi-matchup-history" aria-labelledby={TITLE_ID}>
      <button
        type="button"
        className="my-rikishi-matchup-history__toggle"
        aria-expanded={open}
        aria-controls={PANEL_ID}
        onClick={() => setOpen((value) => !value)}
      >
        <h2 id={TITLE_ID} className="my-rikishi-matchup-history__title">
          {t('myRikishi.matchupHistory.title')}
        </h2>
        <span aria-hidden="true" className="my-rikishi-matchup-history__indicator">
          {open ? t('myRikishi.matchupHistory.toggleClose') : t('myRikishi.matchupHistory.toggleOpen')}
        </span>
      </button>
      <div id={PANEL_ID} className="my-rikishi-matchup-history__panel" hidden={!open}>
        <ol className="my-rikishi-matchup-history__list">
          {records.map((record) => (
            <li key={record.monthKey} className="my-rikishi-matchup-history__item">
              <span className="my-rikishi-matchup-history__basho">{record.year}{record.bashoName}</span>
              <span className="my-rikishi-matchup-history__score">
                {t('myRikishi.matchupHistory.rowScore', {
                  year: record.year,
                  bashoName: record.bashoName,
                  winsA: record.winsA,
                  winsB: record.winsB,
                  nameA,
                  nameB,
                })}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
