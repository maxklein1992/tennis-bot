import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface StatsView {
  activeUsers: number;
  totalSchedules: number;
}

export const GLOBAL_STATS_ID = 1;

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<StatsView> {
    const [activeAccounts, globalStats] = await Promise.all([
      this.prisma.bookingSchedule.groupBy({
        by: ['accountId'],
        where: { enabled: true },
      }),
      this.prisma.globalStats.findUniqueOrThrow({ where: { id: GLOBAL_STATS_ID } }),
    ]);
    return {
      activeUsers: activeAccounts.length,
      totalSchedules: globalStats.totalSchedulesCreated,
    };
  }
}
