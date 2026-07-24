import { useTranslation } from 'react-i18next';
import { setLanguage, type Language } from '../i18n';

const LANGUAGE_OPTIONS: { code: Language; flag: string }[] = [
  { code: 'nl', flag: '🇳🇱' },
  { code: 'en', flag: '🇬🇧' },
];

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const activeLanguage = i18n.language === 'en' ? 'en' : 'nl';

  return (
    <div className="language-switcher" role="group" aria-label="Taal / Language">
      {LANGUAGE_OPTIONS.map((option) => (
        <button
          key={option.code}
          type="button"
          className={`language-switcher-option${
            activeLanguage === option.code ? ' language-switcher-option-active' : ''
          }`}
          aria-pressed={activeLanguage === option.code}
          onClick={() => setLanguage(option.code)}
        >
          <span aria-hidden="true">{option.flag}</span>
          <span className="language-switcher-option-label">{t(`languageSwitcher.${option.code}`)}</span>
        </button>
      ))}
    </div>
  );
}
