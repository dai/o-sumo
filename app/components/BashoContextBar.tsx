import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getBashoStatus, type BashoStatus } from '../lib/basho-status';
import type { TorikumiDataSet } from '../lib/torikumi-data';
import { formatUpdatedAt } from '../lib/updated-at';

type BashoContextBarProps = {
  archive: TorikumiDataSet;
  bashoTitle: string;
  resultPath: string;
  schedulePath: string;
  updatedAt: string;
  status?: BashoStatus;
};

export function bashoStatusLabel(status: BashoStatus, t: (key: string, options?: Record<string, unknown>) => string): string {
  if (status.kind === 'live') return t('bashoStatus.live', { day: status.day ?? '' });
  if (status.kind === 'upcoming') return t('bashoStatus.upcoming');
  return t('bashoStatus.final');
}

export default function BashoContextBar({
  archive,
  bashoTitle,
  resultPath,
  schedulePath,
  updatedAt,
  status,
}: BashoContextBarProps) {
  const { t } = useTranslation('common');
  const currentStatus = status ?? getBashoStatus(archive);
  const primaryPath = currentStatus.kind === 'final' ? resultPath : schedulePath;
  const primaryLabel = currentStatus.kind === 'final'
    ? t('bashoStatus.viewFinalResults')
    : t('bashoStatus.viewSchedule');

  return (
    <aside className={`basho-context-bar basho-context-bar--${currentStatus.kind}`} aria-label={t('bashoStatus.contextLabel')}>
      <div className="basho-context-bar__summary">
        <span className="basho-context-bar__title">{bashoTitle}</span>
        <strong className="basho-context-bar__status">{bashoStatusLabel(currentStatus, t)}</strong>
        <span className="basho-context-bar__updated">{t('bashoStatus.updatedAt', { date: formatUpdatedAt(updatedAt) })}</span>
      </div>
      <div className="basho-context-bar__actions">
        <Link to={primaryPath}>{primaryLabel}</Link>
        <Link to={currentStatus.kind === 'final' ? schedulePath : resultPath}>
          {currentStatus.kind === 'final' ? t('bashoStatus.viewPastSchedule') : t('bashoStatus.viewResults')}
        </Link>
      </div>
    </aside>
  );
}
