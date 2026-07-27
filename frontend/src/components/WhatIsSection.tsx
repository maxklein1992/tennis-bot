import { useTranslation } from 'react-i18next';

const WHAT_IS_IMAGE_URL =
  'https://images.unsplash.com/photo-1646649852046-b758d2d573f3?auto=format&fit=crop&w=1200&q=80';

export function WhatIsSection() {
  const { t } = useTranslation();

  return (
    <section className="what-is-section">
      <img className="what-is-image" src={WHAT_IS_IMAGE_URL} alt="" aria-hidden="true" />
      <div className="what-is-content">
        <h2 className="what-is-title">{t('home.whatIsTitle')}</h2>
        <p className="what-is-text">{t('home.whatIsText')}</p>
      </div>
    </section>
  );
}
