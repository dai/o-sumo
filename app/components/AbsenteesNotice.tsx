import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { canonicalShikona } from '../lib/rikishi-display';
import { extractRikishiIdFromProfileUrl, rikishiProfilePath } from '../lib/rikishi-profile';

export interface AbsenteeEntry {
  id: number;
  name: string;
  profileUrl: string;
}

export default function AbsenteesNotice({ entries }: { entries: AbsenteeEntry[] }) {
  const { t } = useTranslation('common');

  if (entries.length === 0) {
    return null;
  }

  return (
    <p className="absentees-notice">
      <span className="absentees-label">{t('torikumi.shared.absenteesLabel')}</span>{' '}
      {entries.map((entry, index) => {
        const name = canonicalShikona(entry.profileUrl, entry.name);
        const rikishiId = extractRikishiIdFromProfileUrl(entry.profileUrl);

        return (
          <Fragment key={`${entry.id}:${entry.profileUrl}`}>
            {index > 0 ? '、' : null}
            {rikishiId ? (
              <Link to={rikishiProfilePath(rikishiId)} className="torikumi-rikishi-link">
                {name}
              </Link>
            ) : (
              name
            )}
          </Fragment>
        );
      })}
    </p>
  );
}
