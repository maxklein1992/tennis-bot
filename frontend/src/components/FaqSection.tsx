import { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Hoe werkt tennis-bot precies?',
    answer:
      'Je stelt een vast schema in: een dag, tijdstip en baan die je wekelijks wilt bespelen. ' +
      'Zodra de KNLTB-baanplanning voor die datum opent, probeert tennis-bot direct namens jou de ' +
      'gewenste baan te reserveren, zonder dat jij erachter hoeft te blijven wachten.',
  },
  {
    question: 'Hoe vaak wordt er geprobeerd te boeken?',
    answer:
      'Voor elk schema doet tennis-bot één boekingspoging, op het door jou ingestelde tijdstip ' +
      'waarop de baan beschikbaar komt. Lukt de reservering, dan zie je dit direct terug in je dashboard.',
  },
  {
    question: 'Wat gebeurt er als er geen baan beschikbaar is?',
    answer:
      'Als de gewenste baan op dat moment al bezet is, faalt de poging netjes en ontvang je hiervan ' +
      'een melding in je dashboard. Tennis-bot verzint geen alternatieve baan of tijd; je schema blijft ' +
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
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  return (
    <section className="faq-section">
      <h2 className="faq-title">Veelgestelde vragen</h2>
      <div className="faq-list">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.question} className="faq-item">
              <button
                type="button"
                className="faq-question"
                aria-expanded={isOpen}
                onClick={() => toggle(index)}
              >
                {item.question}
                <span className="faq-icon" aria-hidden="true">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && <p className="faq-answer">{item.answer}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
