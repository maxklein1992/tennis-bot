import { useTranslation } from 'react-i18next';

interface Step {
  title: string;
  description: string;
}

export function HowItWorksPage() {
  const { t } = useTranslation();
  const steps = t('howItWorksPage.steps', { returnObjects: true }) as Step[];

  return (
    <div className="how-it-works-page">
      <h1 className="how-it-works-page-title">{t('howItWorksPage.title')}</h1>
      <p className="how-it-works-page-intro">{t('howItWorksPage.intro')}</p>
      <ol className="how-it-works-page-steps">
        {steps.map((step) => (
          <li key={step.title} className="how-it-works-page-step">
            <h2 className="how-it-works-page-step-title">{step.title}</h2>
            <p className="how-it-works-page-step-description">{step.description}</p>
          </li>
        ))}
      </ol>
      <section className="how-it-works-page-faq">
        <h2>{t('howItWorksPage.faq.q1')}</h2>
        <p>{t('howItWorksPage.faq.a1')}</p>
        <h2>{t('howItWorksPage.faq.q2')}</h2>
        <p>{t('howItWorksPage.faq.a2')}</p>
      </section>
    </div>
  );
}
