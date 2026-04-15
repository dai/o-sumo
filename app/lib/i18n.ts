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
    fallbackLng: 'ja',
    defaultNS: 'common',
    ns: ['common'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: LANG_STORAGE_KEY,
      checkWhitelist: true,
      languageToResolve: (requestedLang: string): SupportedLang => {
        return SUPPORTED_LANGS.includes(requestedLang as SupportedLang)
          ? (requestedLang as SupportedLang)
          : 'ja';
      },
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export { i18n };
