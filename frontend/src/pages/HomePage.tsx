import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { FaqSection } from '../components/FaqSection';

export function HomePage() {
  return (
    <>
      <div className="hero">
        <Logo size={56} />
        <h1 className="hero-title">Automatisch je tennisbaan reserveren</h1>
        <p className="hero-subtitle">
          Tennis-bot boekt elke week automatisch je vaste baan bij de KNLTB, zodra deze
          beschikbaar komt &mdash; zonder dat je er zelf achteraan hoeft te zitten.
        </p>
        <Link to="/dashboard" className="hero-cta primary-button">
          Naar dashboard
        </Link>
      </div>
      <FaqSection />
    </>
  );
}
