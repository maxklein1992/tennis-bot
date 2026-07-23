import { Link, NavLink } from 'react-router-dom';
import { Logo } from './Logo';
import { NAV_TABS } from '../nav-tabs';

export function NavBar() {
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
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Link to="/dashboard" className="nav-cta">
        Naar dashboard
      </Link>
    </header>
  );
}
