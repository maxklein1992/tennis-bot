import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NAV_TABS } from '../nav-tabs';

export function NavBar() {
  const { t } = useTranslation();

  return (
    <header className="nav-bar">
      <Link to="/" className="nav-logo-link">
        <Logo />
      </Link>
      <nav className="nav-tabs">
        {NAV_TABS.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) => `nav-tab${isActive ? ' nav-tab-active' : ''}`}
          >
            {t(tab.labelKey)}
          </NavLink>
        ))}
      </nav>
      <div className="nav-actions">
        <LanguageSwitcher />
        <Link to="/dashboard" className="nav-cta">
          {t('nav.dashboardCta')}
        </Link>
      </div>
    </header>
  );
}
