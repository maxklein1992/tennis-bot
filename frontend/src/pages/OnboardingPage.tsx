import { useState } from 'react';
import { submitOnboarding } from '../api/client';
import type { Account, Club } from '../api/types';
import { Card } from '../components/Card';
import { ClubPicker } from '../components/ClubPicker';
import { Logo } from '../components/Logo';

/**
 * Onboardingpagina (issues #3, #4, #11): verplichte stap direct na
 * registratie, vóór het dashboard. Vraagt volledige naam, vereniging
 * (opgezocht op naam, levert clubId), bondsnummer en KNLTB-wachtwoord, en
 * verifieert de inloggegevens live bij KNLTB voordat ze worden opgeslagen.
 */
export function OnboardingPage({
  onComplete,
}: {
  onComplete: (account: Account) => void;
}) {
  const [fullName, setFullName] = useState('');
  const [club, setClub] = useState<Club | null>(null);
  const [membershipNumber, setMembershipNumber] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!club) {
      setError('Kies een vereniging.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const account = await submitOnboarding({
        fullName,
        clubId: club.id,
        clubName: club.name,
        membershipNumber,
        password,
      });
      onComplete(account);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <Card className="onboarding-card">
        <div className="onboarding-card-brand">
          <Logo size={40} />
        </div>
        <h1>Welkom bij ReserveringBot</h1>
        <p className="onboarding-intro">
          Voordat je naar het dashboard gaat, hebben we nog een paar gegevens nodig.
        </p>
        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="onboarding-fullname">Volledige naam</label>
            <input
              id="onboarding-fullname"
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label htmlFor="onboarding-club">Vereniging</label>
            <ClubPicker value={club} onChange={setClub} />
          </div>
          <div className="form-row">
            <label htmlFor="onboarding-membership">KNLTB-bondsnummer</label>
            <input
              id="onboarding-membership"
              type="text"
              required
              value={membershipNumber}
              onChange={(e) => setMembershipNumber(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label htmlFor="onboarding-password">Wachtwoord</label>
            <input
              id="onboarding-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={submitting} className="primary-button">
            {submitting ? 'Bezig met verifiëren...' : 'Opslaan en doorgaan'}
          </button>
          {error && <p className="form-message form-error">{error}</p>}
        </form>
      </Card>
    </div>
  );
}
