import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function HomeLink({ placement }: { placement: 'header' | 'footer' }) {
  const { t } = useTranslation('common');

  return (
    <Link to="/" className={`site-home-link site-home-link--${placement}`}>
      {t('global.homeLink')}
    </Link>
  );
}
