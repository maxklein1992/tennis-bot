import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { WhatIsSection } from '../components/WhatIsSection';
import { StatsSection } from '../components/StatsSection';
import { FaqSection } from '../components/FaqSection';

// Rechtenvrije stockfoto van een padelwedstrijd (Unsplash), gebruikt als hero-achtergrond.
const HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1646649852033-7e0f3d679f8b?auto=format&fit=crop&w=1920&q=80';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <div className="hero" style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">{t('home.heroTitle')}</h1>
          <p className="hero-subtitle">{t('home.heroSubtitle')}</p>
          <Link to="/dashboard" className="hero-cta primary-button">
            {t('home.heroCta')}
          </Link>
        </div>
      </div>
      <StatsSection />
      <WhatIsSection />
      <HowItWorksSection />
      <FaqSection />
    </>
  );
}
