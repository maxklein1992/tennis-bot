import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { computeNextTarget } from '../booking/target-time.util';
import { ScheduleInputDto } from './dto/schedule.dto';
import type {
  AttemptStatus,
  BookingSchedule,
  Prisma,
  TriggerType,
} from '@prisma/client';

const RECENT_ATTEMPTS_LIMIT = 15;

export interface RecordAttemptInput {
  trigger: TriggerType;
  dryRun: boolean;
  targetStart: Date;
  targetEnd: Date;
  status: AttemptStatus;
  courtId?: string;
  courtName?: string;
  validationResponse?: unknown;
  reservationId?: string;
  errorMessage?: string;
  rawResult?: unknown;
  durationMs?: number;
}

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const schedules = await this.prisma.bookingSchedule.findMany({
      where: { account: { userId } },
      orderBy: { createdAt: 'asc' },
      include: {
        attempts: {
          orderBy: { createdAt: 'desc' },
          take: RECENT_ATTEMPTS_LIMIT,
          select: { id: true, createdAt: true, status: true, courtName: true },
        },
        _count: { select: { attempts: true } },
      },
    });
    const successCounts = await this.prisma.bookingAttempt.groupBy({
      by: ['scheduleId'],
      where: { status: 'SUCCESS', schedule: { account: { userId } } },
      _count: true,
    });
    const successMap = new Map(successCounts.map((s) => [s.scheduleId, s._count]));

    return schedules.map((s) => this.toView(s, successMap.get(s.id) ?? 0));
  }

  /**
   * Ongescoped — alleen voor interne achtergrond-aanroepers zonder
   * gebruikerscontext (BookingRunnerService, BookingSchedulerService). Die
   * zien alleen id's die al uit de globale listEnabled() kwamen, dus dat
   * blijft veilig.
   */
  async getOne(id: string): Promise<BookingSchedule> {
    const schedule = await this.prisma.bookingSchedule.findUnique({ where: { id } });
    if (!schedule) throw new NotFoundException(`Reservering ${id} niet gevonden`);
    return schedule;
  }

  /**
   * Eigenaarscheck: geeft 404 (niet 403) als het schema niet bestaat óf van
   * een andere gebruiker is, zodat er geen bestaans-informatie lekt.
   */
  async findOwned(id: string, userId: string): Promise<BookingSchedule> {
    const schedule = await this.prisma.bookingSchedule.findFirst({
      where: { id, account: { userId } },
    });
    if (!schedule) throw new NotFoundException(`Reservering ${id} niet gevonden`);
    return schedule;
  }

  async create(userId: string, dto: ScheduleInputDto) {
    const schedule = await this.prisma.bookingSchedule.create({
      data: {
        account: { connect: { userId } },
        label: dto.label,
        partnerMemberIds: dto.partners?.map((p) => p.id) ?? [],
        partnerMemberNames: dto.partners?.map((p) => p.name) ?? [],
        targetWeekday: dto.targetWeekday ?? 'MONDAY',
        targetTime: dto.targetTime ?? '19:00',
        courtPreference: dto.courtPreference ?? [],
        durationMinutes: dto.durationMinutes ?? 60,
        enabled: dto.enabled ?? true,
      },
    });
    return this.toView({ ...schedule, attempts: [], _count: { attempts: 0 } }, 0);
  }

  async update(id: string, userId: string, dto: ScheduleInputDto) {
    await this.findOwned(id, userId);
    const data: Prisma.BookingScheduleUpdateInput = {
      label: dto.label,
      targetWeekday: dto.targetWeekday,
      targetTime: dto.targetTime,
      courtPreference: dto.courtPreference,
      durationMinutes: dto.durationMinutes,
      enabled: dto.enabled,
    };
    if (dto.partners) {
      data.partnerMemberIds = dto.partners.map((p) => p.id);
      data.partnerMemberNames = dto.partners.map((p) => p.name);
    }
    await this.prisma.bookingSchedule.update({ where: { id }, data });
    const [schedule] = await this.prisma.bookingSchedule.findMany({
      where: { id },
      include: {
        attempts: {
          orderBy: { createdAt: 'desc' },
          take: RECENT_ATTEMPTS_LIMIT,
          select: { id: true, createdAt: true, status: true, courtName: true },
        },
        _count: { select: { attempts: true } },
      },
    });
    const successCount = await this.prisma.bookingAttempt.count({
      where: { scheduleId: id, status: 'SUCCESS' },
    });
    return this.toView(schedule, successCount);
  }

  async setEnabled(id: string, userId: string, enabled: boolean) {
    await this.findOwned(id, userId);
    await this.prisma.bookingSchedule.update({ where: { id }, data: { enabled } });
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOwned(id, userId);
    await this.prisma.bookingSchedule.delete({ where: { id } });
  }

  async listEnabled(): Promise<BookingSchedule[]> {
    return this.prisma.bookingSchedule.findMany({ where: { enabled: true } });
  }

  async recordAttempt(scheduleId: string, input: RecordAttemptInput) {
    return this.prisma.bookingAttempt.create({
      data: {
        scheduleId,
        trigger: input.trigger,
        dryRun: input.dryRun,
        targetStart: input.targetStart,
        targetEnd: input.targetEnd,
        status: input.status,
        courtId: input.courtId,
        courtName: input.courtName,
        validationResponse: input.validationResponse as Prisma.InputJsonValue,
        reservationId: input.reservationId,
        errorMessage: input.errorMessage,
        rawResult: input.rawResult as Prisma.InputJsonValue,
        durationMs: input.durationMs,
      },
    });
  }

  private toView(
    schedule: BookingSchedule & {
      attempts: Array<{
        id: string;
        createdAt: Date;
        status: AttemptStatus;
        courtName: string | null;
      }>;
      _count: { attempts: number };
    },
    successCount: number,
  ) {
    return {
      id: schedule.id,
      label: schedule.label,
      partners: schedule.partnerMemberIds.map((id, i) => ({
        id,
        name: schedule.partnerMemberNames[i] ?? '(naam onbekend)',
      })),
      targetWeekday: schedule.targetWeekday,
      targetTime: schedule.targetTime,
      courtPreference: schedule.courtPreference,
      durationMinutes: schedule.durationMinutes,
      enabled: schedule.enabled,
      nextRunAt: schedule.enabled
        ? computeNextTarget(schedule.targetWeekday, schedule.targetTime).toISO()
        : null,
      recentAttempts: schedule.attempts.map((a) => ({
        id: a.id,
        createdAt: a.createdAt,
        status: a.status,
        courtName: a.courtName,
      })),
      successCount,
      totalCount: schedule._count.attempts,
    };
  }
}
