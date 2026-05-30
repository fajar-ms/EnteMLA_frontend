// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Use require() for JSON files in React Native
const en = require('./localss/en/translation.json');
const ml = require('./localss/ml/translation.json');

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ml: { translation: ml },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;