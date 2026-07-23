import { useEffect, useState } from 'react';
import { getAccount, updateAccount } from '../api/client';
import type { Account } from '../api/types';
import { Card } from './Card';

export function AccountForm() {
  const [account, setAccount] = useState<Account | null>(null);
  const [membershipNumber, setMembershipNumber] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAccount()
      .then((a) => {
        setAccount(a);
        setMembershipNumber(a.membershipNumber);
      })
      .catch((e) => setError(e.message));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const input: { membershipNumber?: string; password?: string } = { membershipNumber };
      if (password) input.password = password;
      const updated = await updateAccount(input);
      setAccount(updated);
      setPassword('');
      setMessage('Account opgeslagen.');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  if (!account) return null;

  return (
    <Card className="account-card">
      <h2>Persoonlijke gegevens</h2>
      <form className="account-form-fields" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="membershipNumber">KNLTB-lidmaatschapsnummer</label>
          <input
            id="membershipNumber"
            type="text"
            value={membershipNumber}
            onChange={(e) => setMembershipNumber(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="password">Wachtwoord</label>
          <input
            id="password"
            type="password"
            placeholder={account.hasPassword ? 'laat leeg om ongewijzigd te laten' : ''}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" disabled={saving} className="primary-button">
          {saving ? 'Opslaan...' : 'Opslaan'}
        </button>
        {message && <p className="form-message form-success">{message}</p>}
        {error && <p className="form-message form-error">{error}</p>}
      </form>
    </Card>
  );
}
