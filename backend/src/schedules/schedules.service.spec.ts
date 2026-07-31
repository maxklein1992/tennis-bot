import { NotFoundException } from '@nestjs/common';
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
      },
      bookingAttempt: {
        groupBy: jest.fn().mockResolvedValue([]),
      },
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
