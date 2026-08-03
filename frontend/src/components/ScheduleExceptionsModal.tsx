import { useEffect, useState } from 'react';
import {
  deleteScheduleException,
  listScheduleExceptions,
  upsertScheduleException,
} from '../api/client';
import type { Partner, Schedule, ScheduleException } from '../api/types';
import { PartnerPicker } from './PartnerPicker';

type Mode = 'skip' | 'override';

export function ScheduleExceptionsModal({
  schedule,
  onClose,
  onChanged,
}: {
  schedule: Schedule;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [date, setDate] = useState('');
  const [mode, setMode] = useState<Mode>('skip');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [editingDate, setEditingDate] = useState<string | null>(null);

  function load() {
    setLoading(true);
    listScheduleExceptions(schedule.id)
      .then(setExceptions)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [schedule.id]);

  function resetForm() {
    setDate('');
    setMode('skip');
    setPartners([]);
    setEditingDate(null);
  }

  function startEdit(exception: ScheduleException) {
    setDate(exception.date);
    setMode(exception.skip ? 'skip' : 'override');
    setPartners(exception.partners);
    setEditingDate(exception.date);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await upsertScheduleException(schedule.id, date, {
        skip: mode === 'skip',
        partners: mode === 'override' ? partners : undefined,
      });
      resetForm();
      load();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(exceptionDate: string) {
    const ok = window.confirm(`Uitzondering voor ${exceptionDate} verwijderen?`);
    if (!ok) return;
    await deleteScheduleException(schedule.id, exceptionDate);
    if (editingDate === exceptionDate) resetForm();
    load();
    onChanged();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Uitzonderingen — {schedule.label || 'deze reservering'}</h2>
        <p className="muted">
          Stel per datum in dat er niet gereserveerd moet worden, of gebruik andere
          medespelers voor die ene datum. De wekelijkse instelling zelf blijft ongewijzigd.
        </p>

        {loading && <p className="muted">Laden...</p>}

        {!loading && (
          <div className="exception-list">
            {exceptions.length === 0 && (
              <p className="muted">Nog geen uitzonderingen ingesteld.</p>
            )}
            {exceptions.map((exception) => (
              <div className="exception-row" key={exception.date}>
                <div>
                  <strong>{exception.date}</strong> —{' '}
                  {exception.skip
                    ? 'niet reserveren'
                    : `andere medespelers: ${exception.partners.map((p) => p.name).join(', ') || 'geen'}`}
                </div>
                <div className="exception-row-actions">
                  <button type="button" onClick={() => startEdit(exception)}>
                    Bewerken
                  </button>
                  <button type="button" onClick={() => handleDelete(exception.date)}>
                    Verwijderen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-row">
            <label htmlFor="exception-date">Datum</label>
            <input
              id="exception-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={editingDate !== null}
              required
            />
          </div>

          <div className="auth-mode-toggle">
            <button
              type="button"
              className={mode === 'skip' ? 'active' : ''}
              onClick={() => setMode('skip')}
            >
              Niet reserveren
            </button>
            <button
              type="button"
              className={mode === 'override' ? 'active' : ''}
              onClick={() => setMode('override')}
            >
              Andere medespelers
            </button>
          </div>

          {mode === 'override' && (
            <div className="form-row form-row-start">
              <label>Medespelers</label>
              <PartnerPicker value={partners} onChange={setPartners} />
            </div>
          )}

          <div className="modal-actions">
            {editingDate !== null && (
              <button type="button" onClick={resetForm} disabled={saving}>
                Annuleren
              </button>
            )}
            <button type="button" onClick={onClose} disabled={saving}>
              Sluiten
            </button>
            <button type="submit" disabled={saving || !date}>
              {saving ? 'Opslaan...' : editingDate !== null ? 'Bijwerken' : 'Toevoegen'}
            </button>
          </div>
          {error && <p className="form-message form-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
