import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NAV_TABS } from '../nav-tabs';
import { getAuthStatus } from '../api/auth';

export function NavBar() {
  const { t } = useTranslation();
  const [registrationAvailable, setRegistrationAvailable] = useState(false);

  useEffect(() => {
    getAuthStatus()
      .then((status) => setRegistrationAvailable(status.registrationAvailable))
      .catch(() => setRegistrationAvailable(false));
  }, []);

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
        <Link to="/dashboard?mode=login" className="nav-cta nav-cta-outline">
          {t('nav.loginCta')}
        </Link>
        {registrationAvailable ? (
          <Link to="/dashboard?mode=register" className="nav-cta">
            {t('nav.registerCta')}
          </Link>
        ) : (
          <span className="nav-cta nav-cta-disabled" title={t('nav.registerUnavailable')}>
            {t('nav.registerCta')}
          </span>
        )}
      </div>
    </header>
  );
}
