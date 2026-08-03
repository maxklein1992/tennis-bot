import type { Schedule } from '../api/types';
import { Card } from './Card';
import { ScheduleCard } from './ScheduleCard';

export function ActiveReservationsCard({
  schedules,
  onChanged,
  onEdit,
  onExceptions,
  onNew,
}: {
  schedules: Schedule[];
  onChanged: () => void;
  onEdit: (schedule: Schedule) => void;
  onExceptions: (schedule: Schedule) => void;
  onNew: () => void;
}) {
  return (
    <Card className="active-reservations-card">
      <div className="card-header-row">
        <h2>Actieve reserveringen</h2>
        <button type="button" onClick={onNew} className="primary-button">
          + Nieuwe reservering
        </button>
      </div>

      <div className="schedule-grid">
        {schedules.map((s) => (
          <ScheduleCard
            key={s.id}
            schedule={s}
            onChanged={onChanged}
            onEdit={onEdit}
            onExceptions={onExceptions}
          />
        ))}
        {schedules.length === 0 && <p className="muted">Nog geen wekelijkse reserveringen.</p>}
      </div>
    </Card>
  );
}
