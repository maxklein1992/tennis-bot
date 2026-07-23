import { DateTime } from 'luxon';
import type { Schedule } from '../api/types';
import { Card } from './Card';

const WEEKDAY_LABELS: Record<string, string> = {
  MONDAY: 'Maandag',
  TUESDAY: 'Dinsdag',
  WEDNESDAY: 'Woensdag',
  THURSDAY: 'Donderdag',
  FRIDAY: 'Vrijdag',
  SATURDAY: 'Zaterdag',
  SUNDAY: 'Zondag',
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDate(iso: string): string {
  const formatted = DateTime.fromISO(iso)
    .setZone('Europe/Amsterdam')
    .setLocale('nl')
    .toFormat("cccc dd-LL-yyyy 'om' HH:mm");
  return capitalize(formatted);
}

export function NextUpCard({ schedules }: { schedules: Schedule[] }) {
  const upcoming = schedules
    .filter((s) => s.enabled && s.nextRunAt)
    .sort((a, b) => (a.nextRunAt! < b.nextRunAt! ? -1 : 1))[0];

  return (
    <Card className="next-up-card">
      <h2>Eerstvolgende reservering</h2>
      {upcoming ? (
        <>
          <div className="next-up-date">{formatDate(upcoming.nextRunAt!)}</div>
          <div className="next-up-meta">
            {upcoming.label || `${WEEKDAY_LABELS[upcoming.targetWeekday]} ${upcoming.targetTime}`}
            {upcoming.courtPreference.length > 0 && ` · ${upcoming.courtPreference.join(', ')}`}
          </div>
          <div className="next-up-meta">
            Met: {upcoming.partners.map((p) => p.name).join(', ') || 'geen medespelers'}
          </div>
        </>
      ) : (
        <p className="muted">Geen actieve reserveringen.</p>
      )}
    </Card>
  );
}
