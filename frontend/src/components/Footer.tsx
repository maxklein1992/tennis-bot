import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CONTACT_EMAIL = 'mcklein1992@gmail.com';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <nav className="footer-links">
        <Link to="/">{t('footer.home')}</Link>
        <Link to="/hoe-werkt-het">{t('footer.howItWorks')}</Link>
        <Link to="/over-ons">{t('footer.aboutUs')}</Link>
        <Link to="/contact">{t('footer.contact')}</Link>
      </nav>
      <a href={`mailto:${CONTACT_EMAIL}`} className="footer-contact">
        {CONTACT_EMAIL}
      </a>
    </footer>
  );
}
