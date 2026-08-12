import { useState } from 'react';
import { DateTime } from 'luxon';
import { deleteSchedule, setScheduleEnabled } from '../api/client';
import type { Schedule } from '../api/types';

const WEEKDAY_LABELS: Record<string, string> = {
  MONDAY: 'Maandag',
  TUESDAY: 'Dinsdag',
  WEDNESDAY: 'Woensdag',
  THURSDAY: 'Donderdag',
  FRIDAY: 'Vrijdag',
  SATURDAY: 'Zaterdag',
  SUNDAY: 'Zondag',
};

const STATUS_EMOJI: Record<string, string> = {
  SUCCESS: '✅',
  VALIDATION_FAILED: '❌',
  NO_SLOT_FOUND: '❌',
  BOOKING_FAILED: '❌',
  ERROR: '❌',
  SKIPPED: '⏭️',
};

function formatDate(iso: string): string {
  return DateTime.fromISO(iso).setZone('Europe/Amsterdam').toFormat('dd-LL-yyyy HH:mm');
}

export function ScheduleCard({
  schedule,
  onChanged,
  onEdit,
  onExceptions,
}: {
  schedule: Schedule;
  onChanged: () => void;
  onEdit: (schedule: Schedule) => void;
  onExceptions: (schedule: Schedule) => void;
}) {
  const [busy, setBusy] = useState(false);

  const playerNames = schedule.partners.map((p) => p.name).join(', ') || 'geen medespelers';

  async function handleToggle() {
    setBusy(true);
    try {
      await setScheduleEnabled(schedule.id, !schedule.enabled);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    const ok = window.confirm(
      `Weet je zeker dat je "${schedule.label ?? 'deze reservering'}" wilt verwijderen? De geschiedenis gaat ook mee.`,
    );
    if (!ok) return;
    setBusy(true);
    try {
      await deleteSchedule(schedule.id);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`schedule-card ${schedule.enabled ? '' : 'schedule-card-disabled'}`}>
      <div className="schedule-card-header">
        <h3>{schedule.label || `${WEEKDAY_LABELS[schedule.targetWeekday]} ${schedule.targetTime}`}</h3>
        <label className="toggle">
          <input
            type="checkbox"
            checked={schedule.enabled}
            onChange={handleToggle}
            disabled={busy}
          />
          <span>{schedule.enabled ? 'Actief' : 'Gepauzeerd'}</span>
        </label>
      </div>

      <div className="schedule-card-meta">
        <div>
          {WEEKDAY_LABELS[schedule.targetWeekday]} {schedule.targetTime}
          {schedule.courtPreference.length > 0 && ` · ${schedule.courtPreference.join(', ')}`}
        </div>
        <div>Medespelers: {playerNames}</div>
      </div>

      {schedule.enabled && schedule.nextRunAt && (
        <div className="schedule-card-next">
          <strong>Eerstvolgende poging:</strong> {formatDate(schedule.nextRunAt)}
        </div>
      )}

      <div className="schedule-card-history">
        <div className="emoji-row">
          {schedule.recentAttempts.length === 0 && <span className="muted">Nog geen pogingen</span>}
          {schedule.recentAttempts.map((a) => (
            <span
              key={a.id}
              title={`${formatDate(a.createdAt)} — ${a.status}${a.courtFallback ? ' (andere baan: voorkeur niet beschikbaar)' : ''}`}
            >
              {STATUS_EMOJI[a.status] ?? '❔'}
            </span>
          ))}
        </div>
        <div className="muted">
          {schedule.successCount} van {schedule.totalCount} geslaagd
        </div>
      </div>

      <div className="schedule-card-actions">
        <button type="button" onClick={() => onEdit(schedule)} disabled={busy}>
          Bewerken
        </button>
        <button type="button" onClick={() => onExceptions(schedule)} disabled={busy}>
          Uitzonderingen
        </button>
        <button type="button" onClick={handleDelete} disabled={busy} className="danger-outline">
          Verwijderen
        </button>
      </div>
    </div>
  );
}
