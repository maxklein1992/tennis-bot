import { useEffect, useState } from 'react';
import { getAuthStatus, login, register } from '../api/auth';
import type { AuthUser } from '../api/types';
import { Card } from './Card';

export function AuthPage({
  onAuthenticated,
}: {
  onAuthenticated: (token: string, user: AuthUser) => void;
}) {
  const [mode, setMode] = useState<'login' | 'register' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAuthStatus()
      .then((status) => setMode(status.registrationAvailable ? 'register' : 'login'))
      .catch(() => setMode('login'));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = mode === 'register' ? await register(email, password) : await login(email, password);
      onAuthenticated(result.accessToken, result.user);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (mode === null) return null;

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <h1>ReserveringBot dashboard</h1>
        <h2>{mode === 'register' ? 'Account aanmaken' : 'Inloggen'}</h2>
        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="auth-email">E-mailadres</label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label htmlFor="auth-password">Wachtwoord</label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={mode === 'register' ? 8 : undefined}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={submitting} className="primary-button">
            {submitting ? 'Bezig...' : mode === 'register' ? 'Account aanmaken' : 'Inloggen'}
          </button>
          {error && <p className="form-message form-error">{error}</p>}
        </form>
      </Card>
    </div>
  );
}
