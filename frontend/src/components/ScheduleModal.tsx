import { useState } from 'react';
import { createSchedule, updateSchedule } from '../api/client';
import type { Partner, Schedule, Weekday } from '../api/types';
import { PartnerPicker } from './PartnerPicker';

const WEEKDAYS: Weekday[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

const WEEKDAY_LABELS: Record<Weekday, string> = {
  MONDAY: 'Maandag',
  TUESDAY: 'Dinsdag',
  WEDNESDAY: 'Woensdag',
  THURSDAY: 'Donderdag',
  FRIDAY: 'Vrijdag',
  SATURDAY: 'Zaterdag',
  SUNDAY: 'Zondag',
};

function toCsv(values: string[]): string {
  return values.join(', ');
}

function fromCsv(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ScheduleModal({
  schedule,
  onClose,
  onSaved,
}: {
  schedule: Schedule | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = schedule !== null;
  const [label, setLabel] = useState(schedule?.label ?? '');
  const [targetWeekday, setTargetWeekday] = useState<Weekday>(schedule?.targetWeekday ?? 'MONDAY');
  const [targetTime, setTargetTime] = useState(schedule?.targetTime ?? '19:00');
  const [courtPreference, setCourtPreference] = useState(toCsv(schedule?.courtPreference ?? []));
  const [partners, setPartners] = useState<Partner[]>(schedule?.partners ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const input = {
        label: label || undefined,
        targetWeekday,
        targetTime,
        courtPreference: fromCsv(courtPreference),
        partners,
      };
      if (isEdit) {
        await updateSchedule(schedule.id, input);
      } else {
        await createSchedule(input);
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? 'Reservering bewerken' : 'Nieuwe reservering'}</h2>
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-row">
            <label htmlFor="label">Naam (optioneel)</label>
            <input
              id="label"
              type="text"
              placeholder="bv. Vrijdagochtend"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label htmlFor="weekday">Dag</label>
            <select
              id="weekday"
              value={targetWeekday}
              onChange={(e) => setTargetWeekday(e.target.value as Weekday)}
            >
              {WEEKDAYS.map((w) => (
                <option key={w} value={w}>
                  {WEEKDAY_LABELS[w]}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="time">Tijd</label>
            <input
              id="time"
              type="time"
              lang="nl-NL"
              step={300}
              value={targetTime}
              onChange={(e) => setTargetTime(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="court">Baanvoorkeur</label>
            <input
              id="court"
              type="text"
              placeholder="Tennisbaan 1, Tennisbaan 2"
              value={courtPreference}
              onChange={(e) => setCourtPreference(e.target.value)}
            />
          </div>

          <div className="form-row form-row-start">
            <label>Medespelers</label>
            <PartnerPicker value={partners} onChange={setPartners} />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={saving}>
              Annuleren
            </button>
            <button type="submit" disabled={saving}>
              {saving ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
          {error && <p className="form-message form-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
