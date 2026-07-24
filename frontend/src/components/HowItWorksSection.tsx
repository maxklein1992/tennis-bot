import { useTranslation } from 'react-i18next';

interface Step {
  title: string;
  description: string;
}

export function HowItWorksSection() {
  const { t } = useTranslation();
  const steps = t('howItWorksSection.steps', { returnObjects: true }) as Step[];

  return (
    <section className="how-it-works-section">
      <h2 className="how-it-works-heading">{t('howItWorksSection.heading')}</h2>
      <p className="how-it-works-intro">{t('howItWorksSection.intro')}</p>
      <ol className="how-it-works-steps">
        {steps.map((step, index) => (
          <li key={step.title} className="how-it-works-step">
            <span className="how-it-works-step-number">{index + 1}</span>
            <h3 className="how-it-works-step-title">{step.title}</h3>
            <p className="how-it-works-step-description">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
