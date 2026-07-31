import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { login, register } from '../api/auth';
import type { AuthUser } from '../api/types';
import { Card } from './Card';
import { Logo } from './Logo';

export function AuthPage({
  onAuthenticated,
}: {
  onAuthenticated: (token: string, user: AuthUser) => void;
}) {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function switchMode(next: 'login' | 'register') {
    setMode(next);
    setError(null);
  }

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

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <div className="auth-card-brand">
          <Logo size={40} />
        </div>
        <div className="auth-mode-toggle">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => switchMode('login')}
          >
            Inloggen
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => switchMode('register')}
          >
            Registreren
          </button>
        </div>
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
