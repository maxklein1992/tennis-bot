import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface StatsView {
  activeUsers: number;
  totalSchedules: number;
}

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<StatsView> {
    const [activeAccounts, successfulBookings] = await Promise.all([
      this.prisma.bookingSchedule.groupBy({
        by: ['accountId'],
        where: { enabled: true },
      }),
      // Elke geslaagde (niet-dryRun) BookingAttempt is één daadwerkelijk
      // gereserveerde baan. Een doorlopende reservering die al 3 weken
      // achter elkaar is geactiveerd telt dus 3x mee, niet 1x — in
      // tegenstelling tot het tellen van BookingSchedule-rijen.
      this.prisma.bookingAttempt.count({
        where: { status: 'SUCCESS', dryRun: false },
      }),
    ]);
    return {
      activeUsers: activeAccounts.length,
      totalSchedules: successfulBookings,
    };
  }
}
