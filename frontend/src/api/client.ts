import type {
  Account,
  Club,
  OnboardingInput,
  Partner,
  RunNowResult,
  Schedule,
  ScheduleException,
  ScheduleExceptionInput,
  ScheduleInput,
  Stats,
  UpdateAccountInput,
} from './types';
import { clearToken, getToken } from './auth';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { headers, ...init });

  if (res.status === 401) {
    clearToken();
    window.dispatchEvent(new Event('auth:logout'));
  }
  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    const rawMessage =
      body && typeof body === 'object' && 'message' in body
        ? (body as { message: unknown }).message
        : null;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(', ')
      : (rawMessage ?? `API-fout ${res.status}`);
    throw new Error(String(message));
  }
  return res.json() as Promise<T>;
}

export function getSchedules(): Promise<Schedule[]> {
  return request<Schedule[]>('/schedules');
}

export function createSchedule(input: ScheduleInput): Promise<Schedule> {
  return request<Schedule>('/schedules', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateSchedule(id: string, input: ScheduleInput): Promise<Schedule> {
  return request<Schedule>(`/schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteSchedule(id: string): Promise<{ ok: boolean }> {
  return request(`/schedules/${id}`, { method: 'DELETE' });
}

export function setScheduleEnabled(id: string, enabled: boolean): Promise<{ ok: boolean }> {
  return request(`/schedules/${id}/enabled`, {
    method: 'PATCH',
    body: JSON.stringify({ enabled }),
  });
}

export function listScheduleExceptions(scheduleId: string): Promise<ScheduleException[]> {
  return request<ScheduleException[]>(`/schedules/${scheduleId}/exceptions`);
}

export function upsertScheduleException(
  scheduleId: string,
  date: string,
  input: ScheduleExceptionInput,
): Promise<ScheduleException> {
  return request<ScheduleException>(`/schedules/${scheduleId}/exceptions/${date}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteScheduleException(
  scheduleId: string,
  date: string,
): Promise<{ ok: boolean }> {
  return request(`/schedules/${scheduleId}/exceptions/${date}`, { method: 'DELETE' });
}

export function runScheduleNow(
  id: string,
  dryRun: boolean,
  confirm = false,
): Promise<RunNowResult> {
  return request<RunNowResult>(`/schedules/${id}/run-now`, {
    method: 'POST',
    body: JSON.stringify({ dryRun, confirm }),
  });
}

export function getAccount(): Promise<Account> {
  return request<Account>('/account');
}

export function updateAccount(input: UpdateAccountInput): Promise<Account> {
  return request<Account>('/account', {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function searchMembers(q: string): Promise<Partner[]> {
  return request<Partner[]>(`/members/search?q=${encodeURIComponent(q)}`);
}

export function searchClubs(q: string): Promise<Club[]> {
  return request<Club[]>(`/clubs/search?q=${encodeURIComponent(q)}`);
}

export function submitOnboarding(input: OnboardingInput): Promise<Account> {
  return request<Account>('/onboarding', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getStats(): Promise<Stats> {
  return request<Stats>('/stats');
}
