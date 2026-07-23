export function AboutPage() {
  return (
    <div className="about-page">
      <h1 className="about-title">Over deze bot</h1>
      <p className="about-text">
        Bij onze tennisclub gaan vaste banen precies 7 dagen van tevoren open &mdash; en ze
        zijn binnen enkele minuten volgeboekt. Zelf op het juiste moment inloggen en op
        &quot;boeken&quot; klikken bleek in de praktijk niet vol te houden, dus is deze bot
        ontstaan: hij checkt automatisch of de baan vrijkomt en boekt hem meteen, elke week
        opnieuw.
      </p>
      <p className="about-text">
        Het is een hobbyproject van &eacute;&eacute;n ontwikkelaar (Max), oorspronkelijk
        gebouwd om wekelijks de vaste baan van zijn moeder bij de KNLTB te reserveren. Geen
        commercieel product, geen team erachter &mdash; gewoon een klein stukje automatisering
        dat een vervelend terugkerend klusje uit handen neemt.
      </p>
      <p className="about-text">
        Dit dashboard laat zien welke boekingen er lopen, wanneer de volgende poging is en
        hoe het de vorige keer is gegaan.
      </p>
    </div>
  );
}
