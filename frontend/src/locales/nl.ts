/**
 * Nederlandse teksten (bron/standaardtaal van de marketingsite).
 */
export const nl = {
  nav: {
    howItWorks: 'Hoe werkt het',
    aboutUs: 'Over ons',
    contact: 'Contact',
    dashboardCta: 'Naar dashboard',
  },
  footer: {
    home: 'Home',
    howItWorks: 'Hoe werkt het',
    aboutUs: 'Over ons',
    contact: 'Contact',
  },
  home: {
    heroTitle: 'Automatisch je baan reserveren',
    heroSubtitle:
      'ReserveringBot boekt elke week automatisch je vaste baan bij de KNLTB, zodra deze ' +
      'beschikbaar komt — zonder dat je er zelf achteraan hoeft te zitten.',
    heroCta: 'Naar dashboard',
    whatIsTitle: 'Wat is ReserveringBot?',
    whatIsText:
      'ReserveringBot is de makkelijkste manier om nooit meer je vaste baan mis te lopen. ' +
      'Je stelt één keer je vaste dag, tijd en baan in bij de KNLTB — daarna checkt de bot ' +
      'automatisch of de baan vrijkomt en boekt hem meteen voor je, elke week opnieuw.',
  },
  howItWorksSection: {
    heading: 'Hoe werkt het',
    intro:
      'In vier eenvoudige stappen regelt ReserveringBot je vaste baan, zonder dat je zelf ' +
      'hoeft te wachten of te klikken.',
    steps: [
      {
        title: 'Registreren',
        description: 'Maak in een paar minuten een gratis account aan bij ReserveringBot.',
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
        description: 'Zodra de baan vrijkomt, boekt ReserveringBot deze automatisch voor je.',
      },
    ],
  },
  faq: {
    title: 'Veelgestelde vragen',
    items: [
      {
        question: 'Hoe werkt ReserveringBot precies?',
        answer:
          'Je stelt een vast schema in: een dag, tijdstip en baan die je wekelijks wilt bespelen. ' +
          'Zodra de KNLTB-baanplanning voor die datum opent, probeert ReserveringBot direct namens jou de ' +
          'gewenste baan te reserveren, zonder dat jij erachter hoeft te blijven wachten.',
      },
      {
        question: 'Hoe vaak wordt er geprobeerd te boeken?',
        answer:
          'Voor elk schema doet ReserveringBot één boekingspoging, op het door jou ingestelde tijdstip ' +
          'waarop de baan beschikbaar komt. Lukt de reservering, dan zie je dit direct terug in je dashboard.',
      },
      {
        question: 'Wat gebeurt er als er geen baan beschikbaar is?',
        answer:
          'Als de gewenste baan op dat moment al bezet is, faalt de poging netjes en ontvang je hiervan ' +
          'een melding in je dashboard. ReserveringBot verzint geen alternatieve baan of tijd; je schema blijft ' +
          'gewoon actief voor de week erna.',
      },
      {
        question: 'Is mijn KNLTB-wachtwoord veilig?',
        answer:
          'Je wachtwoord wordt versleuteld opgeslagen op onze server, uitsluitend om namens jou te kunnen ' +
          'inloggen bij de KNLTB tijdens het boeken. We doen ons best om dit zo veilig mogelijk te bewaren, ' +
          'maar zoals bij elke dienst die met een wachtwoord werkt, kunnen we geen absolute garanties geven. ' +
          'Gebruik bij voorkeur geen wachtwoord dat je ook elders gebruikt.',
      },
      {
        question: 'Kan ik meerdere vaste schema’s tegelijk laten boeken?',
        answer:
          'Ja, je kunt meerdere schema’s aanmaken, bijvoorbeeld voor verschillende dagen of speelpartners. ' +
          'Elk schema wordt onafhankelijk van de andere op zijn eigen tijdstip verwerkt.',
      },
    ],
  },
  contact: {
    title: 'Contact',
    subtitle:
      'ReserveringBot is een hobbyproject van één persoon — geen supportteam, geen ' +
      'wachtrij. Heb je een vraag, een bug gevonden of een idee voor een nieuwe functie? Mail ' +
      'gerust, ik reageer meestal snel.',
    mailButton: 'Mail ons: {{email}}',
  },
  about: {
    title: 'Over deze bot',
    paragraph1:
      'Bij onze tennisclub gaan vaste banen een vast aantal dagen van tevoren open — en ze ' +
      'zijn binnen enkele minuten volgeboekt. Zelf op het juiste moment inloggen en op ' +
      '"boeken" klikken bleek in de praktijk niet vol te houden, dus is deze bot ' +
      'ontstaan: hij checkt automatisch of de baan vrijkomt en boekt hem meteen, elke week ' +
      'opnieuw.',
    paragraph2:
      'Het is een hobbyproject van één ontwikkelaar (Max), oorspronkelijk ' +
      'gebouwd om wekelijks de vaste baan van zijn moeder bij de KNLTB te reserveren. Geen ' +
      'commercieel product, geen team erachter — gewoon een klein stukje automatisering ' +
      'dat een vervelend terugkerend klusje uit handen neemt.',
    paragraph3:
      'Dit dashboard laat zien welke boekingen er lopen, wanneer de volgende poging is en ' +
      'hoe het de vorige keer is gegaan.',
  },
  howItWorksPage: {
    title: 'Hoe werkt ReserveringBot',
    intro:
      'ReserveringBot neemt het wekelijkse gepuzzel met baanreserveringen uit handen. Hieronder lees ' +
      'je precies wat er gebeurt, van registratie tot geboekte baan.',
    steps: [
      {
        title: '1. Registreren',
        description:
          'Maak een gratis account aan met je e-mailadres en een wachtwoord. Dit account gebruik je ' +
          'om in te loggen op je ReserveringBot dashboard, los van je KNLTB-account.',
      },
      {
        title: '2. KNLTB-gegevens invullen',
        description:
          'Vul je KNLTB-inloggegevens in zodat ReserveringBot namens jou kan inloggen bij de reserveringsmodule ' +
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
          'ReserveringBot direct te boeken. Lukt het boeken niet in één keer — bijvoorbeeld door een tijdelijke storing ' +
          'of drukte op het platform — dan probeert de bot het automatisch opnieuw, met kleine tussenpozen, totdat ' +
          'de boeking lukt of het boekingsvenster sluit.',
      },
    ],
    faq: {
      q1: 'Wat als het een keer niet lukt?',
      a1:
        'Mocht een boeking onverhoopt mislukken (bijvoorbeeld omdat de baan toch al bezet blijkt, ' +
        'of de KNLTB-website tijdelijk niet bereikbaar is), dan zie je dit direct terug in je ' +
        'dashboard, inclusief de reden. ReserveringBot blijft het proberen zolang het boekingsvenster ' +
        'open staat.',
      q2: 'Hoe snel wordt er geboekt?',
      a2:
        'De bot controleert continu of jouw baan al open staat voor boeking en handelt binnen ' +
        'enkele seconden nadat deze beschikbaar komt — sneller dan je zelf zou kunnen klikken.',
    },
  },
  languageSwitcher: {
    nl: 'Nederlands',
    en: 'English',
  },
};
