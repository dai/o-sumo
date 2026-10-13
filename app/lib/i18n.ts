import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enCommon from '../../src/locales/en/common.json';
import jaCommon from '../../src/locales/ja/common.json';

export const SUPPORTED_LANGS = ['ja', 'en'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];
export const LANG_STORAGE_KEY = 'o-sumo-lang';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      ja: { common: jaCommon },
    },
    supportedLngs: [...SUPPORTED_LANGS],
    fallbackLng: 'ja',
    defaultNS: 'common',
    ns: ['common'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: LANG_STORAGE_KEY,
      convertDetectedLanguage: (requestedLang: string): string => (
        SUPPORTED_LANGS.includes(requestedLang as SupportedLang)
          ? requestedLang
          : 'ja'
      ),
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export { i18n };

// Keep the <html lang> attribute in sync with the active i18n language so
// assistive technologies and browsers know which dictionary to use. Without
// this, switching between JA/EN keeps the lang="ja" declared in index.html,
// which breaks screen reader pronunciation and CSS `:lang()` selectors.
if (typeof document !== 'undefined') {
  const syncHtmlLang = (lang: string) => {
    const safeLang = SUPPORTED_LANGS.includes(lang as SupportedLang) ? lang : 'ja';
    document.documentElement.lang = safeLang;
  };
  syncHtmlLang(i18n.language || 'ja');
  i18n.on('languageChanged', syncHtmlLang);
}
