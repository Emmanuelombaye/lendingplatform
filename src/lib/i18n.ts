import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation files
import en from '../locales/en.json';
import sw from '../locales/sw.json';
import zm from '../locales/zm.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      sw: {
        translation: sw,
      },
      zm: {
        translation: zm,
      },
    },
    fallbackLng: 'sw',
    lng: 'sw',
    supportedLngs: ['sw'],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: [],
      caches: [],
    },
  });

export default i18n;
