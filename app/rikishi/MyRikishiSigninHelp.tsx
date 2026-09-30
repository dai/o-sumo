import React from 'react';
import { useTranslation } from 'react-i18next';

const PANEL_ID = 'my-rikishi-signin-help-panel';
const TITLE_ID = 'my-rikishi-signin-help-title';

export default function MyRikishiSigninHelp() {
  const { t } = useTranslation('common');
  const [open, setOpen] = React.useState(false);

  return (
    <section className="my-rikishi-signin-help" aria-labelledby={TITLE_ID}>
      <button
        type="button"
        className="my-rikishi-signin-help__toggle"
        aria-expanded={open}
        aria-controls={PANEL_ID}
        onClick={() => setOpen((value) => !value)}
      >
        <h2 id={TITLE_ID} className="my-rikishi-signin-help__title">
          {t('myRikishi.auth.help.title')}
        </h2>
        <span aria-hidden="true" className="my-rikishi-signin-help__indicator">
          {open ? t('myRikishi.auth.help.toggleClose') : t('myRikishi.auth.help.toggleOpen')}
        </span>
      </button>
      <div id={PANEL_ID} className="my-rikishi-signin-help__panel" hidden={!open}>
        <p className="my-rikishi-signin-help__intro">{t('myRikishi.auth.help.intro')}</p>
        <ul className="my-rikishi-signin-help__list">
          <li>{t('myRikishi.auth.help.passwordless')}</li>
          <li>{t('myRikishi.auth.help.crossDevice')}</li>
          <li>{t('myRikishi.auth.help.privacy')}</li>
        </ul>
      </div>
    </section>
  );
}
