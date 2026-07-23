import type { AuthResult, AuthStatus, AuthUser } from './types';

const TOKEN_KEY = 'tennisbot_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function parseError(res: Response, fallback: string): Promise<Error> {
  const body = await res.json().catch(() => null);
  return new Error(body?.message ?? fallback);
}

export async function getAuthStatus(): Promise<AuthStatus> {
  const res = await fetch('/api/auth/status');
  if (!res.ok) throw await parseError(res, 'Kon status niet ophalen.');
  return res.json();
}

export async function register(email: string, password: string): Promise<AuthResult> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw await parseError(res, 'Registreren mislukt.');
  return res.json();
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw await parseError(res, 'Inloggen mislukt.');
  return res.json();
}

export async function getMe(): Promise<AuthUser> {
  const token = getToken();
  const res = await fetch('/api/auth/me', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw await parseError(res, 'Niet ingelogd.');
  return res.json();
}
