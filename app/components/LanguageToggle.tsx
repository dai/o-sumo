import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS, LANG_STORAGE_KEY, type SupportedLang } from '../lib/i18n';
import './theme-toggle.css';

const LANG_CODES: Record<SupportedLang, string> = { ja: 'JA', en: 'EN' };
const LANG_NAMES: Record<SupportedLang, string> = { ja: '日本語', en: 'English' };

export default function LanguageToggle() {
  const { i18n } = useTranslation('common');
  const resolvedLang = (i18n.resolvedLanguage === 'en' ? 'en' : 'ja') as SupportedLang;

  const handleSwitch = (lang: SupportedLang) => {
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="language-toggle" role="group" aria-label="言語切り替え">
      {SUPPORTED_LANGS.map((lang) => (
        <button
          key={lang}
          type="button"
          className={`language-toggle-btn${resolvedLang === lang ? ' is-active' : ''}`}
          onClick={() => handleSwitch(lang)}
          aria-pressed={resolvedLang === lang}
          title={LANG_NAMES[lang]}
        >
          {LANG_CODES[lang]}
        </button>
      ))}
    </div>
  );
}
