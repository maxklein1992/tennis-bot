import type { Schedule } from '../api/types';
import { Card } from './Card';

export function OverviewCard({ schedules }: { schedules: Schedule[] }) {
  const activeCount = schedules.filter((s) => s.enabled).length;
  const totalSuccessful = schedules.reduce((sum, s) => sum + s.successCount, 0);

  return (
    <Card className="overview-card">
      <div className="overview-stat">
        <span className="overview-value">{activeCount}</span>
        <span className="overview-label">actieve reserveringen</span>
      </div>
      <div className="overview-stat">
        <span className="overview-value">{totalSuccessful}</span>
        <span className="overview-label">succesvolle boekingen</span>
      </div>
    </Card>
  );
}
