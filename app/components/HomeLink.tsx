import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function HomeLink({ placement }: { placement: 'header' | 'footer' }) {
  const { t } = useTranslation('common');

  if (placement === 'header') {
    const homeText = t('global.homeLink');
    const backToHomeText = t('global.backToHome');
    return (
      <Link
        to="/"
        className="site-home-link site-home-link--header"
        aria-label={homeText}
        title={backToHomeText}
      >
        <img
          src="/favicon.svg"
          alt=""
          aria-hidden="true"
          className="site-logo-favicon"
          width="26"
          height="26"
        />
        <span className="site-logo-tooltip" aria-hidden="true">{backToHomeText}</span>
      </Link>
    );
  }

  return (
    <Link to="/" className="site-home-link site-home-link--footer">
      {t('global.homeLink')}
    </Link>
  );
}
