export interface NavTab {
  path: string;
  /** i18next translation key (under `nav.*`) for this tab's label. */
  labelKey: string;
}

/**
 * Tabs in de marketing-navigatie (naast de homepage zelf en de
 * "Naar dashboard"-knop). Nieuwe tabs (Contact, Over ons, Hoe werkt het, ...)
 * voegen hier een entry toe, registreren hun route in App.tsx en voegen een
 * `nav.<key>` entry toe aan `src/locales/nl.ts` en `src/locales/en.ts`.
 */
export const NAV_TABS: NavTab[] = [
  { path: '/hoe-werkt-het', labelKey: 'nav.howItWorks' },
  { path: '/over-ons', labelKey: 'nav.aboutUs' },
  { path: '/contact', labelKey: 'nav.contact' },
];
