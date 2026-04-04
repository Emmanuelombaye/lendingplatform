import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import sw from '../locales/sw.json';
import zm from '../locales/zm.json';

// Always initialize with the same default on server AND client to prevent
// hydration mismatches (React error #418). Language is switched client-side
// in a useEffect after mount via RootProvider.
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      sw: { translation: sw },
      zm: { translation: zm },
    },
    fallbackLng: 'sw',
    lng: 'sw',           // fixed default — never read localStorage here
    supportedLngs: ['en', 'sw', 'zm'],
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    saveMissing: false,
  });

export default i18n;
