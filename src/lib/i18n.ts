import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation files
import en from '../locales/en.json';
import sw from '../locales/sw.json';
import zm from '../locales/zm.json';

import { getStoredRegion, REGIONS } from './regions';

const currentRegion = getStoredRegion();

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
    fallbackLng: 'en',
    lng: currentRegion.language,
    supportedLngs: ['en', 'sw', 'zm'],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
