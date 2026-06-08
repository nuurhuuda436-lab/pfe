import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fr from './locales/fr.json';
import en from './locales/en.json';
import ar from './locales/ar.json';

const DEFAULT_LANG = 'fr';
const savedLang = localStorage.getItem('lang') || DEFAULT_LANG;

const setDocumentDirection = (lng) => {
  const isRtl = lng === 'ar';
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lng);
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: savedLang,
    fallbackLng: DEFAULT_LANG,
    interpolation: { escapeValue: false },
  });

setDocumentDirection(i18n.language);

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('lang', lng);
  setDocumentDirection(lng);
});

export default i18n;