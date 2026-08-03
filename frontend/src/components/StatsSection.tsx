import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getStats } from '../api/client';
import type { Stats } from '../api/types';

const NUMBER_FORMAT = new Intl.NumberFormat('nl-NL');

export function StatsSection() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  // Geen foutmelding tonen op de marketing-homepage als dit niet lukt —
  // de sectie verschijnt dan gewoon niet.
  if (!stats) return null;

  return (
    <section className="stats-section">
      <div className="stats-tile">
        <span className="stats-value">{NUMBER_FORMAT.format(stats.activeUsers)}</span>
        <span className="stats-label">{t('home.statsActiveUsers')}</span>
      </div>
      <div className="stats-tile">
        <span className="stats-value">{NUMBER_FORMAT.format(stats.totalSchedules)}</span>
        <span className="stats-label">{t('home.statsTotalSchedules')}</span>
      </div>
    </section>
  );
}
