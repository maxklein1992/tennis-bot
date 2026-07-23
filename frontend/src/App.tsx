import { useEffect, useState } from 'react';
import { getSchedules } from './api/client';
import { clearToken, getMe, getToken, setToken } from './api/auth';
import type { AuthUser, Schedule } from './api/types';
import { OverviewCard } from './components/OverviewCard';
import { NextUpCard } from './components/NextUpCard';
import { ActiveReservationsCard } from './components/ActiveReservationsCard';
import { ScheduleModal } from './components/ScheduleModal';
import { AccountForm } from './components/AccountForm';
import { AuthPage } from './components/AuthPage';
import './App.css';

function App() {
  const [user, setUser] = useState<AuthUser | null | 'checking'>('checking');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalSchedule, setModalSchedule] = useState<Schedule | null | 'new'>(null);

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

  function handleAuthenticated(token: string, authUser: AuthUser) {
    setToken(token);
    setUser(authUser);
  }

  function handleLogout() {
    clearToken();
    setUser(null);
  }

  if (user === 'checking') return null;
  if (!user) return <AuthPage onAuthenticated={handleAuthenticated} />;

  return (
    <div className="app">
      <div className="app-header-row">
        <h1>Tennis-bot dashboard</h1>
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
    </div>
  );
}

export default App;
