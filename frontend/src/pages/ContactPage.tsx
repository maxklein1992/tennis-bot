import { useTranslation } from 'react-i18next';

const CONTACT_EMAIL = 'mcklein1992@gmail.com';

export function ContactPage() {
  const { t } = useTranslation();

  return (
    <div className="contact-page">
      <h1 className="contact-title">{t('contact.title')}</h1>
      <p className="contact-subtitle">{t('contact.subtitle')}</p>
      <a href={`mailto:${CONTACT_EMAIL}`} className="contact-mail-button primary-button">
        {t('contact.mailButton', { email: CONTACT_EMAIL })}
      </a>
    </div>
  );
}
