import { useEffect, useState } from 'react';
import { getAccount, getSchedules } from '../api/client';
import { clearToken, getMe, getToken, setToken } from '../api/auth';
import type { Account, AuthUser, Schedule } from '../api/types';
import { OverviewCard } from '../components/OverviewCard';
import { NextUpCard } from '../components/NextUpCard';
import { ActiveReservationsCard } from '../components/ActiveReservationsCard';
import { ScheduleModal } from '../components/ScheduleModal';
import { AccountForm } from '../components/AccountForm';
import { AuthPage } from '../components/AuthPage';
import { OnboardingPage } from './OnboardingPage';
import { Toast } from '../components/Toast';
import type { ToastMessage } from '../components/Toast';

export function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null | 'checking'>('checking');
  const [account, setAccount] = useState<Account | null | 'checking'>('checking');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalSchedule, setModalSchedule] = useState<Schedule | null | 'new'>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  function refresh() {
    getSchedules()
      .then(setSchedules)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    const handleLogout = () => setUser(null);
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  useEffect(() => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => {
        clearToken();
        setUser(null);
      });
  }, []);

  useEffect(() => {
    if (user && user !== 'checking') refresh();
  }, [user]);

  useEffect(() => {
    if (!user || user === 'checking') return;
    getAccount()
      .then(setAccount)
      .catch((e) => {
        setError(e.message);
        setAccount(null);
      });
  }, [user]);

  function handleAuthenticated(token: string, authUser: AuthUser) {
    setToken(token);
    setUser(authUser);
  }

  function handleLogout() {
    clearToken();
    setUser(null);
  }

  function handleOnboardingComplete(updatedAccount: Account) {
    setAccount(updatedAccount);
    setToast({ kind: 'success', text: 'KNLTB-gegevens geverifieerd. Welkom bij ReserveringBot!' });
  }

  if (user === 'checking') return null;
  if (!user) return <AuthPage onAuthenticated={handleAuthenticated} />;
  if (account === 'checking') return null;
  if (!account || !account.onboardedAt) {
    return <OnboardingPage onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="app">
      <div className="app-header-row">
        <h1>ReserveringBot dashboard</h1>
        <button className="logout-button" onClick={handleLogout}>
          Uitloggen
        </button>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      <div className="top-row">
        <OverviewCard schedules={schedules} />
        <NextUpCard schedules={schedules} />
      </div>

      <ActiveReservationsCard
        schedules={schedules}
        onChanged={refresh}
        onEdit={(schedule) => setModalSchedule(schedule)}
        onNew={() => setModalSchedule('new')}
      />

      <AccountForm />

      {modalSchedule && (
        <ScheduleModal
          schedule={modalSchedule === 'new' ? null : modalSchedule}
          onClose={() => setModalSchedule(null)}
          onSaved={refresh}
        />
      )}

      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
