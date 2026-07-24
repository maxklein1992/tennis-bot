import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '../components/Logo';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { FaqSection } from '../components/FaqSection';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <div className="hero">
        <Logo size={56} />
        <h1 className="hero-title">{t('home.heroTitle')}</h1>
        <p className="hero-subtitle">{t('home.heroSubtitle')}</p>
        <Link to="/dashboard" className="hero-cta primary-button">
          {t('home.heroCta')}
        </Link>
      </div>
      <HowItWorksSection />
      <FaqSection />
    </>
  );
}
