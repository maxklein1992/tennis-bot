const DETAILED_STEPS = [
  {
    title: '1. Registreren',
    description:
      'Maak een gratis account aan met je e-mailadres en een wachtwoord. Dit account gebruik je ' +
      'om in te loggen op je tennis-bot dashboard, los van je KNLTB-account.',
  },
  {
    title: '2. KNLTB-gegevens invullen',
    description:
      'Vul je KNLTB-inloggegevens in zodat tennis-bot namens jou kan inloggen bij de reserveringsmodule ' +
      'van jouw vereniging. Je gegevens worden veilig opgeslagen en alleen gebruikt om baanreserveringen ' +
      'te plaatsen — nooit voor iets anders.',
  },
  {
    title: '3. Wekelijkse reservering instellen',
    description:
      'Geef aan op welke dag en tijd je wekelijks wilt spelen, op welke baan (of banen) en eventueel met ' +
      'wie. Je kunt meerdere vaste reserveringen naast elkaar instellen en ze op elk moment aan- of uitzetten.',
  },
  {
    title: '4. Bot boekt automatisch',
    description:
      'Zodra de baan volgens het KNLTB-boekingssysteem vrijkomt (meestal enkele dagen van tevoren), probeert ' +
      'tennis-bot direct te boeken. Lukt het boeken niet in één keer — bijvoorbeeld door een tijdelijke storing ' +
      'of drukte op het platform — dan probeert de bot het automatisch opnieuw, met kleine tussenpozen, totdat ' +
      'de boeking lukt of het boekingsvenster sluit.',
  },
];

export function HowItWorksPage() {
  return (
    <div className="how-it-works-page">
      <h1 className="how-it-works-page-title">Hoe werkt tennis-bot</h1>
      <p className="how-it-works-page-intro">
        Tennis-bot neemt het wekelijkse gepuzzel met baanreserveringen uit handen. Hieronder lees
        je precies wat er gebeurt, van registratie tot geboekte baan.
      </p>
      <ol className="how-it-works-page-steps">
        {DETAILED_STEPS.map((step) => (
          <li key={step.title} className="how-it-works-page-step">
            <h2 className="how-it-works-page-step-title">{step.title}</h2>
            <p className="how-it-works-page-step-description">{step.description}</p>
          </li>
        ))}
      </ol>
      <section className="how-it-works-page-faq">
        <h2>Wat als het een keer niet lukt?</h2>
        <p>
          Mocht een boeking onverhoopt mislukken (bijvoorbeeld omdat de baan toch al bezet blijkt,
          of de KNLTB-website tijdelijk niet bereikbaar is), dan zie je dit direct terug in je
          dashboard, inclusief de reden. Tennis-bot blijft het proberen zolang het boekingsvenster
          open staat.
        </p>
        <h2>Hoe snel wordt er geboekt?</h2>
        <p>
          De bot controleert continu of jouw baan al open staat voor boeking en handelt binnen
          enkele seconden nadat deze beschikbaar komt &mdash; sneller dan je zelf zou kunnen klikken.
        </p>
      </section>
    </div>
  );
}
