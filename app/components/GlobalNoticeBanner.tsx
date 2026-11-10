import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resolveGlobalNotice, type GlobalNoticeArchive } from '../lib/global-notice';
import { torikumiArchive } from '../lib/torikumi-data';

export default function GlobalNoticeBanner({
  archive = torikumiArchive,
  now = new Date(),
}: {
  archive?: GlobalNoticeArchive;
  now?: Date;
}) {
  const { t, i18n } = useTranslation('common');
  const notice = resolveGlobalNotice(archive, now, i18n.language);
  if (!notice) return null;

  const message = notice.partial
    ? t('global.noticePartial', { day: notice.dayLabel })
    : t('global.noticeUpdated', { basho: notice.bashoLabel, day: notice.dayLabel });

  return (
    <div className="global-notice-banner" role="status" aria-live="polite">
      <Link to={notice.href} className="global-notice-banner__link">
        {message}
      </Link>
    </div>
  );
}
