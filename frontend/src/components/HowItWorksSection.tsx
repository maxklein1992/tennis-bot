const STEPS = [
  {
    title: 'Registreren',
    description: 'Maak in een paar minuten een gratis account aan bij tennis-bot.',
  },
  {
    title: 'KNLTB-gegevens invullen',
    description: 'Vul je KNLTB-inloggegevens en je vaste baanvoorkeuren in.',
  },
  {
    title: 'Wekelijkse reservering instellen',
    description: 'Kies dag, tijd en baan waarop je elke week wilt spelen.',
  },
  {
    title: 'Bot boekt automatisch',
    description: 'Zodra de baan vrijkomt, boekt tennis-bot deze automatisch voor je.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="how-it-works-section">
      <h2 className="how-it-works-heading">Hoe werkt het</h2>
      <p className="how-it-works-intro">
        In vier eenvoudige stappen regelt tennis-bot je vaste baan, zonder dat je zelf
        hoeft te wachten of te klikken.
      </p>
      <ol className="how-it-works-steps">
        {STEPS.map((step, index) => (
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
