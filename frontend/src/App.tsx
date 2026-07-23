import { useEffect, useState } from 'react';
import { getSchedules } from './api/client';
import type { Schedule } from './api/types';
import { OverviewCard } from './components/OverviewCard';
import { NextUpCard } from './components/NextUpCard';
import { ActiveReservationsCard } from './components/ActiveReservationsCard';
import { ScheduleModal } from './components/ScheduleModal';
import { AccountForm } from './components/AccountForm';
import './App.css';

function App() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalSchedule, setModalSchedule] = useState<Schedule | null | 'new'>(null);

  function refresh() {
    getSchedules()
      .then(setSchedules)
      .catch((e) => setError(e.message));
  }

  useEffect(refresh, []);

  return (
    <div className="app">
      <h1>Tennis-bot dashboard</h1>

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
