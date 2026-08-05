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
    expect(result?.isFallback).toBe(false);
  });

  it('valt nooit terug op alle banen als de voorkeur naar geen enkele bestaande baan verwijst', () => {
    // Regressietest: court-1 heeft wél een slot om 17:00 zonder voorkeur,
    // maar een niet-resolvende voorkeur (typo/onbestaande naam) moet altijd
    // null opleveren — nooit stilzwijgend op alle banen zoeken.
    const target = DateTime.fromISO('2026-07-30T17:00:00', {
      zone: 'Europe/Amsterdam',
    });
    const result = findAvailableSlot(courts, target, ['Baan die niet bestaat']);
    expect(result).toBeNull();
  });

  it('valt terug op een andere baan van hetzelfde type als de voorkeursbaan geen slot heeft', () => {
    const target = DateTime.fromISO('2026-07-30T17:00:00', {
      zone: 'Europe/Amsterdam',
    });
    const fallbackCourts: CourtAvailability[] = [
      {
        court_details: { id: 'preferred', name: 'Tennisbaan 1 / Test' },
        timeline: { blocks: [{ block_type: 'courtClosedByOpeningHours', slots: null }] },
      },
      {
        court_details: { id: 'other-tennis', name: 'Tennisbaan 2 / Test' },
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
    const result = findAvailableSlot(fallbackCourts, target, ['Tennisbaan 1']);
    expect(result).toEqual({
      courtId: 'other-tennis',
      courtName: 'Tennisbaan 2 / Test',
      isFallback: true,
    });
  });

  it('valt niet terug op een baan van een ander type', () => {
    const target = DateTime.fromISO('2026-07-30T17:00:00', {
      zone: 'Europe/Amsterdam',
    });
    const fallbackCourts: CourtAvailability[] = [
      {
        court_details: { id: 'preferred', name: 'Tennisbaan 1 / Test' },
        timeline: { blocks: [{ block_type: 'courtClosedByOpeningHours', slots: null }] },
      },
      {
        court_details: { id: 'padel', name: 'Padelbaan 1 / Test' },
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
    const result = findAvailableSlot(fallbackCourts, target, ['Tennisbaan 1']);
    expect(result).toBeNull();
  });

  it('probeert een type-fallback als geen van meerdere voorkeursbanen een slot heeft', () => {
    const target = DateTime.fromISO('2026-07-30T17:00:00', {
      zone: 'Europe/Amsterdam',
    });
    const fallbackCourts: CourtAvailability[] = [
      {
        court_details: { id: 'pref-1', name: 'Tennisbaan 1 / Test' },
        timeline: { blocks: [{ block_type: 'courtClosedByOpeningHours', slots: null }] },
      },
      {
        court_details: { id: 'pref-2', name: 'Tennisbaan 2 / Test' },
        timeline: { blocks: [{ block_type: 'courtClosedByOpeningHours', slots: null }] },
      },
      {
        court_details: { id: 'fallback', name: 'Tennisbaan 3 / Test' },
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
    const result = findAvailableSlot(fallbackCourts, target, ['Tennisbaan 1', 'Tennisbaan 2']);
    expect(result).toEqual({
      courtId: 'fallback',
      courtName: 'Tennisbaan 3 / Test',
      isFallback: true,
    });
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
