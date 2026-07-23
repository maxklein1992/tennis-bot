import { Link } from 'react-router-dom';

const CONTACT_EMAIL = 'mcklein1992@gmail.com';

export function Footer() {
  return (
    <footer className="site-footer">
      <nav className="footer-links">
        <Link to="/">Home</Link>
        <Link to="/hoe-werkt-het">Hoe werkt het</Link>
        <Link to="/over-ons">Over ons</Link>
        <Link to="/contact">Contact</Link>
      </nav>
      <a href={`mailto:${CONTACT_EMAIL}`} className="footer-contact">
        {CONTACT_EMAIL}
      </a>
    </footer>
  );
}
