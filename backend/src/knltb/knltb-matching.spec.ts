import { DateTime } from 'luxon';
import { findAvailableSlot } from './knltb-matching';
import { CourtAvailability } from './knltb.types';

/**
 * Fixture gebaseerd op een echte availability_timeline-response (zie
 * logs/result-*.json uit de oude standalone bot). Regressietest voor de bug
 * van 23-07-2026: `.equals()` gaf altijd false omdat de API-tijden in UTC
 * staan en het doelmoment in Europe/Amsterdam — nu vergeleken via `.toMillis()`.
 */
const courts: CourtAvailability[] = [
  {
    court_details: { id: 'court-1', name: 'Tennisbaan 1 / ESH Media-baan ' },
    timeline: {
      blocks: [
        {
          block_type: 'courtClosedByOpeningHours',
          slots: null,
        },
        {
          block_type: 'available',
          slots: {
            '2players': [
              {
                start_time: '2026-07-30T15:00:00Z', // 17:00 Europe/Amsterdam (zomertijd, UTC+2)
                end_time: '2026-07-30T16:00:00Z',
                available: true,
              },
              {
                start_time: '2026-07-30T16:00:00Z',
                end_time: '2026-07-30T17:00:00Z',
                available: false,
              },
            ],
          },
        },
      ],
    },
  },
  {
    court_details: { id: 'court-2', name: 'Tennisbaan 2 / Nieuwkerk-baan' },
    timeline: {
      blocks: [
        {
          block_type: 'available',
          slots: {
            '2players': [
              {
                start_time: '2026-07-30T15:00:00Z',
                end_time: '2026-07-30T16:00:00Z',
                available: true,
              },
            ],
          },
        },
      ],
    },
  },
];

describe('findAvailableSlot', () => {
  it('vindt een beschikbare slot ondanks tijdzoneverschil (UTC API vs Europe/Amsterdam doelmoment)', () => {
    const target = DateTime.fromISO('2026-07-30T17:00:00', {
      zone: 'Europe/Amsterdam',
    });
    const result = findAvailableSlot(courts, target, []);
    expect(result).not.toBeNull();
    expect(result?.courtId).toBe('court-1');
  });

  it('respecteert baanvoorkeur-volgorde en matcht op prefix (sponsor-namen genegeerd)', () => {
    const target = DateTime.fromISO('2026-07-30T17:00:00', {
      zone: 'Europe/Amsterdam',
    });
    const result = findAvailableSlot(courts, target, ['Tennisbaan 2']);
    expect(result?.courtId).toBe('court-2');
  });

  it('geeft null terug als de slot niet beschikbaar is', () => {
    const target = DateTime.fromISO('2026-07-30T18:00:00', {
      zone: 'Europe/Amsterdam',
    });
    const result = findAvailableSlot(courts, target, []);
    expect(result).toBeNull();
  });

  it('geeft null terug als het exacte tijdstip niet voorkomt in de timeline', () => {
    const target = DateTime.fromISO('2026-07-30T17:30:00', {
      zone: 'Europe/Amsterdam',
    });
    const result = findAvailableSlot(courts, target, []);
    expect(result).toBeNull();
  });
});
