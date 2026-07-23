import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { nl } from './locales/nl';
import { en } from './locales/en';

export const SUPPORTED_LANGUAGES = ['nl', 'en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = 'tennis-bot-language';

/**
 * Simple, dependency-free persistence: read the last chosen language from
 * localStorage, defaulting to Dutch (the site's default/source language).
 */
function getStoredLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'nl';
  }
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === 'en' ? 'en' : 'nl';
}

void i18n.use(initReactI18next).init({
  resources: {
    nl: { translation: nl },
    en: { translation: en },
  },
  lng: getStoredLanguage(),
  fallbackLng: 'nl',
  interpolation: {
    escapeValue: false,
  },
});

/** Switch the active language and persist the choice for the next visit. */
export function setLanguage(language: Language) {
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  void i18n.changeLanguage(language);
}

export default i18n;
