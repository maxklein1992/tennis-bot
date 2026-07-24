import { useTranslation } from 'react-i18next';

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="about-page">
      <h1 className="about-title">{t('about.title')}</h1>
      <p className="about-text">{t('about.paragraph1')}</p>
      <p className="about-text">{t('about.paragraph2')}</p>
      <p className="about-text">{t('about.paragraph3')}</p>
    </div>
  );
}
