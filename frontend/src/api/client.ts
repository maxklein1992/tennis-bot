import type {
  Account,
  Partner,
  RunNowResult,
  Schedule,
  ScheduleInput,
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
    const body = await res.text().catch(() => '');
    throw new Error(`API-fout ${res.status}: ${body}`);
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
