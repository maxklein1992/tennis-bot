import { useState } from 'react';
import { submitOnboarding } from '../api/client';
import type { Account, Club } from '../api/types';
import { ClubPicker } from '../components/ClubPicker';
import { Logo } from '../components/Logo';
import { PasswordInput } from '../components/PasswordInput';

/**
 * Tijdelijk vooraf ingevulde vereniging, zolang het echte vereniging-
 * zoeken kapot is (zie backend/src/knltb/knltb-api.service.ts —
 * TEMPORARY_KNOWN_CLUBS). Voorkomt dat je moet typen/zoeken om de enige
 * vereniging te vinden die de tijdelijke fallback kent. Verwijderen zodra
 * het echte zoek-endpoint gefixed is.
 */
const TEMPORARY_DEFAULT_CLUB: Club = {
  id: 'b818722a-9832-4e00-9829-5d2db2a473b6',
  name: 'T.V. Cromwijck',
};

/**
 * Onboarding als popup (issues #3, #4, #11), getoond zodra je voor het
 * eerst een reservering probeert aan te maken zonder KNLTB-koppeling.
 * Vraagt volledige naam, vereniging (opgezocht op naam, levert clubId),
 * bondsnummer en KNLTB-wachtwoord, en verifieert de inloggegevens live bij
 * KNLTB voordat ze worden opgeslagen.
 */
export function OnboardingPage({
  onComplete,
  onCancel,
}: {
  onComplete: (account: Account) => void;
  onCancel: () => void;
}) {
  const [fullName, setFullName] = useState('');
  const [club, setClub] = useState<Club | null>(TEMPORARY_DEFAULT_CLUB);
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
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal onboarding-card" onClick={(e) => e.stopPropagation()}>
        <div className="onboarding-card-brand">
          <Logo size={40} />
        </div>
        <h1>Verbind met de KNLTB app</h1>
        <p className="onboarding-intro">
          Voordat je een reservering kan aanmaken, moet je eerst verbinding maken met de
          KNLTB app.
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
            <label htmlFor="onboarding-password">Wachtwoord in KNLTB app</label>
            <PasswordInput
              id="onboarding-password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onCancel} disabled={submitting}>
              Annuleren
            </button>
            <button type="submit" disabled={submitting} className="primary-button">
              {submitting ? 'Bezig met verifiëren...' : 'Opslaan en doorgaan'}
            </button>
          </div>
          {error && <p className="form-message form-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
