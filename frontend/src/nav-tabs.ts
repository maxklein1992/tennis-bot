export interface NavTab {
  path: string;
  label: string;
}

/**
 * Tabs in de marketing-navigatie (naast de homepage zelf en de
 * "Naar dashboard"-knop). Nieuwe tabs (Contact, Over ons, Hoe werkt het, ...)
 * voegen hier een entry toe en registreren hun route in App.tsx.
 */
export const NAV_TABS: NavTab[] = [
  { path: '/hoe-werkt-het', label: 'Hoe werkt het' },
  { path: '/contact', label: 'Contact' },
];
