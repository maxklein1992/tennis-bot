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
    <select
      className="language-switcher"
      aria-label="Taal / Language"
      value={activeLanguage}
      onChange={(e) => setLanguage(e.target.value as Language)}
    >
      {LANGUAGE_OPTIONS.map((option) => (
        <option key={option.code} value={option.code}>
          {option.flag} {t(`languageSwitcher.${option.code}`)}
        </option>
      ))}
    </select>
  );
}
