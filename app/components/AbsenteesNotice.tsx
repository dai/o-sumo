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

export interface AbsenteeGroups {
  makuuchi: AbsenteeEntry[];
  juryo: AbsenteeEntry[];
}

function AbsenteeNames({ entries }: { entries: AbsenteeEntry[] }) {
  return entries.map((entry, index) => {
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
  });
}

export default function AbsenteesNotice({
  entries = [],
  groups,
}: {
  entries?: AbsenteeEntry[];
  groups?: AbsenteeGroups;
}) {
  const { t } = useTranslation('common');

  if (groups) {
    const sections = [
      { key: 'makuuchi', label: t('torikumi.shared.absenteesMakuuchi'), entries: groups.makuuchi },
      { key: 'juryo', label: t('torikumi.shared.absenteesJuryo'), entries: groups.juryo },
    ].filter((section) => section.entries.length > 0);

    if (sections.length === 0) return null;

    return (
      <p className="absentees-notice">
        {sections.map((section, sectionIndex) => (
          <span key={section.key} className="absentees-division">
            {sectionIndex > 0 ? '／' : null}
            <span className="absentees-label">{section.label}</span>{' '}
            <AbsenteeNames entries={section.entries} />
          </span>
        ))}
      </p>
    );
  }

  if (entries.length === 0) {
    return null;
  }

  return (
    <p className="absentees-notice">
      <span className="absentees-label">{t('torikumi.shared.absenteesLabel')}</span>{' '}
      <AbsenteeNames entries={entries} />
    </p>
  );
}
