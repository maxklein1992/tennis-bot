import { BadRequestException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { ScheduleExceptionsService } from './schedule-exceptions.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * `date` moet overal als kale YYYY-MM-DD-string behandeld worden
 * (UTC-middernacht encoding) — nooit als Europe/Amsterdam-gezoneerde
 * timestamp, anders ontstaat een off-by-one-dag-bug rond DST-overgangen.
 * Deze tests toetsen dat expliciet rond een DST-overgang.
 */
describe('ScheduleExceptionsService', () => {
  function build() {
    const prisma = {
      scheduleException: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
        deleteMany: jest.fn(),
      },
    };
    const service = new ScheduleExceptionsService(prisma as unknown as PrismaService);
    return { service, prisma };
  }

  it('upsert gooit BadRequestException als skip=false zonder medespelers', async () => {
    const { service } = build();

    await expect(
      service.upsert('schedule-a', '2026-08-10', { skip: false, partners: [] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('upsert gooit BadRequestException bij een ongeldige datum', async () => {
    const { service } = build();

    await expect(
      service.upsert('schedule-a', '2026-02-30', { skip: true }),
    ).rejects.toThrow(BadRequestException);
  });

  it('upsert forceert lege partner-arrays als skip=true, ook als er partners zijn meegestuurd', async () => {
    const { service, prisma } = build();
    prisma.scheduleException.upsert.mockResolvedValue({
      date: new Date('2026-08-10T00:00:00.000Z'),
      skip: true,
      partnerMemberIds: [],
      partnerMemberNames: [],
    });

    await service.upsert('schedule-a', '2026-08-10', {
      skip: true,
      partners: [{ id: 'p1', name: 'Henk' }],
    });

    expect(prisma.scheduleException.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ partnerMemberIds: [], partnerMemberNames: [] }),
        update: expect.objectContaining({ partnerMemberIds: [], partnerMemberNames: [] }),
      }),
    );
  });

  it('upsert slaat de datum op als UTC-middernacht, ongeacht Amsterdam-DST', async () => {
    const { service, prisma } = build();
    prisma.scheduleException.upsert.mockResolvedValue({
      date: new Date('2026-10-25T00:00:00.000Z'),
      skip: false,
      partnerMemberIds: ['p1'],
      partnerMemberNames: ['Henk'],
    });

    // 2026-10-25 is de dag van de DST-overgang (klok terug) in Europe/Amsterdam.
    await service.upsert('schedule-a', '2026-10-25', {
      skip: false,
      partners: [{ id: 'p1', name: 'Henk' }],
    });

    expect(prisma.scheduleException.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          scheduleId_date: {
            scheduleId: 'schedule-a',
            date: new Date('2026-10-25T00:00:00.000Z'),
          },
        },
      }),
    );
  });

  it('findForDate matcht op kalenderdatum in Europe/Amsterdam, ook rond een DST-overgang', async () => {
    const { service, prisma } = build();
    prisma.scheduleException.findUnique.mockResolvedValue(null);

    // 19:00 Europe/Amsterdam op de DST-overgangsdag zelf.
    const targetStart = DateTime.fromISO('2026-10-25T19:00:00', { zone: 'Europe/Amsterdam' });

    await service.findForDate('schedule-a', targetStart);

    expect(prisma.scheduleException.findUnique).toHaveBeenCalledWith({
      where: {
        scheduleId_date: {
          scheduleId: 'schedule-a',
          date: new Date('2026-10-25T00:00:00.000Z'),
        },
      },
    });
  });

  it('findForDate geeft null als er geen uitzondering is', async () => {
    const { service, prisma } = build();
    prisma.scheduleException.findUnique.mockResolvedValue(null);

    const result = await service.findForDate(
      'schedule-a',
      DateTime.fromISO('2026-08-10T19:00:00', { zone: 'Europe/Amsterdam' }),
    );

    expect(result).toBeNull();
  });

  it('findForDate geeft skip en partnerMemberIds terug als er een uitzondering bestaat', async () => {
    const { service, prisma } = build();
    prisma.scheduleException.findUnique.mockResolvedValue({
      skip: false,
      partnerMemberIds: ['p1', 'p2'],
    });

    const result = await service.findForDate(
      'schedule-a',
      DateTime.fromISO('2026-08-10T19:00:00', { zone: 'Europe/Amsterdam' }),
    );

    expect(result).toEqual({ skip: false, partnerMemberIds: ['p1', 'p2'] });
  });

  it('list geeft uitzonderingen gesorteerd op datum, gemapt naar partners', async () => {
    const { service, prisma } = build();
    prisma.scheduleException.findMany.mockResolvedValue([
      {
        date: new Date('2026-08-10T00:00:00.000Z'),
        skip: true,
        partnerMemberIds: [],
        partnerMemberNames: [],
      },
      {
        date: new Date('2026-08-17T00:00:00.000Z'),
        skip: false,
        partnerMemberIds: ['p1'],
        partnerMemberNames: ['Henk'],
      },
    ]);

    const result = await service.list('schedule-a');

    expect(prisma.scheduleException.findMany).toHaveBeenCalledWith({
      where: { scheduleId: 'schedule-a' },
      orderBy: { date: 'asc' },
    });
    expect(result).toEqual([
      { date: '2026-08-10', skip: true, partners: [] },
      { date: '2026-08-17', skip: false, partners: [{ id: 'p1', name: 'Henk' }] },
    ]);
  });
});
