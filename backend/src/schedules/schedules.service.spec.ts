import { ConflictException, NotFoundException } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Regressietest voor de multi-tenant-migratie: een account mag nooit
 * schema's van een ander account kunnen zien, opvragen of muteren.
 */
describe('SchedulesService — accountscheiding', () => {
  function build() {
    const prisma = {
      bookingSchedule: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      bookingAttempt: {
        groupBy: jest.fn().mockResolvedValue([]),
      },
      knltbAccount: {
        findUniqueOrThrow: jest.fn(),
      },
      globalStats: {
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    const service = new SchedulesService(prisma as unknown as PrismaService);
    return { service, prisma };
  }

  it('findOwned gooit NotFoundException als het schema van een andere gebruiker is', async () => {
    const { service, prisma } = build();
    prisma.bookingSchedule.findFirst.mockResolvedValue(null);

    await expect(service.findOwned('schedule-a', 'user-b')).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.bookingSchedule.findFirst).toHaveBeenCalledWith({
      where: { id: 'schedule-a', account: { userId: 'user-b' } },
    });
  });

  it('findOwned levert het schema op als het van de opgevraagde gebruiker is', async () => {
    const { service, prisma } = build();
    const schedule = { id: 'schedule-a', accountId: 1 };
    prisma.bookingSchedule.findFirst.mockResolvedValue(schedule);

    await expect(service.findOwned('schedule-a', 'user-a')).resolves.toBe(schedule);
  });

  it('list(userId) filtert op de relatie naar het eigen account', async () => {
    const { service, prisma } = build();
    prisma.bookingSchedule.findMany.mockResolvedValue([]);

    await service.list('user-b');

    expect(prisma.bookingSchedule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { account: { userId: 'user-b' } } }),
    );
  });
});

/**
 * Twee gebruikers bij dezelfde vereniging mogen nooit allebei dezelfde baan
 * op hetzelfde moment claimen — die kan er toch maar één daadwerkelijk
 * boeken.
 */
describe('SchedulesService — baanconflict tussen gebruikers', () => {
  function build() {
    const prisma = {
      bookingSchedule: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      knltbAccount: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({ clubId: 'club-1' }),
      },
      globalStats: {
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    const service = new SchedulesService(prisma as unknown as PrismaService);
    return { service, prisma };
  }

  const dto = {
    targetWeekday: 'MONDAY' as const,
    targetTime: '20:00',
    durationMinutes: 60,
    courtPreference: ['Padel 1'],
  };

  it('create() gooit ConflictException als een andere gebruiker dezelfde baan op een overlappend tijdstip claimt', async () => {
    const { service, prisma } = build();
    prisma.bookingSchedule.findMany.mockResolvedValue([
      {
        targetTime: '20:30',
        durationMinutes: 60,
        courtPreference: ['padel 1'],
      },
    ]);

    await expect(service.create('user-a', dto)).rejects.toThrow(
      ConflictException,
    );
    expect(prisma.bookingSchedule.findMany).toHaveBeenCalledWith({
      where: {
        targetWeekday: 'MONDAY',
        enabled: true,
        account: { clubId: 'club-1', userId: { not: 'user-a' } },
      },
      select: {
        targetTime: true,
        durationMinutes: true,
        courtPreference: true,
      },
    });
  });

  it('create() staat toe als er geen overlap in baanvoorkeur is', async () => {
    const { service, prisma } = build();
    prisma.bookingSchedule.findMany.mockResolvedValue([
      {
        targetTime: '20:00',
        durationMinutes: 60,
        courtPreference: ['Tennisbaan 2'],
      },
    ]);
    prisma.$transaction.mockResolvedValue([
      {
        id: 'new-schedule',
        partnerMemberIds: [],
        partnerMemberNames: [],
        ...dto,
      },
    ]);

    await expect(service.create('user-a', dto)).resolves.toBeDefined();
  });

  it('create() staat toe als de tijden niet overlappen', async () => {
    const { service, prisma } = build();
    prisma.bookingSchedule.findMany.mockResolvedValue([
      {
        targetTime: '21:00',
        durationMinutes: 60,
        courtPreference: ['Padel 1'],
      },
    ]);
    prisma.$transaction.mockResolvedValue([
      {
        id: 'new-schedule',
        partnerMemberIds: [],
        partnerMemberNames: [],
        ...dto,
      },
    ]);

    await expect(service.create('user-a', dto)).resolves.toBeDefined();
  });

  it('create() slaat de conflictcheck helemaal over zonder baanvoorkeur', async () => {
    const { service, prisma } = build();
    prisma.$transaction.mockResolvedValue([
      {
        id: 'new-schedule',
        partnerMemberIds: [],
        partnerMemberNames: [],
        ...dto,
      },
    ]);

    await service.create('user-a', { ...dto, courtPreference: [] });

    expect(prisma.knltbAccount.findUniqueOrThrow).not.toHaveBeenCalled();
    expect(prisma.bookingSchedule.findMany).not.toHaveBeenCalled();
  });
});
